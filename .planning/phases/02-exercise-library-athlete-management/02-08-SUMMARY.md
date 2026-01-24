---
phase: 02-exercise-library-athlete-management
plan: 08
subsystem: api
tags: [neverthrow, use-cases, exercises, authorization, crud]

# Dependency graph
requires:
  - phase: 02-05
    provides: ExerciseRepositoryPort implementation with findById, findAll, create, update, archive
  - phase: 02-03
    provides: Exercise domain entity with createExercise, isCurated helper functions
provides:
  - makeCreateExercise - creates custom exercises with organizationId
  - makeCloneExercise - clones curated/custom exercises with provenance tracking
  - makeListExercises - returns curated + org's custom exercises with filtering
  - makeGetExercise - fetches single exercise with access control
  - makeUpdateExercise - updates custom exercises only
  - makeArchiveExercise - soft deletes via archivedAt timestamp
affects: [02-09, exercise-procedures, frontend-exercise-hooks]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Use case factory pattern with dependency injection
    - Authorization-first pattern in all use cases
    - ResultAsync chaining for async operations

key-files:
  created:
    - packages/backend/src/use-cases/exercises/create-exercise.ts
    - packages/backend/src/use-cases/exercises/clone-exercise.ts
    - packages/backend/src/use-cases/exercises/list-exercises.ts
    - packages/backend/src/use-cases/exercises/get-exercise.ts
    - packages/backend/src/use-cases/exercises/update-exercise.ts
    - packages/backend/src/use-cases/exercises/archive-exercise.ts
  modified: []

key-decisions:
  - "Clone creates custom copy with clonedFromId for provenance tracking"
  - "Curated exercises visible but not editable (update/archive blocked)"
  - "Access control returns not_found for unauthorized exercises (no information leakage)"

patterns-established:
  - "Authorization-first: hasPermission check before any business logic"
  - "Curated protection: isCurated() check blocks modifications"
  - "Error type mapping: ExerciseRepositoryError mapped to use case-specific errors"

# Metrics
duration: 4min
completed: 2026-01-24
---

# Phase 2 Plan 08: Exercise Use Cases Summary

**Exercise CRUD use cases with curated/custom distinction, clone functionality, and authorization-first pattern**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-24T01:32:17Z
- **Completed:** 2026-01-24T01:36:30Z
- **Tasks:** 3
- **Files created:** 6

## Accomplishments
- Full CRUD use cases for exercise library with proper authorization
- Clone functionality for creating custom exercises from curated templates
- Curated exercise protection (visible but not editable/archivable)
- Access control preventing cross-organization exercise access

## Task Commits

Each task was committed atomically:

1. **Task 1: Create and Clone Exercise Use Cases** - `88afe14` (feat)
2. **Task 2: List and Get Exercise Use Cases** - `d46594c` (feat)
3. **Task 3: Update and Archive Exercise Use Cases** - `ac9c617` (feat)

**Lint fixes:** `9ea8ddc` (style: fix lint issues in exercise use cases)

## Files Created

- `packages/backend/src/use-cases/exercises/create-exercise.ts` - Creates custom exercises with organizationId
- `packages/backend/src/use-cases/exercises/clone-exercise.ts` - Clones exercises with clonedFromId provenance
- `packages/backend/src/use-cases/exercises/list-exercises.ts` - Lists curated + org's custom exercises
- `packages/backend/src/use-cases/exercises/get-exercise.ts` - Gets single exercise with access control
- `packages/backend/src/use-cases/exercises/update-exercise.ts` - Updates custom exercises only
- `packages/backend/src/use-cases/exercises/archive-exercise.ts` - Soft deletes via archivedAt

## Decisions Made

1. **Clone provenance tracking** - Clone operation stores `clonedFromId` to track which curated exercise was cloned, enabling analytics on popular exercises.

2. **Access control returns not_found** - When a user tries to access another org's custom exercise, we return `not_found` instead of `forbidden` to prevent information leakage about exercise existence.

3. **Curated exercise protection** - Curated exercises (organizationId === null) cannot be edited or archived. Users must clone them to create a custom version.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

1. **ExerciseRepositoryError type handling** - The error type union includes `NOT_FOUND` (with exerciseId) and `DATABASE_ERROR` (with message). Had to use conditional check `e.type === "DATABASE_ERROR" ? e.message : ...` to properly map errors without type casting.

2. **Biome lint fixes** - Removed unused `okAsync` import from archive-exercise.ts after linter flagged it.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Exercise use cases complete with full CRUD + clone operations
- Ready for 02-09: Exercise Contracts & Procedures
- Repository layer from 02-05 integrates seamlessly with use cases

---
*Phase: 02-exercise-library-athlete-management*
*Completed: 2026-01-24*
