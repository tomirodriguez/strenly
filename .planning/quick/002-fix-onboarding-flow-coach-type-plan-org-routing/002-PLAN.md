---
type: quick
plan: 002
title: "Fix Onboarding Flow - Coach Type, Plan Selection, Org Routing"
autonomous: true
files_modified:
  # Backend - Subscription Creation
  - packages/backend/src/use-cases/subscriptions/create-subscription.ts
  - packages/backend/src/procedures/subscriptions/create-subscription.ts
  - packages/backend/src/procedures/subscriptions/index.ts
  - packages/backend/src/procedures/router.ts
  - packages/contracts/src/subscriptions/index.ts
  # Frontend - Onboarding Flow
  - apps/coach-web/src/features/auth/views/onboarding-view.tsx
  - apps/coach-web/src/features/auth/components/coach-type-step.tsx
  - apps/coach-web/src/features/auth/components/plan-selection-step.tsx
  - apps/coach-web/src/features/auth/components/org-form-step.tsx
  # Frontend - Org Slug Routing
  - apps/coach-web/src/routes/_authenticated.tsx
  - apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
  - apps/coach-web/src/routes/_authenticated/$orgSlug/dashboard.tsx
  - apps/coach-web/src/routes/_authenticated/$orgSlug/athletes.tsx
  - apps/coach-web/src/routes/_authenticated/$orgSlug/exercises.tsx
must_haves:
  truths:
    - "User sees coach type selection (solo vs gym) after signup"
    - "User must select a subscription plan before accessing platform"
    - "User creates organization after selecting plan"
    - "Onboarding creates org + subscription atomically"
    - "All authenticated routes use /:orgSlug/* pattern"
    - "API requests include X-Organization-Slug header from URL param"
  artifacts:
    - path: "packages/backend/src/procedures/subscriptions/create-subscription.ts"
      provides: "Create subscription procedure for onboarding"
    - path: "apps/coach-web/src/features/auth/components/coach-type-step.tsx"
      provides: "Step 1: Coach type selection UI"
    - path: "apps/coach-web/src/features/auth/components/plan-selection-step.tsx"
      provides: "Step 2: Plan selection with mock payment"
    - path: "apps/coach-web/src/routes/_authenticated/$orgSlug.tsx"
      provides: "Dynamic org slug route layout"
  key_links:
    - from: "onboarding-view.tsx"
      to: "subscriptions.createSubscription"
      via: "orpc mutation after org creation"
    - from: "$orgSlug.tsx"
      to: "api-client.ts setCurrentOrgSlug"
      via: "useEffect syncing URL param to API header"
---

<objective>
Fix the user onboarding flow to implement the correct journey: signup -> coach type selection -> mandatory plan selection -> organization setup -> dashboard. Also restructure routes to use URL-based organization routing (`/:orgSlug/*`).

Purpose: Users cannot access the platform without a valid subscription. The org slug in URL enables direct linking and multi-org support.
Output: Complete multi-step onboarding with subscription creation, URL-based org routing for all authenticated pages.
</objective>

<context>
@.planning/PROJECT.md
@packages/contracts/src/subscriptions/plan.ts
@packages/contracts/src/subscriptions/subscription.ts
@apps/coach-web/src/lib/api-client.ts
@apps/coach-web/src/lib/auth-client.ts
@apps/coach-web/src/features/auth/views/onboarding-view.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create subscription procedure for onboarding</name>
  <skills>/procedure, /use-case</skills>
  <files>
    packages/contracts/src/subscriptions/index.ts
    packages/backend/src/use-cases/subscriptions/create-subscription.ts
    packages/backend/src/infrastructure/repositories/subscription.repository.ts
    packages/backend/src/procedures/subscriptions/create-subscription.ts
    packages/backend/src/procedures/subscriptions/index.ts
  </files>
  <action>
1. Add `createSubscriptionInputSchema` to contracts:
```typescript
export const createSubscriptionInputSchema = z.object({
  organizationId: z.string(),
  planId: z.string(),
})
```

2. Add `create` method to subscription repository:
```typescript
create(subscription: Subscription): ResultAsync<Subscription, SubscriptionRepositoryError>
```
Insert into subscriptions table with:
- id: generate UUID
- organizationId, planId from input
- status: 'active'
- athleteCount: 0
- currentPeriodStart: now
- currentPeriodEnd: now + 30 days

3. Create use case `create-subscription.ts`:
- No authorization needed (called during onboarding, user creating their own org)
- Validate planId exists using planRepository.findById
- Create subscription via repository
- Return created subscription

4. Create procedure `create-subscription.ts`:
- Use `authedProcedure` (user must be logged in but no org context yet)
- Input: createSubscriptionInputSchema
- Output: subscriptionSchema
- Call use case, map errors

5. Add to subscriptions router in index.ts
  </action>
  <verify>
Run `pnpm typecheck` - no errors
Grep for createSubscription in procedures/subscriptions/index.ts confirms export
  </verify>
  <done>
Backend can create subscriptions for new organizations during onboarding
  </done>
</task>

<task type="auto">
  <name>Task 2: Build multi-step onboarding wizard</name>
  <skills>/form</skills>
  <files>
    apps/coach-web/src/features/auth/components/coach-type-step.tsx
    apps/coach-web/src/features/auth/components/plan-selection-step.tsx
    apps/coach-web/src/features/auth/components/org-form-step.tsx
    apps/coach-web/src/features/auth/views/onboarding-view.tsx
  </files>
  <action>
