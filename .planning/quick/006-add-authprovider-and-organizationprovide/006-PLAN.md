---
phase: quick
plan: 006
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/contexts/auth-context.tsx
  - apps/coach-web/src/contexts/organization-context.tsx
  - apps/coach-web/src/routes/_authenticated.tsx
  - apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
  - apps/coach-web/src/features/dashboard/views/dashboard-view.tsx
  - apps/coach-web/src/features/auth/views/onboarding-view.tsx
autonomous: true
must_haves:
  truths:
    - "Session data is fetched once in _authenticated beforeLoad and cached in AuthContext"
    - "Organization data is fetched once in $orgSlug beforeLoad and cached in OrganizationContext"
    - "Components use useAuth() and useOrganization() instead of Better-Auth hooks"
    - "No redundant API calls on route changes within the SPA"
  artifacts:
    - path: "apps/coach-web/src/contexts/auth-context.tsx"
      provides: "AuthProvider and useAuth hook"
      exports: ["AuthProvider", "useAuth"]
    - path: "apps/coach-web/src/contexts/organization-context.tsx"
      provides: "OrganizationProvider and useOrganization hook"
      exports: ["OrganizationProvider", "useOrganization"]
  key_links:
    - from: "apps/coach-web/src/routes/_authenticated.tsx"
      to: "apps/coach-web/src/contexts/auth-context.tsx"
      via: "AuthProvider wrapping Outlet"
      pattern: "<AuthProvider"
    - from: "apps/coach-web/src/routes/_authenticated/$orgSlug.tsx"
      to: "apps/coach-web/src/contexts/organization-context.tsx"
      via: "OrganizationProvider wrapping Outlet"
      pattern: "<OrganizationProvider"
---

<objective>
Add AuthProvider and OrganizationProvider to cache session and org data in React Context, eliminating redundant API calls on SPA navigation.

Purpose: Currently, session and org data are fetched multiple times - once in `beforeLoad` for validation, and again via Better-Auth hooks in components. This causes performance issues. By caching the data fetched in `beforeLoad` into React Context, components can read cached data instantly.

Output: Two context providers (AuthProvider, OrganizationProvider) and updated routes/components using them.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/coach-web/src/routes/__root.tsx
@apps/coach-web/src/routes/_authenticated.tsx
@apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
@apps/coach-web/src/lib/auth-client.ts
@apps/coach-web/src/features/dashboard/views/dashboard-view.tsx
@apps/coach-web/src/features/auth/views/onboarding-view.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create AuthContext and OrganizationContext providers</name>
  <files>
    apps/coach-web/src/contexts/auth-context.tsx
    apps/coach-web/src/contexts/organization-context.tsx
  </files>
  <action>
Create two React Context providers:

**auth-context.tsx:**
- Define `AuthContextValue` type with `user`, `session` properties matching `authClient.getSession()` return type
- Create `AuthContext` with `createContext<AuthContextValue | null>(null)`
- Create `AuthProvider` component that accepts `value: AuthContextValue` prop and provides it via context
- Create `useAuth()` hook that throws if used outside provider (ensures type safety)
- Export: `AuthProvider`, `useAuth`, `AuthContextValue` type

**organization-context.tsx:**
- Define `OrganizationContextValue` type matching the org object from `authClient.organization.list()` (id, name, slug, metadata with type/status)
- Create `OrganizationContext` with `createContext<OrganizationContextValue | null>(null)`
- Create `OrganizationProvider` component that accepts `value: OrganizationContextValue` prop
- Create `useOrganization()` hook that throws if used outside provider
- Export: `OrganizationProvider`, `useOrganization`, `OrganizationContextValue` type

**Type definitions:**
```typescript
// auth-context.tsx
type AuthContextValue = {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  session: {
    id: string
    expiresAt: Date
  }
}

// organization-context.tsx
type OrganizationContextValue = {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: {
    type?: string
    status?: string
  } | null
}
```
  </action>
  <verify>
Files exist and export correct types:
```bash
grep -q "export function AuthProvider" apps/coach-web/src/contexts/auth-context.tsx
grep -q "export function useAuth" apps/coach-web/src/contexts/auth-context.tsx
grep -q "export function OrganizationProvider" apps/coach-web/src/contexts/organization-context.tsx
grep -q "export function useOrganization" apps/coach-web/src/contexts/organization-context.tsx
```
  </verify>
  <done>
Both context files exist with Provider components and hooks exported. Types are properly defined.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire providers into route layouts and update components</name>
  <files>
    apps/coach-web/src/routes/_authenticated.tsx
    apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
    apps/coach-web/src/features/dashboard/views/dashboard-view.tsx
    apps/coach-web/src/features/auth/views/onboarding-view.tsx
  </files>
  <action>
**_authenticated.tsx:**
- Import `AuthProvider` from `@/contexts/auth-context`
- In `AuthenticatedLayout`, wrap `<AppShell>` with `<AuthProvider value={authData}>`
- The `authData` from `beforeLoad` is already the right shape (user + session)

**$orgSlug.tsx:**
- Import `OrganizationProvider` from `@/contexts/organization-context`
- In `OrgSlugLayout`, get `org` from route context via `Route.useRouteContext()`
- Wrap `<Outlet />` with `<OrganizationProvider value={org}>`
- The `org` returned from `beforeLoad` already has id, name, slug, metadata

**dashboard-view.tsx:**
- Replace `import { useActiveOrganization } from '@/lib/auth-client'`
- With `import { useOrganization } from '@/contexts/organization-context'`
- Replace `const { data: org } = useActiveOrganization()` with `const org = useOrganization()`
- Update usage: `org?.name` becomes `org.name` (no longer optional since provider guarantees it)

**onboarding-view.tsx:**
- Replace `import { authClient, useSession } from '@/lib/auth-client'`
- With `import { authClient } from '@/lib/auth-client'` and `import { useAuth } from '@/contexts/auth-context'`
- Replace `const { data: session } = useSession()` with `const { user } = useAuth()`
- Update usage: `session?.user?.name` becomes `user.name`

Note: Onboarding is outside $orgSlug so it only has AuthProvider. It needs useAuth not useOrganization.
  </action>
  <verify>
```bash
pnpm typecheck
pnpm lint
```
Both commands pass with no errors.
  </verify>
  <done>
- AuthProvider wraps authenticated layout
- OrganizationProvider wraps $orgSlug layout
- dashboard-view uses useOrganization() from context
- onboarding-view uses useAuth() from context
- No Better-Auth hooks (useSession, useActiveOrganization) used in components
- Typecheck and lint pass
  </done>
</task>

</tasks>

<verification>
1. `pnpm typecheck` passes
2. `pnpm lint` passes
3. Manual test:
   - Login and navigate to dashboard - should show org name without delay
   - Navigate between routes in $orgSlug - no network requests for session/org
   - Check Network tab - only one session/org fetch on initial load
</verification>

<success_criteria>
- Session data cached in AuthProvider, available via useAuth()
- Organization data cached in OrganizationProvider, available via useOrganization()
- Components read from context instead of making API calls
- Type safety maintained (hooks throw if used outside provider)
- No regressions in auth flow or org switching
</success_criteria>

<output>
After completion, create `.planning/quick/006-add-authprovider-and-organizationprovide/006-SUMMARY.md`
</output>
