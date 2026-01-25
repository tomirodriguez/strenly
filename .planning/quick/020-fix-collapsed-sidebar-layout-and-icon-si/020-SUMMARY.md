# Quick Task 020 Summary

## Fix Collapsed Sidebar Layout and Icon Sizes

**Date:** 2026-01-25
**Commits:** 3d64977, 19312d4

### Problem

The sidebar had visual issues when collapsed:
- Text leaking through (showing partial letters like "S", "P", "A", "E", "Tan")
- Icons too small (16px for h-12 items)
- Header/footer content not adapting to collapsed state
- Sidebar width too narrow (4rem/64px) for h-12 items

### Solution

**Task 1: Fix sidebar.tsx (commit 3d64977)**
- Increased collapsed width: `SIDEBAR_WIDTH_ICON` from `4rem` to `5rem` (80px)
- Changed icon size: `[&_svg]:size-4` to `[&_svg]:size-5` (20px)
- Fixed lg variant: added `group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!`
- Removed forced sizing: removed `group-data-[collapsible=icon]:size-8!` to keep h-12 height

**Task 2: Fix app-sidebar.tsx (commit 19312d4)**
- Header: Added `group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0` to container
- Header: Added `group-data-[collapsible=icon]:hidden` to "STRENLY" text
- Footer: Added `group-data-[collapsible=icon]:p-2` to reduce padding
- Footer: Added collapse-aware classes to user chip container
- Footer: Hidden user info div and MoreVerticalIcon when collapsed

### Files Changed

| File | Changes |
|------|---------|
| `apps/coach-web/src/components/ui/sidebar.tsx` | Width, icon size, lg variant |
| `apps/coach-web/src/components/layout/app-sidebar.tsx` | Header/footer collapse awareness |

### Result

- Collapsed sidebar shows only centered icons
- No text visible when collapsed
- Header shows only logo icon
- Footer shows only avatar
- Icons properly sized (20px) for h-12 items
- Smooth transitions between states
