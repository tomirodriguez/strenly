---
phase: 03-program-builder
plan: 01
subsystem: database
tags: [drizzle, postgresql, jsonb, programs, prescriptions]

# Dependency graph
requires:
  - phase: 02-exercise-library
    provides: exercises table schema
  - phase: 02-athlete-management
    provides: athletes table schema
provides:
  - programs table with organization/athlete relations
  - program_weeks table for grid columns
  - program_sessions table for training days
  - program_exercises table with superset/split row support
  - prescriptions table with JSONB structured data
affects: [03-02 domain entities, 03-03 repositories, program-builder frontend]

# Tech tracking
tech-stack:
  added: []
  patterns: [JSONB typed column, self-referencing table for sub-rows, unique constraint for cell identity]

key-files:
  created:
    - packages/database/src/schema/programs.ts
    - packages/database/src/schema/program-weeks.ts
    - packages/database/src/schema/program-sessions.ts
    - packages/database/src/schema/program-exercises.ts
    - packages/database/src/schema/prescriptions.ts
  modified:
    - packages/database/src/schema/index.ts

key-decisions:
  - "JSONB for prescription data with typed ParsedPrescription interface"
  - "Self-referencing parentRowId for split row support"
  - "Unique constraint on (programExerciseId, weekId) for cell identity"
  - "onDelete cascade from programs through weeks/sessions/exercises to prescriptions"
  - "onDelete restrict for exercise references to prevent orphaned program exercises"

patterns-established:
  - "JSONB columns use $type<Interface>() for type safety"
  - "Composite indexes for orderIndex queries include parent foreign key"
  - "Superset grouping via text column (A, B, C) and integer order (1, 2, 3)"

# Metrics
duration: 5min
completed: 2026-01-25
---

# Phase 03-01: Database Schema Summary

**Program builder database schema with 5 tables supporting Excel-like grid structure, JSONB prescriptions, superset grouping, and split rows**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-25
- **Completed:** 2026-01-25
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Created programs table with organization, athlete, and template support
- Created program_weeks and program_sessions tables for grid structure
- Created program_exercises table with superset grouping and split row support
- Created prescriptions table with JSONB structured prescription data
- Applied schema to database via db:push

## Task Commits

Each task was committed atomically:

1. **Task 1: Create programs table schema** - `cc47df2` (feat)
2. **Task 2: Create program weeks and sessions tables** - `e651167` (feat)
3. **Task 3: Create program exercises and prescriptions tables** - `c0c3dba` (feat)

## Files Created/Modified
- `packages/database/src/schema/programs.ts` - Programs table with status enum, organization/athlete relations
- `packages/database/src/schema/program-weeks.ts` - Week columns with customizable names
- `packages/database/src/schema/program-sessions.ts` - Training days with orderIndex
- `packages/database/src/schema/program-exercises.ts` - Exercise rows with superset/split row support
- `packages/database/src/schema/prescriptions.ts` - JSONB prescription storage with unique constraint
- `packages/database/src/schema/index.ts` - Export all new tables

## Decisions Made
- **JSONB for prescriptions:** Stores structured data (sets, reps, intensity, tempo) with full type safety via $type<ParsedPrescription>()
- **Self-referencing parentRowId:** Enables split rows (same exercise, different set configs like Heavy Singles + Back-off Volume)
- **Unique (exerciseId, weekId):** Each cell in the grid is uniquely identified
- **onDelete cascade chain:** Deleting a program cascades through weeks/sessions/exercises to prescriptions
- **onDelete restrict for exercises:** Prevents deleting exercises that are used in programs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - schema creation and db:push completed successfully.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Database schema complete for program builder domain
- Ready for domain entities (Program, Week, Session, ProgramExercise, Prescription)
- Ready for repository implementations
- ParsedPrescription interface exported from prescriptions.ts for use in domain layer

---
*Phase: 03-program-builder*
*Completed: 2026-01-25*
