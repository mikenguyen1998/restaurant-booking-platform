# @restaurant-platform/api

NestJS backend (ESM, TypeScript strict), deployed to Node.js-compatible hosting.

| Path                | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `src/main.ts`       | Bootstrap; listens on `API_PORT` (default `4000`)         |
| `src/app.module.ts` | Root module; imports the feature modules                  |
| `src/modules/*`     | Feature modules (empty)                                   |
| `src/common/`       | Cross-cutting pieces (filters, guards, pipes, decorators) |
| `src/config/`       | Configuration loading and validation                      |
| `src/database/`     | Integration with `@restaurant-platform/database`          |
| `src/jobs/`         | Background worker / job definitions                       |

Each feature module (`auth`, `users`, `restaurants`, `bookings`, `reviews`,
`collections`, `notifications`, `admin`) has the same layout:

```text
<module>/
├── controllers/
├── services/
├── dto/
├── entities/
├── repositories/
└── <module>.module.ts   # empty @Module({})
```

No controllers, services, or endpoints exist yet.

## Environment

Loading `.env` files is not wired up yet; it is part of the `src/config` design.
Until then the API reads only variables already present in the process environment.

## Commands

```bash
pnpm --filter @restaurant-platform/api dev         # watch mode, http://localhost:4000
pnpm --filter @restaurant-platform/api build
pnpm --filter @restaurant-platform/api start:prod  # run the compiled build
pnpm --filter @restaurant-platform/api test        # Vitest unit + database contract tests
```

## Tests

Run `pnpm test` from the repository root. Vitest reads the root `.env`.
The auth store contract suite needs a disposable PostgreSQL database specified
by `TEST_DATABASE_URL`; its database name must end in `_test`. It truncates auth
tables between cases. Never point it at the development or production database.
Without `TEST_DATABASE_URL`, the database suite is skipped.

Start Docker Desktop, then PostgreSQL:

```bash
docker compose up -d postgres
```

For the default local credentials from `.env.example`, first-time setup is:

```bash
# Only create the database if it does not already exist.
docker compose exec postgres createdb -U restaurant restaurant_platform_test

# Use the same dedicated URL in the root .env as TEST_DATABASE_URL.
export TEST_DATABASE_URL='postgresql://restaurant:restaurant@localhost:5432/restaurant_platform_test?schema=public'
DATABASE_URL="$TEST_DATABASE_URL" pnpm --filter @restaurant-platform/database db:migrate:deploy
pnpm test
```

Adjust credentials/port to match your local Compose configuration. Applying
migrations must target the test URL, not the normal `DATABASE_URL`. An unavailable
server or missing auth tables now produces a setup error before any cleanup runs.
