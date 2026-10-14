# Domain glossary

Terms used consistently across code, API, database, and UI. Accepted decisions in [issue #4](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/4) override conflicting older definitions. Storage/role representations are technical proposals; see [implementation status](../product/implementation-status.md).

## Actors and identity

| Term                 | Definition                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **User**             | A registered account. Owner and customer capabilities coexist on the same account; concrete role model pending.                            |
| **Customer**         | An account using customer capabilities, including an owner booking as customer.                                                            |
| **Guest**            | An unauthenticated person who creates a booking by supplying contact details. A guest is not a user and has no account or management link. |
| **Restaurant Owner** | An account with approved owner access. One owner per restaurant in v1; that owner may manage multiple restaurants.                         |
| **Admin**            | A user with role `ADMIN`.                                                                                                                  |
| **System**           | Non-human actor: scheduled jobs and background workers.                                                                                    |
| **Actor**            | Whoever performs an action (user, guest, or system). Recorded on booking events and audit logs.                                            |

## Geography and time

| Term                        | Definition                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Country**                 | ISO 3166-1 alpha-2 country (e.g. `VN`).                                                                                       |
| **City**                    | A city within a country (e.g. Hanoi). Used for browsing and seed scope.                                                       |
| **Location**                | A restaurant's address plus latitude/longitude.                                                                               |
| **Restaurant timezone**     | IANA timezone name of the restaurant (e.g. `Asia/Ho_Chi_Minh`). All wall-clock rules for that restaurant are evaluated in it. |
| **Local date / local time** | Calendar date / wall-clock time in the restaurant timezone.                                                                   |
| **Instant**                 | An absolute point in time, stored as UTC (`timestamptz`).                                                                     |
| **Geocoding**               | Converting an address into coordinates. Behind an abstraction; no provider in the first implementation.                       |

## Catalog

| Term                  | Definition                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Restaurant**        | A venue listed on the platform, owned by one restaurant owner.                                                        |
| **Restaurant status** | Onboarding/visibility state: `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `SUSPENDED`.                          |
| **Submission**        | A request by the owner for admin review of the restaurant. Each submission gets exactly one admin decision.           |
| **Verification**      | The admin check of profile, location, menu and photos during a submission review.                                     |
| **Suspension**        | Admin action that removes an approved restaurant from service.                                                        |
| **Cuisine**           | Platform-managed taxonomy term (e.g. Vietnamese, Japanese). Many-to-many with restaurants.                            |
| **Amenity**           | Platform-managed taxonomy term describing a facility or feature (e.g. parking, Wi-Fi). Many-to-many with restaurants. |
| **Menu**              | The restaurant's list of menu sections and menu items. Informational only; not orderable.                             |
| **Photo**             | An image of the restaurant stored in object storage.                                                                  |
| **Announcement**      | A message published by a restaurant, delivered as a notification.                                                     |

## Reservation model

| Term                    | Definition                                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Resource**            | A bookable unit of a restaurant with a type (`TABLE` or `VIP_ROOM`), capacity, priority, active flag, and optional fee. Customers never pick resources.                                   |
| **Resource type**       | `TABLE` or `VIP_ROOM`.                                                                                                                                                                    |
| **Capacity**            | The maximum party size a resource can seat.                                                                                                                                               |
| **Priority**            | Restaurant-defined ordering used by the allocation engine when several candidates fit.                                                                                                    |
| **Combination**         | A restaurant-defined set of two or more resources that may be allocated together to one booking.                                                                                          |
| **Candidate**           | Single resource or explicit combination; owner-entered combination capacity bounded by member sum.                                                                                        |
| **Opening period**      | A weekly wall-clock interval on one weekday, e.g. Monday 11:00–14:00. A weekday may have several. No overnight periods.                                                                   |
| **Blackout**            | Restaurant-wide or resource time-bounded closure; meal overlap blocks new allocations, buffer alone does not; existing bookings retained and owner alerted.                               |
| **Booking settings**    | Restaurant settings defined in [availability policy](availability-and-allocation.md#time-and-settings), including independent lastBookingTime and configurable lead/horizon/party limits. |
| **Slot**                | A permitted booking start time generated from an opening period and the slot interval (e.g. 18:00, 18:30, ...).                                                                           |
| **Slot interval**       | Minutes between consecutive slots.                                                                                                                                                        |
| **Booking duration**    | Length of the reservation (default 120 minutes).                                                                                                                                          |
| **Buffer**              | Cleanup time after a booking during which its resources stay unavailable.                                                                                                                 |
| **Occupied window**     | `[start, end + buffer)`: the interval during which a booking blocks its resources.                                                                                                        |
| **Availability**        | The set of slots on a date for which at least one candidate is free for a party size. Advisory: only the booking transaction is authoritative.                                            |
| **Allocation**          | The assignment of one resource to one booking for its occupied window. A booking has one allocation per resource it holds.                                                                |
| **Released allocation** | An allocation that no longer blocks its resource (booking cancelled, expired, or rescheduled away). Kept for history; approved unreachable NO_SHOW release is included.                   |
| **Allocation engine**   | Backend component that selects the candidate for a booking and writes allocations transactionally.                                                                                        |
| **Preference**          | A customer's wish that influences allocation, e.g. VIP/private room. Requested VIP never silently downgrades; regular seating needs consent.                                              |

## Booking

| Term                      | Definition                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Booking**               | A reservation of a restaurant for a party at a start instant. Also "reservation".                                         |
| **Booking reference**     | Short human-readable code identifying a booking to customers and restaurants.                                             |
| **Booking source**        | How the booking was created: `ONLINE` (customer or guest via the platform) or `MANUAL` (entered by the restaurant owner). |
| **Authenticated booking** | Booking created by a logged-in customer; linked to the user.                                                              |
| **Guest booking**         | Booking created without an account; holds contact details only.                                                           |
| **Booking status**        | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`, `EXPIRED`. See [booking lifecycle](booking-lifecycle.md).    |
| **Cancellation deadline** | Instant `start − deadline minutes` after which self-service cancellation/rescheduling is closed. Default 120 minutes.     |
| **Rescheduling**          | Changing date/time and party size atomically, keeping ID/reference; no fixed count limit within deadline, rate limiting.  |
| **No-show suggestion**    | Owner alert for unresolved absence; never an automatic NO_SHOW/cancel/release.                                            |
| **Completion**            | Automatic transition only for CONFIRMED with recorded arrival and now >= endsAt.                                          |
| **Override**              | COMPLETED ↔ NO_SHOW correction: owner within 24h with reason/audit, admin thereafter; anchor unresolved.                  |
| **Idempotency key**       | Actor-scoped retry intent: same key/fingerprint replays; changed fingerprint conflicts. Secure guest scope pending #12.   |
| **Booking event**         | Immutable history record of a booking change (created, confirmed, rescheduled, cancelled, ...).                           |

## Engagement

| Term               | Definition                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Favorite**       | A customer's bookmark of a restaurant. At most one per customer and restaurant. Independent of collections.        |
| **Collection**     | A named, customer-owned list of restaurants with visibility `PUBLIC` or `PRIVATE`.                                 |
| **Review**         | A customer's rating and text for one completed booking.                                                            |
| **Ratings**        | Four scores per review: overall, food, service, atmosphere.                                                        |
| **Edit window**    | Period after creation during which a review can be edited (default 7 days).                                        |
| **Owner reply**    | The restaurant owner's public response to a review.                                                                |
| **Flag**           | A report that a review needs moderation. Flags escalate to admins; they do not unpublish the review by themselves. |
| **Moderation**     | Admin handling of flagged reviews (e.g. hide or dismiss flag).                                                     |
| **Recommendation** | Rule-based list of restaurants suggested to a customer.                                                            |

## Money

| Term                    | Definition                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Money**               | An amount plus an ISO 4217 currency code. Never a float.                                                                                    |
| **Minor units**         | Integer amount in the currency's smallest unit (VND: 1 đồng, USD: 1 cent).                                                                  |
| **Restaurant currency** | Currency in which a restaurant's prices and fees are expressed.                                                                             |
| **Resource fee**        | Optional reservation fee on a resource (typically a VIP room). Shown explicitly and snapshotted; collected at restaurant, not online in v1. |

## Platform

| Term             | Definition                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **Notification** | A message to a user or booking contact, in-app and/or by email.                                             |
| **Delivery**     | One attempt stream of a notification over one channel, with status and retries.                             |
| **Audit log**    | Append-only record of an important action: actor, action, target, timestamp, metadata.                      |
| **Outbox event** | A domain event written in the same transaction as the change that caused it, later processed by the worker. |
| **Worker**       | Background process consuming jobs (notifications, reminders, indexing, completion/expiry).                  |
| **Search index** | Elasticsearch projection of approved restaurants. PostgreSQL remains the source of truth.                   |
