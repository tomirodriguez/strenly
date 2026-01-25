---
phase: quick
plan: 015
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/backend/src/infrastructure/repositories/athlete.repository.ts
autonomous: true

must_haves:
  truths:
    - "Athletes table shows most recently updated athletes first"
    - "Newly edited athletes appear at the top of the list"
  artifacts:
    - path: "packages/backend/src/infrastructure/repositories/athlete.repository.ts"
      provides: "Athletes ordered by updatedAt descending"
      contains: "desc(athletes.updatedAt)"
  key_links:
    - from: "athlete.repository.ts"
      to: "findAll query"
      via: "orderBy clause"
      pattern: "orderBy.*desc.*updatedAt"
---

<objective>
Change the default sort order of the athletes table to show most recently updated athletes first.

Purpose: Coaches typically want to see athletes they've recently worked with at the top of the list, making it easier to continue managing their most active athletes.
Output: Athletes list sorted by updatedAt descending instead of by name.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@packages/backend/src/infrastructure/repositories/athlete.repository.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Change athletes orderBy to updatedAt descending</name>
  <files>packages/backend/src/infrastructure/repositories/athlete.repository.ts</files>
  <action>
    In the `findAll` method of the athlete repository:

    1. Add `desc` to the drizzle-orm imports (line 13): `import { and, count, desc, eq, ilike } from 'drizzle-orm'`

    2. Change line 140 from:
       `query.orderBy(athletes.name)`
       to:
       `query.orderBy(desc(athletes.updatedAt))`

    This ensures most recently updated athletes appear first in the list.
  </action>
  <verify>
    Run `pnpm typecheck` to ensure no type errors.
    Run `pnpm lint` to ensure code style compliance.
  </verify>
  <done>
    Athletes repository returns results ordered by updatedAt descending. When a coach views the athletes table, recently updated athletes appear at the top.
  </done>
</task>

</tasks>

<verification>
1. `pnpm typecheck` passes
2. `pnpm lint` passes
3. Manual verification: After editing an athlete, that athlete should appear at the top of the list on page refresh
</verification>

<success_criteria>
- Athletes table displays athletes ordered by most recently updated first
- No type errors or lint issues
</success_criteria>

<output>
After completion, create `.planning/quick/015-change-athletes-table-default-sort-to-up/015-SUMMARY.md`
</output>
