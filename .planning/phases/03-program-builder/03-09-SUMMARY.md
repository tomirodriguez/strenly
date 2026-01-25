---
phase: 03-program-builder
plan: 09
subsystem: procedures
tags: [procedures, programs, weeks, sessions, exercise-rows, prescriptions, orpc]

# Dependency graph
requires:
  - phase: 03-program-builder/03-06
    provides: week and session use cases
  - phase: 03-program-builder/03-07
    provides: exercise row and prescription use cases
  - phase: 03-program-builder/03-08
    provides: program contracts
provides:
  - week procedures (add, update, delete, duplicate)
  - session procedures (add, update, delete)
  - exercise row procedures (add, update, delete, reorder, addSplit, toggleSuperset)
  - prescription update procedure
  - nested router structure for grid operations
affects: [03-10, program-builder-frontend, grid-editor-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [nested-router-structure, authProcedure-for-all-grid-ops]

key-files:
  created:
    - packages/backend/src/procedures/programs/weeks.ts
    - packages/backend/src/procedures/programs/sessions.ts
    - packages/backend/src/procedures/programs/exercise-rows.ts
    - packages/backend/src/procedures/programs/prescriptions.ts
  modified:
    - packages/backend/src/procedures/programs/index.ts
    - packages/contracts/src/programs/prescription.ts
    - packages/contracts/src/programs/index.ts
    - packages/contracts/package.json

key-decisions:
  - "Nested router structure for grid operations (programs.weeks.add, programs.exerciseRows.update, etc.)"
  - "All procedures use authProcedure for organization authentication"
  - "Prescription update returns parsedPrescriptionSchema.nullable() - null for cleared cells"
  - "Exercise row procedures fetch exercise name separately for response"
  - "Error messages in Spanish for Argentine market"

patterns-established:
  - "Grid operations grouped under nested router keys (weeks, sessions, exerciseRows, prescriptions)"
  - "Prescription endpoint accepts notation string, returns structured parsed data"

# Metrics
duration: 6 min
completed: 2026-01-25
---

# Phase 03 Plan 09: Grid Manipulation Procedures Summary

**Contracts and procedures for grid manipulation operations (weeks, sessions, exercise rows, prescriptions) - enabling the Excel-like program editor API.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-25T14:38:28Z
- **Completed:** 2026-01-25T14:44:21Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Week procedures: add, update, delete, duplicate with authorization and error handling
- Session procedures: add, update, delete with last-session protection
- Exercise row procedures: full CRUD plus reorder, split rows, and superset toggle
- Prescription update procedure with notation parsing returning structured data
- Nested router structure for logical API organization

## Task Commits

Each task was committed atomically:

1. **Task 1: Add updatePrescriptionSchema and package.json exports** - `ad81ec9` (feat)
2. **Task 2: Create grid manipulation procedures** - `630a0c9` (feat)

## Files Created/Modified

### Created
- `packages/backend/src/procedures/programs/weeks.ts` - Week CRUD procedures (add, update, delete, duplicate)
- `packages/backend/src/procedures/programs/sessions.ts` - Session CRUD procedures (add, update, delete)
- `packages/backend/src/procedures/programs/exercise-rows.ts` - Exercise row procedures (add, update, delete, reorder, addSplit, toggleSuperset)
- `packages/backend/src/procedures/programs/prescriptions.ts` - Prescription update with notation parsing

### Modified
- `packages/backend/src/procedures/programs/index.ts` - Added nested router structure
- `packages/contracts/src/programs/prescription.ts` - Added updatePrescriptionSchema
- `packages/contracts/src/programs/index.ts` - Exported updatePrescriptionSchema
- `packages/contracts/package.json` - Added exports for programs submodules

## Router Structure

The programs router now has a nested structure for grid operations:

```typescript
programs = {
  // Program CRUD
  create, list, get, update, archive, duplicate,

  // Grid operations
  weeks: { add, update, delete, duplicate },
  sessions: { add, update, delete },
  exerciseRows: { add, update, delete, reorder, addSplit, toggleSuperset },
  prescriptions: { update },
}
```

## Decisions Made

1. **Nested router structure:** Grid operations grouped under `weeks`, `sessions`, `exerciseRows`, `prescriptions` keys for logical API organization and clear endpoint naming.

2. **All procedures use authProcedure:** Every grid operation requires organization authentication via the `authProcedure` middleware, ensuring multi-tenancy security.

3. **Prescription returns nullable parsed data:** The `updatePrescriptionProcedure` returns `parsedPrescriptionSchema.nullable()` - null when the cell is cleared (empty notation or dash), otherwise the full parsed prescription data.

4. **Exercise name fetched separately:** Exercise row procedures fetch the exercise name via `exerciseRepository.findById()` to include it in the response, since the domain model only stores the exerciseId.

5. **Error messages in Spanish:** All error messages are in Spanish for the Argentine market target.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added updatePrescriptionSchema**
- **Found during:** Task 1
- **Issue:** Plan specified updatePrescriptionSchema in artifacts but it didn't exist in prescription.ts
- **Fix:** Added the schema to prescription.ts and exported from index.ts
- **Files modified:** packages/contracts/src/programs/prescription.ts, packages/contracts/src/programs/index.ts
- **Committed in:** ad81ec9

**2. [Rule 2 - Missing Critical] Added package.json exports**
- **Found during:** Task 1
- **Issue:** Package.json didn't export the programs submodules needed for imports
- **Fix:** Added exports for programs, programs/program, programs/week, etc.
- **Files modified:** packages/contracts/package.json
- **Committed in:** ad81ec9

---

**Total deviations:** 2 auto-fixed (both missing critical functionality)
**Impact on plan:** Minor - schema and exports were needed for procedures to work

## Verification Results

- TypeScript: All packages typecheck successfully
- All procedures use authProcedure for authentication
- Router exposes all nested endpoints (weeks, sessions, exerciseRows, prescriptions)
- Prescription procedure returns parsed data or null

## Next Phase Readiness

**Ready for 03-10 (Program Builder Frontend):**
- All grid manipulation endpoints exposed via oRPC
- Contracts define schemas for all grid operations
- Nested router structure provides clear API surface
- Prescription notation parsing returns structured data for grid cells

**API Surface:**
- `programs.weeks.{add, update, delete, duplicate}`
- `programs.sessions.{add, update, delete}`
- `programs.exerciseRows.{add, update, delete, reorder, addSplit, toggleSuperset}`
- `programs.prescriptions.update`

---
*Phase: 03-program-builder*
*Completed: 2026-01-25*
