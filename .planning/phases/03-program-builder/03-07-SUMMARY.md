---
phase: 03-program-builder
plan: 07
subsystem: use-cases
tags: [exercise-row, prescription, superset, split-row, neverthrow]

# Dependency graph
requires:
  - phase: 03-program-builder/03-02
    provides: prescription notation parser
  - phase: 03-program-builder/03-03
    provides: domain entities (Program, Prescription)
  - phase: 03-program-builder/03-04
    provides: program repository port and implementation
provides:
  - addExerciseRowUseCase
  - updateExerciseRowUseCase
  - deleteExerciseRowUseCase
  - reorderExerciseRowsUseCase
  - updatePrescriptionUseCase
  - addSplitRowUseCase
  - toggleSupersetUseCase
affects: [03-08, 03-09, program-builder-frontend]

# Tech tracking
tech-stack:
  added: []
  patterns: [authorization-first, merge-update, sequential-sub-row-delete]

key-files:
  created:
    - packages/backend/src/use-cases/programs/add-exercise-row.ts
    - packages/backend/src/use-cases/programs/update-exercise-row.ts
    - packages/backend/src/use-cases/programs/delete-exercise-row.ts
    - packages/backend/src/use-cases/programs/reorder-exercise-rows.ts
    - packages/backend/src/use-cases/programs/update-prescription.ts
    - packages/backend/src/use-cases/programs/add-split-row.ts
    - packages/backend/src/use-cases/programs/toggle-superset.ts
  modified:
    - packages/core/src/ports/program-repository.port.ts
    - packages/backend/src/infrastructure/repositories/program.repository.ts
    - packages/backend/src/use-cases/programs/delete-week.ts

key-decisions:
  - "Extended ProgramRepositoryPort with findExerciseRowById, getMaxExerciseRowOrderIndex, findSubRows"
  - "Sub-rows deleted sequentially before parent row deletion"
  - "Superset order defaults to 1 for new group assignments"
  - "Split row orderIndex uses parent + 0.5 for initial placement"

patterns-established:
  - "Authorization-first: All use cases check hasPermission() before any logic"
  - "Merge-update: Update use cases fetch existing, merge with input, persist"
  - "Notation parsing: updatePrescriptionUseCase uses parsePrescriptionNotation from contracts"

# Metrics
duration: 8min
completed: 2026-01-25
---

# Phase 03 Plan 07: Exercise Row and Prescription Use Cases Summary

**Use cases for exercise row CRUD, prescription cell updates, split rows, and superset grouping - enabling grid data operations.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-25T14:30:28Z
- **Completed:** 2026-01-25T14:38:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Exercise row management: add, update, delete, reorder operations
- Prescription updates with notation parsing via contracts
- Split row creation linking sub-rows to parent with setTypeLabel
- Superset grouping toggle for exercise grouping (A1/A2 patterns)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create exercise row management use cases** - `f6a2a12` (feat)
2. **Task 2: Create prescription and superset use cases** - `6cd392d` (feat)

## Files Created/Modified

### Created
- `packages/backend/src/use-cases/programs/add-exercise-row.ts` - Add exercise to session with auto orderIndex
- `packages/backend/src/use-cases/programs/update-exercise-row.ts` - Update row with merge pattern
- `packages/backend/src/use-cases/programs/delete-exercise-row.ts` - Delete row and sub-rows
- `packages/backend/src/use-cases/programs/reorder-exercise-rows.ts` - Reorder for drag-drop
- `packages/backend/src/use-cases/programs/update-prescription.ts` - Parse notation and upsert cell
- `packages/backend/src/use-cases/programs/add-split-row.ts` - Create sub-row for same exercise
- `packages/backend/src/use-cases/programs/toggle-superset.ts` - Add/remove from superset group

### Modified
- `packages/core/src/ports/program-repository.port.ts` - Added findExerciseRowById, getMaxExerciseRowOrderIndex, findSubRows
- `packages/backend/src/infrastructure/repositories/program.repository.ts` - Implemented new port methods
- `packages/backend/src/use-cases/programs/delete-week.ts` - Fixed error type mapping

## Decisions Made

1. **Extended ProgramRepositoryPort:** Added findExerciseRowById, getMaxExerciseRowOrderIndex, and findSubRows to support use case operations. The existing port lacked these methods needed for fetch-before-update pattern and orderIndex calculation.

2. **Sequential sub-row deletion:** When deleting an exercise row with sub-rows (split rows), sub-rows are deleted one-by-one before the parent to ensure clean cascading of prescriptions.

3. **Superset order defaults to 1:** When adding to a new superset group, order starts at 1. Frontend can handle renumbering if multiple rows added to same group.

4. **Split row orderIndex = parent + 0.5:** Places sub-row immediately after parent in visual order. Normalization happens on reorder if needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended repository port with missing methods**
- **Found during:** Task 1 (update-exercise-row implementation)
- **Issue:** Repository port lacked findExerciseRowById needed for fetch-before-update pattern
- **Fix:** Added findExerciseRowById, getMaxExerciseRowOrderIndex, findSubRows to port and implemented in repository
- **Files modified:** packages/core/src/ports/program-repository.port.ts, packages/backend/src/infrastructure/repositories/program.repository.ts
- **Verification:** Typecheck passes
- **Committed in:** f6a2a12 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed delete-week.ts error type mapping**
- **Found during:** Task 1 (typecheck)
- **Issue:** delete-week.ts had incorrect error property access (e.message on NOT_FOUND which has id not message)
- **Fix:** Added conditional check for error type before accessing properties
- **Files modified:** packages/backend/src/use-cases/programs/delete-week.ts
- **Verification:** Typecheck passes
- **Committed in:** f6a2a12 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Repository extension was necessary for proper use case implementation. No scope creep.

## Issues Encountered
None - execution proceeded as planned after port extension.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness

**Ready for 03-08 (Contracts & Procedures):**
- All exercise row and prescription use cases implemented
- Authorization enforced with hasPermission()
- ResultAsync pattern consistent with other use cases
- Prescription parsing integrated with contracts

**Artifacts provided:**
- `makeAddExerciseRow(deps)(input)` - Add exercise row
- `makeUpdateExerciseRow(deps)(input)` - Update exercise row
- `makeDeleteExerciseRow(deps)(input)` - Delete with sub-rows
- `makeReorderExerciseRows(deps)(input)` - Reorder rows
- `makeUpdatePrescription(deps)(input)` - Parse notation and upsert
- `makeAddSplitRow(deps)(input)` - Create sub-row
- `makeToggleSuperset(deps)(input)` - Manage superset groups

---
*Phase: 03-program-builder*
*Completed: 2026-01-25*
