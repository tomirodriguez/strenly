---
phase: quick
plan: 013
subsystem: frontend
tags: [orpc, tanstack-query, cache-invalidation, query-keys]

# Dependency graph
requires:
  - phase: 02.5
    provides: athlete hooks and mutation patterns
provides:
  - Updated orpc-query skill with official key() patterns
  - Refactored athlete hooks using oRPC built-in key methods
affects: [phase-3, any-future-frontend-hooks]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "oRPC key() for invalidation"
    - "No custom query key factories"

key-files:
  created: []
  modified:
    - .claude/skills/orpc-query/SKILL.md
    - apps/coach-web/CLAUDE.md
    - apps/coach-web/src/features/athletes/hooks/queries/use-athletes.ts
    - apps/coach-web/src/features/athletes/hooks/queries/use-athlete-invitation.ts
    - apps/coach-web/src/features/athletes/hooks/mutations/use-archive-athlete.ts
    - apps/coach-web/src/features/athletes/hooks/mutations/use-create-athlete.ts
    - apps/coach-web/src/features/athletes/hooks/mutations/use-update-athlete.ts
    - apps/coach-web/src/features/athletes/hooks/mutations/use-generate-invitation.ts
    - apps/coach-web/src/features/athletes/components/invitation-modal.tsx

key-decisions:
  - "Use orpc.athletes.key() for invalidating all athlete queries"
  - "Custom query key factories marked as anti-pattern in skill docs"

patterns-established:
  - "orpc.{procedure}.key() for partial match invalidation"
  - "orpc.{procedure}.queryKey({ input }) for get/set query data"
  - "No *-keys.ts files - oRPC manages keys automatically"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Quick Task 013: Update oRPC Query Skill and Refactor Query Invalidations

**Replaced custom query key factories with oRPC's official `.key()` method for type-safe cache invalidation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T12:23:15Z
- **Completed:** 2026-01-25T12:26:30Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Updated `/orpc-query` skill documentation with official oRPC key patterns
- Removed all custom query key factories (`athleteKeys`, `invitationKeys`)
- All mutation hooks now use `orpc.athletes.key()` for cache invalidation
- Documented custom key factories as anti-pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Update orpc-query skill with official key patterns** - `db64093` (docs)
2. **Task 2: Refactor all query invalidations to use oRPC key pattern** - `25934b3` (refactor)

## Files Created/Modified

**Skill Documentation:**
- `.claude/skills/orpc-query/SKILL.md` - Replaced `<query_key_factories>` with `<query_keys>` section documenting `.key()`, `.queryKey()`, `.mutationKey()`, `.infiniteKey()` methods

**App Documentation:**
- `apps/coach-web/CLAUDE.md` - Updated API Hooks Pattern example to use `orpc.athletes.key()`

**Query Files (removed key factories):**
- `apps/coach-web/src/features/athletes/hooks/queries/use-athletes.ts` - Removed `athleteKeys` constant
- `apps/coach-web/src/features/athletes/hooks/queries/use-athlete-invitation.ts` - Removed `invitationKeys` constant and custom queryKey override

**Mutation Files (updated invalidations):**
- `apps/coach-web/src/features/athletes/hooks/mutations/use-archive-athlete.ts` - Uses `orpc.athletes.key()`
- `apps/coach-web/src/features/athletes/hooks/mutations/use-create-athlete.ts` - Uses `orpc.athletes.key()`
- `apps/coach-web/src/features/athletes/hooks/mutations/use-update-athlete.ts` - Uses `orpc.athletes.key()`
- `apps/coach-web/src/features/athletes/hooks/mutations/use-generate-invitation.ts` - Uses `orpc.athletes.key()`

**Component (updated invalidation):**
- `apps/coach-web/src/features/athletes/components/invitation-modal.tsx` - Uses `orpc.athletes.getInvitation.key({ input })`

## Decisions Made
- Use `orpc.athletes.key()` to invalidate all athlete queries (simpler than granular invalidation)
- Mark custom query key factories as anti-pattern in skill docs (oRPC provides better alternative)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All hooks ready for Phase 3 Program Builder
- Pattern established for future query hooks

---
*Quick Task: 013*
*Completed: 2026-01-25*
