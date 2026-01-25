---
phase: quick
plan: 015
subsystem: backend
tags: [athletes, repository, sorting, drizzle-orm]

dependency-graph:
  requires: []
  provides:
    - "Athletes sorted by updatedAt descending by default"
  affects: []

tech-stack:
  added: []
  patterns:
    - "desc() for descending order in Drizzle ORM"

file-tracking:
  key-files:
    created: []
    modified:
      - packages/backend/src/infrastructure/repositories/athlete.repository.ts

decisions:
  - id: dec-015-1
    summary: "Sort athletes by updatedAt descending for better UX"
    rationale: "Coaches typically want to see athletes they've recently worked with at the top of the list"
    alternatives: ["Keep name sort", "Add sort parameter to API"]

metrics:
  duration: "1 min"
  completed: "2026-01-25"
---

# Quick Task 015: Change Athletes Table Default Sort to updatedAt Descending

**One-liner:** Athletes list now shows most recently updated athletes first instead of alphabetical order

## Execution Summary

| Task | Name | Commit | Duration |
|------|------|--------|----------|
| 1 | Change athletes orderBy to updatedAt descending | 2e8e339 | 1 min |

**Total Duration:** 1 min

## What Changed

### Repository Layer

Modified the `findAll` method in `athlete.repository.ts` to:

1. Import `desc` from drizzle-orm
2. Change `orderBy(athletes.name)` to `orderBy(desc(athletes.updatedAt))`

**Before:**
```typescript
import { and, count, eq, ilike } from 'drizzle-orm'
// ...
query.orderBy(athletes.name)
```

**After:**
```typescript
import { and, count, desc, eq, ilike } from 'drizzle-orm'
// ...
query.orderBy(desc(athletes.updatedAt))
```

## Why This Matters

Coaches using the athletes table typically want to continue working with athletes they've recently edited. By sorting by `updatedAt` descending:

- Recently edited athletes appear at the top
- Newly created athletes appear at the top (since create sets updatedAt)
- Reduces scrolling/searching for active athletes

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Athletes repository returns results ordered by updatedAt descending

## Files Modified

| File | Change |
|------|--------|
| `packages/backend/src/infrastructure/repositories/athlete.repository.ts` | Added desc import, changed orderBy clause |
