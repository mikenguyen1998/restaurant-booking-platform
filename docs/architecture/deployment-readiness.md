# Deployment readiness

## Current release scope

This release is the [FE/BE skeleton](application-skeleton.md), suitable for a controlled preview. Discovery and authentication are connected; booking and management writes return 501. Workspace navigation does not implement role/ownership authorization. Do not enable pending controls or advertise live reservations.

Local verification passed typecheck, lint, build, API 121 tests and shared 11 tests. All 31 web pages returned 200 in production-start smoke checks. This is local evidence, not evidence of a deployed environment. GitHub CI must pass on the merged revision before release.

Known application blockers and limitations remain in [the verification report](../verification/issues-3-5.md): non-atomic cache invalidation can resurrect stale availability; public reviews lack a parent-restaurant approval filter. Booking writes, worker delivery and full booking policy implementation remain pending.

## Runtime requirements

- Node 24+, pnpm 12.3.4; deploy the monorepo with workspace dependencies and generated Prisma client available. The current build does not produce standalone API or web container images.
- PostgreSQL 18 with all committed migrations, including required extensions; Redis 8 reachable by the API. Provision separate disposable databases/services for tests.
- The API bootstrap explicitly loads the repository-root `.env` relative to `apps/api/dist/main.js`; provision that file securely at runtime. Injected platform variables alone do not remove this file requirement. Never package or commit local credentials.
- Set `NODE_ENV=production`, `DATABASE_URL`, `REDIS_URL`, `API_PORT`, `WEB_URL`, `MAIL_FROM`; configure `SMTP_URL` for actual delivery. Empty SMTP writes local `.eml` files and is not production email delivery.
- Set `NEXT_PUBLIC_API_URL` for the web **before build**. `WEB_URL` must match the browser origin exactly for credentialed CORS and CSRF. Prefer HTTPS sibling hostnames under the same site and verify session cookies in the target browser.
- Set `TRUST_PROXY` only to the verified reverse-proxy hop count. Configure TLS, routing, persistent database storage, backups, private database/Redis networking and secret management on the chosen host.

## Release procedure

From the repository root, with the deployment-specific environment provisioned:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

Run the existing CI test job against isolated services; do not point tests at the deployment database. Back up the deployment database, review migration status and run committed migrations as a single release step:

```bash
pnpm --filter @restaurant-platform/database db:migrate:deploy
```

Do not run the development seed against production. Start separate long-running API and web processes using the built workspaces:

```bash
pnpm --filter @restaurant-platform/api start:prod
pnpm --filter @restaurant-platform/web start
```

The web start script currently fixes port 3000; API uses API_PORT, default 4000. Configure the host to match those ports. The checked-in Docker Compose file provisions local services; it is not an application deployment stack. No hosting provider, domain, production resources or deployment automation has been configured by this change.

## Verify before exposing a preview

Check `/health`, restaurant list/detail and browser credentialed sign-in/session/sign-out on the actual HTTPS origins. Verify mail delivery, restart behavior and logs without secrets. Confirm pending writes return 501 without changing data and that the UI does not imply a reservation was made. Check mobile layouts and error/retry states.

Keep the previous application artifact for rollback. Before any database rollback, assess migration compatibility and restore strategy; do not assume reverting application code reverses database changes. Promote only after reviewing the known limitations and the merged CI result.
