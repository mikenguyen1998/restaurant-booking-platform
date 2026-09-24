# Database

Status: **proposed** (Phase 1). Nothing has been migrated. The live schema,
`packages/database/prisma/schema.prisma`, still contains only the generator and
datasource.

| File                                                   | Contents                                                                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [`proposed-schema.prisma`](proposed-schema.prisma)     | Proposed Prisma models. Validated with `prisma validate`.                                                             |
| [`proposed-constraints.sql`](proposed-constraints.sql) | Constraints Prisma cannot express: exclusion constraints, CHECKs, partial unique indexes, audit immutability trigger. |

Related domain docs: [entities](../domain/entities.md),
[invariants](../domain/invariants.md).

## Conventions

| Topic              | Convention                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Naming             | Prisma models in PascalCase, mapped to snake_case plural tables (`@@map`). Columns in snake_case via Prisma's default mapping. |
| Keys               | UUID v7 (`uuid(7)`), time-ordered, index-friendly (T-23).                                                                      |
| Time               | `timestamptz(3)` for instants. Weekly opening hours as minutes since local midnight.                                           |
| Money              | `bigint` minor units + `char(3)` ISO 4217 currency. Pairs are all-null or all-set (CHECK).                                     |
| Coordinates        | `numeric(9,6)` (~0.1 m precision). Geo queries happen in Elasticsearch, so PostGIS is not required (T-20).                     |
| Localised taxonomy | `jsonb` `{ "vi": ..., "en": ... }` (T-21).                                                                                     |
| Deletion           | Resources are archived, not deleted. Bookings, reviews, and audit logs are never deleted by the application.                   |
| Constraints        | Everything that can be a database constraint is one. Raw-SQL constraints live in migrations next to the Prisma-generated SQL.  |

Column naming note: Prisma maps field names to columns verbatim unless `@map` is
used. Phase 2 will add `@map("snake_case")` to every field, so the raw SQL in
`proposed-constraints.sql` (which uses snake_case) matches. This is omitted from the
proposal to keep it readable.

## The overlap guarantee

The core concurrency guarantee is a single constraint:

```sql
ALTER TABLE booking_allocations
  ADD CONSTRAINT booking_allocations_no_overlap
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(starts_at, occupied_until, '[)') WITH &&
  ) WHERE (released_at IS NULL);
```

- It makes a double booking impossible regardless of application bugs, isolation
  level, or number of API instances.
- `occupied_until = ends_at + buffer`, so the buffer is enforced by the same rule.
- `[)` makes back-to-back occupancy legal (one ends at 20:15, the next starts 20:15).
- Released allocations stay as history and do not participate.
- The constraint is backed by a GiST index, which also serves overlap queries in the
  availability engine.

See [availability and allocation](../domain/availability-and-allocation.md) for how
the booking transaction uses it.

## Seed data (Phase 2)

Per the requirements, seed data focuses on Hanoi: country `VN`, city Hanoi,
cuisine/amenity taxonomy, restaurants with resources, menus, opening hours, and
reviews. Seed content (names, counts) will be proposed in Phase 2 for review.
