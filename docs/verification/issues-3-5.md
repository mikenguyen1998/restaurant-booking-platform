# Issues #3 and #5: setup and test verification

Historical verification before the later user-authorized FE/BE skeleton. The source baseline/results below are preserved; newer application changes are described in [application skeleton](../architecture/application-skeleton.md). Statements about unchanged application code refer to this earlier verification scope, not the subsequent skeleton work.

Verified 15 October 2026 on branch `docs-tests/issues-3-5-verification`, based on main `144aeac4a8dcf9d3167aa57f06c742ca5e11b41b` after PR #29. This report covers uncommitted docs/tests/config changes; no application code, schema, production migrations or CI workflow was changed. No push, new Actions run, PR creation or issue closure was performed. Issue #6 was not implemented.

## Sources and prior evidence

Read issues [#3](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/3), [#4](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/4), [#5](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/5), [#6](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/6) and PR [#28](https://github.com/mikenguyen1998/restaurant-booking-platform/pull/28)/[#29](https://github.com/mikenguyen1998/restaurant-booking-platform/pull/29), including available comments/reviews (none returned). Root git status was clean before creating the branch. The only repo AGENTS.md found was the web-specific guide; ancestor/root guides were also checked earlier in this session.

- PR #28 merge is exactly `1be57760c8468ec087aa9c7462afe68dce70ae86`.
- Downloaded the successful [merge push run 38570708735](https://github.com/mikenguyen1998/restaurant-booking-platform/actions/runs/38570708735) using `gh run view 38570708735 --log`. Logs confirm six migrations, shared 11 passed, API 118 passed, including the 24-test PostgreSQL authentication contract, and test tasks marked **cache bypass**. This corroborates the prior report; it is not evidence about newly written tests.
- PR #29 merge is `144aeac4a8dcf9d3167aa57f06c742ca5e11b41b`. Its [successful PR run 38625486320](https://github.com/mikenguyen1998/restaurant-booking-platform/actions/runs/38625486320) is accessible. Approved #4 policy and partial/unresolved Q mappings were retained; this task does not choose the correction-window anchor or other deferred decisions.

## Isolation and fresh setup

Fresh local clone: `/private/tmp/rbp-issues-3-5-verification`, initially no node_modules/generated client. Installed with `pnpm install --frozen-lockfile`; then used Node **24.22.0**, pnpm **12.3.4**. Docker project **rbp-verify-35** used its own PostgreSQL 18/Redis 8 containers and named volumes on ports **55439/56389**, not the existing developer services on 5432/6379. API/web smoke ports were **54039/53039**. Root .env was created from the example and pointed only to those services. No existing developer database was reset, migrated or seeded. After verification, only rbp-verify-35 containers/network were stopped/removed with compose down; its disposable volumes and local logs were retained. Existing developer services were left running.

Actual successful setup commands, from that checkout:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm --filter @restaurant-platform/shared build
pnpm --filter @restaurant-platform/database db:migrate:deploy
pnpm --filter @restaurant-platform/database db:seed
docker compose -p rbp-verify-35 exec -T postgres createdb -U restaurant restaurant_platform_test
DATABASE_URL='postgresql://restaurant:restaurant@127.0.0.1:55439/restaurant_platform_test?schema=public' pnpm --filter @restaurant-platform/database db:migrate:deploy
```

Committed migrations ran successfully on both new databases. Seed completed on the separate demo database (Hanoi restaurant, owner, four resources, two existing bookings), not on the auth test database. Required current extensions `pg_trgm` and `plpgsql` were present. No booking exclusion constraint/btree_gist guarantee is claimed.

API dependency build and `node dist/main.js` startup passed under the isolated environment; Next dev on the alternate port returned HTTP 200 with the expected placeholder text. Full `pnpm build --force` was also checked with Node 24. Smoke used alternate-port Next CLI execution rather than the root dev command's fixed web port 3000; a browser booking UI was not tested and does not exist.

## HTTP/library verification (#3)

Inspected controllers, DTOs, services/repositories, bootstrap, auth/cache/mail configs and the freshly installed `@nestjs/authentication@0.0.1` module/definition/session/cookie/origin code. The library registers **no HTTP controllers**; routes are application-owned. Router startup logs and `/api-json` show the **16 method/path pairs** listed in [API reference](../api/README.md).

Actual HTTP smoke made **25 assertions**, all matching expected statuses: public health/discovery/detail/reviews/availability, invalid UUID/pagination (400), unauthorized /me (401), absent /auth/session (404), untrusted-Origin write (403), trusted-Origin verification/reset invalid-token errors (400), forgot (202), signup (201 with session cookie/no passwordHash), /me and session list (200), sign-in (200), resend (202), unknown session revoke (404), own session revoke (204), sign-out-everywhere/sign-out (204), revoked-cookie /me (401). Email used local file transport, not SMTP.

This verifies startup and those paths/statuses against actual services, not every error branch, a browser cookie implementation, production deployment, mail delivery or a booking write. Current availability is advisory and not full #4 compliance. A static source gap remains: review listing filters PUBLISHED by restaurantId without checking that the parent restaurant is APPROVED; unlike detail it can expose reviews for a non-approved parent. No fixture for that visibility gap was executed here; see source links in API reference. Expected public visibility is APPROVED-only; propose adding the parent check in application code in a separate authorized change.

## Retained test changes (#5)

- CI config fails before suite collection when TEST_DATABASE_URL or REDIS_URL is missing; local unconfigured service suites may still skip. CI does not load a local .env as a substitute for required job env.
- The authentication contract remains the library's 24 cases. Test helper creates a UUID schema per suite/process and clones six auth tables from the migrated public schema with columns/defaults/checks/indexes. Those tables have no foreign keys; helper fails if future foreign keys would make LIKE insufficient. Prisma schema selection and raw-query search_path target the run's schema; contract TRUNCATE is isolated. Teardown drops only that owned schema. This is test fixture DDL, not a new production migration.
- Three real Redis tests use the configured Keyv/cache-manager and throttler adapters: cross-instance cached reads/completed invalidation; millisecond TTL expiry; concurrent atomic counts/blocking (12 requests, 5 admitted and 7 blocked). UUID keys, explicit deletion and client disconnect; no FLUSHDB. These tests exercise existing services, not hypothetical booking writes.
- Existing Turbo test configuration already has cache:false and explicit database/Redis env; no CI/Turbo edit was necessary.

For CI-equivalent local verification, export only disposable service URLs and CI=true, as CI does. Example with the isolated services:

```bash
export CI=true
export DATABASE_URL='postgresql://restaurant:restaurant@127.0.0.1:55439/restaurant_platform_test?schema=public'
export TEST_DATABASE_URL="$DATABASE_URL"
export REDIS_URL='redis://127.0.0.1:56389'
pnpm test
pnpm test
# Separately verify simultaneous processes, not just the two sequential runs:
pnpm --filter @restaurant-platform/api test > /tmp/api-a.log 2>&1 &
first_pid=$!
pnpm --filter @restaurant-platform/api test > /tmp/api-b.log 2>&1 &
second_pid=$!
wait "$first_pid"
wait "$second_pid"
```

## Actual results and failure propagation

| Check actually executed                                                      | Result                                                                                       |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Baseline fresh-checkout `pnpm test`, before new test/config changes          | API 118 + shared 11 passed                                                                   |
| Updated root `pnpm test`, twice sequentially on same database                | Each: API **121** + shared **11** passed; includes 24 real PostgreSQL and 3 real Redis cases |
| Two simultaneous API test processes on same test database and Redis service  | Both **121/121** passed; per-process schema and UUID keys isolate fixtures                   |
| Post-run schema inspection                                                   | No `auth_test_%` schemas left                                                                |
| CI=true, unset TEST_DATABASE_URL, `pnpm test`                                | Exit **1**, explicit required-env setup error; no silent skip                                |
| CI=true, unset REDIS_URL, `pnpm test`                                        | Exit **1**, explicit required-env setup error                                                |
| Temporary shared spec throwing INTENTIONAL_VERIFICATION_FAILURE; `pnpm test` | Exit **1**, shared test failure propagated through Turbo/pnpm                                |
| Same temporary failure; `bash -e -c` running pnpm test then a marker command | Exit **1**, subsequent marker was not created                                                |
| Temporary failure removed in finally; restored `pnpm test`                   | API 121 + shared 11 passed; no failing temporary spec in final diff                          |
| `pnpm typecheck`, `pnpm lint` after final test edits                         | Passed                                                                                       |
| Full Node 24 `pnpm build --force`                                            | Passed                                                                                       |
| Formatting/local links/diff checks                                           | See final verification below                                                                 |

The temporary failure was created only in the isolated checkout, removed immediately after those two failure commands, and followed by a green run. **No intentionally failing GitHub Actions run was triggered**: failure propagation is proven locally/CI-equivalently, while the remote workflow's unhandled `run: pnpm test` is statically inspected. New test/helper changes have not run on GitHub because nothing was pushed. Test tasks bypassed Turbo cache in sequential/restored runs; cache hits for dependency builds do not replace test execution.

## Blocker: stale availability after concurrent invalidation

A separate temporary real-Redis race probe executed **4 cases: 3 passed, 1 failed**. The failing case was not added to the retained suite, as requested for a final diff without failing temporary tests. Its failing expectation was not weakened or inverted. Green retained tests do **not** settle this race.

- **Expected:** an older delayed invalidation cannot make a completed newer closure invalidation disappear; next availability remains `available: false`.
- **Actual:** `available: true` returned from an older cached version, after a newer read had correctly returned false.
- **Reproduction:** pause invalidation A after reading version 0; B advances to 1 and caches available=true; a closure changes repository state; C advances to 2 and returns false; resume A, which writes 1; the next read reuses the stale v1 true response. Cache storage is real Redis; repository state changes and scheduling barrier are controlled test fixtures. No booking writes were constructed.
- **Cause:** `AvailabilityService.invalidateAvailability()` performs read-then-set (`getVersion`, then `set(version + 1)`), permitting a delayed writer to regress the version. A Redis-backed cache alone cannot make that pair atomic.
- **Proposed fix for the developer:** atomic version advancement/invalidation across instances, with safe ordering for in-flight reads and no per-process L1. Adapt the Redis/Keyv abstraction deliberately rather than changing assertions. Application code was not changed.

The probe copy and logs remained in the session's temporary verification directory (`/private/tmp/rbp-cache-race-reproduction.spec.ts`, `/private/tmp/rbp-redis-contracts.log`); these are local evidence, not committed portable tests or CI artifacts. This application blocker prevents calling #5's cache-race acceptance fully satisfied.

## Acceptance assessment

| Criterion                                                        | Assessment                                                                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| #3 accurate README/API and actual library routes                 | Met by source audit, reference and HTTP smoke; not every branch/browser verified                                           |
| #3 architecture current versus proposals; sessions versus JWT    | Met; PR #29 policy retained, stale source comments not treated as active auth config                                       |
| #3 evidence-based progress; fresh setup                          | Met by this report and progress/setup updates; booking/web writes remain pending                                           |
| #5 existing tests gate failures                                  | Met locally/CI-equivalently and prior green remote logs; new remote failure run **not verified**                           |
| #5 fresh migrations, required extensions, disposable credentials | Met on fresh isolated services; no developer/production database touched                                                   |
| #5 repeatable cleanup and concurrent-run isolation               | Met for current auth/Redis suites: two sequential root suites, two simultaneous API suites and empty-schema teardown check |
| #5 real Redis and relevant races                                 | Three retained contracts passed; **not fully met** because stale-invalidation race is an application blocker               |
| #5 missing-env/cache protection                                  | Met locally: both missing-env probes fail; tests bypass Turbo cache; changes not remotely run                              |

## Final verification

Actually ran full `pnpm format:check` in the isolated checkout with the final docs/tests copied: passed. Local link/anchor scan: **71 checked**, passed; authorized-file scope check: **15 changed files**, all docs or permitted tests/helpers/config. `git diff HEAD --check` passed. No tests were added to validate Markdown wording. Existing/new infrastructure contracts do not establish #4 booking-policy implementation or implement #6.
