---
name: review-and-test
description: Review the user's uncommitted changes; if the review passes (no blocking issues), automatically write and run Vitest tests for the changed code. Use when the user types /review-and-test, "review", or "review và viết test".
---

# Review → (pass) → write tests

The user writes the feature code themselves (learning project). This workflow
**reviews** their code and, **only if it passes**, writes the tests for them.
Never rewrite or fix the user's feature code in this workflow — point out the
problems and let them fix it. Reply in Vietnamese.

## 1. Collect the change

```bash
git status --short
git diff            # plus `git diff --cached` if something is staged
```

Read every changed/new `.ts` file in full (not just the hunks). Skip
`docs/`, lockfiles and generated files. If nothing changed in `apps/` or
`packages/`, say so and stop.

## 2. Automatic checks

Run from the repo root and keep the output:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## 3. Review

Check the diff against:

- **Correctness** — logic bugs, wrong comparisons, off-by-one, missing `await`,
  unused query results, wrong Prisma method (`findUnique` vs `findMany`).
- **Domain rules** — `docs/domain/*.md`, especially `invariants.md`,
  `availability-and-allocation.md`, `booking-lifecycle.md`.
  Time intervals are half-open `[start, end)`; overlap = `aStart < bEnd && bStart < aEnd`.
- **Timezone** — restaurant-local times built with Luxon + `restaurant.timezone`
  (`apps/api/src/common/utils/date.ts`), never `new Date('YYYY-MM-DD HH:mm')`.
- **NestJS conventions** — `NotFoundException` / `BadRequestException`
  (with `new`), DTOs validated with class-validator, optional fields marked `?`.
- **Shared code** — pure, framework-free helpers belong in `packages/shared/src/utils`
  (or `constants`), API-only helpers in `apps/api/src/common/utils`.
  Flag duplicated helpers that already exist there.
- **Style** — matches surrounding code; Prettier clean.

Classify each finding:

| Level | Meaning |
|---|---|
| 🔴 blocking | wrong behaviour, compile/lint/test failure, violates a domain invariant |
| 🟡 should fix | works but fragile, misleading, or inconsistent |
| 🟢 nit | naming, comments, small cleanups |

Report findings (file:line, what is wrong, *why*, a hint for the fix — a
small snippet is fine, not a full rewrite).

## 4. Gate

- **Any 🔴, or typecheck/lint/test failed → STOP.** Print the review, end with
  "Sửa các lỗi 🔴 rồi chạy lại `/review-and-test`." Do **not** write tests.
- **No 🔴 and all checks green → PASS.** Print the review (🟡/🟢 are fine), then
  continue to step 5.

## 5. Write tests (only on PASS)

For each changed unit, add or extend a co-located `*.spec.ts`:

| Code | Test location | How |
|---|---|---|
| Pure helpers in `packages/shared/src/**` | next to the file, e.g. `utils/time.spec.ts` | plain Vitest, no mocks |
| Helpers in `apps/api/src/common/utils/**` | next to the file | plain Vitest |
| Nest services in `apps/api/src/modules/**/services` | next to the service | instantiate the class with a mocked `PrismaService` (`vi.fn()` per model method used); no DB |

Rules:

- `import { describe, it, expect, vi } from 'vitest'` explicitly.
- Relative imports use the `.js` extension (ESM / `nodenext`).
- Cover: happy path, each branch/exception, edge cases from the domain docs
  (e.g. buffer example 18:00/20:00/20:15, slot exactly at closing, Sunday mapping,
  empty results, timezone).
- Test names in English, describing behaviour (`it('rejects a slot that is not generated')`).
- Do not change production code to make a test pass. If a test reveals a bug,
  delete that test, and report the bug to the user as 🔴 instead.

## 6. Verify

```bash
pnpm test
pnpm typecheck
pnpm lint
```

All must pass. Then reply with:

1. Review summary (🟡/🟢 left to fix).
2. Test files added, number of tests, and the `pnpm test` result.
3. Next step from `docs/TODO.md`, and update the ticked items there and in
   `docs/PROGRESS.md` if the change completes them.

Do not commit — the user commits.
