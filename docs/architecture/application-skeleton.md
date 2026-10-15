# FE / BE application skeleton

Local implementation on 15 October 2026, following the user's later authorization to build the FE/BE skeleton. This expands application structure beyond the earlier docs/tests-only #3/#5 work. It is not a completed booking MVP and does not resolve pending business or technical decisions.

## Frontend

Next.js App Router, Vietnamese UI, responsive desktop/mobile layout, shared header/footer and customer/owner/admin navigation. No new runtime dependencies, external fonts or image services were introduced. Decorative dining illustrations are CSS, not restaurant photos. Existing restaurant data comes from the API; unavailable services show errors/retry, not fabricated records.

| Area        | Routes / behavior                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Discovery   | `/`, `/restaurants` with URL filters/pagination, `/restaurants/[id]` with details/reviews and advisory availability picker                                               |
| Auth        | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`; calls existing API with credentials; verification requires explicit submission           |
| Account     | `/dashboard`, `/dashboard/bookings`, `/dashboard/favorites`, `/dashboard/collections`, `/dashboard/notifications`; data-dependent operations remain pending              |
| Sessions    | `/dashboard/settings`: actual current account, verification resend, session listing/revocation and sign-out-everywhere                                                   |
| Booking     | `/bookings/new`, `/bookings/[id]`: scaffold, no booking confirmation or reservation writes; submit is disabled                                                           |
| Owner       | `/owner`, `/owner/restaurants`, `/owner/restaurants/new`, `/owner/restaurants/[id]/settings`, `/owner/bookings`, `/owner/resources`, `/owner/closures`, `/owner/reviews` |
| Admin       | `/admin`, `/admin/restaurants`, `/admin/bookings`, `/admin/users`, `/admin/reviews`, `/admin/audit`                                                                      |
| Collections | `/collections/[id]`: pending state without private data                                                                                                                  |
| Boundaries  | Root loading, not-found and Next 16 error/retry boundaries                                                                                                               |

`src/lib/api.ts` owns credentialed JSON transport/errors; `use-resource.ts` aborts obsolete requests and provides loading/error/retry state. SessionProvider discards obsolete session reads. Shared transport types live in `packages/shared/src/contracts/api.ts`; reusable button foundation is in `packages/ui`.

Owner/admin shells are navigation/preparation UI, not a grant of access. They contain no private operational data. Saving forms and pending actions are disabled. Complete service-level role/ownership rules remain future work.

## Backend

Existing authentication, public restaurant reads and health remain operational. Bookings, reviews, collections, favorites, notifications, search, recommendations, locations, owner restaurant operations, admin and profile changes now have registered Nest module/controller/service scaffolds.

Every new service delegates to `pendingFeature()`, which throws HTTP **501**, rather than returning fake records, successful mutations or silently performing writes. The existing global session guard/CSRF/throttling remains active; protected requests can return 401 before reaching the stub. Booking/profile request DTOs have transport-level validation; full business authorization, conditional guest contacts, idempotency and allocation are deliberately pending. Other scaffold controllers reserve entry points; request DTOs/repositories/use cases still need implementation.

| Reserved API group                                         | Skeleton responsibilities                                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/bookings`                                                | Create/list/read, cancellation and atomic rescheduling entry points                                                                              |
| `/owner/restaurants`                                       | Profile/submission, resources/combinations, hours/settings/closures, manual bookings, arrival/contact/hold/no-show/requested changes/corrections |
| `/admin`                                                   | Restaurant decisions, booking support, users, review moderation, audit and reports                                                               |
| `/reviews`, `/collections`, `/favorites`, `/notifications` | Engagement, replies/flags, read state and reminder preferences                                                                                   |
| `/search`, `/recommendations`, `/locations`                | Indexed search, rule-based recommendations and reference catalogs                                                                                |
| `PATCH /me`, `POST /me/owner-access-requests`              | Profile and owner-onboarding entry points                                                                                                        |

Public skeleton routes: POST /bookings, GET /search, GET /locations/{cities,cuisines,amenities}, GET /collections/:id. They return 501 and disclose no records. Other new routes require a session but do not yet implement domain role checks; no stub writes or reads operational data. Do not treat a customer receiving 501 on an admin stub as completed admin authorization.

Worker contracts in `src/jobs/job.contracts.ts` define job envelopes/handler/publisher ports only; no scheduler, queue, delivery or outbox persistence is claimed. No schema, migrations, payment gateway, Elasticsearch or background infrastructure was added.

## Run and continue

Follow [root setup](../../README.md#fresh-local-setup), then `pnpm dev`. Set `apps/web/.env.local` with NEXT_PUBLIC_API_URL and use a matching WEB_URL origin for browser CSRF/CORS. Client generation, shared build and database migrations remain prerequisites for existing API reads/auth.

Continue by implementing each service/DTO/repository boundary against the [accepted #4 policy](../product/README.md) and adding appropriate contract/integration tests. Keep pending routes at 501 until authorization, validation, transactional writes and side effects are ready; never make a UI successful by fabricating a booking. The known cache invalidation race and review-parent visibility gap remain documented, not silently repaired by this skeleton.

## Verification scope

Typecheck, lint and full build are run in the isolated checkout used by [#3/#5 verification](../verification/issues-3-5.md). Local production-start smoke checks returned HTTP 200 for all 31 web pages and found 80 registered API method/path pairs (16 existing operational routes, 64 scaffold routes). Public and authenticated 501 probes passed; unauthenticated protected requests returned 401. A scaffold booking POST left the isolated database booking count unchanged. Sign-up, current account, session listing and sign-out were exercised through HTTP. The retained suite passed: API 121 tests (including 24 PostgreSQL and 3 Redis tests), shared 11 tests. Test tasks bypassed Turbo cache; only prerequisite build tasks used it. Desktop, mobile and owner screenshots were captured in Chrome; this does not establish full browser form interaction or role authorization coverage. Existing booking-policy acceptance is still pending; scaffolding is not production booking behavior. No commit/push or deployment is part of this work.
