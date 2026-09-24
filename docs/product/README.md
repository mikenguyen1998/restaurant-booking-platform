# Product requirements baseline

This page restates the product decisions provided by the product owner. It is the
reference the rest of the documentation is checked against. It does **not** add
rules. Anything not stated here is listed as an open question in
[`../open-questions.md`](../open-questions.md).

## Product

A restaurant discovery and reservation platform.

| Scope   | Coverage                    |
| ------- | --------------------------- |
| Initial | Hanoi, Vietnam              |
| Future  | Vietnam, then international |

Architecture must therefore support country, city, latitude/longitude, a timezone
per restaurant, a currency per restaurant, radius/location search, and a Vietnamese
and English UI.

## Actors

| Actor            | Notes                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Customer         | Registered user who discovers, books, reviews, and organises restaurants. |
| Guest            | Unauthenticated person who books by providing booking information.        |
| Restaurant Owner | One owner/operator account per restaurant. No multi-staff roles yet.      |
| Admin            | Platform administrator.                                                   |
| System           | Background processes (completion, expiry, reminders, indexing).           |

## Capabilities by actor

**Customer:** discover, search and filter restaurants; view details, photos, menu,
reviews and map location; favorite restaurants; organise restaurants into PUBLIC or
PRIVATE collections (favorites and collections are separate concepts); check
availability; book; view booking history; cancel/reschedule own bookings according
to policy; review completed bookings; receive notifications.

**Guest:** book by providing booking information. No self-service management link.
Cancellation and rescheduling of guest bookings is handled by the restaurant owner.

**Restaurant Owner:** onboarding (draft → configure → submit → admin review →
approved); configure profile, location, photos, menu, resources, opening hours,
booking duration, slot interval, buffer time, cancellation policy, allocation
preferences; operate reservations (list, calendar, manual bookings, guest bookings,
guest cancellation/rescheduling, no-show confirmation, completion override); reply
to reviews. Cannot directly cancel a confirmed booking.

**Admin:** user management, restaurant review (approve/reject/suspend), booking
management (including restaurant-initiated cancellation of confirmed bookings),
review moderation (flagging/escalation, not pre-approval), reports, platform
analytics, audit logs.

## Stated business rules

| Area               | Rule                                                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Onboarding         | Admin verification covers profile, location, menu, photos. Admin can approve, reject, suspend.                                                                                                                                    |
| Resources          | Generic resource concept: `TABLE`, `VIP_ROOM`. Attributes: name, type, capacity, active state, priority, optional fee, currency.                                                                                                  |
| Allocation         | Customer provides date, time slot, party size, preferences. The system decides the resources. A booking may reserve multiple resources. Restaurant controls combinability, combination rules, priority, VIP preference behaviour. |
| Slots              | Fixed slots; restaurant configures the interval.                                                                                                                                                                                  |
| Duration           | Default 120 minutes; restaurant may configure.                                                                                                                                                                                    |
| Buffer             | Restaurant may configure a cleanup buffer. Booking 18:00–20:00 + 15 min buffer → next booking on that resource starts at 20:15 at the earliest.                                                                                   |
| Opening hours      | No overnight periods yet.                                                                                                                                                                                                         |
| Closures           | Restaurant-wide blackout/closure periods must be supported.                                                                                                                                                                       |
| Booking states     | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`, `EXPIRED`.                                                                                                                                                           |
| Confirmation       | No payment in phase 1: a successfully allocated booking becomes `CONFIRMED` inside the booking transaction. No manual restaurant confirmation.                                                                                    |
| Cancellation       | Default deadline 2 hours before reservation time for cancellation and rescheduling; restaurant can customise.                                                                                                                     |
| Owner cancellation | Owner cannot directly cancel a confirmed booking. Admin handles restaurant-side cancellation of confirmed bookings. Owner handles guest cancellation/rescheduling.                                                                |
| Rescheduling       | Atomic: the old booking stays intact unless the new allocation succeeds.                                                                                                                                                          |
| Concurrency        | Two concurrent requests must never both reserve the same resource/time. The booking transaction is the source of truth.                                                                                                           |
| No-show            | System flags/suggests; owner confirms `NO_SHOW`.                                                                                                                                                                                  |
| Completion         | System moves to `COMPLETED` after end time; owner can override.                                                                                                                                                                   |
| Reviews            | Only `COMPLETED` bookings; one review per booking; editable for a configurable window (default 7 days); ratings: overall, food, service, atmosphere; owner can reply.                                                             |
| Moderation         | Immediate publication, with flagging/escalation.                                                                                                                                                                                  |
| Search             | Elasticsearch. Keyword, cuisine, price, rating, distance, availability, amenities, VIP/private room, opening now. Radius search.                                                                                                  |
| Map                | Coordinates, map pins, detail location. Geocoding behind an abstraction; no provider yet.                                                                                                                                         |
| Amenities          | Proper domain concept (outdoor seating, parking, private room, family friendly, pet friendly, Wi-Fi, ...).                                                                                                                        |
| Notifications      | In-app and email. Events: booking created, confirmed, cancelled, rescheduled; reminders 24 h and 2 h before; review/reply; restaurant announcement. Asynchronous via background jobs.                                             |
| Recommendations    | Rule-based in phase 1, behind a service abstraction. No AI.                                                                                                                                                                       |
| Payment            | Not implemented. Money objects carry amount and currency. VIP resources may carry an optional fee.                                                                                                                                |
| Money              | Multi-currency at domain level; no floating point.                                                                                                                                                                                |
| Timezone           | Each restaurant has a timezone; the booking engine uses it for opening hours, slots, start/end, deadlines, reminders, blackouts.                                                                                                  |
| Audit              | Important actions are audited with actor, action, target, timestamp, metadata.                                                                                                                                                    |
