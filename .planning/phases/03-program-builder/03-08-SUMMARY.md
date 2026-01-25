---
phase: 03-program-builder
plan: 08
subsystem: api
tags: [contracts, procedures, oRPC, zod, programs]
dependency-graph:
  requires: [03-05, 03-06, 03-07]
  provides: [program-contracts, program-procedures, programs-router]
  affects: [frontend-programs]
tech-stack:
  added: []
  patterns: [authProcedure, error-mapping, mapExerciseRow-helper]
key-files:
  created:
    - packages/contracts/src/programs/program.ts
    - packages/contracts/src/programs/index.ts
    - packages/contracts/src/programs/week.ts
    - packages/contracts/src/programs/session.ts
    - packages/contracts/src/programs/exercise-row.ts
    - packages/backend/src/procedures/programs/create.ts
    - packages/backend/src/procedures/programs/get.ts
    - packages/backend/src/procedures/programs/list.ts
    - packages/backend/src/procedures/programs/update.ts
    - packages/backend/src/procedures/programs/archive.ts
    - packages/backend/src/procedures/programs/duplicate.ts
    - packages/backend/src/procedures/programs/index.ts
  modified:
    - packages/backend/src/procedures/router.ts
decisions:
  - id: recursive-schema-type-annotation
    choice: "Use explicit type annotation for recursive schema"
    rationale: "TypeScript cannot infer recursive z.lazy() types, explicit annotation required"
  - id: date-to-iso-string
    choice: "Convert Date to ISO string in procedure responses"
    rationale: "JSON serialization requires string dates, maintain consistency with other procedures"
metrics:
  duration: "6 min"
  completed: "2026-01-25"
---

# Phase 03 Plan 08: Program Contracts and Procedures Summary

Zod contracts and oRPC procedures for program CRUD and duplication operations

## One-liner

Program API contracts with Zod schemas plus thin oRPC procedures calling use cases for full program lifecycle management

## What Changed

### Task 1: Create Program Contracts

Created comprehensive Zod schemas in `packages/contracts/src/programs/`:

**program.ts - Core program schemas:**
- `programStatusSchema` - enum: draft, active, archived
- `programSchema` - basic program output
- `programWeekSchema` - week column output
- `programSessionSchema` - session (training day) output
- `prescriptionSchema` - prescription cell data
- `exerciseRowWithPrescriptionsSchema` - row with nested prescriptions
- `sessionWithRowsSchema` - session with exercise rows
- `programWithDetailsSchema` - full program for grid view

**Input schemas:**
- `createProgramInputSchema` - name (3-100 chars), description, athleteId, isTemplate
- `updateProgramInputSchema` - programId + partial update fields
- `listProgramsInputSchema` - filtering by athleteId, isTemplate, status, search + pagination
- `getProgramInputSchema` - programId
- `archiveProgramInputSchema` - programId
- `duplicateProgramInputSchema` - sourceProgramId, name, athleteId, isTemplate

**Additional contract files (from existing work):**
- `week.ts` - add, update, delete, duplicate week schemas
- `session.ts` - add, update, delete session schemas
- `exercise-row.ts` - add, update, delete, reorder, split, superset schemas

### Task 2: Create Program Procedures and Router

Created thin oRPC procedures in `packages/backend/src/procedures/programs/`:

**Core procedures:**
- `createProgram` - validates athlete if provided, calls use case, returns program output
- `getProgram` - returns full ProgramWithDetails with nested weeks, sessions, rows
- `listPrograms` - filtering support, returns paginated list
- `updateProgram` - partial updates for name/description
- `archiveProgram` - status transition via domain method
- `duplicateProgram` - deep copy with new IDs, returns ProgramWithDetails

**Router structure:**
- All procedures use `authProcedure` for organization authentication
- Error mapping: forbidden (403), not_found (404), validation_error (400)
- Programs router added to main router at `programs` key

## Key Files

| File | Purpose |
|------|---------|
| `contracts/src/programs/program.ts` | Core program schemas |
| `contracts/src/programs/index.ts` | Barrel exports |
| `procedures/programs/create.ts` | Create with athlete validation |
| `procedures/programs/get.ts` | Full details for grid view |
| `procedures/programs/list.ts` | Filtered list with pagination |
| `procedures/programs/update.ts` | Partial updates |
| `procedures/programs/archive.ts` | Status transition |
| `procedures/programs/duplicate.ts` | Deep copy |
| `procedures/programs/index.ts` | Programs router |
| `procedures/router.ts` | Main router (updated) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed exercise repository method signature**

- **Found during:** Full typecheck
- **Issue:** `exercise-rows.ts` (created by concurrent 03-09 plan) was calling `exerciseRepository.findById(ctx, id)` but the port only accepts `findById(id)`
- **Fix:** Removed ctx parameter from all 4 occurrences, removed unused ctx variable declarations
- **Files modified:** packages/backend/src/procedures/programs/exercise-rows.ts
- **Commit:** Part of 03-09 commit (auto-formatted)

**2. [Rule 3 - Blocking] Removed unused imports in use cases**

- **Found during:** Lint
- **Issue:** delete-week.ts and update-prescription.ts had unused `okAsync` imports
- **Fix:** Removed unused imports
- **Files modified:** packages/backend/src/use-cases/programs/delete-week.ts, update-prescription.ts
- **Commit:** Part of lint fixes

**3. [Rule 1 - Bug] Fixed recursive schema type annotation**

- **Found during:** Task 1 typecheck
- **Issue:** `exerciseRowWithPrescriptionsSchema` with `z.lazy()` self-reference caused implicit any type
- **Fix:** Added explicit type annotation `z.ZodType<ExerciseRowWithPrescriptions>`
- **Files modified:** packages/contracts/src/programs/program.ts
- **Commit:** 78b0e61

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Recursive schema | Explicit type annotation | TypeScript requires explicit type for z.lazy() |
| Date serialization | toISOString() in procedures | JSON compatibility, consistent with other endpoints |
| Helper function | mapExerciseRow | Reusable date conversion for nested rows |
| Error granularity | Specific error codes | FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, ATHLETE_NOT_FOUND |

## Testing Notes

All contracts and procedures typecheck correctly. Endpoints ready for frontend integration:
- `programs.create` - POST /api/programs
- `programs.list` - GET /api/programs
- `programs.get` - GET /api/programs/:id
- `programs.update` - PATCH /api/programs/:id
- `programs.archive` - POST /api/programs/:id/archive
- `programs.duplicate` - POST /api/programs/:id/duplicate

## Next Phase Readiness

Ready for frontend components. Backend API is complete for:
- Program creation with athlete assignment
- Program listing with filtering
- Full program details for grid rendering
- Program updates and archiving
- Template instantiation via duplicate

Dependencies satisfied:
- Use cases from 03-05, 03-06, 03-07
- Repository from 03-04
- Domain entities from 03-03

Next steps:
- Frontend program grid components
- Real-time cell editing
- Drag-and-drop row reordering
