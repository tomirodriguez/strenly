---
quick: 019
type: execute
files_modified:
  - apps/coach-web/src/components/ui/sidebar.tsx
autonomous: true
---

<objective>
Remove hover effect from active sidebar items so they maintain their primary background color when hovered.

Purpose: Active nav items should stay visually distinct (using sidebar-primary colors) even when hovered, not switch to the accent color.
Output: Sidebar active items no longer change background/text on hover.
</objective>

<context>
@apps/coach-web/src/components/ui/sidebar.tsx

The `sidebarMenuButtonVariants` base class applies:
- `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground` for all items
- `data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground` for active items

The problem: hover styles override active styles due to CSS specificity (both are same level but hover comes first in the class string, and Tailwind applies them in order of appearance which can be unpredictable with arbitrary utilities).

The fix: Add explicit `data-active:hover:` variants to maintain the primary styling on hover for active items.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add data-active:hover variants to SidebarMenuButton</name>
  <files>apps/coach-web/src/components/ui/sidebar.tsx</files>
  <action>
In the `sidebarMenuButtonVariants` cva base class (line 443-444), add hover override for active items:

After `data-active:text-sidebar-primary-foreground`, add:
- `data-active:hover:bg-sidebar-primary`
- `data-active:hover:text-sidebar-primary-foreground`

This ensures when an item is active (`data-active`), hovering does not change its colors.

The updated base string should include:
```
data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground
```
  </action>
  <verify>
1. Run `pnpm typecheck` - should pass
2. Run `pnpm lint` - should pass
3. Manual verification: In the coach-web app, hover over an active sidebar item. It should maintain its primary background color (blue) instead of switching to the accent hover color.
  </verify>
  <done>Active sidebar items maintain their primary background and text color when hovered.</done>
</task>

</tasks>

<verification>
- `pnpm typecheck` passes
- `pnpm lint` passes
- Active nav item stays blue on hover instead of switching to accent color
</verification>

<success_criteria>
- Active sidebar menu buttons no longer visually change when hovered
- Non-active items still show hover effect normally
- No type errors or lint warnings introduced
</success_criteria>

<output>
After completion, update `.planning/STATE.md` quick tasks table.
</output>
