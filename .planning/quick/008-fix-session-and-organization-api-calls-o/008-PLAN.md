---
phase: quick
plan: 008
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/routes/_authenticated.tsx
  - apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
autonomous: true

must_haves:
  truths:
    - "Navigation between pages within the same org is instant (no API delay)"
    - "No setActive() calls ever - org context comes from URL slug"
    - "Session and org list cached to avoid repeated API calls"
    - "X-Organization-Slug header correctly set via setCurrentOrgSlug()"
  artifacts:
    - path: "apps/coach-web/src/routes/_authenticated.tsx"
      provides: "Cached session + org list"
    - path: "apps/coach-web/src/routes/_authenticated/$orgSlug.tsx"
      provides: "Org validation from cached data, no API calls"
  key_links:
    - from: "_authenticated.tsx beforeLoad"
      to: "AuthProvider + organizations in context"
      via: "session and org list from route context"
    - from: "$orgSlug.tsx beforeLoad"
      to: "parent route context"
      via: "organizations already fetched by parent"
---

<objective>
Fix ~2 second delays on sidebar navigation caused by redundant API calls.

**Key insight from user:** We NEVER need to call `authClient.organization.setActive()`. The organization context comes from the URL slug - we just need to set the `X-Organization-Slug` header via `setCurrentOrgSlug()`.

Current problem (on every navigation):
- `GET /api/auth/get-session` (396ms) - redundant
- `GET /api/auth/organization/list` (724ms) - redundant
- `POST /api/auth/organization/set-active` (905ms) - COMPLETELY UNNECESSARY

Output: Instant navigation - session + org list fetched once, setActive() eliminated entirely.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@apps/coach-web/src/routes/_authenticated.tsx
@apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
@apps/coach-web/src/lib/auth-client.ts
@apps/coach-web/src/lib/api-client.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Move org list fetch to _authenticated.tsx and cache session + orgs</name>
  <files>apps/coach-web/src/routes/_authenticated.tsx</files>
  <action>
Update _authenticated.tsx to fetch and cache both session and organization list:

1. **Add caching for session + orgs** at module level:
```typescript
// Cache to avoid redundant API calls on navigation
let authCache: {
  session: typeof sessionData.data
  organizations: Organization[]
  timestamp: number
} | null = null
const CACHE_TTL = 30000 // 30 seconds

function getCachedAuth() {
  if (authCache && Date.now() - authCache.timestamp < CACHE_TTL) {
    return authCache
  }
  return null
}
```

2. **Update beforeLoad** to fetch orgs and use cache:
```typescript
beforeLoad: async () => {
  const cached = getCachedAuth()
  if (cached?.session) {
    return { authData: cached.session, organizations: cached.organizations }
  }

  const sessionData = await authClient.getSession()
  if (!sessionData.data) {
    throw redirect({ to: '/login' })
  }

  const orgsResult = await authClient.organization.list()
  const organizations = orgsResult.data ?? []

  authCache = {
    session: sessionData.data,
    organizations,
    timestamp: Date.now(),
  }

  return { authData: sessionData.data, organizations }
}
```

3. **Export cache invalidation** for use on logout:
```typescript
export function clearAuthCache() {
  authCache = null
}
```

This moves the org list fetch to the parent layout so child routes don't need to fetch it.
  </action>
  <verify>
Check that _authenticated.tsx compiles and returns both authData and organizations.
  </verify>
  <done>Session + org list fetched once and cached in _authenticated.tsx</done>
</task>

<task type="auto">
  <name>Task 2: Simplify $orgSlug.tsx - use parent's cached org list, REMOVE setActive()</name>
  <files>apps/coach-web/src/routes/_authenticated/$orgSlug.tsx</files>
  <action>
Completely refactor $orgSlug.tsx to use parent route's cached data:

1. **Remove all API calls from beforeLoad**:
   - Remove `authClient.organization.list()` - use parent's organizations
   - Remove `authClient.organization.setActive()` - NEVER NEEDED

2. **Access parent context** in beforeLoad:
```typescript
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { OrganizationProvider } from '@/contexts/organization-context'
import { setCurrentOrgSlug } from '@/lib/api-client'

export const Route = createFileRoute('/_authenticated/$orgSlug')({
  beforeLoad: async ({ params, context }) => {
    // Get organizations from parent _authenticated route
    const organizations = context.organizations
    const org = organizations.find((o) => o.slug === params.orgSlug)

    if (!org) {
      throw redirect({ to: '/onboarding' })
    }

    return { org }
  },
  component: OrgSlugLayout,
})
```

3. **Keep useEffect for API header** (fast, no network call):
```typescript
function OrgSlugLayout() {
  const { orgSlug } = Route.useParams()
  const { org } = Route.useRouteContext()

  // Sync URL org slug with API client header - this is instant, no API call
  useEffect(() => {
    setCurrentOrgSlug(orgSlug)
    return () => setCurrentOrgSlug(null)
  }, [orgSlug])

  return (
    <OrganizationProvider value={org}>
      <Outlet />
    </OrganizationProvider>
  )
}
```

**Critical:** NO authClient.organization.setActive() anywhere. Ever. The X-Organization-Slug header is all we need.
  </action>
  <verify>
- Navigate between pages in same org - should be instant
- Check Network tab - no set-active or organization/list calls during navigation
- API calls still include X-Organization-Slug header
  </verify>
  <done>$orgSlug.tsx uses cached org data, no API calls on navigation</done>
</task>

<task type="auto">
  <name>Task 3: Update organization context type if needed</name>
  <files>apps/coach-web/src/contexts/organization-context.tsx</files>
  <action>
Verify OrganizationProvider accepts the org type from Better Auth's organization.list().

If there are type mismatches, update the context type to match what Better Auth returns:
```typescript
type Organization = {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: Date
  // Additional fields from our schema
  type?: string
  status?: string
}
```

Check that the context value type matches what beforeLoad returns.
  </action>
  <verify>
TypeScript compiles without errors for the org context types.
  </verify>
  <done>Organization context types aligned with Better Auth response</done>
</task>

</tasks>

<verification>
1. **Cold start:** Login fresh, navigate to dashboard - single set of API calls (session + org list)
2. **Same-org navigation:** Click sidebar links rapidly - instant navigation (<50ms), NO network calls
3. **Network tab:** During same-org navigation, ZERO calls to:
   - `/api/auth/get-session`
   - `/api/auth/organization/list`
   - `/api/auth/organization/set-active`
4. **API header:** Make an oRPC call - verify X-Organization-Slug header is present and correct
5. **Org switch:** Navigate to different org slug - should refetch if cache expired, otherwise use cached orgs
</verification>

<success_criteria>
- Navigation between pages in same org is instant (<50ms)
- ZERO `/api/auth/organization/set-active` calls ever
- Session + org list fetched once per 30 seconds max
- All API calls include correct X-Organization-Slug header
- All existing functionality preserved
</success_criteria>

<output>
After completion, create `.planning/quick/008-fix-session-and-organization-api-calls-o/008-SUMMARY.md`
</output>
