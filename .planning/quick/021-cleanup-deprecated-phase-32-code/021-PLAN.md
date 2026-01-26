---
phase: quick
plan: 021
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/components/programs/program-grid.tsx
  - apps/coach-web/src/components/programs/prescription-cell.tsx
  - apps/coach-web/src/components/programs/exercise-picker-cell.tsx
  - packages/database/src/schema/program-exercises.ts
  - packages/database/src/schema/prescriptions.ts
  - packages/contracts/src/programs/program.ts
  - packages/contracts/src/programs/exercise-row.ts
  - packages/backend/src/infrastructure/repositories/program.repository.ts
autonomous: true

must_haves:
  truths:
    - "Old react-datasheet-grid files no longer exist"
    - "Database schema has no deprecated columns"
    - "Contract schemas have no deprecated fields"
    - "TypeScript compiles without errors after cleanup"
  artifacts:
    - path: "packages/database/src/schema/program-exercises.ts"
      provides: "Clean schema without deprecated columns"
      contains: "groupId"
    - path: "packages/database/src/schema/prescriptions.ts"
      provides: "Clean schema without ParsedPrescription"
      contains: "PrescriptionSeriesData"
  key_links:
    - from: "packages/contracts/src/programs/program.ts"
      to: "packages/backend/src/infrastructure/repositories/program.repository.ts"
      via: "Type definitions match"
      pattern: "exerciseRowWithPrescriptionsSchema"
---

<objective>
Clean up deprecated Phase 3.2 code after data migration is complete.

Purpose: Remove technical debt from the codebase - old react-datasheet-grid files, deprecated database columns (supersetGroup, supersetOrder, isSubRow, parentRowId), and the legacy ParsedPrescription interface.

Output: Clean codebase with only the new series-based prescription model and group-based superset structure.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@packages/database/src/schema/program-exercises.ts
@packages/database/src/schema/prescriptions.ts
@packages/contracts/src/programs/program.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Delete old grid files and archive migration script</name>
  <files>
    - apps/coach-web/src/components/programs/program-grid.tsx (DELETE)
    - apps/coach-web/src/components/programs/prescription-cell.tsx (DELETE)
    - apps/coach-web/src/components/programs/exercise-picker-cell.tsx (DELETE)
    - packages/database/src/seed/migrate-to-series.ts (MOVE to archive/)
  </files>
  <action>
    1. Delete the three old grid component files (verified not imported anywhere):
       - apps/coach-web/src/components/programs/program-grid.tsx (~825 lines, old react-datasheet-grid)
       - apps/coach-web/src/components/programs/prescription-cell.tsx (~100 lines, old cell)
       - apps/coach-web/src/components/programs/exercise-picker-cell.tsx (~150 lines, old cell)

    2. Create archive directory and move migration script:
       - mkdir -p packages/database/src/seed/archive
       - mv packages/database/src/seed/migrate-to-series.ts packages/database/src/seed/archive/

    3. Remove @wasback/react-datasheet-grid dependency if no longer used:
       - Check package.json for the dependency
       - If only used by deleted files, remove it
  </action>
  <verify>
    - Files no longer exist: `ls apps/coach-web/src/components/programs/{program-grid,prescription-cell,exercise-picker-cell}.tsx` returns "No such file"
    - Migration script archived: `ls packages/database/src/seed/archive/migrate-to-series.ts` exists
    - pnpm typecheck passes (no broken imports)
  </verify>
  <done>Old grid files deleted, migration script archived, no broken imports</done>
</task>

