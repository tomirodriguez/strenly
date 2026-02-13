# Strenly Master Audit Report

**Date:** 2026-02-13
**Audited by:** 10 parallel Claude agents against 18 skill definitions
**Scope:** 213 files across 10 architectural layers

---

## Agent Instructions

**You are executing a phased refactoring of the Strenly codebase.** Read this file to understand the full picture, then execute the phase assigned to you.

### How to execute a phase

1. Read this file (`MASTER-AUDIT.md`) for context
2. Read `REFACTORING-PLAN.md` for the detailed phase breakdown
3. Read the specific layer report(s) listed in your phase (e.g., `.audit/03-repositories.md`)
4. Read the relevant skill(s) from `.claude/skills/` before writing any code
5. For each fix: read the source file, apply the minimal correct change, verify it compiles
6. After all fixes in the phase: run `pnpm typecheck && pnpm lint && pnpm test`
7. If any check fails, fix the issue before finishing
8. Create a conventional commit: `refactor(scope): description of phase changes`
9. Update the Progress Tracker below: mark your phase as DONE

### Rules for agents

- Follow ALL rules in `CLAUDE.md` (project root) — especially no `as` casts, no `!`, no barrel files
- Load the corresponding skill (`/domain`, `/port`, `/repository`, etc.) BEFORE writing code for that layer
- Search for 2-3 existing examples of the pattern before implementing fixes
- Do NOT refactor beyond what the phase specifies — stay focused
- If a fix would cascade into another phase's scope, note it but don't fix it

### Prompt template

To launch a phase, start a new conversation and tell the agent which batch to execute. The agent should read this file and `REFACTORING-PLAN.md` for all the context it needs.

---

## Progress Tracker

### Batch 1 — SEQUENTIAL (shared files: athlete.repository.ts, workout-log.repository.ts)
- [x] **Phase 1: Security & Multi-tenancy** — exercise org scoping, workout-log permissions, ILIKE injection
- [x] **Phase 2: `as` Cast Elimination** — useOrgSlug hook, fix 31 casts across 20+ files

### Batch 2 — PARALLEL OK (zero file overlap: contracts vs frontend components)
- [x] **Phase 3: Contracts Single Source of Truth** — refactor 14+ schemas to `.pick()`, timestamps, inline schemas
- [x] **Phase 7: DataTable Upgrade** — createDataTableColumns, sorting, error states (frontend independent)

### Batch 3 — SEQUENTIAL (domain → ports → use cases dependency chain)
- [x] **Phase 4+5: Domain + Ports/Repos** — athlete-invitation factory, reconstitute fns, required pagination, T|null returns
- [ ] **Phase 6: Use Cases & Procedures** — missing use cases, domain validation, business logic cleanup

### Batch 4 — after all above
- [ ] **Phase 8: Routes & Forms Polish** — thin routes, remove useEffects, form purity, error boundaries

### Completion Log

| Phase | Status | Date | Commit | Notes |
|-------|--------|------|--------|-------|
| 1 | DONE | 2026-02-13 | b20663f | 13 files: org scoping, permissions, ILIKE escape, markAccepted scope |
| 2 | DONE | 2026-02-13 | 6e01742 | 9 files: schema validation, type guards, widened types, removed casts |
| 3 | DONE | 2026-02-13 | 1cc849b | 23 files: .pick() derivation for 14+ schemas, timestampsSchema spread, inline schemas moved to contracts |
| 4+5 | DONE | 2026-02-13 | TBD | 37 files: athlete-invitation Result factory, reconstitute fns for 5 entities, required pagination on all ports, T|null for findById/findByOrgId, MuscleGroup port to core, null-check pattern in 8 use cases |
| 6 | PENDING | - | - | - |
| 7 | DONE | 2026-02-13 | 49e8b56 | 11 files: createDataTableColumns helper, DataTableColumnHeader, error/empty states, fixed double nesting, page reset on filter, removed barrel file |
| 8 | PENDING | - | - | - |

---

## Executive Summary

| Layer | Files | Critical | Warning | Suggestion | Total |
|-------|-------|----------|---------|------------|-------|
| Domain | 24 | 8 | 11 | 9 | 28 |
| Ports | 7 | 8 | 9 | 5 | 22 |
| Repositories | 9 | 12 | 14 | 8 | 34 |
| Use Cases | 48 | 10 | 18 | 10 | 38 |
| Contracts | 32 | 14 | 22 | 11 | 47 |
| Procedures | 38 | 6 | 12 | 6 | 24 |
| Routes | 18 | 2 | 7 | 4 | 13 |
| Forms | 7 | 2 | 4 | 1 | 7 |
| Data Tables | 13 | 9 | 10 | 7 | 26 |
| Cross-cutting | all | 21 | 19 | 15 | 55 |
| **TOTAL** | **213** | **92** | **126** | **76** | **294** |

