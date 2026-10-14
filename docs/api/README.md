# API

## Implemented behavior

Source exposes public restaurant list/detail/reviews and `GET /restaurants/:id/availability`, auth sign-up/sign-in/session management, email verification/password reset, `GET /me` and health. Swagger is configured in [main.ts](../../apps/api/src/main.ts). This inventory is static source inspection, not a test run in this reconciliation.

Availability query accepts date, optional slot, partySize and optional preference, but the service currently ignores preference and uses meal-end-before-closing slot generation. Its response is advisory, never a booking guarantee. See [implementation status](../product/implementation-status.md).

## Accepted policy / pending booking contract

Booking writes/controllers are absent. Future request/authorization and response contracts must follow [permissions](../domain/permissions.md), [availability](../domain/availability-and-allocation.md) and [lifecycle](../domain/booking-lifecycle.md), including verified authenticated customer email, guest name/phone, exact self-service deadline and owner customer-request exceptions. Do not expose the schema's nullable guest phone or PENDING default as the v1 API policy.

Idempotency must authorize actor/key/intent replay and reject changed fingerprints without editing. Header format, key storage, secure guest scope and private replay DTO remain **technical proposal / pending design** in [issue #12](https://github.com/mikenguyen1998/restaurant-booking-platform/issues/12). No new routes, status codes or replay payload fields are finalized here.

Arrival/contact/hold/correction routes, snapshot semantics and notification rescheduling also require technical contracts; the 24-hour correction anchor remains an unresolved product decision. A passing auth/availability suite cannot establish these missing booking behaviors.
