---
phase: 02-exercise-library-athlete-management
plan: 06
subsystem: api
tags: [use-cases, athletes, neverthrow, authorization, crud]

# Dependency graph
requires:
  - phase: 02-04
    provides: AthleteRepositoryPort and Drizzle implementation
  - phase: 02-02
    provides: Athlete domain entity with createAthlete factory
provides:
  - makeCreateAthlete use case factory
  - makeListAthletes use case factory with pagination
  - makeGetAthlete use case factory
  - makeUpdateAthlete use case factory with merge logic
  - makeArchiveAthlete use case factory for soft delete
affects: [02-07, athlete-procedures, coach-web-athlete-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Authorization-first pattern (check permission before any logic)
    - ResultAsync error mapping for typed errors
    - Factory function pattern for dependency injection

key-files:
  created:
    - packages/backend/src/use-cases/athletes/create-athlete.ts
    - packages/backend/src/use-cases/athletes/list-athletes.ts
    - packages/backend/src/use-cases/athletes/get-athlete.ts
    - packages/backend/src/use-cases/athletes/update-athlete.ts
    - packages/backend/src/use-cases/athletes/archive-athlete.ts
  modified:
    - packages/backend/src/use-cases/athletes/generate-invitation.ts
    - packages/backend/src/use-cases/exercises/clone-exercise.ts

key-decisions:
  - "Archive = soft delete via status change, preserves data"
  - "Update merges input with existing entity before validation"
  - "All use cases export factory functions (makeXxx pattern)"

patterns-established:
  - "Authorization FIRST: Always check hasPermission() before any business logic"
  - "Typed error unions: forbidden | validation_error | not_found | repository_error"
  - "Error mapping: Repository errors mapped to use case error types"

# Metrics
duration: 4min
completed: 2026-01-24
---

# Phase 02 Plan 06: Athlete Use Cases Summary

**CRUD use cases for athletes with authorization-first pattern, domain validation, and typed error unions**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-24T03:00:00Z
- **Completed:** 2026-01-24T03:04:00Z
- **Tasks:** 3
- **Files created:** 5

## Accomplishments
- Create athlete use case with domain validation via createAthlete factory
- List athletes with pagination (limit, offset) and filtering (status, search)
- Get athlete by ID with proper not_found error handling
- Update athlete with merge logic preserving unmodified fields
- Archive athlete as soft delete (status -> inactive)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Athlete Use Case** - `245b9b4` (feat)
2. **Task 2: List and Get Athlete Use Cases** - `b7bd953` (feat)
3. **Task 3: Update and Archive Athlete Use Cases** - `93fe086` (feat)

## Files Created/Modified
- `packages/backend/src/use-cases/athletes/create-athlete.ts` - makeCreateAthlete factory with domain validation
- `packages/backend/src/use-cases/athletes/list-athletes.ts` - makeListAthletes with pagination and filtering
- `packages/backend/src/use-cases/athletes/get-athlete.ts` - makeGetAthlete with not_found handling
- `packages/backend/src/use-cases/athletes/update-athlete.ts` - makeUpdateAthlete with merge logic
- `packages/backend/src/use-cases/athletes/archive-athlete.ts` - makeArchiveAthlete for soft delete

## Decisions Made
- Archive changes status to "inactive" rather than deleting - preserves historical data
- Update merges input with existing athlete data before re-validating through domain entity
- All error types are discriminated unions for exhaustive error handling

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed type errors in generate-invitation.ts**
- **Found during:** Task 1 (Create Athlete Use Case)
- **Issue:** OrganizationContext missing userId/memberRole, AthleteRepositoryError has no .message
- **Fix:** Added full OrganizationContext, used type-narrowing for error message extraction
- **Files modified:** packages/backend/src/use-cases/athletes/generate-invitation.ts
- **Verification:** pnpm typecheck --filter @strenly/backend passes
- **Committed in:** 245b9b4 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed type errors in clone-exercise.ts**
- **Found during:** Task 1 (Create Athlete Use Case)
- **Issue:** ExerciseRepositoryError has no .message property
- **Fix:** Used type-narrowing: e.type === "DATABASE_ERROR" ? e.message : fallback
- **Files modified:** packages/backend/src/use-cases/exercises/clone-exercise.ts
- **Verification:** pnpm typecheck --filter @strenly/backend passes
- **Committed in:** 245b9b4 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary for typecheck to pass. No scope creep - existing code had type errors.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Athlete use cases complete and ready for procedures layer
- All five CRUD operations available: create, list, get, update, archive
- Consistent authorization-first pattern established for team to follow

---
*Phase: 02-exercise-library-athlete-management*
*Completed: 2026-01-24*
