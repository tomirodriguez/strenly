---
phase: quick
plan: 021
subsystem: database, backend, frontend
tags: [drizzle, postgresql, cleanup, refactor, typescript]

# Dependency graph
requires:
  - phase: 03.2-prescription-data-structure-refactor
    provides: New series-based prescription model and exercise groups
provides:
  - Clean codebase without deprecated Phase 3.2 columns and files
  - Simpler contract schemas without legacy fields
  - Streamlined frontend grid components
affects: []

# Tech tracking
tech-stack:
  added: []
  removed: ["@wasback/react-datasheet-grid"]
  patterns: []

key-files:
  deleted:
    - apps/coach-web/src/components/programs/program-grid.tsx
    - apps/coach-web/src/components/programs/prescription-cell.tsx
    - apps/coach-web/src/components/programs/exercise-picker-cell.tsx
    - apps/coach-web/src/components/programs/split-row-dialog.tsx
    - packages/backend/src/use-cases/programs/add-split-row.ts
    - packages/backend/src/use-cases/programs/toggle-superset.ts
  modified:
    - packages/database/src/schema/program-exercises.ts
    - packages/database/src/schema/prescriptions.ts
    - packages/contracts/src/programs/program.ts
    - packages/contracts/src/programs/exercise-row.ts
    - packages/backend/src/infrastructure/repositories/program.repository.ts
    - apps/coach-web/src/components/programs/exercise-row-actions.tsx

key-decisions:
  - "Archived migration script instead of deleting for future reference"
  - "Removed ParsedPrescription interface entirely - series model is now canonical"
  - "Simplified exercise-row-actions to only move/delete - superset operations removed"

# Metrics
duration: 45min
completed: 2026-01-25
---

# Quick Task 021: Cleanup Deprecated Phase 3.2 Code Summary

**Removed deprecated Phase 3.2 columns (supersetGroup, supersetOrder, isSubRow, parentRowId, prescription), old react-datasheet-grid files, and legacy use-cases - ~1200 lines deleted**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-01-25T21:00:00Z
- **Completed:** 2026-01-25T21:53:00Z
- **Tasks:** 3/3
- **Files deleted:** 6
- **Files modified:** 26

## Accomplishments

- Deleted 3 old react-datasheet-grid components (~1100 lines)
- Removed @wasback/react-datasheet-grid dependency
- Dropped 4 deprecated database columns and 2 indexes
- Made prescriptions.series column NOT NULL
- Removed deprecated fields from contracts, ports, repository
- Deleted 2 obsolete use-cases (add-split-row, toggle-superset)
- Simplified frontend grid components to use groupId model

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete old grid files and archive migration script** - `e2c7be9` (chore)
2. **Task 2: Remove deprecated database schema columns** - `c001a52` (chore)
3. **Task 3: Update contracts, use-cases, procedures to use groupId model** - `f9c8f47` (refactor)

## Files Deleted

- `apps/coach-web/src/components/programs/program-grid.tsx` - Old react-datasheet-grid implementation (~825 lines)
- `apps/coach-web/src/components/programs/prescription-cell.tsx` - Old cell component (~100 lines)
- `apps/coach-web/src/components/programs/exercise-picker-cell.tsx` - Old exercise picker (~150 lines)
- `apps/coach-web/src/components/programs/split-row-dialog.tsx` - Split row dialog (no longer used)
- `packages/backend/src/use-cases/programs/add-split-row.ts` - Deprecated use case
- `packages/backend/src/use-cases/programs/toggle-superset.ts` - Deprecated use case

## Files Modified

**Database Schema:**
- `packages/database/src/schema/program-exercises.ts` - Removed supersetGroup, supersetOrder, isSubRow, parentRowId columns and indexes
- `packages/database/src/schema/prescriptions.ts` - Removed ParsedPrescription interface and prescription column; made series NOT NULL

**Contracts:**
- `packages/contracts/src/programs/program.ts` - Removed deprecated fields from exerciseRow schemas
- `packages/contracts/src/programs/exercise-row.ts` - Removed deprecated field references
- `packages/contracts/src/programs/index.ts` - Cleaned up exports

**Backend:**
- `packages/core/src/ports/program-repository.port.ts` - Removed findSubRows, updated types
- `packages/backend/src/infrastructure/repositories/program.repository.ts` - Removed deprecated field mappings
- `packages/backend/src/use-cases/programs/add-exercise-row.ts` - Use groupId instead of supersetGroup
- `packages/backend/src/use-cases/programs/update-exercise-row.ts` - Use groupId instead of supersetGroup
- `packages/backend/src/use-cases/programs/reorder-exercise-rows.ts` - Use groupId for adjacency checks
- `packages/backend/src/use-cases/programs/duplicate-program.ts` - Removed subRows handling
- `packages/backend/src/use-cases/programs/delete-exercise-row.ts` - Simplified to direct delete
- `packages/backend/src/procedures/programs/exercise-rows.ts` - Removed deprecated procedures
- `packages/backend/src/procedures/programs/index.ts` - Removed addSplit and toggleSuperset from router
- `packages/backend/src/procedures/programs/get.ts` - Updated mapExerciseRow
- `packages/backend/src/procedures/programs/duplicate.ts` - Updated mapExerciseRow
- `packages/backend/src/procedures/programs/templates.ts` - Updated mapExerciseRow

**Frontend:**
- `apps/coach-web/src/features/programs/hooks/mutations/use-grid-mutations.ts` - Removed useAddSplitRow, useToggleSuperset
- `apps/coach-web/src/components/programs/program-grid/transform-program.ts` - Use groupId for superset display
- `apps/coach-web/src/components/programs/program-grid/program-grid.tsx` - Removed split row and toggle superset
- `apps/coach-web/src/components/programs/exercise-row-actions.tsx` - Simplified to move/delete only
- `apps/coach-web/src/components/programs/program-grid/grid-body.tsx` - Removed deprecated props
- `apps/coach-web/src/components/programs/program-grid/exercise-row.tsx` - Removed deprecated props
- `apps/coach-web/src/components/programs/program-grid/exercise-cell.tsx` - Removed deprecated props
- `apps/coach-web/src/components/programs/program-grid/prescription-cell.tsx` - Fixed lint error

## Decisions Made

1. **Archived migration script** - Kept migrate-to-series.ts in archive/ folder for reference rather than deleting
2. **Removed ParsedPrescription entirely** - The series model is now the only model; no backward compatibility needed
3. **Simplified row actions** - Removed superset and split row operations from context menu; exercise groups are now managed differently

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed lint error in prescription-cell.tsx**
- **Found during:** Task 3 verification
- **Issue:** Pre-existing lint error using array index as React key
- **Fix:** Changed key from `i` to `${index}-${part}` for unique keys
- **Files modified:** apps/coach-web/src/components/programs/program-grid/prescription-cell.tsx
- **Verification:** pnpm lint passes
- **Committed in:** f9c8f47 (part of Task 3 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Minor fix required for lint to pass. No scope creep.

## Issues Encountered

None - plan executed as expected.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Codebase is now clean with only the new series-based prescription model
- Exercise groups (groupId) are the only superset mechanism
- Ready for continued feature development

---
*Phase: quick*
*Completed: 2026-01-25*
