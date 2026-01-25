---
phase: 03-program-builder
plan: 05
subsystem: use-cases
tags: [programs, use-cases, neverthrow, authorization]
dependency-graph:
  requires: [03-03, 03-04]
  provides: [program-crud-use-cases, duplicate-program-use-case]
  affects: [03-06, 03-07]
tech-stack:
  added: []
  patterns: [authorization-first, make-factory, deep-copy]
key-files:
  created:
    - packages/backend/src/use-cases/programs/create-program.ts
    - packages/backend/src/use-cases/programs/get-program.ts
    - packages/backend/src/use-cases/programs/list-programs.ts
    - packages/backend/src/use-cases/programs/update-program.ts
    - packages/backend/src/use-cases/programs/archive-program.ts
    - packages/backend/src/use-cases/programs/duplicate-program.ts
  modified: []
decisions:
  - id: make-factory-pattern
    choice: "Use makeXxxUseCase factory pattern"
    rationale: "Dependency injection for repositories, consistent with existing use cases"
  - id: default-week-session
    choice: "Create default Semana 1 and DIA 1 on program creation"
    rationale: "Programs should never be empty, better UX"
  - id: deep-copy-sequential
    choice: "Sequential entity creation for duplicate"
    rationale: "Simpler error handling, no transaction needed for atomicity"
metrics:
  duration: "5 min"
  completed: "2026-01-25"
---

# Phase 03 Plan 05: Program Use Cases Summary

Program CRUD use cases with authorization-first pattern and deep copy duplication

## One-liner

Authorization-first program CRUD use cases plus deep copy duplicate for template instantiation

## What Changed

### Task 1: Program CRUD Use Cases

Created five core use cases following established patterns:

**createProgramUseCase:**
- Validates input via domain factory
- Verifies athlete exists if athleteId provided
- Creates program with default week ("Semana 1") and session ("DIA 1")
- Returns created program

**getProgramUseCase:**
- Returns ProgramWithDetails for grid rendering
- Uses repository.findWithDetails() for full nested data

**listProgramsUseCase:**
- Supports filters: athleteId, isTemplate, status, search
- Returns { items, totalCount } for pagination

**updateProgramUseCase:**
- Merges input with existing program
- Validates via domain entity before persist

**archiveProgramUseCase:**
- Uses domain archiveProgram() for status transition
- Prevents re-archiving already archived programs

### Task 2: Duplicate Program Use Case

Implemented deep copy for template instantiation (TPL-02) and program duplication (PRG-08):

- Generates new IDs for ALL entities: program, weeks, sessions, exercise rows, prescriptions
- Preserves order indices and relationships
- Handles sub-rows with correct parent linkage
- Resets status to 'draft', allows custom athleteId/isTemplate
- Returns new ProgramWithDetails

## Key Files

| File | Purpose |
|------|---------|
| `create-program.ts` | Create with default week/session |
| `get-program.ts` | Full details for grid view |
| `list-programs.ts` | Filtered list with pagination |
| `update-program.ts` | Merge updates with existing |
| `archive-program.ts` | Status transition via domain |
| `duplicate-program.ts` | Deep copy with new IDs |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed error handling in existing use cases**

- **Found during:** Task 1 typecheck
- **Issue:** Existing exercise row use cases had `e.message` on NOT_FOUND errors which don't have message property
- **Fix:** Updated mapErr functions to properly handle discriminated union errors
- **Files modified:** add-exercise-row.ts, delete-exercise-row.ts, reorder-exercise-rows.ts, update-exercise-row.ts
- **Commit:** Part of main commit (auto-formatted by biome)

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Factory pattern | makeXxxUseCase | Dependency injection, consistent with existing |
| Default content | Week + Session | Programs never empty, better UX |
| Duplicate strategy | Sequential | Simpler error handling |
| Prescription copy | Full copy | Complete program replication |

## Testing Notes

All use cases typecheck correctly. Integration testing recommended for:
- Program creation with athlete verification
- Duplicate program with complex nested structures
- Archive status transition validation

## Next Phase Readiness

Ready for 03-06 (Contracts & Procedures) which will expose these use cases via API.

Dependencies satisfied:
- Domain entities from 03-03
- Repository from 03-04
- Use cases from this plan

Remaining for Phase 3:
- API contracts (Zod schemas)
- oRPC procedures
- Frontend components
