# @restaurant-platform/web

Next.js (App Router) frontend, deployed to Vercel.

| Path                    | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `src/app/(public)`      | Public routes (discovery, restaurant profiles)             |
| `src/app/(auth)`        | Authentication routes                                      |
| `src/app/dashboard`     | Signed-in user / restaurant dashboard routes               |
| `src/app/admin`         | Platform administration routes                             |
| `src/components/ui`     | App-specific primitives (shared ones go in `packages/ui`)  |
| `src/components/layout` | Layout building blocks (header, footer, shells)            |
| `src/components/shared` | Components reused across features                          |
| `src/features/*`        | Feature modules (components, hooks, API calls per feature) |
| `src/lib`               | Framework-level helpers                                    |
| `src/providers`         | React context providers                                    |
| `src/styles`            | Global CSS and Tailwind entry point                        |

All directories are empty placeholders. Nothing is implemented yet.

## Environment

Next.js reads env files from this directory, not the repository root. Put
`NEXT_PUBLIC_*` values in `apps/web/.env.local` (git-ignored). See the root
`.env.example` for the variable names.

## Commands

```bash
pnpm --filter @restaurant-platform/web dev        # http://localhost:3000
pnpm --filter @restaurant-platform/web build
pnpm --filter @restaurant-platform/web typecheck
```
