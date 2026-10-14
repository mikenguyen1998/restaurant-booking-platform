# Restaurant Discovery & Booking Platform

A real-world full-stack application for discovering restaurants and managing
reservations.

> **Status: backend implementation in progress.** Database, public restaurant API,
> session authentication and most of the availability read path are implemented.
> Booking writes and the product web UI are pending. Initial market: Hanoi, Vietnam.
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

- Node.js 24 (see `.nvmrc`)
- pnpm 12 (`corepack enable` picks up the version pinned in `package.json`)
- Docker (for PostgreSQL and Redis)

### Setup

```bash
pnpm install
cp .env.example .env
pnpm docker:up        # start PostgreSQL (5432) and Redis (6379)
pnpm dev              # web on http://localhost:3000, API on http://localhost:4000
```

### Root commands

| Command            | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `pnpm dev`         | Run all apps and package watchers                                |
| `pnpm build`       | Build all packages and apps                                      |
| `pnpm lint`        | Lint all workspaces                                              |
| `pnpm typecheck`   | Type-check all workspaces                                        |
| `pnpm test`        | Run workspace test suites (DB suites need test DB configuration) |
| `pnpm format`      | Format with Prettier                                             |
| `pnpm db:generate` | Generate the Prisma client                                       |
| `pnpm db:migrate`  | Create/apply Prisma migrations (development)                     |
| `pnpm db:studio`   | Open Prisma Studio                                               |
| `pnpm docker:up`   | Start local PostgreSQL and Redis                                 |
| `pnpm docker:down` | Stop local services (data is kept in Docker volumes)             |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

For code review followed by test writing in Claude Code, use `/review-and-test`.
The existing [skill](.claude/skills/review-and-test/SKILL.md) reviews uncommitted
code, runs checks, and adds tests when the review passes. It leaves feature fixes
and commits to the author. See [next steps](docs/NEXT-STEPS.md) for details.

## License

See [LICENSE](LICENSE).
