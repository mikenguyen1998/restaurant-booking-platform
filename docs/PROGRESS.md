# Project Progress

Last updated: 2026-10-05 · Legend: ✅ done · 🚧 in progress · ⬜ todo

Step-by-step checklist with guides: [TODO.md](TODO.md)

## Overview

| Phase | Status | Progress |
|---|---|---|
| 0. Foundation | ✅ | 100% |
| 1. Database | ✅ | 100% |
| 2. Restaurants API (public) | ✅ | 100% |
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

## 3. Auth & Users ⬜
- [ ] Register / login (email + password, argon2/bcrypt)
- [ ] JWT access + refresh tokens
- [ ] Roles guard (`CUSTOMER`, `RESTAURANT_OWNER`, `ADMIN`)
- [ ] `GET /me`

## 4. Availability engine 🚧
- [x] `AvailabilityService` + DTO skeleton
- [x] `AvailabilityService` injected in `RestaurantsController`, `GET /restaurants/:id/availability` wired
- [ ] Replace placeholder query in `AvailabilityService` (currently filters `restaurant` by `date`/`slot`, which aren't restaurant fields)
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
1. Implement slot generation + allocation in `AvailabilityService` (phase 4).
2. Auth & roles (phase 3) — needed before bookings.
3. Build `POST /bookings` with a double-booking guard + concurrency test (phase 5).
