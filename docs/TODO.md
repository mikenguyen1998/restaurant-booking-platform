# TODO — Remaining work with guides

Your personal checklist for finishing the project. Tick boxes as you go (`[ ]` → `[x]`).
Each item has a link to read if you get stuck. 📘 = project doc in this repo, 🌐 = external guide.

Recommended order: **4 → 3 → 5 → 6 → 7 → 10**, then 8, 9, 11 if you have time.

---

## 4. Availability engine

Read first: 📘 [availability-and-allocation.md](domain/availability-and-allocation.md) · 📘 [invariants.md](domain/invariants.md)

- [ ] Rewrite the placeholder query in `apps/api/src/modules/restaurants/services/availability.service.ts`
  - 🌐 [Prisma — relation queries (include/select)](https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries)
- [ ] Generate slots from opening hours + `slotIntervalMinutes`
  - 🌐 [Luxon — date/time library](https://moment.github.io/luxon/#/) (intervals, adding minutes)
- [ ] Exclude closures and past times, using the restaurant's timezone
  - 🌐 [Luxon — zones](https://moment.github.io/luxon/#/zones)
- [ ] Skip tables already used by active bookings (`BookingResource` intervals + buffer)
  - 🌐 [Prisma — filtering & comparison operators (lt/gt)](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting)
- [ ] Allocation: best-fit table by capacity/priority, then table combinations
  - 📘 [availability-and-allocation.md](domain/availability-and-allocation.md) (rules are defined there)
- [ ] Unit tests for slot generation & allocation
  - 🌐 [Vitest — getting started](https://vitest.dev/guide/)
  - 🌐 [NestJS — testing](https://docs.nestjs.com/fundamentals/testing)
  - 🌐 [NestJS + Vitest (SWC recipe)](https://docs.nestjs.com/recipes/swc#vitest)
- [ ] Cache availability in Redis, invalidate when a booking changes
  - 🌐 [NestJS — caching](https://docs.nestjs.com/techniques/caching)

## 3. Auth & Users

Read first: 📘 [permissions.md](domain/permissions.md)

- [ ] Register / login with email + password (hash with argon2)
  - 🌐 [NestJS — authentication](https://docs.nestjs.com/security/authentication)
  - 🌐 [node-argon2](https://github.com/ranisalt/node-argon2)
- [ ] JWT access + refresh tokens
  - 🌐 [JWT introduction](https://jwt.io/introduction)
  - 🌐 [NestJS — Passport recipe (JWT strategy)](https://docs.nestjs.com/recipes/passport)
- [ ] Roles guard (`CUSTOMER`, `RESTAURANT_OWNER`, `ADMIN`)
  - 🌐 [NestJS — authorization (roles)](https://docs.nestjs.com/security/authorization)
  - 🌐 [NestJS — guards](https://docs.nestjs.com/guards)
- [ ] `GET /me` endpoint
  - 🌐 [NestJS — custom decorators (`@CurrentUser`)](https://docs.nestjs.com/custom-decorators)
- [ ] Rate-limit login/register
  - 🌐 [NestJS — rate limiting](https://docs.nestjs.com/security/rate-limiting)
- [ ] Load secrets (JWT secret, DB URL) from env
  - 🌐 [NestJS — configuration](https://docs.nestjs.com/techniques/configuration)

## 5. Booking flow + concurrency ⭐ portfolio highlight

Read first: 📘 [booking-lifecycle.md](domain/booking-lifecycle.md) · 📘 [invariants.md](domain/invariants.md)

- [ ] `POST /bookings` — allocate a table inside a transaction
  - 🌐 [Prisma — transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [ ] Prevent double booking at the database level (pick one):
  - Option A — exclusion constraint on a time range (strongest guarantee)
    - 🌐 [Postgres — range types (`tstzrange`)](https://www.postgresql.org/docs/current/rangetypes.html)
    - 🌐 [Postgres — `EXCLUDE` constraints](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-EXCLUDE)
    - 🌐 [Postgres — `btree_gist` extension](https://www.postgresql.org/docs/current/btree-gist.html)
    - 🌐 [Prisma — custom SQL in migrations](https://www.prisma.io/docs/orm/prisma-migrate/workflows/customizing-migrations)
  - Option B — row locking
    - 🌐 [Postgres — `SELECT … FOR UPDATE`](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE)
    - 🌐 [Prisma — raw SQL queries](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries)
  - Background: 🌐 [Postgres — transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [ ] Idempotency key for create (same key → same booking, no duplicate)
  - 🌐 [Stripe — idempotent requests (the classic design)](https://docs.stripe.com/api/idempotent_requests)
- [ ] Status transitions: PENDING → CONFIRMED / CANCELLED / COMPLETED / NO_SHOW / EXPIRED
  - 📘 [booking-lifecycle.md](domain/booking-lifecycle.md)
- [ ] Cancellation deadline rule
- [ ] `bookingNumber` generator (short, human-readable, unique)
- [ ] Concurrency test: N parallel requests → exactly 1 succeeds
  - 🌐 [NestJS — end-to-end testing](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)
  - 🌐 [Testcontainers for Node (real Postgres in tests)](https://node.testcontainers.org/)
- [ ] Write audit log entries for booking changes

## 6. Owner dashboard & admin API

Read first: 📘 [restaurant-lifecycle.md](domain/restaurant-lifecycle.md) · 📘 [permissions.md](domain/permissions.md)

- [ ] Restaurant CRUD (DRAFT → PENDING_APPROVAL)
  - 🌐 [NestJS — controllers](https://docs.nestjs.com/controllers)
  - 🌐 [NestJS — validation](https://docs.nestjs.com/techniques/validation)
- [ ] Manage tables/resources, opening hours, closures, booking settings
- [ ] List / confirm / mark no-show bookings (owner can only see own restaurants)
- [ ] Admin: approve / reject restaurants

## 7. Web app (Next.js)

- [ ] Learn the App Router basics
  - 🌐 [Next.js — Learn course](https://nextjs.org/learn)
  - 🌐 [Next.js — App Router docs](https://nextjs.org/docs/app)
- [ ] Layout, theme, shared UI in `packages/ui`
  - 🌐 [Tailwind CSS docs](https://tailwindcss.com/docs)
  - 🌐 [shadcn/ui](https://ui.shadcn.com/docs)
  - 🌐 [shadcn/ui in a monorepo](https://ui.shadcn.com/docs/monorepo)
- [ ] Typed API client + TanStack Query
  - 🌐 [openapi-typescript (types from your Swagger)](https://openapi-ts.dev/)
  - 🌐 [TanStack Query — overview](https://tanstack.com/query/latest/docs/framework/react/overview)
  - 🌐 [TanStack Query — SSR with Next.js](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [ ] Restaurant list + filters (filters in URL) + detail page
  - 🌐 [Next.js — `useSearchParams`](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [ ] Availability picker (date, party size, slot)
  - 🌐 [shadcn/ui — date picker](https://ui.shadcn.com/docs/components/date-picker)
- [ ] Booking form + confirmation page
  - 🌐 [React Hook Form](https://react-hook-form.com/get-started)
  - 🌐 [Zod](https://zod.dev/)
- [ ] Auth pages (login/register) + "My bookings"
  - 🌐 [Next.js — authentication guide](https://nextjs.org/docs/app/guides/authentication)
- [ ] Owner dashboard (bookings table, resources)
  - 🌐 [TanStack Table](https://tanstack.com/table/latest)
  - 🌐 [shadcn/ui — data table](https://ui.shadcn.com/docs/components/data-table)

## 8. Background jobs & notifications

- [ ] BullMQ on Redis
  - 🌐 [NestJS — queues](https://docs.nestjs.com/techniques/queues)
  - 🌐 [BullMQ docs](https://docs.bullmq.io/)
- [ ] Expire unconfirmed PENDING bookings (delayed job)
  - 🌐 [BullMQ — delayed jobs](https://docs.bullmq.io/guide/jobs/delayed)
- [ ] Email confirmation / reminder
  - 🌐 [Resend (email API, free tier)](https://resend.com/docs)
  - 🌐 [React Email (templates)](https://react.email/docs/introduction)
- [ ] In-app notifications (table + `GET /notifications`)

## 9. Reviews / favorites / collections

- [ ] Review only allowed after a COMPLETED booking
- [ ] Owner reply to review
- [ ] Favorites
- [ ] Collections
  - 🌐 [Prisma — many-to-many relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)

## 10. Quality, deploy & portfolio

- [ ] Tests in CI (unit + e2e with a Postgres service)
  - 🌐 [GitHub Actions — PostgreSQL service containers](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers)
- [ ] Dockerfile for the API
  - 🌐 [pnpm — working with Docker](https://pnpm.io/docker)
  - 🌐 [Turborepo — Docker guide (`turbo prune`)](https://turborepo.com/docs/guides/tools/docker)
- [ ] Deploy web → Vercel
  - 🌐 [Vercel — monorepos](https://vercel.com/docs/monorepos)
- [ ] Deploy API + Postgres + Redis (pick one host)
  - 🌐 [Railway docs](https://docs.railway.com/)
  - 🌐 [Fly.io — JavaScript apps](https://fly.io/docs/js/)
  - 🌐 [Render docs](https://render.com/docs)
- [ ] Update README (still says "Phase 1"): architecture diagram, screenshots, live demo link
  - 🌐 [GitHub — Mermaid diagrams in Markdown](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)
- [ ] Write-up: how double booking is prevented
- [ ] Add to mikenguyen.site with repo link

## 11. AI feature (stretch)

- [ ] Natural-language search ("table for 4, Friday 7pm, Hoan Kiem")
- [ ] LLM tool calling → availability API
  - 🌐 [Claude — tool use overview](https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview)
- [ ] Streaming chat UI
  - 🌐 [Vercel AI SDK — chatbot UI](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
