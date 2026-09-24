# @restaurant-platform/shared

Framework-agnostic code shared by `apps/web` and `apps/api`.

| Directory       | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `src/types`     | Cross-application TypeScript types             |
| `src/constants` | Shared constants                               |
| `src/schemas`   | Shared validation schemas (library not chosen) |

Rules:

- No dependencies on React, Next.js, NestJS, or Prisma.
- Must not import from any other workspace package.

The package is compiled with `tsc` to `dist/` so both the Node.js API and the
Next.js app can consume it. `pnpm dev` at the root rebuilds it on change.
