# Database

**Implemented behavior:** live [Prisma schema](../../packages/database/prisma/schema.prisma), [migrations](../../packages/database/prisma/migrations) and [seed](../../packages/database/prisma/seed.ts) exist. [ERD](ERD.md) depicts the live schema, not policy compliance.

**Accepted policy** comes from [issue #4](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/4); policy details remain in the domain documents. [Implementation status](../product/implementation-status.md) records source gaps.

| Artifact                                                | Status                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `packages/database/prisma/schema.prisma` and migrations | Live implemented persistence                                                                |
| [proposed-schema.prisma](proposed-schema.prisma)        | Historical technical proposal predating #4; not migrated or an accepted booking contract    |
| [proposed-constraints.sql](proposed-constraints.sql)    | Historical technical proposal; names/columns differ from live schema; do not apply directly |

The historical proposed artifacts are intentionally not changed in this documentation-only task (no schema/SQL changes). Where they conflict with #4, accepted domain policy supersedes them; redesign before implementation. Their buffer defaults, optional guest phone, global idempotency-key uniqueness and noShowSuggestedAt-only lifecycle must not be treated as approved behavior.

## Implemented representation and pending design

Live identifiers are Prisma UUID defaults; opening hours are `@db.Time`, one row per restaurant/weekday; instants use `timestamptz`. Money currently uses Decimal fields, not the proposed bigint Money model. Settings include duration 120, slot interval 30, buffer 15 and cancellation deadline 120. `Restaurant.ownerId` models one owner with multiple owned restaurants. `BookingResource.isActive` is the live allocation-history flag, rather than the proposal's releasedAt.

**Pending implementation/design:** inclusive independent lastBookingTime; lead/horizon/party settings; resource closures; entered combination capacity and VIP behavior; policy/fee snapshots; required guest phone at booking validation; arrival/contact/hold data; scoped idempotency; events/outbox. Live Booking defaults to PENDING but v1 writes must explicitly create CONFIRMED; there is no booking creation path yet. Physical role representation must support owner-as-customer behavior, not imply mutually exclusive capabilities.

## Proposed overlap guarantee

No overlap exclusion constraint is present in the live migrations. **Technical proposal (T-01):** enforce no overlapping active occupied windows per resource using PostgreSQL GiST exclusion and `btree_gist`; occupancy includes buffer and uses `[)` bounds. Any SQL must be designed for live names/columns and cancellation/reschedule/release history, not copied from historical proposed SQL.

Constraint/lock/savepoint choice is technical design; accepted policy only requires transactional all-or-nothing allocation and no double booking. Arrival/hold/contact data, reminder rescheduling and secure guest replay (#12) remain separate technical designs. No schema, migrations or proposed SQL were altered in this reconciliation.
