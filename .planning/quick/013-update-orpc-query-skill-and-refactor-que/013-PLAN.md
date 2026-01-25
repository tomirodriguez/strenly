---
phase: quick
plan: 013
type: execute
wave: 1
depends_on: []
files_modified:
  - .claude/skills/orpc-query/SKILL.md
  - apps/coach-web/CLAUDE.md
  - apps/coach-web/src/features/athletes/hooks/queries/use-athletes.ts
  - apps/coach-web/src/features/athletes/hooks/queries/use-athlete-invitation.ts
  - apps/coach-web/src/features/athletes/hooks/mutations/use-archive-athlete.ts
  - apps/coach-web/src/features/athletes/hooks/mutations/use-create-athlete.ts
  - apps/coach-web/src/features/athletes/hooks/mutations/use-update-athlete.ts
  - apps/coach-web/src/features/athletes/hooks/mutations/use-generate-invitation.ts
  - apps/coach-web/src/features/athletes/components/invitation-modal.tsx
autonomous: true

must_haves:
  truths:
    - "Query invalidations use oRPC's official key() method"
    - "No custom query key factories exist in codebase"
    - "Skill documentation matches oRPC official patterns"
  artifacts:
    - path: ".claude/skills/orpc-query/SKILL.md"
      provides: "Updated skill with official oRPC key patterns"
      contains: "orpc.athletes.key()"
    - path: "apps/coach-web/src/features/athletes/hooks/mutations/use-create-athlete.ts"
      provides: "Mutation hook using official invalidation pattern"
      contains: "orpc.athletes.key()"
  key_links:
    - from: "mutation hooks"
      to: "orpc client"
      via: "orpc.{procedure}.key()"
      pattern: "orpc\\.athletes\\.key\\(\\)"
---

<objective>
Update orpc-query skill to use oRPC's official query key pattern and refactor all query invalidations in coach-web to use the new pattern.

Purpose: Replace custom query key factories with oRPC's built-in `.key()` method for type-safe, consistent cache invalidation.
Output: Updated skill documentation and refactored mutation hooks.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.claude/skills/orpc-query/SKILL.md
@apps/coach-web/CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update orpc-query skill with official key patterns</name>
  <files>
    .claude/skills/orpc-query/SKILL.md
    apps/coach-web/CLAUDE.md
  </files>
  <action>
Update `.claude/skills/orpc-query/SKILL.md`:

1. **Replace `<query_key_factories>` section entirely** with new `<query_keys>` section documenting oRPC's official methods:
   - `.key()` - Partial matching for invalidation (use in `invalidateQueries`)
   - `.queryKey({ input })` - Full matching for specific query (use in `setQueryData`, `getQueryData`)
   - `.mutationKey()` - For mutation key matching
   - `.infiniteKey()` - For infinite query key matching

2. **Update `<mutations>` section** to show correct invalidation pattern:
   ```typescript
   // WRONG: Custom key factory
   queryClient.invalidateQueries({ queryKey: athleteKeys.all })

   // CORRECT: oRPC official pattern
   queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })

   // Invalidate specific query with input
   queryClient.invalidateQueries({ queryKey: orpc.athletes.get.key({ input: { athleteId } }) })
   ```

3. **Update `<success_criteria>` table** to reflect new patterns.

4. **Add to `<anti_patterns>`** section:
   ```typescript
   // WRONG: Custom query key factory
   export const athleteKeys = {
     all: ['athletes'] as const,
     detail: (id: string) => [...athleteKeys.all, id] as const,
   }

   // CORRECT: Use oRPC's built-in key methods
   orpc.athletes.key()                           // All athlete queries
   orpc.athletes.get.key({ input: { athleteId } }) // Specific get query
   ```

5. **Update `apps/coach-web/CLAUDE.md`** API Hooks Pattern example to use `orpc.athletes.key()` instead of `['athletes']`.
  </action>
  <verify>
