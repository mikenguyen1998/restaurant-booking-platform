# Permission matrix

Legend: ✅ allowed · **own** only on the actor's own resources · **own R** only for
restaurants the owner owns · ❌ not allowed · `Q-xx` pending a business decision ·
— not applicable.

**Accepted policy:** [issue #4](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/4). **Pending implementation:** booking authorization and owner onboarding; existing auth sessions do not establish these permissions. Enforcement in application services as well as controllers is a **technical proposal**.

Owner uses customer capabilities on the same account (own bookings, reviews, favorites, collections and recommendations) as well as operating owned restaurants. Ownership must be checked; one owner can manage multiple restaurants, each with one owner in v1. Customer requests restaurant opening; admin approves owner access. Email verification before owner submission and admin account provisioning remain unresolved (Q-03/Q-04).

## Discovery

| Capability                                                   | Guest | Customer | Owner                     | Admin |
| ------------------------------------------------------------ | ----- | -------- | ------------------------- | ----- |
| Search, filter, list approved restaurants                    | ✅    | ✅       | ✅                        | ✅    |
| View approved restaurant details, photos, menu, reviews, map | ✅    | ✅       | ✅                        | ✅    |
| View non-approved restaurant                                 | ❌    | ❌       | own R                     | ✅    |
| Check availability                                           | ✅    | ✅       | ✅                        | ✅    |
| Personalised recommendations                                 | ❌    | ✅       | own (customer capability) | ❌    |

## Booking

Details and evidence requirements are maintained in [booking lifecycle](booking-lifecycle.md#cancellation-and-rescheduling).

| Capability                                                               | Guest                        | Customer                | Owner                                                                  | Admin                                            |
| ------------------------------------------------------------------------ | ---------------------------- | ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| Create online booking                                                    | name + phone; email optional | verified email required | same account as verified customer                                      | not approved by #4; outside stated requirements  |
| Create manual booking                                                    | ❌                           | ❌                      | own R                                                                  | ❌                                               |
| View/history                                                             | no self-service link         | own                     | own customer bookings + own R operations                               | ✅                                               |
| Self-service cancel/reschedule                                           | ❌                           | own, now <= deadline    | own customer booking under same rule                                   | admin authority below                            |
| Handle explicit customer-requested change after deadline                 | ❌                           | contact restaurant      | own R; reason/contact evidence/audit, including authenticated bookings | ✅; reason/audit/notification                    |
| Initiate restaurant-side cancellation of authenticated CONFIRMED booking | ❌                           | —                       | ❌; request admin handling                                             | ✅; reason/audit/customer notification           |
| Handle guest cancel/reschedule requests                                  | ❌                           | —                       | own R; explicit request/evidence; after-deadline exception allowed     | ✅; reason/audit/notification                    |
| Cancel/reschedule manual booking                                         | —                            | —                       | own R; reason and audited action                                       | ✅; reason/audit/notification                    |
| Record arrival/contact/extend hold                                       | ❌                           | —                       | own R; actor/time/outcome for contact                                  | additional operational scope not specified by #4 |
| Mark NO_SHOW/release for unreachable guest                               | ❌                           | ❌                      | own R; absent, failed contact, now >= effective holdUntil + 15 min     | additional operational scope not specified by #4 |
| Cancel immediately on explicit non-attendance                            | ❌                           | communicates request    | own R; reason/contact result/actor/time                                | admin cancellation authority                     |
| Correct COMPLETED ↔ NO_SHOW                                              | ❌                           | ❌                      | own R within 24h; reason/audit; reference timestamp unresolved         | handles after window; reason/audit               |
| Admin cancel/reschedule                                                  | —                            | —                       | —                                                                      | any deadline; reason/audit/customer notification |
| See guest contacts                                                       | —                            | —                       | own R                                                                  | ✅                                               |

## Restaurant onboarding and configuration

| Capability                                                | Guest | Customer | Owner                     | Admin                  |
| --------------------------------------------------------- | ----- | -------- | ------------------------- | ---------------------- |
| Create restaurant draft                                   | ❌    | ❌       | ✅ (multiple restaurants) | ❌                     |
| Edit profile, location, photos, menu, amenities, cuisines | ❌    | ❌       | own R (re-review: `Q-05`) | `Q-05`                 |
| Manage resources, combinations                            | ❌    | ❌       | own R                     | ❌                     |
| Manage opening hours, blackouts, booking settings         | ❌    | ❌       | own R                     | ❌                     |
| Submit for review                                         | ❌    | ❌       | own R                     | ❌                     |
| Approve / reject                                          | ❌    | ❌       | ❌                        | ✅                     |
| Suspend / reinstate                                       | ❌    | ❌       | ❌                        | ✅ (reinstate: `Q-06`) |
| Publish announcement                                      | ❌    | ❌       | own R (`Q-30`)            | ❌                     |
| Manage cuisine and amenity taxonomy                       | ❌    | ❌       | ❌                        | ✅                     |

## Reviews

| Capability                           | Guest | Customer                      | Owner                   | Admin |
| ------------------------------------ | ----- | ----------------------------- | ----------------------- | ----- |
| Create review                        | ❌    | own `COMPLETED` booking, once | own customer capability | ❌    |
| Edit review                          | ❌    | own, within edit window       | own customer capability | ❌    |
| Reply to review                      | ❌    | ❌                            | own R                   | ❌    |
| Flag review                          | ❌    | `Q-29`                        | `Q-29`                  | —     |
| Hide / restore review, resolve flags | ❌    | ❌                            | ❌                      | ✅    |

## Engagement

| Capability                        | Guest | Customer | Owner                     | Admin                 |
| --------------------------------- | ----- | -------- | ------------------------- | --------------------- |
| Favorite / unfavorite             | ❌    | own      | own (customer capability) | ❌                    |
| Create / edit / delete collection | ❌    | own      | own (customer capability) | ❌                    |
| View public collection            | ✅    | ✅       | ✅                        | ✅                    |
| View private collection           | ❌    | own      | own customer capability   | `Q-43` (proposal: ❌) |

## Account and notifications

| Capability                           | Guest                            | Customer                   | Owner                          | Admin                                |
| ------------------------------------ | -------------------------------- | -------------------------- | ------------------------------ | ------------------------------------ |
| Register                             | ✅ (as customer)                 | —                          | customer requests owner access | admin provisioning unresolved (Q-03) |
| Edit own profile, preferred language | —                                | own                        | own                            | own                                  |
| In-app notifications                 | ❌                               | own                        | own                            | own                                  |
| Email notifications                  | booking emails if email supplied | ✅ (reminder-only opt-out) | ✅                             | ✅                                   |
| Manage users (status, role)          | ❌                               | ❌                         | ❌                             | ✅                                   |

## Admin

| Capability                     | Guest | Customer | Owner          | Admin |
| ------------------------------ | ----- | -------- | -------------- | ----- |
| Dashboards, reports, analytics | ❌    | ❌       | own R (`Q-44`) | ✅    |
| Audit logs                     | ❌    | ❌       | ❌             | ✅    |

## System actor

| Capability                                                  | Allowed                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| Complete CONFIRMED bookings with arrival and end reached    | ✅                                                                 |
| Expire `PENDING` bookings (future flow; technical proposal) | ✅                                                                 |
| Late-arrival/absence alerts                                 | Alert owner at effective hold; no automatic NO_SHOW/cancel/release |
| Send notifications and reminders                            | ✅                                                                 |
| Update search index                                         | ✅                                                                 |
| Change restaurant status, cancel `CONFIRMED` bookings       | ❌                                                                 |
