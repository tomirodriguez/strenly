---
phase: quick
plan: 018
subsystem: ui
tags: [router, navigation, breadcrumbs, sidebar]

# Dependency graph
requires:
  - phase: 02.6-layout
    provides: sidebar and header components
provides:
  - Redirect from /$orgSlug to /$orgSlug/dashboard
  - Breadcrumbs starting with "Inicio"
  - Collapsible sidebar on desktop
affects: [navigation, user-experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Redirect in beforeLoad for route-level redirects
    - Breadcrumbs with fixed home item

key-files:
  modified:
    - apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
    - apps/coach-web/src/components/layout/breadcrumbs.tsx
    - apps/coach-web/src/components/layout/app-header.tsx
    - apps/coach-web/src/components/layout/app-sidebar.tsx

key-decisions:
  - "Redirect in beforeLoad guards route entry"
  - "Breadcrumbs always show Inicio as first item linking to dashboard"
  - "Sidebar collapsible='icon' for desktop collapse mode"

patterns-established:
  - "Route redirects in beforeLoad: throw redirect() to prevent component render"
  - "Fixed home breadcrumb: Always show Inicio, then build path from segments"

# Metrics
duration: 3min
completed: 2026-01-25
---

# Quick Task 018: Redirect, Breadcrumbs, Sidebar Collapse

**Route redirect to dashboard, Spanish breadcrumbs with Inicio home, and collapsible sidebar on desktop**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-25T11:14:00Z
- **Completed:** 2026-01-25T11:17:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- /$orgSlug now redirects to /$orgSlug/dashboard in beforeLoad
- Breadcrumbs start with "Inicio" on all pages, linking to dashboard
- Dashboard page shows "Inicio" as current page (no link)
- Sidebar trigger visible on all screen sizes
- Sidebar collapses to icon-only mode when triggered

## Task Commits

Each task was committed atomically:

1. **Task 1: Add redirect and fix breadcrumbs** - `bdb4f42` (feat)
2. **Task 2: Enable sidebar collapse on desktop** - `89a1b77` (feat)

## Files Modified
- `apps/coach-web/src/routes/_authenticated/$orgSlug.tsx` - Added redirect to dashboard in beforeLoad
- `apps/coach-web/src/components/layout/breadcrumbs.tsx` - Fixed home breadcrumb to show "Inicio", Spanish labels
- `apps/coach-web/src/components/layout/app-header.tsx` - Removed md:hidden from SidebarTrigger
- `apps/coach-web/src/components/layout/app-sidebar.tsx` - Changed collapsible to "icon"

## Decisions Made
- Redirect in beforeLoad prevents component render on base org route
- Breadcrumbs use Spanish labels (Panel, Atletas, Ejercicios, Configuracion)
- Fixed Inicio home item separate from dynamic path segments
- Sidebar uses collapsible="icon" for desktop collapse mode

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness
- Navigation UX improvements complete
- Users land on dashboard by default
- Breadcrumbs provide consistent navigation context
- Sidebar can be collapsed for more workspace

---
*Quick Task: 018*
*Completed: 2026-01-25*
