---
phase: quick-016
plan: 01
subsystem: ui
tags: [react, tailwind, base-ui, dropdown, menu]

# Dependency graph
requires:
  - phase: 02.5-05
    provides: shadcn/ui dropdown-menu component with Base UI
provides:
  - Dropdown menu with content-based width sizing
  - Minimum width sufficient for action item labels
affects: [all features using dropdown menus]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - apps/coach-web/src/components/ui/dropdown-menu.tsx

key-decisions:
  - "Use w-auto instead of w-(--anchor-width) for content-based sizing"
  - "Set min-w-44 (176px) as minimum width for dropdown menus"

patterns-established: []

# Metrics
duration: 1min
completed: 2026-01-25
---

# Quick Task 016: Fix Dropdown Menu Min-Width Summary

**Dropdown menus now size to content with 176px minimum width, preventing action item text wrapping**

## Performance

- **Duration:** 1 minute
- **Started:** 2026-01-25T12:37:37Z
- **Completed:** 2026-01-25T12:39:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Changed dropdown menu width from trigger-constrained to content-based
- Increased minimum width from 128px to 176px
- Fixed wrapping issue in action items like "Ver invitacion" and "Generar invitacion"

## Task Commits

Each task was committed atomically:

1. **Task 1: Update DropdownMenuContent width classes** - `8c71475` (fix)

## Files Created/Modified
- `apps/coach-web/src/components/ui/dropdown-menu.tsx` - Changed DropdownMenuContent from `w-(--anchor-width) min-w-32` to `w-auto min-w-44`

## Decisions Made
None - followed plan as specified. Changed width classes as directed to fix text wrapping.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward CSS class update.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Dropdown menu component ready for use across all features. No blockers.

---
*Phase: quick-016*
*Completed: 2026-01-25*
