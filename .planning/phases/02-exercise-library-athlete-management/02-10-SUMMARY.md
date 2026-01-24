---
phase: 02-exercise-library-athlete-management
plan: 10
subsystem: api-layer
tags: [oRPC, contracts, procedures, exercises, muscle-groups]
dependency-graph:
  requires: ["02-08"]
  provides: ["exercises-api", "muscle-groups-api"]
  affects: ["03-program-builder"]
tech-stack:
  added: []
  patterns:
    - "exhaustive-error-switch"
    - "procedure-error-mapping"
    - "zod-schema-validation"
key-files:
  created:
    - "packages/contracts/src/exercises/exercise.ts"
    - "packages/contracts/src/exercises/muscle-group.ts"
    - "packages/contracts/src/exercises/index.ts"
    - "packages/backend/src/procedures/exercises/create-exercise.ts"
    - "packages/backend/src/procedures/exercises/list-exercises.ts"
    - "packages/backend/src/procedures/exercises/get-exercise.ts"
    - "packages/backend/src/procedures/exercises/update-exercise.ts"
    - "packages/backend/src/procedures/exercises/archive-exercise.ts"
    - "packages/backend/src/procedures/exercises/clone-exercise.ts"
    - "packages/backend/src/procedures/exercises/list-muscle-groups.ts"
    - "packages/backend/src/procedures/exercises/index.ts"
  modified:
    - "packages/contracts/package.json"
    - "packages/backend/src/procedures/router.ts"
decisions:
  - id: "exercises-contracts-export"
    choice: "Add exports to contracts package.json"
    reason: "Module path resolution requires explicit exports"
  - id: "crypto-random-uuid"
    choice: "Use crypto.randomUUID() instead of nanoid"
    reason: "Built-in API, no external dependency needed"
  - id: "zod-parse-muscle-names"
    choice: "Parse muscle names through schema for type safety"
    reason: "Repository returns string, schema expects enum"
metrics:
  duration: "3 min"
  completed: "2026-01-24"
---

# Phase 2 Plan 10: Exercise Contracts & Procedures Summary

**One-liner:** Zod contracts and oRPC procedures for exercise CRUD, clone, and muscle group lookup.

## What Was Built

### Contracts Package

Created `@strenly/contracts/exercises` module with:

- **muscleGroupSchema** - Enum of 10 muscle groups
- **bodyRegionSchema** - Upper/lower/core regions
- **muscleGroupInfoSchema** - Full muscle group data for dropdowns
- **movementPatternSchema** - Push/pull/hinge/squat/carry/core
- **exerciseSchema** - Complete exercise output representation
- **Input schemas** - create, update, list, get, archive, clone

### Exercises Router

Created 7 procedures following established patterns:

| Procedure | Input | Output | Key Errors |
|-----------|-------|--------|------------|
| create | createExerciseInputSchema | exerciseSchema | FORBIDDEN, VALIDATION_ERROR |
| list | listExercisesInputSchema | listExercisesOutputSchema | FORBIDDEN |
| get | getExerciseInputSchema | exerciseSchema | FORBIDDEN, NOT_FOUND |
| update | updateExerciseInputSchema | exerciseSchema | FORBIDDEN, NOT_FOUND, CANNOT_EDIT_CURATED, VALIDATION_ERROR |
| archive | archiveExerciseInputSchema | archiveExerciseOutputSchema | FORBIDDEN, NOT_FOUND, CANNOT_ARCHIVE_CURATED |
| clone | cloneExerciseInputSchema | exerciseSchema | FORBIDDEN, SOURCE_NOT_FOUND, VALIDATION_ERROR |
| muscleGroups | (none) | z.array(muscleGroupInfoSchema) | INTERNAL_ERROR |

## Decisions Made

1. **contracts/package.json exports** - Added explicit exports for exercises module to enable module path resolution (`@strenly/contracts/exercises`)

2. **crypto.randomUUID()** - Used built-in Web Crypto API instead of nanoid for ID generation (no external dependency)

3. **Zod parse for type safety** - Muscle group names parsed through schema to convert string to enum type

## Commits

| Hash | Description |
|------|-------------|
| d5326af | feat(02-10): create exercise contracts |
| 745cb6b | feat(02-10): create exercise CRUD procedures |
| e27a838 | feat(02-10): add muscle groups endpoint and mount exercises router |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `pnpm typecheck --filter @strenly/backend` - PASS
- `pnpm typecheck --filter @strenly/contracts` - PASS
- Exercises router mounted at /api/rpc/exercises/*
- All procedures use exhaustive error switches
- Clone copies all exercise fields with provenance

## Next Phase Readiness

**Ready for Phase 3** - Program Builder can now:
- Use exercises.list to populate exercise picker
- Use exercises.muscleGroups for filtering UI
- Clone curated exercises for customization
- Create custom exercises for organization
