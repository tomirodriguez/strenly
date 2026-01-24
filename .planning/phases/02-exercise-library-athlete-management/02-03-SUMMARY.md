---
phase: 02-exercise-library-athlete-management
plan: 03
subsystem: domain
tags: [exercise, domain-entity, value-object, tdd, clean-architecture]

dependency-graph:
  requires: []
  provides:
    - Exercise domain entity with validation
    - MuscleGroup value object (10 muscle groups)
    - MovementPattern value object (6 patterns)
    - ExerciseRepositoryPort interface
  affects:
    - "02-04: Exercise Repository Implementation"
    - "02-05: Exercise Use Cases"
    - "02-06: Exercise Contracts & Procedures"

tech-stack:
  added: []
  patterns:
    - "Value objects as const arrays with type guards"
    - "Factory function returning Result<Entity, Error>"
    - "Helper functions for entity state checks (isCurated, isCustom, isArchived)"

key-files:
  created:
    - packages/core/src/domain/entities/exercise.ts
    - packages/core/src/domain/entities/exercise.test.ts
    - packages/core/src/domain/entities/muscle-group.ts
    - packages/core/src/domain/entities/movement-pattern.ts
    - packages/core/src/ports/exercise-repository.port.ts
  modified:
    - packages/core/src/index.ts

decisions:
  - title: "Value objects as const arrays"
    context: "Need runtime validation for muscle groups and movement patterns"
    decision: "Use const arrays with type guards for value objects"
    rationale: "Simple, no class overhead, works with both runtime checks and TypeScript types"
  - title: "Curated vs Custom via nullable organizationId"
    context: "Exercises can be global (curated) or org-specific (custom)"
    decision: "organizationId: null for curated, string for custom"
    rationale: "Clean distinction without separate types or boolean flags"

metrics:
  duration: 2 min
  completed: 2026-01-24
---

# Phase 02 Plan 03: Exercise Domain Entity Summary

**One-liner:** Exercise entity with TDD validation for name/URL/patterns, MuscleGroup/MovementPattern value objects with 10 muscles and 6 patterns, plus repository port interface.

## What Was Built

### MuscleGroup Value Object (`muscle-group.ts`)
- 10 muscle groups: chest, back, shoulders, biceps, triceps, quads, hamstrings, glutes, core, calves
- Body region mapping (upper/lower/core)
- Type guard `isValidMuscleGroup()` and helper `getBodyRegion()`

### MovementPattern Value Object (`movement-pattern.ts`)
- 6 patterns: push, pull, hinge, squat, carry, core
- Type guard `isValidMovementPattern()`

### Exercise Domain Entity (`exercise.ts`)
- Factory function `createExercise()` returning `Result<Exercise, ExerciseError>`
- Validation:
  - Name: required, 1-100 chars, trimmed
  - VideoUrl: valid URL if provided
  - MovementPattern: must be valid pattern if provided
  - Muscle groups: all must be valid
- Helper functions: `isCurated()`, `isCustom()`, `isArchived()`
- Curated exercises have `organizationId: null`
- Custom exercises have `organizationId: string`

### Exercise Repository Port (`exercise-repository.port.ts`)
- `ExerciseRepositoryPort` interface with CRUD methods
- `ListExercisesOptions` for filtering by org, pattern, muscle, search
- `ExerciseRepositoryError` discriminated union (NOT_FOUND, DATABASE_ERROR)

### Test Coverage
- 33 tests for Exercise entity (100% coverage)
- TDD flow: RED (failing tests) -> GREEN (implementation)

## Task Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | RED - Value objects and failing tests | `b856059` |
| 2 | GREEN - Exercise entity implementation | `2fa0fc5` |
| 3 | Repository port and exports | `16f2066` |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `pnpm test --filter @strenly/core`: 144 tests pass
- `pnpm typecheck --filter @strenly/core`: passes
- Exercise entity: 100% test coverage
- All exports available from `@strenly/core`

## Next Steps

Ready for:
- **02-04**: Exercise repository implementation with Drizzle ORM
- **02-05**: Exercise use cases (create, update, list, archive)
- **02-06**: Exercise contracts and procedures