1. Create `coach-type-step.tsx`:
- Two large cards: "Coach Individual" vs "Gym / Equipo"
- On select, call onNext(type: 'coach_solo' | 'gym')
- Use icons (User for solo, Users for gym)
- Spanish text matching existing app language

2. Create `plan-selection-step.tsx`:
- Fetch plans using `orpc.subscriptions.listPlans.queryOptions({ input: { organizationType } })`
- Display plan cards with: name, price, features, athleteLimit
- Highlight recommended plan
- "Seleccionar" button on each card
- Mock payment: just select plan, no actual payment integration
- On select, call onNext(planId: string)

3. Create `org-form-step.tsx`:
- Reuse existing OrgForm component structure
- Add slug auto-generation from name (kebab-case, remove special chars)
- On submit, call onNext({ name, slug })

4. Refactor `onboarding-view.tsx`:
- State machine with steps: 'coach-type' | 'plan' | 'org' | 'submitting'
- Store: coachType, planId, orgName, orgSlug
- On final submit:
  a. Create org via authClient.organization.create({ name, slug, metadata: { type: coachType } })
  b. Create subscription via orpc mutation (organizationId, planId)
  c. Set active org
  d. Navigate to `/${slug}/dashboard`
- Show step indicator (1/3, 2/3, 3/3)
- Allow going back to previous steps
  </action>
  <verify>
Run `pnpm dev:coach`
Navigate to /onboarding
Complete all 3 steps - should create org + subscription and redirect
  </verify>
  <done>
Users can complete full onboarding flow: type selection -> plan selection -> org creation
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement URL-based org slug routing</name>
  <skills>/orpc-query</skills>
  <files>
    apps/coach-web/src/routes/_authenticated.tsx
    apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
    apps/coach-web/src/routes/_authenticated/$orgSlug/dashboard.tsx
    apps/coach-web/src/routes/_authenticated/$orgSlug/athletes.tsx
    apps/coach-web/src/routes/_authenticated/$orgSlug/exercises.tsx
    apps/coach-web/src/routes/index.tsx
  </files>
  <action>
1. Create `$orgSlug.tsx` layout route:
```typescript
export const Route = createFileRoute('/_authenticated/$orgSlug')({
  beforeLoad: async ({ params }) => {
    // Validate org slug belongs to user
    const orgs = await authClient.organization.list()
    const org = orgs.data?.find(o => o.slug === params.orgSlug)
    if (!org) {
      throw redirect({ to: '/onboarding' })
    }
    // Set active org if different
    const activeOrg = await authClient.organization.getActive()
    if (activeOrg.data?.slug !== params.orgSlug) {
      await authClient.organization.setActive({ organizationId: org.id })
    }
    return { org }
  },
  component: OrgSlugLayout,
})

function OrgSlugLayout() {
  const { orgSlug } = Route.useParams()

  // Sync URL org slug with API client
  useEffect(() => {
    setCurrentOrgSlug(orgSlug)
    return () => setCurrentOrgSlug(null)
  }, [orgSlug])

  return <Outlet />
}
```

2. Move existing routes under $orgSlug:
- `_authenticated/dashboard.tsx` -> `_authenticated/$orgSlug/dashboard.tsx`
- `_authenticated/athletes.tsx` -> `_authenticated/$orgSlug/athletes.tsx`
- `_authenticated/exercises.tsx` -> `_authenticated/$orgSlug/exercises.tsx`
- Update imports and file route paths

3. Update `_authenticated.tsx`:
- Remove org slug sync from useEffect (moved to $orgSlug layout)
- Keep auth check only

4. Update `index.tsx` (root redirect):
- If user has orgs, redirect to `/${firstOrg.slug}/dashboard`
- If no orgs, redirect to `/onboarding`

5. Update all navigation links:
- Use relative paths or include orgSlug param
- Example: `to="/$orgSlug/athletes"` with `params: { orgSlug }`
  </action>
  <verify>
Run `pnpm dev:coach`
Navigate to /my-org-slug/dashboard - should load dashboard
Navigate to /my-org-slug/athletes - should load athletes
Check Network tab - API requests should include X-Organization-Slug header matching URL
  </verify>
  <done>
All authenticated routes use /:orgSlug/* pattern, org context comes from URL
  </done>
</task>

</tasks>

<verification>
1. Run `pnpm typecheck && pnpm lint` - passes
2. Complete onboarding flow creates org + subscription
3. Redirect after onboarding goes to correct org-prefixed URL
4. All authenticated pages accessible via /:orgSlug/* pattern
5. API requests include correct X-Organization-Slug header from URL param
6. Invalid org slugs redirect to /onboarding or 404
</verification>

<success_criteria>
- User journey: signup -> coach type -> plan selection -> org creation -> /slug/dashboard
- Subscription created during onboarding with selected plan
- All routes under `/_authenticated/$orgSlug/*`
- X-Organization-Slug header derived from URL param, not cookies
- typecheck and lint pass
</success_criteria>

<output>
After completion, create `.planning/quick/002-fix-onboarding-flow-coach-type-plan-org-routing/002-SUMMARY.md`
</output>
