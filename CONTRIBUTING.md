# Contributing

## Getting started

Follow the setup steps in [README.md](README.md#development).

## Before opening a pull request

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format:check
```

CI provisions PostgreSQL/Redis, installs dependencies, typechecks/lints, applies committed test-database migrations, runs tests, checks formatting and builds. Tests are not Turbo-cached. See [isolated test setup and evidence](docs/verification/issues-3-5.md); integration env is mandatory in CI.

## Guidelines

- **Respect package boundaries.** Follow the dependency rules in the README. The
  web app never accesses the database directly, and `packages/*` never import
  from `apps/*`.
- **Keep business logic in the API.** `packages/ui` stays presentation-only;
  `packages/shared` stays framework-agnostic.
- **Schema changes go through Prisma migrations** in `packages/database`.
- **Record significant architectural decisions** in `docs/decisions/`.
- **Never commit secrets.** Only `.env.example` is tracked.
- **Add dependencies to the workspace that uses them**, not to the root
  (the root only holds repository tooling).
