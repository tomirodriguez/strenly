---
phase: quick
plan: 006
subsystem: ui
tags: [react, context, auth, organization, caching]

# Dependency graph
requires:
  - phase: 02.5
    provides: Coach Web Foundation with Better-Auth integration
provides:
  - AuthProvider and useAuth() hook for session caching
  - OrganizationProvider and useOrganization() hook for org caching
  - Reduced redundant API calls on SPA navigation
affects: [phase-3, coach-web-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Context providers for route-level data caching
    - Hooks that throw outside provider for type safety

key-files:
  created:
    - apps/coach-web/src/contexts/auth-context.tsx
    - apps/coach-web/src/contexts/organization-context.tsx
  modified:
    - apps/coach-web/src/routes/_authenticated.tsx
    - apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
    - apps/coach-web/src/features/dashboard/views/dashboard-view.tsx
    - apps/coach-web/src/features/auth/views/onboarding-view.tsx

key-decisions:
  - "AuthProvider wraps at _authenticated layout level"
  - "OrganizationProvider wraps at $orgSlug layout level"
  - "Hooks throw if used outside provider for type safety"

patterns-established:
  - "Context caching: Fetch data in beforeLoad, cache in Context, access via hooks"
  - "Type-safe hooks: Throw error if used outside provider instead of returning null"

# Metrics
duration: 3min
completed: 2026-01-24
---

# Quick Task 006: Add AuthProvider and OrganizationProvider

**React Context providers caching session and org data from beforeLoad, eliminating redundant Better-Auth API calls on SPA navigation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-24
- **Completed:** 2026-01-24
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created AuthProvider and useAuth() hook for caching session data
- Created OrganizationProvider and useOrganization() hook for caching org data
- Wired providers into route layouts (_authenticated and $orgSlug)
- Updated dashboard-view and onboarding-view to use context hooks instead of Better-Auth hooks
- Eliminated redundant API calls on route navigation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AuthContext and OrganizationContext providers** - `eec0db5` (feat)
2. **Task 2: Wire providers into route layouts and update components** - `33083ce` (feat)

## Files Created/Modified
- `apps/coach-web/src/contexts/auth-context.tsx` - AuthProvider and useAuth() hook
- `apps/coach-web/src/contexts/organization-context.tsx` - OrganizationProvider and useOrganization() hook
- `apps/coach-web/src/routes/_authenticated.tsx` - Wrapped layout with AuthProvider
- `apps/coach-web/src/routes/_authenticated/$orgSlug.tsx` - Wrapped layout with OrganizationProvider
- `apps/coach-web/src/features/dashboard/views/dashboard-view.tsx` - Uses useOrganization() instead of useActiveOrganization()
- `apps/coach-web/src/features/auth/views/onboarding-view.tsx` - Uses useAuth() instead of useSession()

## Decisions Made
- **AuthProvider at _authenticated level** - Session is available to all authenticated routes
- **OrganizationProvider at $orgSlug level** - Org data only available within org-scoped routes
- **Type-safe hooks** - Hooks throw if used outside provider, ensuring components can't accidentally render without data

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Context providers ready for use in Phase 3 components
- Components can now access session and org data synchronously without API calls
- No blockers or concerns

---
*Quick Task: 006*
*Completed: 2026-01-24*
