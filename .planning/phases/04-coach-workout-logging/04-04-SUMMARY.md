---
phase: 04-coach-workout-logging
plan: 04
subsystem: api
tags: [use-case, neverthrow, clean-architecture, workout-log, authorization]

# Dependency graph
requires:
  - phase: 04-01
    provides: WorkoutLog domain entity with createWorkoutLog factory
  - phase: 04-02
    provides: WorkoutLogRepository port interface
provides:
  - createLog use case (initialize log from program prescription)
  - saveLog use case (validate and persist workout log)
  - getLog use case (load log by ID)
affects: [04-05, 04-06, workout-log-procedures]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Authorization-first in all use cases
    - Auto-calculate status from exercise states
    - Pre-fill actual values from prescription

key-files:
  created:
    - packages/backend/src/use-cases/workout-logs/create-log.ts
    - packages/backend/src/use-cases/workout-logs/save-log.ts
    - packages/backend/src/use-cases/workout-logs/get-log.ts
  modified: []

key-decisions:
  - "createLog does NOT persist - returns pre-filled log for client editing"
  - "saveLog auto-calculates status from exercise states"
  - "Pre-fill repsPerformed/weightUsed from prescription, never RPE"
  - "Prescription snapshot stored in series for deviation display"

patterns-established:
  - "WorkoutLog use case pattern: createLog -> saveLog flow"
  - "Status auto-calculation: completed/partial/skipped based on exercise states"

# Metrics
duration: 4min
completed: 2026-01-27
---

# Phase 04 Plan 04: WorkoutLog Use Cases Summary

**Three use cases for workout logging: createLog (pre-fill from prescription), saveLog (validate and persist), getLog (load by ID)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-27T16:19:07Z
- **Completed:** 2026-01-27T16:22:40Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

- createLog use case initializes workout log from program prescription with pre-filled values
- saveLog use case validates via domain factory and auto-calculates status
- getLog use case loads log with proper authorization and not_found handling
- All use cases check authorization before any business logic

## Task Commits

Each task was committed atomically:

1. **Task 1: Create createLog Use Case** - `14ad273` (feat)
2. **Task 2: Create saveLog and getLog Use Cases** - `713990a` (feat)

## Files Created/Modified

- `packages/backend/src/use-cases/workout-logs/create-log.ts` - Initialize log from prescription
- `packages/backend/src/use-cases/workout-logs/save-log.ts` - Validate and persist log
- `packages/backend/src/use-cases/workout-logs/get-log.ts` - Load log by ID

## Decisions Made

- **createLog does NOT persist:** Returns pre-filled log for client-side editing. Client calls saveLog after editing. This allows the coach to review and modify before saving.
- **Auto-calculate status:** saveLog calculates status automatically based on exercise states:
  - 'completed' if all exercises done (not skipped) with all series done
  - 'skipped' if all exercises skipped
  - 'partial' otherwise
- **Pre-fill from prescription:** repsPerformed and weightUsed are pre-filled from prescription values. RPE is never pre-filled (athlete-specific).
- **Prescription snapshot:** Series store both actual values and prescribed snapshot for deviation display in UI.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Use cases ready for contracts (04-05) and procedures (04-06)
- createLog/saveLog/getLog pattern established for workout logging flow
- Authorization checks in place for all operations

---
*Phase: 04-coach-workout-logging*
*Completed: 2026-01-27*
