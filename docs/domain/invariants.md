# Invariants and constraints

Each invariant says **where it is enforced**. "DB" means a database constraint that
holds even if application code is wrong. "Domain" means domain/application code,
covered by tests. Business rules that are still open are not listed here.

## Booking and allocation

| ID   | Invariant                                                                                                                | Enforced by                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| B-01 | No two unreleased allocations of the same resource have overlapping occupied windows.                                    | DB: `EXCLUDE USING gist (resource_id WITH =, tstzrange(starts_at, occupied_until, '[)') WITH &&) WHERE (released_at IS NULL)` |
| B-02 | An allocation's window is non-empty: `starts_at < occupied_until`.                                                       | DB check                                                                                                                      |
| B-03 | A booking in `PENDING` or `CONFIRMED` has ≥ 1 unreleased allocation; a booking in `CANCELLED` or `EXPIRED` has none.     | Domain (same transaction as the status change); verified by tests and a periodic consistency check                            |
| B-04 | A resource is allocated at most once per booking while unreleased.                                                       | DB: partial unique `(booking_id, resource_id) WHERE released_at IS NULL`                                                      |
| B-05 | All allocated resources belong to the booking's restaurant.                                                              | Domain; DB composite FK on `(resource_id, restaurant_id)`                                                                     |
| B-06 | Total capacity of a booking's candidate ≥ party size.                                                                    | Domain                                                                                                                        |
| B-07 | `endsAt = startsAt + durationMinutes`; `occupiedUntil = endsAt + bufferMinutes`, using the booking's snapshotted values. | Domain; DB checks where expressible                                                                                           |
| B-08 | `partySize ≥ 1`.                                                                                                         | DB check                                                                                                                      |
| B-09 | A booking is created only for an `APPROVED` restaurant.                                                                  | Domain, under restaurant row lock                                                                                             |
| B-10 | A booking starts at a valid slot of the restaurant at creation time and does not overlap a blackout.                     | Domain, under restaurant row lock                                                                                             |
| B-11 | Status changes follow the [state machine](booking-lifecycle.md) only.                                                    | Domain (single transition function); conditional updates                                                                      |
| B-12 | Guest booking ⇔ `customerId IS NULL`; guest and manual bookings carry contact details.                                   | DB check (contact name not null); Domain for required fields ([Q-18](../open-questions.md#business-questions))                |
| B-13 | An idempotency key maps to at most one booking.                                                                          | DB unique                                                                                                                     |
| B-14 | A reschedule either fully succeeds (new allocations, new times) or leaves the booking and its allocations unchanged.     | Single transaction                                                                                                            |
| B-15 | Self-service cancellation/rescheduling only before `startsAt − deadline`.                                                | Domain                                                                                                                        |
| B-16 | Owners never cancel a `CONFIRMED` booking of an authenticated customer.                                                  | Domain authorization                                                                                                          |
| B-17 | Every booking change writes a `BookingEvent` in the same transaction.                                                    | Domain                                                                                                                        |
| B-18 | `PENDING` bookings have `expiresAt`; other statuses need not.                                                            | DB check                                                                                                                      |

## Restaurant and configuration

| ID   | Invariant                                                                                | Enforced by                                              |
| ---- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| R-01 | Restaurant has a valid IANA timezone and ISO 4217 currency.                              | Domain validation; DB `char(3)`                          |
| R-02 | Latitude ∈ [-90, 90], longitude ∈ [-180, 180].                                           | DB checks                                                |
| R-03 | Opening period: `0 ≤ opensAt < closesAt ≤ 1440` (no overnight).                          | DB check                                                 |
| R-04 | Opening periods of one restaurant and weekday do not overlap.                            | DB exclusion on `int4range(opens_at, closes_at)`         |
| R-05 | Blackout: `startsAt < endsAt`.                                                           | DB check                                                 |
| R-06 | Settings: slot interval > 0, duration > 0, buffer ≥ 0, deadline ≥ 0.                     | DB checks                                                |
| R-07 | Resource capacity ≥ 1; name unique per restaurant.                                       | DB                                                       |
| R-08 | Money fields of a restaurant (resource fees, menu prices) use the restaurant's currency. | Domain ([Q-36](../open-questions.md#business-questions)) |
| R-09 | A combination has ≥ 2 members, all from its restaurant.                                  | Domain; composite FK for restaurant                      |
| R-10 | At most one undecided submission per restaurant.                                         | DB partial unique                                        |
| R-11 | At most one cover photo per restaurant.                                                  | DB partial unique                                        |
| R-12 | Only `APPROVED` restaurants appear in search and public APIs.                            | Domain; search index contains only approved restaurants  |

## Reviews and engagement

| ID   | Invariant                                                                  | Enforced by                                                       |
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

| ID   | Invariant                                                                                      | Enforced by                                                               |
| ---- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| M-01 | Money is integer minor units + ISO 4217 code; never floating point.                            | Types (`bigint`), DB column types                                         |
| M-02 | Arithmetic only between equal currencies.                                                      | Domain `Money` value object                                               |
| T-01 | Instants are stored as `timestamptz`.                                                          | Schema                                                                    |
| T-02 | Wall-clock rules are evaluated in the restaurant timezone, never the server's or the viewer's. | Domain; tests pin the server timezone to UTC and use a non-UTC restaurant |

## Audit and events

| ID   | Invariant                                                                                                                       | Enforced by                                                                                        |
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
| Owner | cancel or reschedule a guest booking                                                                                                   |
| Owner | create a manual booking                                                                                                                |
| Owner | mark no-show; override completion                                                                                                      |
