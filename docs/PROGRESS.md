# Project Progress

Last updated: 2026-10-01 · Legend: ✅ done · 🚧 in progress · ⬜ todo

## Overview

| Phase | Status | Progress |
|---|---|---|
| 0. Foundation | ✅ | 100% |
| 1. Database | ✅ | 100% |
| 2. Restaurants API (public) | 🚧 | ~50% |
| 3. Auth & Users | ⬜ | 0% |
| 4. Availability engine | 🚧 | ~5% |
| 5. Booking flow + concurrency | ⬜ | 0% |
| 6. Owner dashboard API | ⬜ | 0% |
| 7. Web app (Next.js) | ⬜ | 0% |
| 8. Background jobs & notifications | ⬜ | 0% |
| 9. Reviews / favorites / collections | ⬜ | 0% |
| 10. Quality, deploy & portfolio | ⬜ | ~15% |
| 11. AI feature (stretch) | ⬜ | 0% |

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

## 2. Restaurants API (public) 🚧
- [x] PrismaModule / PrismaService
- [x] Health check endpoint
- [x] Pagination DTO + util
- [x] `GET /restaurants` (paginated)
- [x] `GET /restaurants/:id`
- [x] `GET /restaurants/:id/reviews`
- [ ] Filters: city, district, cuisine, price level, search by name
- [ ] Only list `APPROVED` restaurants
- [ ] Global ValidationPipe + exception filter + consistent error format
- [ ] Swagger / OpenAPI docs
- [ ] Commit current staged work

## 3. Auth & Users ⬜
- [ ] Register / login (email + password, argon2/bcrypt)
- [ ] JWT access + refresh tokens
- [ ] Roles guard (`CUSTOMER`, `RESTAURANT_OWNER`, `ADMIN`)
- [ ] `GET /me`

## 4. Availability engine 🚧
- [x] `AvailabilityService` + DTO skeleton
- [ ] Fix: `availabilityService` not injected as a field in `RestaurantsController`; endpoint still calls `RestaurantsService`
- [ ] Generate slots from opening hours + `slotIntervalMinutes`
- [ ] Exclude closures and past times (restaurant timezone)
- [ ] Check resource conflicts via active `BookingResource` intervals (+ buffer)
- [ ] Allocation: best-fit table by capacity/priority, then combination rules
- [ ] Unit tests for slot generation & allocation (Vitest)
- [ ] Cache availability in Redis, invalidate on booking change

## 5. Booking flow + concurrency ⬜ (portfolio highlight)
- [ ] `POST /bookings` with allocation inside a transaction
- [ ] Prevent double booking (Postgres exclusion constraint on `tstzrange` or `SELECT … FOR UPDATE`)
- [ ] Idempotency key for create
- [ ] Lifecycle: PENDING → CONFIRMED / CANCELLED / COMPLETED / NO_SHOW / EXPIRED
- [ ] Cancellation deadline rule
- [ ] `bookingNumber` generator
- [ ] Concurrency test: N parallel requests → exactly 1 succeeds
- [ ] Audit log entries

## 6. Owner dashboard API ⬜
- [ ] CRUD restaurant (DRAFT → PENDING_APPROVAL)
- [ ] Manage tables/resources, opening hours, closures, booking settings
- [ ] List / confirm / mark no-show bookings
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
- [ ] Expire unconfirmed PENDING bookings
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
1. Commit current work (phase 2).
2. Fix the controller injection, then implement slot generation (phase 4).
3. Build `POST /bookings` with a double-booking guard + concurrency test (phase 5).
