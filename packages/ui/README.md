# @restaurant-platform/ui

Shared, presentation-only React components built on Tailwind CSS and shadcn/ui.

- `src/components/`: shared components (empty; add them only when needed).
- `src/lib/utils.ts`: the `cn()` class-name helper that shadcn/ui components expect.
- `components.json`: shadcn/ui CLI configuration for this package.

This is a just-in-time package: it ships TypeScript source, and the consuming
Next.js app compiles it (`transpilePackages` in `apps/web/next.config.ts`).

To add a shadcn/ui component when one is actually needed:

```bash
cd packages/ui
pnpm dlx shadcn@latest add <component>
```

Rules: no data fetching, no API calls, no feature or business logic.
