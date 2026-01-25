---
phase: 03-program-builder
plan: 06
subsystem: use-cases
tags: [use-cases, programs, weeks, sessions, authorization, neverthrow]
dependency-graph:
  requires:
    - phase: 03-program-builder
      plan: 03
      provides: domain entities
    - phase: 03-program-builder
      plan: 04
      provides: program repository
  provides: [week-use-cases, session-use-cases, grid-structure-operations]
  affects: [03-07, program-builder-procedures, program-builder-frontend]
tech-stack:
  added: []
  patterns: [authorization-first, result-async-chaining, last-entity-protection]
key-files:
  created:
    - packages/backend/src/use-cases/programs/add-week.ts
    - packages/backend/src/use-cases/programs/update-week.ts
    - packages/backend/src/use-cases/programs/delete-week.ts
    - packages/backend/src/use-cases/programs/duplicate-week.ts
    - packages/backend/src/use-cases/programs/add-session.ts
    - packages/backend/src/use-cases/programs/update-session.ts
    - packages/backend/src/use-cases/programs/delete-session.ts
  modified: []
decisions:
  - id: programId-in-input
    choice: "Require programId in delete/duplicate week and delete session inputs"
    reason: "Allows efficient verification of week/session count without iterating all programs"
  - id: separate-error-types
    choice: "Separate not_found and program_not_found error types"
    reason: "Clear distinction between missing week/session and missing program for better error handling"
  - id: last-entity-protection
    choice: "Prevent deletion of last week/session at use case level"
    reason: "Minimum structure (1 week, 1 session) required for valid program grid"
metrics:
  duration: 4 min
  completed: 2026-01-25
---

# Phase 03 Plan 06: Week and Session Use Cases Summary

Use cases for managing program weeks (columns) and sessions (training days) with authorization, validation, and business rules.

## One-liner

Seven use cases for week/session CRUD: add/update/delete/duplicate week and add/update/delete session with authorization-first pattern and last-entity protection.

## What Was Done

### Week Management Use Cases

- **addWeekUseCase** (`add-week.ts`):
  - Input: { programId, name? } - name defaults to "Semana {N+1}"
  - Authorization: programs:write
  - Calculates orderIndex from existing week count
  - Creates week via repository.createWeek()

- **updateWeekUseCase** (`update-week.ts`):
  - Input: { weekId, name }
  - Authorization: programs:write
  - Repository verifies week exists and belongs to org

- **deleteWeekUseCase** (`delete-week.ts`):
  - Input: { programId, weekId }
  - Authorization: programs:write
  - Verifies week exists in program
  - Prevents deletion if last week (last_week error)
  - Cascades to prescriptions

- **duplicateWeekUseCase** (`duplicate-week.ts`):
  - Input: { programId, weekId, name? } - name defaults to "{source} (copia)"
  - Authorization: programs:write
  - Uses repository.duplicateWeek() which copies all prescriptions

### Session Management Use Cases

- **addSessionUseCase** (`add-session.ts`):
  - Input: { programId, name } (e.g., "DIA 2 - PUSH")
  - Authorization: programs:write
  - Calculates orderIndex from existing session count

- **updateSessionUseCase** (`update-session.ts`):
  - Input: { sessionId, name }
  - Authorization: programs:write
  - Repository verifies session exists and belongs to org

- **deleteSessionUseCase** (`delete-session.ts`):
  - Input: { programId, sessionId }
  - Authorization: programs:write
  - Verifies session exists in program
  - Prevents deletion if last session (last_session error)
  - Cascades to exercise rows and prescriptions

## Key Files

| File | Purpose |
|------|---------|
| `packages/backend/src/use-cases/programs/add-week.ts` | Add week with auto-name |
| `packages/backend/src/use-cases/programs/update-week.ts` | Update week name |
| `packages/backend/src/use-cases/programs/delete-week.ts` | Delete week with protection |
| `packages/backend/src/use-cases/programs/duplicate-week.ts` | Copy week with prescriptions |
| `packages/backend/src/use-cases/programs/add-session.ts` | Add session (training day) |
| `packages/backend/src/use-cases/programs/update-session.ts` | Update session name |
| `packages/backend/src/use-cases/programs/delete-session.ts` | Delete session with protection |

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| programId in input | Require for delete/duplicate | Efficient count check without iterating programs |
| Separate error types | not_found vs program_not_found | Clear distinction for error handling |
| Last entity protection | Use case level enforcement | Programs must have at least 1 week and 1 session |
| Default names in Spanish | "Semana N", "(copia)" | Argentine market target |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- TypeScript: No errors in backend package
- Authorization: hasPermission check is FIRST in all 7 use cases
- Business rules: last_week and last_session error types prevent minimum structure violations
- Cascade delete: Works via repository (verified in 03-04)

## Next Phase Readiness

**Ready for 03-07 (Contracts and Procedures):**
- All week management operations implemented
- All session management operations implemented
- Error types defined for HTTP status mapping
- Input types ready for Zod schema derivation

**Artifacts provided:**
- `makeAddWeek`, `makeUpdateWeek`, `makeDeleteWeek`, `makeDuplicateWeek`
- `makeAddSession`, `makeUpdateSession`, `makeDeleteSession`
- Error types: `AddWeekError`, `UpdateWeekError`, `DeleteWeekError`, `DuplicateWeekError`
- Error types: `AddSessionError`, `UpdateSessionError`, `DeleteSessionError`

---
*Phase: 03-program-builder*
*Completed: 2026-01-25*
