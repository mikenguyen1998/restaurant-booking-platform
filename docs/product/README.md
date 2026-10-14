# Product requirements baseline

This baseline incorporates **accepted policy** from [issue #4](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/4), approved 14 October 2026. Detailed booking rules live in the domain documents linked below; acceptance is not implementation. This page restates the product decisions provided by the product owner. It is the
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

| Actor            | Notes                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customer         | Registered user who discovers, books, reviews, and organises restaurants.                                                                         |
| Guest            | Unauthenticated person who books by providing booking information.                                                                                |
| Restaurant Owner | One owner per restaurant in v1; an owner can manage multiple restaurants and use customer capabilities on the same account. No multi-staff roles. |
| Admin            | Platform administrator.                                                                                                                           |
| System           | Background processes (completion, expiry, reminders, indexing).                                                                                   |

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
to reviews. May handle explicit customer-requested changes with evidence; cannot initiate cancellation of authenticated confirmed bookings (restaurant-side cancellation goes through admin). Same account retains customer capabilities.

**Admin:** user management, restaurant review (approve/reject/suspend), booking
management (including restaurant-initiated cancellation of confirmed bookings),
review moderation (flagging/escalation, not pre-approval), reports, platform
analytics, audit logs.

## Stated business rules

| Area               | Rule                                                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Onboarding         | Customer requests to open a restaurant; admin approves owner access. Restaurant verification covers profile, location, menu, photos; admin approves/rejects/suspends. Submission completeness/re-review remain unresolved (Q-05). |
| Resources          | Generic resource concept: `TABLE`, `VIP_ROOM`. Attributes: name, type, capacity, active state, priority, optional fee, currency.                                                                                                  |
| Allocation         | Customer provides date, time slot, party size, preferences. The system decides the resources. A booking may reserve multiple resources. Restaurant controls combinability, combination rules, priority, VIP preference behaviour. |
| Slots              | Restaurant-configurable interval default 30 min; independent inclusive lastBookingTime. See [availability policy](../domain/availability-and-allocation.md#time-and-settings).                                                    |
| Duration           | Default 120 minutes; restaurant may configure.                                                                                                                                                                                    |
| Buffer             | Restaurant-configurable default 15 min; occupied interval includes buffer; meal/buffer may exceed closing. See [availability policy](../domain/availability-and-allocation.md).                                                   |
| Opening hours      | No overnight periods yet.                                                                                                                                                                                                         |
| Closures           | Restaurant-wide and resource closures; meal overlap blocks new bookings, buffer-only overlap does not. Existing bookings stay intact; alert owner. See [closures](../domain/availability-and-allocation.md#closures).             |
| Booking states     | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`, `EXPIRED`.                                                                                                                                                           |
| Confirmation       | No payment in phase 1: a successfully allocated booking becomes `CONFIRMED` inside the booking transaction. No manual restaurant confirmation.                                                                                    |
| Cancellation       | Self-service now <= deadline, default 120 min before start; see [lifecycle](../domain/booking-lifecycle.md#cancellation-and-rescheduling).                                                                                        |
| Owner cancellation | Explicit customer-request exceptions, manual-booking handling and restaurant-side admin cancellation follow [permissions](../domain/permissions.md#booking); no blanket owner prohibition.                                        |
| Rescheduling       | Date/time and party size; same ID/reference; atomic allocation, failure retains old booking/allocations. No fixed count limit within deadline; rate limiting. See [lifecycle](../domain/booking-lifecycle.md#rescheduling).       |
| Concurrency        | Two concurrent requests must never both reserve the same resource/time. The booking transaction is the source of truth.                                                                                                           |
| No-show            | Arrival/hold/contact workflow, manual NO_SHOW/release and late-arrival rebooking follow [lifecycle](../domain/booking-lifecycle.md#arrival-hold-and-contact); no automatic hold-expiry release.                                   |
| Completion         | Automatic only for CONFIRMED + recorded arrival + end reached. Corrections and review handling follow [lifecycle](../domain/booking-lifecycle.md#completion-and-correction).                                                      |
| Reviews            | Only `COMPLETED` bookings; one review per booking; editable for a configurable window (default 7 days); ratings: overall, food, service, atmosphere; owner can reply.                                                             |
| Moderation         | Immediate publication, with flagging/escalation.                                                                                                                                                                                  |
| Search             | Elasticsearch. Keyword, cuisine, price, rating, distance, availability, amenities, VIP/private room, opening now. Radius search.                                                                                                  |
| Map                | Coordinates, map pins, detail location. Geocoding behind an abstraction; no provider yet.                                                                                                                                         |
| Amenities          | Proper domain concept (outdoor seating, parking, private room, family friendly, pet friendly, Wi-Fi, ...).                                                                                                                        |
| Notifications      | One immediate booking-success confirmation; email recipients, passed reminders, reminder-only opt-out and important changes follow [lifecycle](../domain/booking-lifecycle.md#events-and-notifications).                          |
| Recommendations    | Rule-based in phase 1, behind a service abstraction. No AI.                                                                                                                                                                       |
| Payment            | No online payment in v1. VIP fee explicitly displayed, snapshotted, collected at restaurant.                                                                                                                                      |
| Money              | Multi-currency at domain level; no floating point.                                                                                                                                                                                |
| Timezone           | Each restaurant has a timezone; the booking engine uses it for opening hours, slots, start/end, deadlines, reminders, blackouts.                                                                                                  |
| Audit              | Important actions are audited with actor, action, target, timestamp, metadata.                                                                                                                                                    |

## Implementation status

See [implementation-status.md](implementation-status.md) for static source evidence, pending implementation and unresolved technical/product work. Policy acceptance is not a test result.
