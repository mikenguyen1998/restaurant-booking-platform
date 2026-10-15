# @restaurant-platform/web

Next.js 16 App Router FE skeleton with Vietnamese responsive UI: discovery/detail/availability, authentication, account/session management, and owner/admin workspaces. See the [application skeleton guide](../../docs/architecture/application-skeleton.md) for all routes and pending operations.

- `src/app`: route/layout/loading/error/not-found entries.
- `src/features`: restaurant, auth, booking and workspace components.
- `src/lib`: credentialed API client and abortable resource hook.
- `src/providers`: current-session state.
- `src/components`: shared navigation/layout/empty/loading states.
- `src/styles/globals.css`: responsive design tokens and styles.

Set NEXT_PUBLIC_API_URL in `apps/web/.env.local`; root .env is not the browser env source. Set API WEB_URL to the web origin. Existing cookie-session login/verification/reset and public reads use the API; pending booking/owner/admin forms do not submit or save fake data. Role/ownership business authorization remains future backend work.

```bash
pnpm --filter @restaurant-platform/web dev
pnpm --filter @restaurant-platform/web build
pnpm --filter @restaurant-platform/web typecheck
```

Root setup, database generation/migrations/seed and API startup are documented in [README](../../README.md#fresh-local-setup). No extra dependency installation is required for the new skeleton.

Booking forms now send typed requests through `src/lib/booking-api.ts`, including customer/owner/admin list/detail/change forms. Valid requests still return explicit 501; no business writes are implemented. See [booking handoff](../../docs/architecture/booking-mvp-handoff.md).
