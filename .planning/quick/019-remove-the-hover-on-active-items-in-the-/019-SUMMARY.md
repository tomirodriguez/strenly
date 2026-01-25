---
quick: 019
subsystem: ui
tags: [tailwind, sidebar, css, hover-states]

key-files:
  modified:
    - apps/coach-web/src/components/ui/sidebar.tsx

duration: 1min
completed: 2026-01-25
---

# Quick Task 019: Remove Hover on Active Sidebar Items

**Added data-active:hover variants to SidebarMenuButton so active nav items maintain primary colors on hover**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-25T14:21:42Z
- **Completed:** 2026-01-25T14:22:56Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Active sidebar items now maintain their primary background/text colors when hovered
- Non-active items still show normal hover effect
- CSS specificity issue resolved with explicit data-active:hover: variants

## Task Commits

1. **Task 1: Add data-active:hover variants to SidebarMenuButton** - `2cfb380` (fix)

## Files Modified

- `apps/coach-web/src/components/ui/sidebar.tsx` - Added `data-active:hover:bg-sidebar-primary` and `data-active:hover:text-sidebar-primary-foreground` to sidebarMenuButtonVariants base class

## Decisions Made

None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing typecheck error in `org-form.tsx` (Zod version mismatch) unrelated to this change - verified error exists before and after the change.

## Next Phase Readiness

- Sidebar hover behavior fixed
- Ready for visual verification in running app

---
*Quick: 019*
*Completed: 2026-01-25*
