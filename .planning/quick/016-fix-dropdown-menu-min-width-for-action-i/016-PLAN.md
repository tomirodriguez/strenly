---
phase: quick-016
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/components/ui/dropdown-menu.tsx
autonomous: true

must_haves:
  truths:
    - "Dropdown menu action items display on single lines without wrapping"
    - "Dropdown menu width adjusts to fit its content"
  artifacts:
    - path: "apps/coach-web/src/components/ui/dropdown-menu.tsx"
      provides: "Fixed DropdownMenuContent width classes"
      contains: "w-auto min-w-44"
  key_links: []
---

<objective>
Fix dropdown menu minimum width to prevent action items from wrapping to two lines.

Purpose: Menu items like "Ver invitacion" and "Generar invitacion" currently wrap because the menu is constrained by trigger width and has insufficient min-width.

Output: Dropdown menus that properly size to their content with adequate minimum width.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/coach-web/src/components/ui/dropdown-menu.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update DropdownMenuContent width classes</name>
  <files>apps/coach-web/src/components/ui/dropdown-menu.tsx</files>
  <action>
In the `DropdownMenuContent` component (line 37-44), update the className on the `MenuPrimitive.Popup`:

1. Change `w-(--anchor-width)` to `w-auto` - This removes the constraint that forces the menu to match the trigger button width
2. Change `min-w-32` to `min-w-44` - This increases minimum width from 128px to 176px, providing adequate space for typical menu labels

The updated class list should contain:
`w-auto min-w-44` instead of `w-(--anchor-width) min-w-32`

This allows the menu to size based on its content while ensuring a reasonable minimum width for action items.
  </action>
  <verify>
Run `pnpm typecheck` to ensure no type errors.
Visual verification: Open any dropdown menu in the app and confirm items display on single lines.
  </verify>
  <done>
DropdownMenuContent uses `w-auto min-w-44` classes. Menu items no longer wrap to multiple lines.
  </done>
</task>

</tasks>

<verification>
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Dropdown menus display action items on single lines
</verification>

<success_criteria>
- Dropdown menu action items like "Ver invitacion" and "Generar invitacion" display on single lines
- Menu width adjusts based on content rather than trigger button width
- No TypeScript or lint errors introduced
</success_criteria>

<output>
After completion, create `.planning/quick/016-fix-dropdown-menu-min-width-for-action-i/016-SUMMARY.md`
</output>
