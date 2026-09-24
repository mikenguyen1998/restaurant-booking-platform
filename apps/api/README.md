# @restaurant-platform/api

NestJS backend (ESM, TypeScript strict), deployed to Node.js-compatible hosting.

| Path                | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `src/main.ts`       | Bootstrap; listens on `API_PORT` (default `4000`)         |
| `src/app.module.ts` | Root module; imports the feature modules                  |
| `src/modules/*`     | Feature modules (empty)                                   |
| `src/common/`       | Cross-cutting pieces (filters, guards, pipes, decorators) |
| `src/config/`       | Configuration loading and validation                      |
| `src/database/`     | Integration with `@restaurant-platform/database`          |
| `src/jobs/`         | Background worker / job definitions                       |

Each feature module (`auth`, `users`, `restaurants`, `bookings`, `reviews`,
`collections`, `notifications`, `admin`) has the same layout:

```text
<module>/
├── controllers/
├── services/
├── dto/
├── entities/
├── repositories/
└── <module>.module.ts   # empty @Module({})
```

No controllers, services, or endpoints exist yet.

## Environment

Loading `.env` files is not wired up yet; it is part of the `src/config` design.
Until then the API reads only variables already present in the process environment.

## Commands

```bash
pnpm --filter @restaurant-platform/api dev         # watch mode, http://localhost:4000
pnpm --filter @restaurant-platform/api build
pnpm --filter @restaurant-platform/api start:prod  # run the compiled build
pnpm --filter @restaurant-platform/api test        # vitest (no tests yet)
```