> Note: Cross-cutting findings overlap with layer-specific findings. Deduplicated unique violations: ~220.

---

## Top 10 Systemic Issues (by impact)

### 1. SECURITY: Exercise repository missing organization scoping
- **Severity:** P0 - Security vulnerability
- **Impact:** 9 files (1 port + 1 repository + 6 use cases + 1 procedure)
- **Risk:** Multi-tenancy bypass — exercises can be created/updated/archived without org scope
- **Reports:** `02-ports.md`, `03-repositories.md`, `04-use-cases.md`

### 2. SECURITY: Workout log permissions using wrong permission types
- **Severity:** P0 - Security vulnerability
- **Impact:** 4 use case files
- **Risk:** `create-log`, `save-log`, `get-log`, `get-log-by-session` check `programs:write/read` instead of `workout_log:*`
- **Report:** `04-use-cases.md`

### 3. Contracts not derived from entity schemas via `.pick()`
- **Severity:** P1 - Architectural violation (single source of truth broken)
- **Impact:** 14+ input schemas across exercises, programs, templates, workout-logs
- **Risk:** Spanish messages duplicated, entity changes don't propagate to inputs
- **Report:** `05-contracts.md`

### 4. `as` type casts in production code (31 instances)
- **Severity:** P1 - CLAUDE.md violation
- **Impact:** 31 instances across 20+ files, 8 of which are the same `params as { orgSlug }` pattern
- **Fix:** Create `useOrgSlug()` hook (eliminates 8 at once), fix remaining individually
- **Report:** `10-cross-cutting.md`

### 5. Procedures calling repositories directly (bypassing use cases)
- **Severity:** P1 - Architecture violation
- **Impact:** 5 procedures (`list-muscle-groups`, `list-plans`, `create-subscription`, `exercise-rows` x2)
- **Risk:** No authorization, no domain validation, Clean Architecture bypassed
- **Report:** `06-procedures.md`

### 6. Sub-entity CRUD bypasses domain validation
- **Severity:** P1 - Domain integrity violation
- **Impact:** 6 use cases (add/update session, week, exercise row)
- **Risk:** Manual object construction without domain factory validation
- **Report:** `04-use-cases.md`

### 7. DataTable skill vs implementation gap
- **Severity:** P2 - Skill/implementation mismatch
- **Impact:** 5 core components + 3 table usages
- **Missing:** `createDataTableColumns`, `DataTableColumnHeader`, sorting, error states, row selection
- **Report:** `09-data-tables.md`

### 8. Domain entities missing `reconstitute` functions
- **Severity:** P2 - Consistency violation
- **Impact:** 5 entities (athlete, athlete-invitation, exercise, plan, subscription)
- **Risk:** Repositories map DB data without domain validation
- **Report:** `01-domain.md`

### 9. Pagination fields optional across all ports
- **Severity:** P2 - Full table scan risk
- **Impact:** 5 ports (athlete, exercise, plan, program, workout-log)
- **Risk:** Callers can omit limit/offset, causing uncontrolled data loading
- **Report:** `02-ports.md`

### 10. Inline Zod schemas in procedures (16 instances)
- **Severity:** P2 - Contracts violation
- **Impact:** 16 schemas across procedure files
- **Fix:** Move to `@strenly/contracts`, create shared `successOutputSchema`
- **Report:** `10-cross-cutting.md`

---

## What's Working Well

- **Zero `!` non-null assertions** across entire codebase
- **Zero CommonJS `require()`** — ESM everywhere
- **Zero `register()` in forms** — all Controller pattern
- **Program aggregate** is the gold standard entity (factory + reconstitute + comprehensive tests)
- **WorkoutLog aggregate** follows the same excellent pattern
- **Authorization first** in most use cases (athletes, programs, exercises)
- **Consistent Field component usage** across all forms
- **Contract-derived schemas** in 5/6 forms
- **Exhaustive error switches** in most procedures
- **Consistent `memberRole` passing** from procedures to use cases

---

## Detailed Reports

| Report | Path |
|--------|------|
| Domain Layer | `.audit/01-domain.md` |
| Ports Layer | `.audit/02-ports.md` |
| Repositories Layer | `.audit/03-repositories.md` |
| Use Cases Layer | `.audit/04-use-cases.md` |
| Contracts Layer | `.audit/05-contracts.md` |
| Procedures Layer | `.audit/06-procedures.md` |
| Routes Layer | `.audit/07-routes.md` |
| Forms Layer | `.audit/08-forms.md` |
| Data Tables Layer | `.audit/09-data-tables.md` |
| Cross-cutting Rules | `.audit/10-cross-cutting.md` |
