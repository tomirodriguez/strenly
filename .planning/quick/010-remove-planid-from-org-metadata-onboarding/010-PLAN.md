---
phase: quick-010
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/auth/src/auth.ts
autonomous: true

must_haves:
  truths:
    - "afterCreateOrganization hook does not reference planId"
    - "No error logged when organization is created without planId in metadata"
    - "Subscription creation is fully handled by oRPC createSubscription procedure"
  artifacts:
    - path: "packages/auth/src/auth.ts"
      provides: "Clean afterCreateOrganization hook without dead code"
  key_links:
    - from: "apps/coach-web/src/routes/onboarding/_layout/index.tsx"
      to: "packages/backend/src/use-cases/subscriptions/create-subscription.ts"
      via: "createSubscriptionMutation after org creation"
      pattern: "createSubscriptionMutation.mutate"
---

<objective>
Remove dead subscription creation logic from Better-Auth afterCreateOrganization hook.

Purpose: The hook currently looks for `planId` in organization metadata and logs an error when not found. This is dead code since the frontend creates subscriptions via oRPC after org creation. The hook should be simplified to only handle org creation concerns.

Output: Clean auth.ts without dead code or misleading error logs.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@packages/auth/src/auth.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove planId subscription logic from afterCreateOrganization hook</name>
  <files>packages/auth/src/auth.ts</files>
  <action>
    Remove the subscription creation logic from the `afterCreateOrganization` hook (lines 96-124):

    1. Remove the metadata type assertion and planId extraction (lines 97-99)
    2. Remove the early return when planId is missing (lines 101-104)
    3. Remove the plan lookup query (lines 106-112)
    4. Remove the subscription insert (lines 114-123)
    5. Remove the unused imports: `eq`, `plans`, `subscriptions` from the import statements

    The hook should become an empty function or be removed entirely if Better-Auth allows it.
    If the hook must remain, leave it as:
    ```typescript
    afterCreateOrganization: async () => {
      // Subscription creation handled by oRPC createSubscription procedure
    },
    ```

    WHY: This code is dead - the frontend creates orgs without planId in metadata and creates subscriptions via oRPC. The current code just logs errors and returns early.
  </action>
  <verify>
    1. `pnpm typecheck` passes (no type errors from removed imports)
    2. `pnpm lint` passes
    3. Grep confirms no planId reference in auth.ts: `grep -n "planId" packages/auth/src/auth.ts` returns empty
  </verify>
  <done>
    - afterCreateOrganization hook contains no subscription logic
    - No planId reference in auth.ts
    - Unused imports removed
    - Type checking passes
  </done>
</task>

</tasks>

<verification>
1. `pnpm typecheck` - No type errors
2. `pnpm lint` - No lint errors
3. `grep -r "planId" packages/auth/` - No references to planId in auth package
</verification>

<success_criteria>
- packages/auth/src/auth.ts has no subscription creation logic
- No planId or plans/subscriptions imports in auth.ts
- Build passes without errors
</success_criteria>

<output>
After completion, create `.planning/quick/010-remove-planid-from-org-metadata-onboarding/010-SUMMARY.md`
</output>
