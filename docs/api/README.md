# Existing HTTP API

Source baseline: `144aeac4a8dcf9d3167aa57f06c742ca5e11b41b` (main after PR #29). Routes below are implemented; see [verification evidence](../verification/issues-3-5.md) for commands, actual smoke coverage and limits. The 16 operational routes below are preserved. New non-operational 501 route scaffolds are documented separately in the [skeleton guide](../architecture/application-skeleton.md); they are not implemented booking/owner/admin operations.

## Transport, authentication and CSRF

- Default base URL: `http://localhost:4000`; `API_PORT` is configurable. No global `/api` route prefix. `/api` is Swagger UI and `/api-json` is the OpenAPI document, not the application API prefix.
- JSON request bodies; timestamps serialize to ISO strings and Prisma Decimal fields serialize as strings. Empty successful responses below have no JSON payload.
- Session auth: cookie `__Host-sid`, `HttpOnly; Secure; Path=/; SameSite=Lax`, no Domain. Absolute TTL 14 days, idle TTL 3 days. Server loads the current user on authenticated requests; no bearer-JWT login/refresh flow is configured. Browser API requests need `credentials: 'include'`; CORS allows `WEB_URL` with credentials. Local Secure-cookie browser behavior is not established by the manual-cookie HTTP smoke.
- Global `enableCsrfProtection({ trustedOrigins: [WEB_URL] })` applies to unsafe methods, **including public auth routes**. GET/HEAD/OPTIONS are safe. Trusted Origin passes; untrusted cross-origin writes return 403. Origin-less CLI requests are allowed when no cross-site Fetch Metadata header is present. There is no configured CSRF token endpoint or header exchange. SignInService also checks trusted origins for login.
- Global throttling defaults to 100/minute, configurable via `THROTTLE_LIMIT`/`THROTTLE_TTL` (milliseconds). Tracker is normalized body email + IP when email is supplied, otherwise IP. Redis stores counts. Route-specific auth limits appear below; 429 is possible across the API.
- `ValidationPipe({ transform: true })` validates DTOs and transforms numeric query parameters; it does not enable whitelist/forbidNonWhitelisted. Only declared DTO fields are part of the documented request contract.

### Library route verification

Installed/locked `@nestjs/authentication` is **0.0.1**, Nest core/platform are **12.1.2**. Inspected the package's `dist/authentication.module.js`, `authentication.module-definition.js`, session/cookie and cross-origin utilities in a fresh install. The module registers services/guards/interceptors, **no HTTP controllers**. All current auth routes are the repo's `AuthController`, `SessionsController`, `EmailVerificationController`, `PasswordResetController`. Library examples mentioning OIDC/magic links/MFA are not automatically exposed routes. Runtime router logs/OpenAPI were also checked; `/auth/session` is not a configured library route (404 in smoke).

## Discovery and health (public)

All successful GETs return 200. Restaurant `id` is a UUID (`ParseUUIDPipe`, invalid value → 400).

| Method / path                       | Query / params                                                                                                                                       | Response                                                                                                              | Main errors / actual limitations                                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /health`                       | none                                                                                                                                                 | Terminus health result `{status, info, error, details}` for PostgreSQL                                                | 503 if database unhealthy; does not check Redis                                                                                                                    |
| `GET /restaurants`                  | `page` integer >=1 (default 1); `limit` integer 1–100 (default 20); optional strings `city`, `district`, `cuisine`, `name`; `priceLevel` integer 1–4 | `{data: RestaurantSummary[], meta}`; only APPROVED restaurants                                                        | 400 invalid query; city/district slugified, cuisine is a trimmed slug, name uses normalized accent-insensitive matching                                            |
| `GET /restaurants/:id`              | `id`                                                                                                                                                 | RestaurantSummary plus `timezone`, `images`, active `menus`, cuisine/amenity joins, `openingHours`, `bookingSettings` | 404 absent/non-APPROVED restaurant                                                                                                                                 |
| `GET /restaurants/:id/reviews`      | `id`, `page`, `limit`; uses ListRestaurantsDto but discovery filter fields are ignored by service                                                    | `{data: Review[], meta}` with PUBLISHED reviews                                                                       | 400 invalid DTO/id; no parent existence/approval lookup, so unknown valid id returns empty 200; parent-approval gap is static source evidence, not accepted policy |
| `GET /restaurants/:id/availability` | `id`; required `date` ISO date string (use `YYYY-MM-DD`), integer `partySize >= 1`; optional string `slot` (`HH:mm`), `preference`                   | Without slot: `{date, partySize, slots: [{time, available}]}`. With slot: `{date, partySize, slot, available}`        | 400 invalid DTO or slot not generated; 404 missing/non-APPROVED restaurant or booking settings; preference currently ignored                                       |

`RestaurantSummary`: `id`, `name`, `slug`, `description`, `city`, `district`, `address`, `latitude`, `longitude`, `priceLevel`, `currencyCode`. Detail arrays are current Prisma relation shapes, not a versioned public DTO. `Review` exposes current scalar fields: ids (`id`, `restaurantId`, `customerId`, `bookingId`), four ratings, content, status and created/updated/edited timestamps.

Pagination meta: `totalItems`, `itemCount`, `itemsPerPage`, `totalPages`, `currentPage`.

**Availability is advisory**: cached results do not reserve resources. Current slot generation still requires the meal to end before closing and does not implement all approved #4 settings/VIP rules. The booking transaction that would revalidate and allocate does not exist. See [implementation gaps](../product/implementation-status.md).

## Authentication and current user

“Public” means no signed-in session required, not a CSRF exemption. Every POST/DELETE below is subject to the unsafe-method origin checks described above. All protected routes can return 401 for absent/expired/revoked sessions; all body DTOs can return 400 and all routes can return 429.

| Method / path                    | Authentication                    | Body / params                    | Success                               | Main additional errors / effects                                                                   |
| -------------------------------- | --------------------------------- | -------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `POST /auth/sign-up`             | Public                            | `{name, email, password}`        | 201 `PublicUser`; sets session cookie | 409 duplicate email; sends verification link; 5/15min                                              |
| `POST /auth/sign-in`             | Public                            | `{email, password}`              | 200 `PublicUser`; sets session cookie | 401 same response for unknown email/wrong password; replaces this browser's prior session; 5/15min |
| `POST /auth/sign-out`            | Public (supports pending session) | no body; current cookie          | 204 empty; clears cookie              | 401 when no live session                                                                           |
| `POST /auth/sign-out-everywhere` | Session                           | no body                          | 204 empty                             | Revokes all sessions for current user                                                              |
| `GET /auth/sessions`             | Session                           | none                             | `SessionView[]`                       | Only current user's sessions; no token/hash returned                                               |
| `DELETE /auth/sessions/:id`      | Session                           | session id string (no UUID pipe) | 204 empty                             | 404 absent or another user's session                                                               |
| `POST /auth/email/verify`        | Public                            | `{token}`                        | 200 `{email, emailVerified: true}`    | 400 unknown/used/expired link; POST avoids consuming tokens via GET mail scanners                  |
| `POST /auth/email/verification`  | Session                           | no body                          | 202 empty                             | 409 already verified, 400 account without email; 3/15min                                           |
| `POST /auth/password/forgot`     | Public                            | `{email}`                        | 202 empty                             | Same acknowledgment for known/unknown address; lookup/mail asynchronously; 3/15min                 |
| `POST /auth/password/reset`      | Public                            | `{token, password}`              | 200 empty                             | 400 invalid/expired token; resets password and ends sessions; does not sign in                     |
| `GET /me`                        | Session                           | none                             | 200 `PublicUser`                      | Current user loaded from database                                                                  |

DTO constraints: signup name is trimmed, non-empty string, max 100; email trimmed/valid, signup max 254. Signup/reset password is a string of 12–128 characters, not trimmed. Sign-in password is non-empty string (no new-password minimum). Tokens are non-empty strings. Reset email uses email validation/trim.

`PublicUser`: `id`, `email` (nullable), `emailVerified`, `phone` (nullable), `name`, `role`, `createdAt`, `updatedAt`; never passwordHash. `SessionView`: `id`, `createdAt`, `lastActiveAt`, `userAgent` (nullable), `current`.

## Errors

Controller/guard/validation errors handled by [AllExceptionsFilter](../../apps/api/src/common/filters/all-exceptions.filter.ts) return `{statusCode, error, message, path, timestamp}`; message can be a string or validation-message array. Prisma P2002 → 409, P2025 → 404, P2003 → 400; unexpected errors → generic 500. Middleware/Swagger errors may bypass that controller filter. Do not treat Swagger's incomplete inferred schemas as stricter contracts than controllers/DTOs.

## Accepted policy / pending booking contract

Operational booking writes are absent; registered booking controllers/services are 501 skeletons. Future request/authorization and response contracts must follow [permissions](../domain/permissions.md), [availability](../domain/availability-and-allocation.md) and [lifecycle](../domain/booking-lifecycle.md), including verified authenticated customer email, guest name/phone, exact self-service deadline and owner customer-request exceptions. Do not expose the schema's nullable guest phone or PENDING default as the v1 API policy.

Idempotency must authorize actor/key/intent replay and reject changed fingerprints without editing. Header format, key storage, secure guest scope and private replay DTO remain **technical proposal / pending design** in [issue #12](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/12). No new routes, status codes or replay payload fields are finalized here.

Arrival/contact/hold/correction routes, snapshot semantics and notification rescheduling also require technical contracts; the 24-hour correction anchor remains an unresolved product decision. A passing auth/availability suite cannot establish these missing booking behaviors.