Read updated skill file and verify:
- No mention of custom query key factories as recommended pattern
- `.key()` method is documented as primary invalidation approach
- Examples show `orpc.{procedure}.key()` pattern
  </verify>
  <done>
Skill documentation teaches oRPC's official key pattern. Custom key factories documented as anti-pattern.
  </done>
</task>

<task type="auto">
  <name>Task 2: Refactor all query invalidations to use oRPC key pattern</name>
  <files>
    apps/coach-web/src/features/athletes/hooks/queries/use-athletes.ts
    apps/coach-web/src/features/athletes/hooks/queries/use-athlete-invitation.ts
    apps/coach-web/src/features/athletes/hooks/mutations/use-archive-athlete.ts
    apps/coach-web/src/features/athletes/hooks/mutations/use-create-athlete.ts
    apps/coach-web/src/features/athletes/hooks/mutations/use-update-athlete.ts
    apps/coach-web/src/features/athletes/hooks/mutations/use-generate-invitation.ts
    apps/coach-web/src/features/athletes/components/invitation-modal.tsx
  </files>
  <action>
**Query files - remove key factories:**

1. `use-athletes.ts`:
   - Remove `athleteKeys` constant entirely
   - Keep only `useAthletes` function unchanged

2. `use-athlete-invitation.ts`:
   - Remove `invitationKeys` constant
   - Remove `queryKey: invitationKeys.detail(athleteId ?? '')` override from `useQuery`
   - Let oRPC handle the query key automatically via `queryOptions`

**Mutation files - update invalidations:**

3. `use-archive-athlete.ts`:
   - Remove `import { athleteKeys } from '../queries/use-athletes'`
   - Change `queryClient.invalidateQueries({ queryKey: athleteKeys.all })` to:
     `queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })`

4. `use-create-athlete.ts`:
   - Remove `athleteKeys` import
   - Change invalidation to `orpc.athletes.key()`

5. `use-update-athlete.ts`:
   - Remove `athleteKeys` import
   - Change list invalidation to `orpc.athletes.key()`
   - Change detail invalidation to `orpc.athletes.get.key({ input: { athleteId: data.id } })`
     (assuming there's a `get` procedure; if not, just use `orpc.athletes.key()`)

6. `use-generate-invitation.ts`:
   - Remove `athleteKeys` import
   - Change invalidation to `orpc.athletes.key()`

7. `invitation-modal.tsx`:
   - Remove `invitationKeys` import from `use-athlete-invitation`
   - Change invalidation to `orpc.athletes.getInvitation.key({ input: { athleteId: athlete.id } })`
   - Import `orpc` from `@/lib/api-client`
  </action>
  <verify>
Run the following to ensure no regressions:
```bash
pnpm typecheck
pnpm lint
```
Grep for old patterns to ensure removal:
```bash
grep -r "athleteKeys\|invitationKeys" apps/coach-web/src/
```
Should return no results.
  </verify>
  <done>
All query invalidations use `orpc.{procedure}.key()` pattern. No custom key factories remain. TypeScript and lint checks pass.
  </done>
</task>

</tasks>

<verification>
```bash
# No custom key factories remain
grep -r "athleteKeys\|invitationKeys" apps/coach-web/src/
# Should output nothing

# All invalidations use orpc.*.key()
grep -r "orpc\.\w\+\.key()" apps/coach-web/src/
# Should show all mutation files

# TypeScript compiles
pnpm typecheck

# Lint passes
pnpm lint
```
</verification>

<success_criteria>
- [ ] Skill `/orpc-query` documents oRPC's official `.key()` pattern
- [ ] Custom query key factories marked as anti-pattern in skill
- [ ] All mutation hooks use `orpc.{procedure}.key()` for invalidation
- [ ] No `athleteKeys` or `invitationKeys` constants exist
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
</success_criteria>

<output>
After completion, create `.planning/quick/013-update-orpc-query-skill-and-refactor-que/013-SUMMARY.md`
</output>
