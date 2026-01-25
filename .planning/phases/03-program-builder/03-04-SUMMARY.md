---
phase: 03-program-builder
plan: 04
subsystem: repository
tags: [drizzle, repository, multi-tenancy, jsonb, program-builder]
dependency-graph:
  requires:
    - phase: 03-program-builder
      plan: 03-01
      provides: database schema
    - phase: 03-program-builder
      plan: 03-03
      provides: domain entities
  provides: [program-repository, week-operations, session-operations, exercise-row-operations, prescription-upsert]
  affects: [03-05, 03-06, program-builder-frontend]
tech-stack:
  added: []
  patterns: [repository-factory, result-async-pattern, access-verification-helpers]
key-files:
  created:
    - packages/core/src/ports/program-repository.port.ts
    - packages/backend/src/infrastructure/repositories/program.repository.ts
  modified:
    - packages/core/src/index.ts
    - packages/backend/src/infrastructure/repositories/index.ts
decisions:
  - id: access-verification-helpers
    choice: "Internal helpers to verify organization ownership for nested entities"
    reason: "Nested operations (weeks, sessions, rows) need to verify parent program belongs to organization"
  - id: result-discriminant-pattern
    choice: "Return { ok: true, data } | { ok: false, error } from async operations"
    reason: "TypeScript can't narrow error types in andThen without explicit discriminant"
  - id: intensity-unit-mapping
    choice: "Map intensityType to intensityUnit in repository layer"
    reason: "Database schema uses both, domain uses only type"
metrics:
  duration: 5 min
  completed: 2026-01-25
---

# Phase 03 Plan 04: Program Repository Summary

Program repository port and Drizzle implementation with complete CRUD for programs, weeks, sessions, exercise rows, and prescriptions with multi-tenancy enforcement.

## One-liner

ProgramRepositoryPort interface with 17 methods; Drizzle implementation including nested access verification, JSONB prescription upsert, and bulk operations (reorder, duplicate week).

## What Was Done

### Port Definition (packages/core/src/ports/program-repository.port.ts)

- **ProgramRepositoryPort interface** with 17 methods:
  - CRUD: create, findById, update, list, findWithDetails, listTemplates
  - Week operations: createWeek, updateWeek, deleteWeek
  - Session operations: createSession, updateSession, deleteSession
  - Exercise row operations: createExerciseRow, updateExerciseRow, deleteExerciseRow
  - Prescription: upsertPrescription (create/update/delete cell values)
  - Bulk: reorderExerciseRows, duplicateWeek

- **Supporting types**:
  - ProgramFilters (status, athleteId, isTemplate, search, pagination)
  - ProgramWeek, ProgramSession, ProgramExerciseRow
  - PrescriptionCell, ExerciseRowWithPrescriptions, SessionWithRows
  - ProgramWithDetails (full grid structure)

- **Error types**: NOT_FOUND (with entityType discrimination) and DATABASE_ERROR

### Repository Implementation (packages/backend/src/infrastructure/repositories/program.repository.ts)

- **createProgramRepository factory function** returning ProgramRepositoryPort
- **Access verification helpers**:
  - verifyProgramAccess: Check program belongs to organization
  - verifyWeekAccess: Join through programs to verify org ownership
  - verifySessionAccess: Join through programs to verify org ownership
  - verifyExerciseRowAccess: Join through sessions and programs to verify org ownership

- **Multi-tenancy**: All queries filter by organizationId from context
- **JSONB handling**: mapPrescriptionToDb/mapPrescriptionToDomain for prescription data
- **ON CONFLICT upsert**: upsertPrescription uses onConflictDoUpdate for efficient cell updates
- **Bulk operations**:
  - reorderExerciseRows: Updates orderIndex in transaction
  - duplicateWeek: Creates new week and copies all prescriptions

### Exports

- Added program and prescription domain entities to core package index
- Added program-repository port to core package index
- Added createProgramRepository to backend repository index

## Key Files

| File | Purpose |
|------|---------|
| `packages/core/src/ports/program-repository.port.ts` | Repository interface with 17 methods |
| `packages/backend/src/infrastructure/repositories/program.repository.ts` | Drizzle implementation (970 lines) |
| `packages/core/src/index.ts` | Export program and prescription entities and port |
| `packages/backend/src/infrastructure/repositories/index.ts` | Export createProgramRepository |

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Access verification helpers | Internal functions per entity type | Nested operations need to verify parent program belongs to organization; extracting to helpers reduces duplication |
| Result discriminant pattern | `{ ok: true, data } | { ok: false, error }` return type | TypeScript cannot narrow error types in ResultAsync.andThen without explicit ok discriminant |
| Intensity unit mapping | Map in repository layer | Database schema has both intensityType and intensityUnit; domain only uses type; repository handles translation |
| Error entity type | Discriminated NOT_FOUND with entityType field | Different entity types (program, week, session, exercise_row) can be distinguished in error handling |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added access verification helpers**

- **Found during:** Task 2
- **Issue:** Nested operations (createWeek, createSession, etc.) need to verify the parent entity belongs to the organization
- **Fix:** Created verifyProgramAccess, verifyWeekAccess, verifySessionAccess, verifyExerciseRowAccess helpers that join through the hierarchy to verify organization ownership
- **Files modified:** packages/backend/src/infrastructure/repositories/program.repository.ts
- **Commit:** 09e7fa1

**2. [Rule 1 - Bug] Fixed intensity unit type mapping**

- **Found during:** Task 2 typecheck
- **Issue:** Database schema intensityUnit uses '%' for percentage, but intensityType uses 'percentage'
- **Fix:** Added explicit mapping in mapPrescriptionToDb function
- **Files modified:** packages/backend/src/infrastructure/repositories/program.repository.ts
- **Commit:** 09e7fa1

## Verification Results

- TypeScript: No errors in core and backend packages
- Biome: All lint rules pass (after formatting fixes)
- All port methods are implemented
- Organization filtering in all queries verified
- Transaction usage for multi-table operations (reorderExerciseRows, duplicateWeek)

## Next Phase Readiness

**Ready for 03-05 (Use Cases):**
- Repository port defines complete interface
- Implementation handles all multi-tenancy concerns
- Error types defined for use case error handling
- Prescription JSONB data handled correctly

**Artifacts provided:**
- `ProgramRepositoryPort` type
- `createProgramRepository(db: DbClient)` factory
- `ProgramFilters`, `ProgramWithDetails`, `ProgramWeek`, `ProgramSession`, `ProgramExerciseRow` types
- `ProgramRepositoryError` discriminated union

---
*Phase: 03-program-builder*
*Completed: 2026-01-25*
