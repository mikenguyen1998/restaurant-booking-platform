# docs

| Document                                                                       | Contents                                                          |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| [product/](product/README.md)                                                  | Requirements baseline as provided by the product owner            |
| [domain/glossary.md](domain/glossary.md)                                       | Domain vocabulary                                                 |
| [domain/entities.md](domain/entities.md)                                       | Entity model and relationship diagram                             |
| [domain/restaurant-lifecycle.md](domain/restaurant-lifecycle.md)               | Restaurant onboarding states                                      |
| [domain/booking-lifecycle.md](domain/booking-lifecycle.md)                     | Booking state machine, cancellation, rescheduling                 |
| [domain/availability-and-allocation.md](domain/availability-and-allocation.md) | Slots, candidates, ranking, transactional allocation, concurrency |
| [domain/invariants.md](domain/invariants.md)                                   | Invariants and where each is enforced; audited actions            |
| [domain/permissions.md](domain/permissions.md)                                 | Permission matrix                                                 |
| [architecture/](architecture/README.md)                                        | System components, write/read paths, module layering              |
| [database/](database/README.md)                                                | Proposed Prisma schema and raw-SQL constraints                    |
| [api/](api/README.md)                                                          | HTTP API conventions and endpoints (from Phase 3)                 |
| [decisions/](decisions/README.md)                                              | Architecture Decision Records                                     |
| [open-questions.md](open-questions.md)                                         | Unresolved business questions and pending technical decisions     |

Status: Phase 1 (domain specification) complete and awaiting review. The domain
documents describe intended behaviour; nothing beyond the scaffold is implemented.
