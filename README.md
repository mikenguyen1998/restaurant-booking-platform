# Restaurant Discovery & Booking Platform

A real-world full-stack application for discovering restaurants and managing
reservations.

> **Status: backend implementation in progress.** Database, public restaurant API,
> session authentication and most of the availability read path are implemented.
> A responsive FE shell now connects discovery/auth and provides customer/owner/admin pages. Booking writes and owner/admin operations remain 501 scaffolds. Initial market: Hanoi, Vietnam.
> See [next steps](docs/NEXT-STEPS.md) and [progress](docs/PROGRESS.md).

## Planned capabilities

The full product scope below is planned; public restaurant reads and availability
already have backend implementations:

- Restaurant discovery
- Search and filtering
- Restaurant profiles
- Availability
- Booking
- Booking management
- Reviews
- Favorites
- Collections
- Notifications
- Restaurant management
- Admin management

## Planned architecture

This is the intended high-level architecture (details in
[docs/architecture](docs/architecture/README.md)). PostgreSQL and Redis are wired
into the API; Elasticsearch, object storage and the worker are still planned.

```text
Next.js Web
      |
      v
NestJS API
      |
      +---- PostgreSQL
      |
      +---- Redis
      |
      +---- Elasticsearch
      |
      +---- Object Storage
      |
      +---- Background Worker
```

| Layer            | Technology                                                   |
| ---------------- | ------------------------------------------------------------ |
| Frontend         | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui    |
| Backend          | NestJS, TypeScript                                           |
| Database         | PostgreSQL, Prisma                                           |
| Infrastructure   | Redis, Elasticsearch, object storage (S3-compatible), Docker |
| Async processing | Background worker (design pending)                           |
| Deployment       | Web on Vercel; API on Node.js-compatible hosting             |
| Monorepo         | pnpm workspaces, Turborepo                                   |

## Repository structure

```text
.
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # NestJS backend
├── packages/
│   ├── database/         # Prisma schema, migrations, generated client
│   ├── ui/               # Shared UI components (shadcn/ui foundation)
│   └── shared/           # Framework-agnostic shared types, constants, schemas
├── infrastructure/       # Docker and object storage configuration
├── docs/                 # Architecture, API, database docs and ADRs
├── .github/workflows/    # CI
├── docker-compose.yml    # Local PostgreSQL + Redis
└── .env.example          # Environment variable template
```

| Path                | Purpose                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`          | User-facing web app: public discovery pages, auth, user/restaurant dashboards, admin UI. Talks only to the API.                                                      |
| `apps/api`          | HTTP API and the single owner of business logic. One NestJS module per domain area (auth, users, restaurants, bookings, reviews, collections, notifications, admin). |
| `packages/database` | Prisma schema, migrations, and the generated client. Only the API depends on it.                                                                                     |
| `packages/ui`       | Reusable, presentation-only React components shared by the web app.                                                                                                  |
| `packages/shared`   | Code shared by web and API (types, constants, validation schemas). No framework dependencies.                                                                        |
| `infrastructure`    | Container configuration for PostgreSQL, Redis, and the API image; object storage notes.                                                                              |
| `docs`              | Architecture, API and database documentation, and architecture decision records.                                                                                     |

### Dependency rules

```text
apps/web  -> packages/ui, packages/shared
apps/api  -> packages/database, packages/shared
packages/ui, packages/database, packages/shared -> (no workspace dependencies)
```

## Development

### Prerequisites

- Node.js 24 (`.nvmrc`); pnpm 12.3.4 (`packageManager` in package.json).
- Docker with the daemon running (PostgreSQL 18 and Redis 8).

### Fresh local setup

Run from the repository root, targeting a new local database. The [verification report](docs/verification/issues-3-5.md) records a separate checkout, Docker project/volumes and ports used to verify these steps without touching an existing database.

```bash
pnpm install --frozen-lockfile
cp .env.example .env
# Edit .env before starting services if default ports/database names are occupied.
pnpm docker:up
pnpm db:generate
pnpm --filter @restaurant-platform/shared build
pnpm --filter @restaurant-platform/database db:migrate:deploy
pnpm --filter @restaurant-platform/database db:seed
printf 'NEXT_PUBLIC_API_URL=http://localhost:4000\n' > apps/web/.env.local
pnpm dev
```

Generation produces the Prisma client; **migrate:deploy** applies committed migrations to the selected fresh database; generation alone does not create tables. Build shared before seed because seed imports the compiled shared package. `db:migrate` is for authoring development migrations, not required to reproduce the existing schema. Seed inserts Hanoi demo data (including an owner and existing allocations); it does not provision a usable seeded password login. Use sign-up for an interactive account.

API defaults to `http://localhost:4000`, Swagger `/api`, health `/health`; web dev/start scripts use port 3000. Web provides discovery/auth flows and customer/owner/admin skeleton pages; booking submission and pending management actions are disabled. Stop dev with Ctrl-C; `pnpm docker:down` keeps service volumes.

