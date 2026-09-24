# @restaurant-platform/database

Owns the PostgreSQL schema, migrations, and the generated Prisma client.

| Path                       | Purpose                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `prisma/schema.prisma`     | Prisma schema (generator + datasource only; no models yet)   |
| `prisma/migrations/`       | Migration history (empty)                                    |
| `prisma/seed.ts`           | Seed entry point (empty)                                     |
| `prisma.config.ts`         | Prisma CLI config; reads `DATABASE_URL` from the root `.env` |
| `src/index.ts`             | Package entry point; re-exports the generated client         |
| `src/generated/` (ignored) | Output of `prisma generate`                                  |

## Commands

```bash
pnpm --filter @restaurant-platform/database db:generate   # generate the client
pnpm --filter @restaurant-platform/database db:validate   # validate the schema
pnpm --filter @restaurant-platform/database db:migrate    # create/apply migrations (dev)
pnpm --filter @restaurant-platform/database db:studio     # open Prisma Studio
```

Only `apps/api` should depend on this package. The web app talks to the API, never
to the database.
