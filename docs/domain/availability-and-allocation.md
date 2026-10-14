# Availability and allocation

**Accepted policy:** [issue #4](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/4), sections 1–2. Booking lifecycle is maintained in [booking-lifecycle.md](booking-lifecycle.md). **Implemented behavior** and gaps below are static source observations, not results of a booking policy test run.

## Read and write paths

Availability queries are advisory and may become stale. Allocation inside the booking transaction is authoritative and must revalidate current restaurant/slot/resource state. Sharing pure slot/candidate/ranking functions is a **technical proposal**; only the availability read path exists today, not booking writes.

## Time and settings

Resolve requested local date/time in the restaurant's IANA timezone. Store instants; meal interval is `[startsAt, endsAt)` and occupied interval is `[startsAt, endsAt + buffer)`. Half-open overlap is `aStart < bEnd && bStart < aEnd`.

| Setting           | Accepted policy                                                                                       | Source status                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `lastBookingTime` | Independent of closing time; start exactly at cutoff allowed. Meal and buffer may extend past closing | Pending implementation; no setting in live schema             |
| Duration          | Existing baseline default 120 minutes, restaurant-configurable                                        | Setting exists                                                |
| Minimum lead time | Default 120 minutes, restaurant-configurable, never below 30                                          | Pending implementation                                        |
| Horizon           | Default 30 days, restaurant-configurable                                                              | Pending implementation                                        |
| Party size        | Restaurant configures min/max; candidate must still fit                                               | DTO only enforces `partySize >= 1`; restaurant limits pending |
| Slot interval     | Default 30 minutes, restaurant-configurable                                                           | Setting exists                                                |
| Buffer            | Default 15 minutes, restaurant-configurable                                                           | Setting exists and occupied-window read checks include buffer |

Cutoff applies to generated starts; it is not a meal-end or cleanup deadline. FE warns at the final slot that the table is held for 15 minutes and the kitchen will close soon, using configured restaurant information when available. Do not invent a kitchen closing timestamp.

**Unresolved decision / technical refinement:** cutoff configuration shape for multiple periods/dates and exact lead-time/horizon boundary calculation (elapsed versus calendar days) are not specified by #4. DST gap/overlap behavior remains a technical proposal (T-06); do not present it as accepted product policy.

**Implemented behavior:** `packages/shared/src/utils/time.ts::generateSlots` requires `start + duration <= close`; `AvailabilityService` only removes starts at/before now, not starts inside the accepted lead-time window. These behaviors do not implement the accepted cutoff/lead-time/horizon policy. Existing unit tests describe the current implementation and do not settle policy.

## Closures

Support restaurant-wide and individual resource time-bounded closures. A closure blocks new booking placement when the **meal interval** overlaps it; buffer-only overlap does not block. Resource closures disqualify the affected table/room for the meal, including any combination containing it; other candidates may remain available.

Owners may create a closure immediately while retaining existing bookings and allocations. Alert the owner to contact affected guests; closure creation does not silently cancel reservations. Settings changes also do not rewrite accepted snapshots of existing bookings.

Examples: meal 18:00–20:00, occupied until 20:15. Closure 20:00–20:10 overlaps only cleanup and does not block the meal; closure 19:45–20:10 does. An already-confirmed booking stays intact if a later closure overlaps it, and the owner is alerted.

**Implemented behavior:** restaurant-wide closure checks use meal overlap. **Pending implementation:** resource closures, closure writes and affected-booking owner alerts. Closure persistence/lock coordination is technical design, not an existing guarantee.

## Candidates and VIP

Single candidates are active resources with sufficient capacity. Combinations must be explicitly allowed by the restaurant and have active/eligible members. Owner enters actual combination seating capacity, **no greater than the sum of member capacities**; the booking's party size must fit that entered capacity. Small parties may use a larger resource; ranking prefers best fit. Do not substitute summed capacity for the entered capacity.

Restaurant configures VIP behavior: `ONLY_WHEN_REQUESTED` or `ALLOW_AS_FALLBACK`. When VIP is requested and unavailable, report no VIP availability and ask for consent before using regular seating. No silent downgrade. The fallback interaction/DTO is pending technical design.

**Implemented behavior:** `buildCandidates` uses summed member capacity; live combinations have no entered-capacity field. Resource queries omit type and `AvailabilityService` does not process the DTO's `preference`. Owner-entered capacity and VIP filtering/consent are **pending implementation**.

## Ranking

Accepted order (#4 questions 22–25):

1. Accepted preference/VIP rules.
2. Single resource before combination.
3. Least spare capacity (`candidate capacity − partySize`).
4. Restaurant priority.
5. Deterministic tie-breaks where they do not change the preceding order.

The current comparator orders single → least spare → higher priority → fewer resources → id. The latter tie-breaks may be retained under #4, but preference eligibility/ranking is missing. Priority direction is existing implemented behavior, not a newly approved business rule.

## Occupancy and allocation

Meal 18:00–20:00 plus 15-minute buffer occupies `[18:00,20:15)`. Another booking on the same resource at 20:00 conflicts; one at 20:15 does not. Buffer applies in both directions. Hold extensions change the waiting deadline only, not this occupied interval; see [arrival and hold](booking-lifecycle.md#arrival-hold-and-contact).

**Technical proposal, pending implementation:** PostgreSQL exclusion constraints on active occupied windows; transactionally authorize/replay idempotency, validate slot/closures, rank eligible candidates, reserve all candidate resources and persist `CONFIRMED` plus snapshots/history/outbox. If a candidate conflicts, bounded retries/savepoints may try the next eligible candidate; never silently downgrade VIP. No candidate success → rollback with no partial booking or allocation.

Locking/isolation/savepoint choices (T-01–T-03) remain technical proposals. Closure/settings/deactivation writes need coordination with allocation so later transactions see current policy; closures preserve earlier bookings and alert owners. Rescheduling is all-or-nothing and retains ID/reference; see [lifecycle](booking-lifecycle.md#rescheduling). Safe actor/key scoping and replay design belong to issue #12, not an unscoped global key assumption.

## Future verification criteria

These are **pending verification**, not tests written or run during policy reconciliation:

- Exact `lastBookingTime`, meal/buffer past closing, configurable lead-time/horizon/party limits.
- Meal versus buffer-only closure overlap; resource closures; closure creation keeps existing bookings and alerts owner.
- Entered combination capacity bounded by members; inactive/closed member excluded.
- Preference/single/spare/priority order and deterministic ties; unavailable requested VIP never silently downgraded.
- Buffer at 20:00/20:15; real PostgreSQL parallel bookings and multi-resource all-or-nothing.
- Exact self-service deadline, explicit customer-request exceptions and admin authority.
- Atomic reschedule (including party size), actor-scoped duplicate replay/mismatch, hold/contact/arrival lifecycle.

Future tests must derive expected behavior from accepted policy/contracts, not from the current implementation. Booking writes are absent, so existing read-path test success cannot establish write-path policy compliance.
