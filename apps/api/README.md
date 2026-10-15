# @restaurant-platform/api

NestJS ESM API. Implemented: public restaurant/availability reads, health, cookie-session authentication, verification/reset and current user. Booking/owner/admin and other reserved routes now have module/controller/service scaffolds returning 501. Worker ports remain non-operational. See [skeleton guide](../../docs/architecture/application-skeleton.md). See [HTTP API reference](../../docs/api/README.md) and [implementation gaps](../../docs/product/implementation-status.md).

`src/modules/*` uses controllers/services/repositories/DTOs; `src/common` owns filters, guards and helpers; `src/config` defines auth/cache/mail/throttling; `src/database` wraps Prisma. Planned architecture is not a claim that these directories are empty.

## Environment and startup

Follow [fresh setup](../../README.md#fresh-local-setup) at the root: create root .env, start PostgreSQL/Redis, generate client, build shared, apply migrations and seed the selected new database. Bootstrap explicitly reads root .env; ConfigModule also reads process env. Without SMTP_URL, mail is written to local files, not sent.

```bash
pnpm --filter @restaurant-platform/api dev
# Compiled alternative, after building dependencies:
pnpm --filter @restaurant-platform/api... build
pnpm --filter @restaurant-platform/api start:prod
```

API_PORT defaults to 4000; `/health`, `/api` and `/api-json` are available. Browser writes use the WEB_URL origin/CSRF checks and session-cookie contract in the API reference.

## Tests

See [root test setup](../../README.md#tests-and-ci) and [verification report](../../docs/verification/issues-3-5.md).

```bash
pnpm test
# Focused integration contracts (requires migrated TEST_DATABASE_URL and REDIS_URL):
pnpm --filter @restaurant-platform/api test src/modules/auth/repositories/prisma-authentication.store.spec.ts src/config/redis.integration.spec.ts
```

Auth tests only accept a database name ending `_test`; each suite/process creates a unique schema and clones the six migrated public auth tables with defaults/checks/indexes. Those tables currently have no foreign keys; the helper fails if that changes. Contract cleanup truncates only that schema and teardown drops it. It does not migrate/reset/seed a developer database. Redis tests own UUID keys and disconnect their clients; no FLUSHDB. CI errors on missing TEST_DATABASE_URL or REDIS_URL before loading local env or skipping suites. Local runs load root .env and may skip unconfigured service suites.

A cache invalidation race was reproduced separately; the green retained suite does not mean that race is fixed. See the blocker in the verification report.
