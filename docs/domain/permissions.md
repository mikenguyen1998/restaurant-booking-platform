# Permission matrix

Legend: ✅ allowed · **own** only on the actor's own resources · **own R** only for
restaurants the owner owns · ❌ not allowed · `Q-xx` pending a business decision ·
— not applicable.

Authorization is enforced in application services (not only controllers), so the
same rules apply to every entry point, including background jobs.

## Discovery

| Capability                                                   | Guest | Customer | Owner  | Admin |
| ------------------------------------------------------------ | ----- | -------- | ------ | ----- |
| Search, filter, list approved restaurants                    | ✅    | ✅       | ✅     | ✅    |
| View approved restaurant details, photos, menu, reviews, map | ✅    | ✅       | ✅     | ✅    |
| View non-approved restaurant                                 | ❌    | ❌       | own R  | ✅    |
| Check availability                                           | ✅    | ✅       | ✅     | ✅    |
| Personalised recommendations                                 | ❌    | ✅       | `Q-01` | ❌    |

## Booking

| Capability                                   | Guest                     | Customer             | Owner                    | Admin                             |
| -------------------------------------------- | ------------------------- | -------------------- | ------------------------ | --------------------------------- |
| Create online booking                        | ✅ (with contact details) | ✅                   | `Q-01`                   | not in requirements (proposal ❌) |
| Create manual booking                        | ❌                        | ❌                   | own R                    | ❌                                |
| View booking                                 | ❌ (no management link)   | own                  | own R                    | ✅                                |
| Booking history                              | ❌                        | own                  | own R (reservation list) | ✅                                |
| Cancel authenticated `CONFIRMED` booking     | —                         | own, before deadline | ❌                       | ✅ (`Q-23`)                       |
| Reschedule authenticated `CONFIRMED` booking | —                         | own, before deadline | ❌ (`Q-21`)              | ✅ (`Q-23`)                       |
| Cancel / reschedule guest booking            | ❌                        | —                    | own R (deadline: `Q-19`) | ✅                                |
| Cancel / reschedule manual booking           | —                         | —                    | `Q-21`                   | ✅                                |
| Mark no-show                                 | ❌                        | ❌                   | own R                    | `Q-24`                            |
| Override completion / no-show                | ❌                        | ❌                   | own R (window: `Q-25`)   | `Q-25`                            |
| See guest contact details                    | —                         | —                    | own R                    | ✅                                |

## Restaurant onboarding and configuration

| Capability                                                | Guest | Customer | Owner                     | Admin                  |
| --------------------------------------------------------- | ----- | -------- | ------------------------- | ---------------------- |
| Create restaurant draft                                   | ❌    | ❌       | ✅ (count: `Q-02`)        | ❌                     |
| Edit profile, location, photos, menu, amenities, cuisines | ❌    | ❌       | own R (re-review: `Q-05`) | `Q-05`                 |
| Manage resources, combinations                            | ❌    | ❌       | own R                     | ❌                     |
| Manage opening hours, blackouts, booking settings         | ❌    | ❌       | own R                     | ❌                     |
| Submit for review                                         | ❌    | ❌       | own R                     | ❌                     |
| Approve / reject                                          | ❌    | ❌       | ❌                        | ✅                     |
| Suspend / reinstate                                       | ❌    | ❌       | ❌                        | ✅ (reinstate: `Q-06`) |
| Publish announcement                                      | ❌    | ❌       | own R (`Q-30`)            | ❌                     |
| Manage cuisine and amenity taxonomy                       | ❌    | ❌       | ❌                        | ✅                     |

## Reviews

| Capability                           | Guest | Customer                      | Owner  | Admin |
| ------------------------------------ | ----- | ----------------------------- | ------ | ----- |
| Create review                        | ❌    | own `COMPLETED` booking, once | ❌     | ❌    |
| Edit review                          | ❌    | own, within edit window       | ❌     | ❌    |
| Reply to review                      | ❌    | ❌                            | own R  | ❌    |
| Flag review                          | ❌    | `Q-29`                        | `Q-29` | —     |
| Hide / restore review, resolve flags | ❌    | ❌                            | ❌     | ✅    |

## Engagement

| Capability                        | Guest | Customer | Owner  | Admin                 |
| --------------------------------- | ----- | -------- | ------ | --------------------- |
| Favorite / unfavorite             | ❌    | own      | `Q-01` | ❌                    |
| Create / edit / delete collection | ❌    | own      | `Q-01` | ❌                    |
| View public collection            | ✅    | ✅       | ✅     | ✅                    |
| View private collection           | ❌    | own      | ❌     | `Q-43` (proposal: ❌) |

## Account and notifications

| Capability                           | Guest                   | Customer    | Owner  | Admin                 |
| ------------------------------------ | ----------------------- | ----------- | ------ | --------------------- |
| Register                             | ✅ (as customer)        | —           | `Q-03` | ❌ (created by admin) |
| Edit own profile, preferred language | —                       | own         | own    | own                   |
| In-app notifications                 | ❌                      | own         | own    | own                   |
| Email notifications                  | booking emails (`Q-18`) | ✅ (`Q-38`) | ✅     | ✅                    |
| Manage users (status, role)          | ❌                      | ❌          | ❌     | ✅                    |

## Admin

| Capability                     | Guest | Customer | Owner          | Admin |
| ------------------------------ | ----- | -------- | -------------- | ----- |
| Dashboards, reports, analytics | ❌    | ❌       | own R (`Q-44`) | ✅    |
| Audit logs                     | ❌    | ❌       | ❌             | ✅    |

## System actor

| Capability                                            | Allowed            |
| ----------------------------------------------------- | ------------------ |
| Complete bookings after end time                      | ✅                 |
| Expire `PENDING` bookings                             | ✅                 |
| Suggest no-show                                       | ✅ (basis: `Q-24`) |
| Send notifications and reminders                      | ✅                 |
| Update search index                                   | ✅                 |
| Change restaurant status, cancel `CONFIRMED` bookings | ❌                 |
