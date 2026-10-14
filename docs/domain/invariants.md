# Invariants and constraints

**Accepted policy** derives from [issue #4](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/4) and the baseline requirements. Enforcement columns below are **technical proposals / pending implementation**, not proof of existing constraints or passing tests. Rows linked to unresolved Q IDs remain technical placeholders, not approved business rules. Current availability only implements a subset; see [source gaps](../product/implementation-status.md).

## Booking and allocation

| ID   | Invariant                                                                                                                                                                                                              | Proposed enforcement / status                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| B-01 | No two unreleased allocations of the same resource have overlapping occupied windows.                                                                                                                                  | DB: `EXCLUDE USING gist (resource_id WITH =, tstzrange(starts_at, occupied_until, '[)') WITH &&) WHERE (released_at IS NULL)` |
| B-02 | An allocation's window is non-empty: `starts_at < occupied_until`.                                                                                                                                                     | DB check                                                                                                                      |
| B-03 | A booking in `PENDING` or `CONFIRMED` has ≥ 1 unreleased allocation; a booking in `CANCELLED` or `EXPIRED` has none.                                                                                                   | Domain (same transaction as the status change); future tests and a proposed periodic consistency check                        |
| B-04 | A resource is allocated at most once per booking while unreleased.                                                                                                                                                     | DB: partial unique `(booking_id, resource_id) WHERE released_at IS NULL`                                                      |
| B-05 | All allocated resources belong to the booking's restaurant.                                                                                                                                                            | Domain; DB composite FK on `(resource_id, restaurant_id)`                                                                     |
| B-06 | Total capacity of a booking's candidate ≥ party size.                                                                                                                                                                  | Domain                                                                                                                        |
| B-07 | `endsAt = startsAt + durationMinutes`; `occupiedUntil = endsAt + bufferMinutes`, using the booking's snapshotted values.                                                                                               | Domain; DB checks where expressible                                                                                           |
| B-08 | `partySize ≥ 1`.                                                                                                                                                                                                       | DB check                                                                                                                      |
| B-09 | A booking is created only for an `APPROVED` restaurant.                                                                                                                                                                | Domain, under restaurant row lock                                                                                             |
| B-10 | A generated start respects inclusive lastBookingTime and restaurant limits; meal (not buffer alone) avoids relevant restaurant/resource closures.                                                                      | Domain; coordination with closure writes pending                                                                              |
| B-11 | Status changes follow the [state machine](booking-lifecycle.md) only.                                                                                                                                                  | Domain (single transition function); conditional updates                                                                      |
| B-12 | Guest booking has no customer account; guest name and phone required, email optional; authenticated customer email verified before booking. Manual contacts follow approved contract; no new required fields inferred. | Domain validation pending; live guestPhone is nullable                                                                        |
| B-13 | Same authorized actor/key/intent replays same booking; changed fingerprint conflicts without editing.                                                                                                                  | Scoped storage and private replay design pending (#12)                                                                        |
| B-14 | A reschedule either fully succeeds (new allocations, new times) or leaves the booking and its allocations unchanged.                                                                                                   | Single transaction                                                                                                            |
| B-15 | Self-service cancellation/reschedule allowed at now <= startsAt − snapshotted deadline.                                                                                                                                | Domain authorization pending                                                                                                  |
| B-16 | Owner cannot initiate authenticated CONFIRMED cancellation; explicit customer request permits owner handling with reason/contact evidence/audit. Restaurant-side cancellation goes through admin.                      | Domain authorization pending                                                                                                  |
| B-17 | Every booking change writes a `BookingEvent` in the same transaction.                                                                                                                                                  | Domain                                                                                                                        |
| B-18 | `PENDING` bookings have `expiresAt`; other statuses need not.                                                                                                                                                          | DB check                                                                                                                      |

Additional **accepted policy / pending implementation** invariants:

- Hold expiry alerts only; owner contact is recorded. Hold extension cannot change meal/occupied interval.
- Unreachable NO_SHOW release requires absence, failed contact and effective hold + 15 minutes. Explicit non-attendance permits immediate cancellation with evidence.
- Auto-completion requires CONFIRMED, recorded arrival and now >= endsAt.
- Corrections require reason/audit; owner has 24 hours (anchor unresolved), admin handles later. NO_SHOW correction temporarily hides review and preserves history.
- New closures preserve existing bookings and alert the owner. VIP cannot silently downgrade.
- Confirmation is one immediate message; opt-out affects only reminder emails.

## Restaurant and configuration

| ID   | Invariant                                                                                                                                   | Proposed enforcement / status                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| R-01 | Restaurant has a valid IANA timezone and ISO 4217 currency.                                                                                 | Domain validation; DB `char(3)`                                                     |
| R-02 | Latitude ∈ [-90, 90], longitude ∈ [-180, 180].                                                                                              | DB checks                                                                           |
| R-03 | Opening period: `0 ≤ opensAt < closesAt ≤ 1440` (no overnight).                                                                             | DB check                                                                            |
| R-04 | Opening periods of one restaurant and weekday do not overlap.                                                                               | DB exclusion on `int4range(opens_at, closes_at)`                                    |
| R-05 | Blackout: `startsAt < endsAt`.                                                                                                              | DB check                                                                            |
| R-06 | Restaurant defaults: interval 30, duration 120, buffer 15, deadline 120 min; lead default 120 with minimum 30 min; horizon default 30 days. | Validation/storage pending beyond existing duration/interval/buffer/deadline fields |
| R-07 | Resource capacity ≥ 1; name unique per restaurant.                                                                                          | DB                                                                                  |
| R-08 | Money fields of a restaurant (resource fees, menu prices) use the restaurant's currency.                                                    | Domain ([Q-36](../open-questions.md#business-questions))                            |
| R-09 | Combination has >= 2 members from its restaurant; owner-entered capacity <= member sum and >= booked party size.                            | Domain/constraints proposed; current source sums member capacity                    |
| R-10 | At most one undecided submission per restaurant.                                                                                            | DB partial unique                                                                   |
| R-11 | At most one cover photo per restaurant.                                                                                                     | DB partial unique                                                                   |
| R-12 | Only `APPROVED` restaurants appear in search and public APIs.                                                                               | Domain; search index contains only approved restaurants                             |

## Reviews and engagement

| ID   | Invariant                                                                  | Proposed enforcement / status                                     |
| ---- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| V-01 | A review exists only for a booking in `COMPLETED` status at creation time. | Domain                                                            |
| V-02 | One review per booking.                                                    | DB unique `booking_id`                                            |
| V-03 | Review author = booking customer (guests cannot review).                   | Domain; review `authorId` not null                                |
| V-04 | Review is editable only until `editableUntil` (default creation + 7 days). | Domain                                                            |
| V-05 | Ratings are within the rating scale.                                       | DB check (scale: [Q-41](../open-questions.md#business-questions)) |
| V-06 | Only the owner of the review's restaurant replies.                         | Domain authorization                                              |
| E-01 | One favorite per (user, restaurant).                                       | DB unique                                                         |
| E-02 | A restaurant appears at most once per collection.                          | DB unique                                                         |
| E-03 | Private collections are visible only to their owner.                       | Domain authorization                                              |

## Money and time

| ID   | Invariant                                                                                      | Proposed enforcement / status                                             |
| ---- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| M-01 | Money is integer minor units + ISO 4217 code; never floating point.                            | Types (`bigint`), DB column types                                         |
| M-02 | Arithmetic only between equal currencies.                                                      | Domain `Money` value object                                               |
| T-01 | Instants are stored as `timestamptz`.                                                          | Schema                                                                    |
| T-02 | Wall-clock rules are evaluated in the restaurant timezone, never the server's or the viewer's. | Domain; tests pin the server timezone to UTC and use a non-UTC restaurant |

## Audit and events

| ID   | Invariant                                                                                                                       | Proposed enforcement / status                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| A-01 | Audited actions write their audit row in the same transaction as the change.                                                    | Application service convention; tests                                                              |
| A-02 | Audit rows are never updated or deleted by the application.                                                                     | No update/delete code path; optional DB trigger ([T-24](../open-questions.md#technical-decisions)) |
| A-03 | Every externally visible side effect (email, index update, reminder) originates from an outbox event committed with the change. | Outbox pattern                                                                                     |

## Audited actions (minimum)

From the requirements, plus the ones implied by the same rule:

| Actor | Action                                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Admin | approve / reject / suspend restaurant (and reinstate, if confirmed)                                                                    |
| Admin | cancel or reschedule a booking                                                                                                         |
| Admin | hide / restore a review; resolve a flag                                                                                                |
| Admin | change a user's role or status                                                                                                         |
| Owner | change restaurant configuration (profile, location, photos, menu, resources, combinations, opening hours, blackouts, booking settings) |
| Owner | submit for review                                                                                                                      |
| Owner | handle explicit customer-requested cancellation/reschedule (guest or authenticated), and manual bookings                               |
| Owner | create a manual booking                                                                                                                |
| Owner | record contact attempts/hold actions; mark no-show; correct completion/no-show with reason                                             |
