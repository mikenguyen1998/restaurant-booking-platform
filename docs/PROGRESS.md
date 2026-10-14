# Project Progress

Last updated: 2026-10-15 · Legend: ✅ done · 🚧 in progress · ⬜ todo

Step-by-step checklist with guides: [TODO.md](TODO.md).

**Accepted policy:** [issue #4](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/4); documentation reconciled for issue #3. Checked items below describe earlier **implemented behavior**, not policy compliance. [Implementation status](product/implementation-status.md) identifies source gaps. No policy tests were written/run during this documentation reconciliation; booking writes remain absent.

## Overview

| Phase                                | Status | Progress                                            |
| ------------------------------------ | ------ | --------------------------------------------------- |
| 0. Foundation                        | ✅     | 100%                                                |
| 1. Database                          | ✅     | 100%                                                |
| 2. Restaurants API (public)          | ✅     | 100%                                                |
| 3. Auth & Users                      | 🚧     | ~80%                                                |
| 4. Availability engine               | 🚧     | Read path exists; #4 policy gaps and writes pending |
| 5. Booking flow + concurrency        | ⬜     | 0%                                                  |
| 6. Owner dashboard API               | ⬜     | 0%                                                  |
| 7. Web app (Next.js)                 | ⬜     | 0%                                                  |
| 8. Background jobs & notifications   | ⬜     | 0%                                                  |
| 9. Reviews / favorites / collections | ⬜     | 0%                                                  |
| 10. Quality, deploy & portfolio      | ⬜     | ~15%                                                |
| 11. AI feature (stretch)             | ⬜     | 0%                                                  |

---

## 0. Foundation ✅

- [x] pnpm + Turborepo monorepo (`apps/api`, `apps/web`, `packages/*`)
- [x] Docker Compose: Postgres + Redis
- [x] CI: typecheck, lint, build
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
- [ ] Tests in CI (unit + e2e with Postgres service)
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

1. Roles / policies and ownership checks (phase 3); review with `/review-and-test`.
2. Refine unresolved decisions/technical designs and reconcile availability implementation with accepted #4 policy (phase 4); documentation only in this task.
3. Prepare schema/migrations for overlap prevention and idempotency, then build
   `POST /bookings` with real PostgreSQL concurrency tests (phase 5).

See [NEXT-STEPS.md](NEXT-STEPS.md) for the full sequence and acceptance criteria.
