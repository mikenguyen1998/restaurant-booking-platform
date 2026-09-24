# Contributing

## Getting started

Follow the setup steps in [README.md](README.md#development).

## Before opening a pull request

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm format:check
```

CI runs install, typecheck, lint, and build on every pull request.

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