<task type="auto">
  <name>Task 2: Remove deprecated database schema columns</name>
  <files>
    - packages/database/src/schema/program-exercises.ts
    - packages/database/src/schema/prescriptions.ts
  </files>
  <action>
    1. In program-exercises.ts, remove:
       - `supersetGroup` column (line ~32)
       - `supersetOrder` column (line ~33)
       - `isSubRow` column (line ~41)
       - `parentRowId` column (line ~42)
       - Indexes: `program_exercises_superset_group_idx`, `program_exercises_parent_row_id_idx` (lines ~59-60)
       - Relation: `parentRow` self-reference (lines ~81-85)
       - Update comments to remove "DEPRECATED" sections

    2. In prescriptions.ts, remove:
       - `ParsedPrescription` interface (lines 26-37) - entire interface block
       - `prescription` column (line ~79) - the old JSONB column
       - Update comments to remove "DEPRECATED" and "Legacy" notes
       - Make `series` column NOT NULL (it was nullable during migration)

    3. Run `pnpm db:push` to apply schema changes (this will warn about column drops - OK since data migrated)
  </action>
  <verify>
    - `pnpm db:push` completes without errors
    - `pnpm typecheck` in packages/database passes
    - Grep for "supersetGroup" in schema files returns no results
    - Grep for "ParsedPrescription" in schema files returns no results
  </verify>
  <done>Database schema has only the new series-based model with group-based superset structure</done>
</task>

<task type="auto">
  <name>Task 3: Update contracts and repository to remove deprecated fields</name>
  <files>
    - packages/contracts/src/programs/program.ts
    - packages/contracts/src/programs/exercise-row.ts
    - packages/contracts/src/programs/index.ts
    - packages/backend/src/infrastructure/repositories/program.repository.ts
    - packages/backend/src/use-cases/programs/*.ts (multiple files)
    - packages/backend/src/procedures/programs/*.ts (multiple files)
  </files>
  <action>
    1. In packages/contracts/src/programs/program.ts:
       - Remove `supersetGroup`, `supersetOrder`, `isSubRow`, `parentRowId` from `baseExerciseRowSchema` (lines ~114-119)
       - Remove the `subRows` field from `exerciseRowWithPrescriptionsSchema` (sessions don't use sub-rows anymore)
       - Remove `prescription` field from `prescriptionWithSeriesSchema` (line ~94, keep only `series`)
       - Remove comments about "Legacy" and "backward compatibility"

    2. In packages/contracts/src/programs/exercise-row.ts:
       - Remove any references to `supersetGroup`, `supersetOrder`, `isSubRow`, `parentRowId`

    3. In packages/contracts/src/programs/index.ts:
       - Ensure no deprecated types are exported

    4. In packages/backend/src/infrastructure/repositories/program.repository.ts:
       - Remove mapping of deprecated fields in `mapExerciseRowToDomain()` and similar functions
       - Remove any SELECT of deprecated columns

    5. In use-cases and procedures:
       - Run `pnpm typecheck` to find all remaining references
       - Fix each file that references deprecated fields
       - For toggle-superset.ts, add-split-row.ts: These may need significant updates or removal if they relied on old model

    6. Run full validation: `pnpm typecheck && pnpm lint`
  </action>
  <verify>
    - `pnpm typecheck` passes across all packages
    - `pnpm lint` passes
    - Grep for "supersetGroup|supersetOrder|isSubRow|parentRowId" in packages/ returns only archive/
  </verify>
  <done>All contracts and backend code use only the new series-based model with exercise groups</done>
</task>

</tasks>

<verification>
After all tasks complete:

1. Full build verification:
   ```bash
   pnpm typecheck && pnpm lint && pnpm test
   ```

2. Database schema verification:
   ```bash
   pnpm db:push  # Should show no pending changes
   ```

3. Search for any remaining deprecated references:
   ```bash
   grep -r "supersetGroup\|supersetOrder\|isSubRow\|parentRowId\|ParsedPrescription" packages/ --include="*.ts" | grep -v archive/
   ```
   Should return no results (excluding archive folder).

4. Manual smoke test:
   - Start dev server: `pnpm dev:coach`
   - Open a program in the grid view
   - Verify prescriptions display correctly
   - Verify supersets (exercise groups) work correctly
</verification>

<success_criteria>
- All deprecated files deleted (3 old grid components)
- Migration script archived
- Database schema has no deprecated columns (supersetGroup, supersetOrder, isSubRow, parentRowId, prescription)
- Contracts have no deprecated fields
- TypeScript compiles without errors
- All tests pass
- Grep for deprecated terms returns no results (outside archive/)
</success_criteria>

<output>
After completion, create `.planning/quick/021-cleanup-deprecated-phase-32-code/021-SUMMARY.md`
</output>
