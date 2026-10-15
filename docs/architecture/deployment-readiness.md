# Deployment readiness

## Chosen topology and official references

Prepared 15 October 2026: two Node services on Railway (Next web + Nest API), private PostgreSQL/Redis, Cloudflare-managed DNS with HTTPS sibling hostnames such as app.example.com and api.example.com. Begin with DNS-only CNAMEs to Railway-provided targets and complete Railway domain verification/TLS first. No hosting resources have been created or deployed.

This is a technical deployment choice for the current Node monorepo, not a change to booking policy. Cloudflare's current [Next.js Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) recommends vinext and documents other adapter paths. We retain the installed Next runtime rather than introducing a runtime migration or treating this dynamic app as a static Pages export. Cloudflare DNS-only records do not pass HTTP through Cloudflare; see [proxy status](https://developers.cloudflare.com/dns/proxy-status/). If proxying is enabled later, separately verify TLS, cookies, client IP/trust-proxy behavior and cache rules; never cache personalized auth/booking responses.

Railway configuration follows official [config-as-code](https://docs.railway.com/config-as-code/reference), [Dockerfile build/ARG behavior](https://docs.railway.com/builds/dockerfiles), [pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command) and [healthchecks](https://docs.railway.com/deployments/healthchecks). Healthchecks use the service PORT and gate a new deployment; they are not continuous monitoring. These references were consulted for configuration; local checks are not a deployed-service claim.

## Configuration files

- `infrastructure/deploy/Dockerfile`: repository-root context, Node 24 Debian/OpenSSL, frozen pnpm 12.3.4 install, Prisma generation via Turbo build, shared/API/web builds. The same runtime artifact serves either service; tooling/dev dependencies are deliberately retained for the Prisma release step. This preview image is not size-optimized.
- `.dockerignore`: excludes env secrets, dependencies, generated clients and local build artifacts; runtime generation/build runs inside the image.
- `infrastructure/deploy/railway-api.json`: build Dockerfile, pre-deploy committed migrations, API start wrapper, `/health`, retry/timeout configuration.
- `infrastructure/deploy/railway-web.json`: same build, web start wrapper, `/` health; no migration step.
- `start-api.sh`: maps Railway PORT to the existing API_PORT, checks required env and creates an empty private root `.env` only if absent. Existing bootstrap requires the file; actual values stay in injected process env. It never overwrites a mounted file. No application bootstrap/business logic was changed.
- `start-web.sh`: calls Next directly, binds 0.0.0.0 and uses PORT rather than the development script's fixed port.
- `infrastructure/deploy/.env.example`: variable names/examples only; use a host secret store for real values.

Create two Railway services with **repository root `/`**. Set the config file path explicitly to `/infrastructure/deploy/railway-api.json` or `/infrastructure/deploy/railway-web.json`; the files are not auto-selected by service name. Do not set an apps/api or apps/web root directory: the Docker context must include workspace packages. No Docker target-stage variable is needed. Set a public API URL build argument on both services because both use the same full build.

## Environment and services

| Service     | Variables / requirements                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API runtime | NODE_ENV=production; PORT supplied by Railway (or explicitly 4000); DATABASE_URL and REDIS_URL from private Railway services; exact HTTPS WEB_URL origin; MAIL_FROM and real SMTP_URL |
| Web build   | NEXT_PUBLIC_API_URL=https://api.example.com; rebuild whenever this public URL changes                                                                                                 |
| Web runtime | NODE_ENV=production; PORT supplied by Railway (or explicitly 3000)                                                                                                                    |
| Proxy       | TRUST_PROXY only after verifying the exact hop count; DNS-only Cloudflare adds no HTTP proxy hop                                                                                      |
| PostgreSQL  | Version 18, persistent volume/backups, required extensions from committed migrations; migration role must have extension permissions                                                  |
| Redis       | Version 8; private connectivity; restrict access, configure persistence/restart policy appropriate to cache and throttler                                                             |

No test URLs are required in runtime. Never configure TEST_DATABASE_URL to a preview/production database. Empty SMTP_URL writes local `.eml` files and does not deliver mail; it is insufficient for email verification and a real booking flow. No development seed runs on deployment. Verify cookies using sibling custom domains under the same site; unrelated railway.app/other-site origins are not a substitute for browser session testing.

## Build, migration and startup

Local image build from the repository root (no deployment):

```bash
docker build -f infrastructure/deploy/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  -t restaurant-booking-preview:local .
```

Railway injects declared public build ARG values; do not add secrets as Docker ARG/ENV. Runtime DATABASE_URL/REDIS_URL/SMTP values must not be baked into image layers. The Dockerfile needs network access to the package registry and base image registry, but no live database or root env file to compile.

The API service's pre-deploy command executes exactly:

```bash
pnpm --filter @restaurant-platform/database db:migrate:deploy
```

Review migrations/status and backups before enabling that release step against a real database. Existing committed migrations only; no reset, migrate-dev or seed. Pre-deploy failure must block startup. Keep only API responsible for migrations. Railway pre-deploy and API startup are separate processes, so the empty root env file is created by the startup wrapper, not by pre-deploy. Prisma config already supports injected env without a file.

The checked-in start commands are:

```bash
sh infrastructure/deploy/start-api.sh
sh infrastructure/deploy/start-web.sh
```

They run inside the Docker artifact at `/app`; they are not generic host commands outside that layout. Health `/health` checks PostgreSQL through the existing indicator; it does not verify Redis or email delivery. Web `/` verifies serving the UI, not API reachability. Keep distinct runtime monitoring for dependencies.

## Reproduce the isolated local smoke environment

The supplied Compose file uses throwaway credentials and publishes only the app ports; PostgreSQL/Redis stay on the private test network. Build the image with the matching browser API URL, then start a unique project:

```bash
docker build -f infrastructure/deploy/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:54039 \
  -t rbp-booking-skeleton:verification .
docker compose -p rbp-booking-preview-check \
  -f infrastructure/deploy/compose.smoke.yml up -d --wait
curl --fail http://localhost:54039/health
curl --fail http://localhost:53039/
docker compose -p rbp-booking-preview-check \
  -f infrastructure/deploy/compose.smoke.yml logs migrate
```

Inspect http://localhost:53039/bookings/new with a restaurantId/date/slot/partySize query. The valid request should reach 501 even on the empty migrated database. For a UUID-only example, use restaurantId `22222222-2222-4222-8222-222222222222`, date `2026-12-31`, slot `18:30`, partySize `2`; there is no seeded restaurant or actual booking. Ports 53039/54039 must be free. Stop only this owned project after checking:

```bash
docker compose -p rbp-booking-preview-check \
  -f infrastructure/deploy/compose.smoke.yml down
```

The smoke database is disposable and not a production volume. No seed or reset command is used.

## Smoke instructions

Use a disposable preview/test environment before production. For local container verification, start isolated PostgreSQL/Redis (the root Compose file is for services only), pass an isolated runtime env file with container-reachable URLs, and run two containers from the image with the respective start scripts, PORT mapping and shared network. Do not run migration/test commands against an existing personal database.

On the chosen HTTPS origins:

1. GET API `/health` must return 200; inspect startup logs without printing secrets. GET web `/` and restaurant pages must render; verify browser API requests target the build-time HTTPS URL.
2. Exercise actual sign-up/sign-in, GET `/me`, session listing and sign-out from the browser. Confirm credentialed CORS/CSRF, secure HttpOnly cookies, verification email delivery and session revocation across reloads.
3. Submit a valid booking form with Idempotency-Key: current skeleton returns **501**, displays the pending message and does not create a booking. Owner/admin writes also remain 501; unauthenticated protected reads return 401. Current 501 is a successful scaffold check, never booking end-to-end acceptance.
4. Check malformed body/UUID, missing key and spoofed actorId/customerId/ownerId produce 400. Verify these checks do not introduce authorization from request identity fields. Role/ownership is still a service implementation task.
5. Check mobile/desktop, API unavailable/retry, and backend restart. Confirm no cached private responses at any CDN/proxy.

Keep the previous image for application rollback. Assess database compatibility before reverting an artifact; reverting code does not reverse migrations.

## Release limitations and verification

This is a controlled preview skeleton, not a production booking MVP. Pending service/repository methods still return 501. Known cache invalidation and review visibility bugs remain in [the earlier report](../verification/issues-3-5.md); no claim that policy/role enforcement, worker delivery or secure guest replay is complete. See [booking handoff](booking-mvp-handoff.md) for implementation order.

Actual local checks: `pnpm typecheck`, `pnpm lint`, `pnpm build` passed. `pnpm test` passed API 163 (including 42 new booking contracts, 24 retained PostgreSQL and 3 Redis cases), web 21 client contracts, shared 11. Test tasks bypassed Turbo cache. A Linux ARM64 Docker image built successfully without a root .env; the Compose smoke project applied all six migrations to a new database and API/web healthchecks passed. Runtime probes found 82 registered API method/path pairs and all 31 web pages returned 200; verified real sign-up/session/sign-out, 400 malformed/spoofed DTO/key/UUID checks, 401 without session and explicit 501. Chrome submitted the mobile guest booking form, observed the Idempotency-Key/body, API 501 and pending UI with no browser exceptions or horizontal overflow at 390px. Booking row count remained zero. These are local/container checks; Railway Linux AMD64 builds, actual domains/HTTPS/proxy and SMTP delivery were not exercised. No production migration, deployment, DNS change, commit or push is performed in this follow-up. Full HTTPS browser cookie/mail delivery acceptance requires an authorized preview deployment.
