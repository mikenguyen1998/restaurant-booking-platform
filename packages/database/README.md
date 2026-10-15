# @restaurant-platform/database

Owns the live PostgreSQL schema, six committed migrations, seed and generated Prisma client. Only API code should consume the generated database client; web calls the API.

| Path                       | Purpose                                                                       |
| -------------------------- | ----------------------------------------------------------------------------- |
| `prisma/schema.prisma`     | Live models/settings; not the historical proposed schema                      |
| `prisma/migrations/`       | Committed schema/auth/search migrations (includes pg_trgm extension)          |
| `prisma/seed.ts`           | Hanoi demo owner/restaurant/resources/allocations; explicitly loads root .env |
| `prisma.config.ts`         | Reads root .env when present; datasource from DATABASE_URL                    |
| `src/generated/` (ignored) | Generated Prisma client, re-exported by src/index.ts                          |

```bash
pnpm db:generate
pnpm --filter @restaurant-platform/shared build
pnpm --filter @restaurant-platform/database db:migrate:deploy
pnpm --filter @restaurant-platform/database db:seed
pnpm --filter @restaurant-platform/database db:validate
```

Run migrations/seed only against the intended local database. For tests, explicitly override DATABASE_URL with the dedicated TEST_DATABASE_URL when applying migrations; see [setup](../../README.md#tests-and-ci). Generation does not create tables. `pnpm db:migrate` authors development migrations; it is not needed for a fresh reproduction of committed schema. `pnpm db:studio` opens Prisma Studio.

Fresh isolated setup and test evidence are recorded in [issues #3/#5 verification](../../docs/verification/issues-3-5.md). Domain policy acceptance is separate from implemented persistence; see [database notes](../../docs/database/README.md).
