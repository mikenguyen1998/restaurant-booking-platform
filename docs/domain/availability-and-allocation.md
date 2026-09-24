# Availability and allocation

This is the most important backend subsystem. It has two paths:

| Path                                                   | Purpose                                                   | Authority                                               |
| ------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------- |
| **Availability query** (read)                          | Show which slots can be booked for a date and party size. | Advisory only. May be stale by the time the user books. |
| **Allocation** (write, inside the booking transaction) | Choose and reserve resources for a booking.               | The single source of truth.                             |

Both paths share the same pure domain functions (slot generation, candidate
generation, ranking) so they cannot drift apart. Only the write path touches locks
and constraints.

## Inputs

| Source                        | Data                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| Request                       | restaurant, local date, local slot time, party size, preferences (e.g. VIP/private room) |
| BookingSettings               | slot interval, duration (default 120), buffer, deadline, allocation preferences          |
| Restaurant                    | timezone (IANA), status, currency                                                        |
| OpeningPeriod                 | weekly wall-clock periods                                                                |
| Blackout                      | restaurant-wide closures (instants)                                                      |
| Resource, ResourceCombination | active resources, capacities, priorities, allowed combinations                           |
| BookingAllocation             | unreleased allocations overlapping the window                                            |

## Time model

1. The request carries a **local date and local time** (e.g. `2026-10-02`, `19:00`).
2. The engine resolves it to an instant using the restaurant timezone:
   `startsAt = zoned(localDate, localTime, restaurant.timezone)`.
3. `endsAt = startsAt + duration`; `occupiedUntil = endsAt + buffer`.
4. The **occupied window** is the half-open interval `[startsAt, occupiedUntil)`.
   Half-open intervals mean a booking ending (plus buffer) at 20:15 does not conflict
   with one starting at 20:15.
5. All stored values are instants; local values are derived for display.

Worked example from the requirements: booking 18:00–20:00 with a 15-minute buffer
occupies `[18:00, 20:15)`. A booking starting 20:00 on the same resource would
occupy `[20:00, …)` and overlap, so it is rejected. A booking starting 20:15 fits.
The buffer also applies before an existing booking: with 120-minute duration and
15-minute buffer, a booking at 16:00 occupies `[16:00, 18:15)` and overlaps an 18:00
booking, so the latest compatible earlier start is 15:45.

