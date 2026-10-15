# Project Progress

Last updated: 2026-10-15 · Legend: ✅ done · 🚧 in progress · ⬜ todo

Step-by-step checklist with guides: [TODO.md](TODO.md).

**Accepted policy:** [issue #4](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/4); documentation reconciled for issue #3. Checked items below describe earlier **implemented behavior**, not policy compliance. [Implementation status](product/implementation-status.md) identifies source gaps. No policy tests were written/run during this documentation reconciliation; booking writes remain absent.

## Overview

Evidence baseline: main `144aeac` after PR #29, verified 15 October 2026. Full commands/results and environment limits: [issues #3/#5 verification](verification/issues-3-5.md). Implemented is not synonymous with verified or policy-complete.

| Area                           | Implemented / source evidence                                                       | Actually verified                                                                                       | Pending / blocker                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Foundation/database            | Compose, schema, six migrations, seed                                               | Fresh isolated install/generation/migrations/seed; Node 24 full build                                   | Booking persistence extensions still pending                                                                       |
| Restaurants API                | Public list/detail/reviews/availability controllers                                 | Startup/OpenAPI plus HTTP smoke                                                                         | Parent approval check absent on review list (static gap); full #4 availability policy missing                      |
| Auth/users                     | Session controllers, verification/reset, /me                                        | Existing tests, 24 PostgreSQL contracts, HTTP/CSRF smoke                                                | Roles/ownership use cases and booking verified-email gate (#6+)                                                    |
| Availability/cache             | Read path, Keyv Redis, version invalidation                                         | Three retained Redis contracts                                                                          | Delayed invalidation revives stale version: reproduced application race, not fixed                                 |
| CI/tests (#5)                  | Migrate/test/format/build gate, real services, Turbo test cache disabled            | Prior #28/#29 green remote logs; two local suites, concurrent APIs, missing-env and failure propagation | New tests/config not pushed or remotely run; no intentional failing Actions run; cache race blocks full acceptance |
| Booking/owner/admin/web/worker | Registered 501 service scaffolds; responsive discovery/auth UI and workspace shells | 31 web routes and 80 API method/path registrations smoke-tested locally                                 | Booking writes, role/ownership enforcement for stubs, worker, engagement and deployment remain pending             |

---

## 0. Foundation ✅

- [x] pnpm + Turborepo monorepo (`apps/api`, `apps/web`, `packages/*`)
- [x] Docker Compose: Postgres + Redis
- [x] CI: typecheck, lint, test-database migrations, tests, format check, build (PR #28; prior remote logs linked above)
- [x] Domain docs (`docs/domain/*`)

## 1. Database ✅

- [x] Prisma schema (users, restaurants, resources, bookings, reviews, …)
- [x] Initial migration
- [x] Seed script

## 2. Restaurants API (public) ✅

- [x] PrismaModule / PrismaService
- [x] Health check endpoint
- [x] Pagination DTO + util
- [x] `GET /restaurants` (paginated)
- [x] `GET /restaurants/:id`
- [x] `GET /restaurants/:id/reviews`
- [x] Filters: city, district, cuisine (slug), price level, search by name
- [x] Accent-insensitive name search: `searchName` + `normalizeSearch` (shared) + `pg_trgm` GIN index
- [x] Seed sets `searchName`; Prisma pinned to 7.10, seed runs via `tsx`
- [x] City/district slug columns (`citySlug`, `districtSlug` + `slugify`)
- [x] Clean up slug migrations (squashed into `restaurant_location_slugs`)
- [x] Canonical city spelling in seed ("Hà Nội" → `ha-noi`)
- [x] Only list `APPROVED` restaurants
- [x] Global ValidationPipe
- [x] Global exception filter + consistent error format (Prisma P2002/P2025/P2003 mapped)
- [x] `ParseUUIDPipe` on `:id` routes
- [x] Swagger / OpenAPI docs (`/api`)
- [x] Commit current work

## 3. Auth & Users 🚧

Following https://docs.nestjs.com/security/authentication (`@nestjs/authentication`), **session cookies** (moved from JWT on 2026-10-11, see T-12), class-validator DTOs.

- [x] `POST /auth/sign-up` (creates the account and signs it in), `POST /auth/sign-in` → `__Host-sid` cookie
- [x] `POST /auth/sign-out`, `POST /auth/sign-out-everywhere`, `GET /auth/sessions`, `DELETE /auth/sessions/:id`
- [x] `SessionAuth` (`SessionCookieProvider`) + global guard; `@Public()` on restaurants, health, auth
- [x] CORS (credentials) + `enableCsrfProtection()` for `WEB_URL`
- [x] `GET /me`
- [x] Email verification: link sent on sign-up, `POST /auth/email/verify`, `POST /auth/email/verification`
- [x] Password reset: `POST /auth/password/forgot` (always 202), `POST /auth/password/reset` (ends every session)
- [x] `PrismaAuthenticationStore` (sessions, refreshTokens, mfa, emailTokens) passing the library's contract suite incl. concurrency; production starts
- [x] NestJS 12.1.2; `@nestjs/authentication` + `@nestjs/mail` pinned to 0.0.1
- [ ] Roles / policies (`@nestjs/authorization`)
- [x] Rate limit: global `AuthThrottlerGuard` (email + IP), 100/min default; sign-in & sign-up 5/15 min, forgot & resend 3/15 min
- [x] Throttler counts in Redis (`@nest-lab/throttler-storage-redis`, peer range stops at Nest 11 — works on 12.1, recheck on upgrades); `TRUST_PROXY` env for `trust proxy`

## 4. Availability engine 🚧

- [x] `AvailabilityService` + DTO skeleton
- [x] `AvailabilityService` injected in `RestaurantsController`, `GET /restaurants/:id/availability` wired
- [x] Replace earlier placeholder query in `AvailabilityService`
- [x] Existing slots use opening hours + interval and require meal end <= close (implemented behavior; conflicts with accepted cutoff policy)
- [x] Exclude closures and past times (restaurant timezone)
- [x] Check resource conflicts via active `BookingResource` intervals (+ buffer)
- [x] Existing candidate ranking and summed-member combinations (implemented behavior; entered capacity and VIP policy pending)
- [x] Existing unit tests for current slot/candidate helpers (not proof of #4 compliance)
- [ ] Cache availability in Redis, invalidate on booking change (🚧 read-through cache + versioned keys done; bump version on booking create/cancel in phase 5)

## 5. Booking flow + concurrency ⬜ (portfolio highlight)

- [ ] `POST /bookings` with allocation inside a transaction
- [ ] Prevent double booking (Postgres exclusion constraint on `tstzrange` or `SELECT … FOR UPDATE`)
- [ ] Idempotency key for create
- [ ] V1 lifecycle: create CONFIRMED; cancel/reschedule/arrival/hold/contact/NO_SHOW/correction according to [accepted lifecycle](domain/booking-lifecycle.md); PENDING/EXPIRED reserved for future flow
- [ ] Cancellation deadline rule
- [ ] `bookingNumber` generator
- [ ] Concurrency test: N parallel requests → exactly 1 succeeds
- [ ] Audit log entries

## 6. Owner dashboard API ⬜

- [ ] CRUD restaurant (DRAFT → PENDING_APPROVAL)
- [ ] Manage tables/resources, opening hours, closures, booking settings
- [ ] List / mark no-show bookings (online booking confirms inside creation transaction)
- [ ] Admin: approve / reject restaurants

## 7. Web app (Next.js) ⬜

- [ ] Layout, theme, shared UI (`packages/ui`)
- [ ] API client + TanStack Query
- [ ] Restaurant list + filters + detail page
- [ ] Availability picker (date, party size, slot)
- [ ] Booking form + confirmation page
- [ ] Auth pages, "My bookings"
- [ ] Owner dashboard (bookings table, resources)

## 8. Background jobs & notifications ⬜

- [ ] BullMQ on Redis
- [ ] Arrival-aware completion, hold/absence alerts and booking reminders; PENDING expiry is a future-flow proposal
- [ ] Email confirmation / reminder
- [ ] In-app notifications

## 9. Reviews / favorites / collections ⬜

- [ ] Review only after COMPLETED booking
- [ ] Owner reply
- [ ] Favorites, collections

## 10. Quality, deploy & portfolio ⬜

- [x] CI pipeline
- [x] Existing unit + PostgreSQL authentication tests gated in CI with fresh migrations and Redis services (PR #28)
- [x] Locally verified per-run auth schemas, 3 real Redis contracts, missing-env guards, repeat cleanup and concurrent API runs
- [ ] New test/config changes verified on GitHub; intentional failing remote run not performed
- [ ] Application fix for reproduced non-atomic availability invalidation; #5 cache-race acceptance remains blocked
- [ ] Dockerfile for API
- [ ] Deploy: web → Vercel, API + DB + Redis → Railway/Fly/Render
- [ ] README: architecture diagram, screenshots, live demo link
- [ ] Write-up: how double booking is prevented
- [ ] Add to mikenguyen.site with repo link

## 11. AI feature (stretch) ⬜

- [ ] Natural-language search ("table for 4, Friday 7pm, Hoan Kiem")
- [ ] LLM tool calling → availability API
- [ ] Streaming chat UI

---

## Next up

1. Developer review/fix of the reproduced availability invalidation race; preserve accepted #4 policy. This task does not modify application code.
2. Review the #3/#5 verification report and run the unpushed test/config diff remotely when authorized; do not mark remote failure propagation proven from local checks.
3. Prepare schema/migrations for overlap prevention and idempotency, then build
   `POST /bookings` with real PostgreSQL concurrency tests (phase 5).

See [NEXT-STEPS.md](NEXT-STEPS.md) for the full sequence and acceptance criteria.

## Later application skeleton

User-authorized FE/BE scaffolding now supplies discovery/auth UI, account/owner/admin layouts/pages and registered 501 backend handlers. [Skeleton guide](architecture/application-skeleton.md) distinguishes working flows from placeholders. Existing progress/verification above is historical evidence; a route scaffold is not implemented booking, ownership policy, transaction or worker behavior.