### Environment

Root `.env` is required by API bootstrap and seed (they explicitly load it), and read by Prisma config/local Vitest. Required API values: `DATABASE_URL`, `REDIS_URL`, `WEB_URL` (origin only), `MAIL_FROM`; `API_PORT` defaults to 4000. `.env.example` supplies local placeholders. PostgreSQL user/password/database/port and Redis port configure Compose. If overriding ports, also update URLs; no real credentials are needed for local verification.

`SMTP_URL` empty selects FileMailTransport, writing `.eml` files under `apps/api/var/mail` when started from that workspace; it does not send email. Configure SMTP only when needed. `CACHE_TTL_MS`, `THROTTLE_TTL` (milliseconds), `THROTTLE_LIMIT` have defaults; `TRUST_PROXY` is only for a known deployed proxy count. Object-storage placeholders are not required for current routes.

Next.js reads `apps/web/.env.local`, not the root env for browser values. Set `NEXT_PUBLIC_API_URL` to the API origin there. Browser session calls need credentials and the configured trusted `WEB_URL`; see [API authentication/CSRF](docs/api/README.md#transport-authentication-and-csrf).

### Tests and CI

Create a separate disposable test database (default example below), then apply the same migrations. Do not point TEST_DATABASE_URL at your development database.

```bash
# First time only, with the default Compose user; skip createdb if already present.
docker compose exec postgres createdb -U restaurant restaurant_platform_test
export TEST_DATABASE_URL='postgresql://restaurant:restaurant@localhost:5432/restaurant_platform_test?schema=public'
DATABASE_URL="$TEST_DATABASE_URL" pnpm --filter @restaurant-platform/database db:migrate:deploy
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

Redis tests use `REDIS_URL` and uniquely owned keys; auth contracts use unique per-run schemas cloned from migrated public auth tables. No FLUSHDB, database reset or truncation of public auth tables. CI requires TEST_DATABASE_URL and REDIS_URL and fails if either is absent; tests bypass Turbo cache. Local service suites can skip when their env variable is absent, so unit-only green is not integration verification. See [test isolation and evidence](docs/verification/issues-3-5.md).

### Root commands

| Command            | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `pnpm dev`         | Run all apps and package watchers                                   |
| `pnpm build`       | Build all packages and apps                                         |
| `pnpm lint`        | Lint all workspaces                                                 |
| `pnpm typecheck`   | Type-check all workspaces                                           |
| `pnpm test`        | Run unit + configured PostgreSQL/Redis suites; see test setup above |
| `pnpm format`      | Format with Prettier                                                |
| `pnpm db:generate` | Generate the Prisma client                                          |
| `pnpm db:migrate`  | Create/apply Prisma migrations (development)                        |
| `pnpm db:studio`   | Open Prisma Studio                                                  |
| `pnpm docker:up`   | Start local PostgreSQL and Redis                                    |
| `pnpm docker:down` | Stop local services (data is kept in Docker volumes)                |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

For code review followed by test writing in Claude Code, use `/review-and-test`.
The existing [skill](.claude/skills/review-and-test/SKILL.md) reviews uncommitted
code, runs checks, and adds tests when the review passes. It leaves feature fixes
and commits to the author. See [next steps](docs/NEXT-STEPS.md) for details.

## License

See [LICENSE](LICENSE).

## Application skeleton

See [FE/BE skeleton guide](docs/architecture/application-skeleton.md) for pages, module boundaries and what works versus what still returns 501. Start with `pnpm dev` after the setup above. New scaffolds do not reserve resources or write bookings; the existing auth/discovery API remains connected.