Daylight-saving time does not exist in Vietnam but will exist internationally.
Rules for non-existent and ambiguous local times are a technical decision
([T-06](../open-questions.md#technical-decisions)); proposal: skip non-existent slot
times and use the earlier offset for ambiguous ones.

## Slot generation

For a restaurant, local date `D`, and settings:

```text
periods = opening periods where weekday = weekday(D)
for each period [open, close):
    t = open
    while slotFits(t, period):          # Q-08
        emit slot (D, t)
        t = t + slotInterval
```

`slotFits` depends on an unresolved rule ([Q-08](../open-questions.md#business-questions)):

- option A: the booking must **end** by closing (`t + duration ≤ close`), or
- option B: only the **start** must be before closing (`t < close`, "last seating").

Whether the buffer may extend past closing is part of the same question.

A generated slot is then **dropped** when any of these hold:

| Rule                                               | Status                                                                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `startsAt ≤ now`                                   | Confirmed (cannot book the past)                                                                                           |
| `startsAt < now + minimum lead time`               | Lead time value open ([Q-11](../open-questions.md#business-questions))                                                     |
| `startsAt > now + booking horizon`                 | Horizon value open ([Q-11](../open-questions.md#business-questions))                                                       |
| `[startsAt, endsAt)` overlaps a blackout           | Confirmed (closure). Whether the buffer must also be outside the blackout: [Q-08](../open-questions.md#business-questions) |
| Party size outside the restaurant's accepted range | Range open ([Q-11](../open-questions.md#business-questions))                                                               |

## Candidates

A **candidate** is a set of resources that may serve one booking:

1. **Single resource**: every active resource with `capacity ≥ partySize`.
2. **Combination**: every active `ResourceCombination` whose members are all active
   and whose seating capacity `≥ partySize`.

The restaurant controls combinability entirely through explicit combinations: two
resources can only be allocated together if a combination listing them exists. This
avoids combinatorial search and matches "restaurant controls which resources can be
combined". Whether a combination's capacity is entered by the owner or derived as the
sum of members, and whether small parties may occupy large resources, are open
([Q-13](../open-questions.md#business-questions)).

A candidate is **free** for a window `W` when none of its resources has an unreleased
allocation overlapping `W`.

## Ranking

Free candidates are ranked, and the first one that commits wins. The **factors** are
given by the requirements; their **order** is a business decision
([Q-15](../open-questions.md#business-questions)). Proposed order, for review:

1. **Preference match.** If the customer asked for VIP/private room, candidates
   containing a `VIP_ROOM` come first. How VIP resources are treated when **not**
   requested is the restaurant's "VIP preference behaviour" setting
   ([Q-14](../open-questions.md#business-questions)); what happens when a requested
   VIP room is unavailable is [Q-16](../open-questions.md#business-questions).
2. **Single before combination.** Prefer not to join tables.
3. **Best fit.** Smallest `capacity − partySize`.
4. **Restaurant priority.** Resource priority, or combination priority.
5. **Fewer resources.** For combinations of equal fit.
6. **Stable tiebreak.** Lowest resource id, so results are deterministic and testable.

## Allocation (write path)

Runs inside the booking transaction at `READ COMMITTED` isolation. Correctness does
not depend on the availability query being current.

```text
BEGIN
 1. idempotency: if a booking with this idempotency key exists
        same request fingerprint → return it (no new allocation)
        different fingerprint    → reject (conflict)
 2. SELECT restaurant FOR KEY SHARE
        guards against concurrent blackout creation, settings change,
        suspension (those take FOR UPDATE on the restaurant row)
        check status = APPROVED
 3. re-validate the slot with current settings, opening periods, blackouts
 4. SELECT candidate resources FOR KEY SHARE (ordered by id)
        guards against concurrent deactivation (FOR UPDATE on the resource)
 5. load unreleased allocations overlapping the window; build and rank candidates
 6. INSERT booking (status CONFIRMED in phase 1, snapshots, idempotency key)
 7. for candidate in ranked candidates:
        SAVEPOINT try
        INSERT one allocation per resource, in resource-id order
        ok                        → break
        exclusion violation 23P01 → ROLLBACK TO SAVEPOINT try; continue
 8. no candidate committed → ROLLBACK; respond "slot no longer available"
 9. INSERT booking events, outbox event, audit log (manual bookings)
COMMIT
```

Step 7 retries in-transaction on the next candidate when another transaction won the
race for the first choice. The database exclusion constraint is what makes this safe:
the loaded allocations in step 5 are only used for ranking.

## Concurrency guarantees

| Race                                        | Mechanism                                                                                                                                                                    | Outcome                                                                                                                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two bookings for the same resource and time | Exclusion constraint on `(resource_id, [starts_at, occupied_until))` for unreleased allocations. The second insert waits for the first transaction, then fails with `23P01`. | Exactly one commits; the other tries its next candidate or fails.                                                                                                                                     |
| Multi-resource bookings                     | All allocations of a booking are inserted in one transaction, in resource-id order.                                                                                          | All-or-nothing; consistent order prevents most deadlocks. Deadlocks that still occur (`40P01`) are retried.                                                                                           |
| Cancellation vs booking                     | Cancellation locks the booking row and releases allocations in one transaction.                                                                                              | A booking that waits on the unreleased row proceeds correctly after the cancellation commits or rolls back.                                                                                           |
| Reschedule vs booking                       | Release + new allocation in one transaction.                                                                                                                                 | Either the reschedule or the competing booking gets the contested resource; the rescheduling booking never loses its original slot on failure.                                                        |
| Blackout vs booking                         | Blackout creation takes `FOR UPDATE` on the restaurant row; bookings take `FOR KEY SHARE`.                                                                                   | Serialised: a blackout sees all bookings committed before it; later bookings see the blackout. Handling of bookings already inside the new blackout: [Q-09](../open-questions.md#business-questions). |
| Resource deactivation vs booking            | Deactivation takes `FOR UPDATE` on the resource row; bookings take `FOR KEY SHARE` on candidate resources.                                                                   | Serialised.                                                                                                                                                                                           |
| Settings change vs booking                  | Settings change takes `FOR UPDATE` on the restaurant row.                                                                                                                    | Serialised; the booking snapshots the settings it used.                                                                                                                                               |
| Duplicate submissions (double click, retry) | Unique idempotency key on booking; fingerprint check.                                                                                                                        | One booking; retries return it.                                                                                                                                                                       |
| System jobs vs user actions                 | Conditional updates (`WHERE status = …`) plus booking row locks.                                                                                                             | Completion, expiry, and owner overrides never overwrite each other silently.                                                                                                                          |

`FOR KEY SHARE` is used for the restaurant row (instead of `FOR SHARE`) so ordinary
profile edits (which take a weaker `FOR NO KEY UPDATE`) do not block bookings.

## Timezone correctness checklist

| Concern               | Rule                                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opening hours         | Evaluated on the local weekday of the local date, in minutes since local midnight.                                                                        |
| Slots                 | Generated in local wall time, then converted to instants.                                                                                                 |
| Start/end             | Stored as instants; the timezone used is snapshotted on the booking.                                                                                      |
| Cancellation deadline | Instant arithmetic on `startsAt`.                                                                                                                         |
| Reminders             | Scheduled at `startsAt − 24h` and `startsAt − 2h` (instants). Bookings created inside a reminder window: [Q-42](../open-questions.md#business-questions). |
| Blackouts             | Entered by the owner in local time, stored as instants.                                                                                                   |
| "Opening now"         | Current instant converted to the restaurant's local weekday and minute.                                                                                   |
| "Today" in the UI     | The restaurant's local date, not the viewer's.                                                                                                            |

## Tests the engine must have (phase 6–7)

- Slot generation: interval, multiple periods per day, lead time, horizon, blackouts, the closing-time rule, DST gap/overlap for a non-Vietnam timezone.
- Buffer: the 18:00/20:00/20:15 example in both directions.
- Ranking: each ranking factor in isolation, and deterministic tiebreak.
- Combinations: allowed vs not allowed pairs; inactive member disables a combination.
- Concurrency (real PostgreSQL, parallel transactions): N parallel requests for one resource → exactly one success; overlapping multi-resource requests; cancel vs book; reschedule vs book; blackout vs book; deactivation vs book; duplicate idempotency keys.
- Rescheduling: success to overlapping time on the same resource; failure leaves the original booking and allocations unchanged.
- Deadlines: just before / at / after the deadline.
