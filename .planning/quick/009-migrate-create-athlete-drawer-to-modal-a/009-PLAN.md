---
phase: quick
plan: 009
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/features/athletes/views/athletes-list-view.tsx
  - apps/coach-web/CLAUDE.md
autonomous: true

must_haves:
  truths:
    - "Create athlete opens in a centered modal dialog, not a side drawer"
    - "Edit athlete opens in a centered modal dialog, not a side drawer"
    - "CLAUDE.md documents when to use modal vs drawer"
  artifacts:
    - path: "apps/coach-web/src/features/athletes/views/athletes-list-view.tsx"
      provides: "Athlete creation/edit using Dialog instead of Sheet"
      contains: "Dialog"
    - path: "apps/coach-web/CLAUDE.md"
      provides: "Modal vs drawer usage guidelines"
      contains: "Modal vs Drawer"
  key_links:
    - from: "athletes-list-view.tsx"
      to: "components/ui/dialog.tsx"
      via: "Dialog import"
      pattern: "import.*Dialog.*from.*dialog"
---

<objective>
Migrate the create/edit athlete form from Sheet (side drawer) to Dialog (centered modal) and document when to use each pattern.

Purpose: Modals are better for focused form entry, while drawers are better for contextual panels that maintain page context.

Output: Athlete forms use Dialog component, CLAUDE.md includes modal vs drawer guidelines.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/coach-web/src/features/athletes/views/athletes-list-view.tsx
@apps/coach-web/src/components/ui/dialog.tsx
@apps/coach-web/src/components/ui/sheet.tsx
@apps/coach-web/CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Migrate athlete form from Sheet to Dialog</name>
  <files>apps/coach-web/src/features/athletes/views/athletes-list-view.tsx</files>
  <action>
Replace Sheet components with Dialog components in athletes-list-view.tsx:

1. Update imports:
   - Remove Sheet imports (Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter)
   - Add Dialog imports (Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter)

2. Rename state variable:
   - `drawerOpen` -> `dialogOpen`
   - Update all references (setDrawerOpen -> setDialogOpen)

3. Replace JSX:
   - `<Sheet>` -> `<Dialog>`
   - `<SheetContent>` -> `<DialogContent>`
   - `<SheetHeader>` -> `<DialogHeader>`
   - `<SheetTitle>` -> `<DialogTitle>`
   - `<SheetDescription>` -> `<DialogDescription>`
   - `<SheetBody>` -> Remove wrapper, move children directly into DialogContent
   - `<SheetFooter>` -> `<DialogFooter>`

4. Form layout adjustment:
   - Dialog does not have SheetBody, so the form should be placed directly after DialogHeader
   - Add appropriate spacing/layout classes if needed

Note: Dialog from base-ui uses same open/onOpenChange pattern as Sheet, so props stay the same.
  </action>
  <verify>
Run `pnpm typecheck` to verify no type errors.
Run `pnpm lint` to verify code style.
  </verify>
  <done>
Athletes list view uses Dialog instead of Sheet for create/edit forms.
Form opens centered on screen with backdrop blur, not sliding from side.
  </done>
</task>

<task type="auto">
  <name>Task 2: Document modal vs drawer guidelines in CLAUDE.md</name>
  <files>apps/coach-web/CLAUDE.md</files>
  <action>
Add a "Modal vs Drawer" section under Conventions in apps/coach-web/CLAUDE.md:

```markdown
### Modal vs Drawer

**Use Modal (Dialog) for:**
- Create/edit forms that need focused attention
- Confirmation dialogs
- Short workflows (1-3 fields)
- Actions that don't require seeing the page behind

**Use Drawer (Sheet) for:**
- Contextual information panels (detail views, settings)
- Complex multi-step forms where page context helps
- Navigation menus on mobile
- Panels that users may want to reference alongside page content

**Pattern:**
- **Centered modal**: User focus shifts entirely to the dialog
- **Side drawer**: User maintains awareness of underlying page
```

Place this section after the existing "Form Pattern" section.
  </action>
  <verify>
File contains new "Modal vs Drawer" section.
Run `pnpm lint` to verify markdown/code formatting if applicable.
  </verify>
  <done>
CLAUDE.md includes clear guidelines on when to use Dialog vs Sheet components.
  </done>
</task>

</tasks>

<verification>
1. `pnpm typecheck` passes
2. `pnpm lint` passes
3. Create athlete button opens a centered modal dialog
4. Edit athlete action opens a centered modal dialog
5. CLAUDE.md contains modal vs drawer guidelines
</verification>

<success_criteria>
- Athlete create/edit forms appear in centered modal dialogs
- No Sheet components used in athletes-list-view.tsx
- CLAUDE.md documents the modal vs drawer pattern for future reference
- All validation passes (typecheck, lint)
</success_criteria>

<output>
After completion, create `.planning/quick/009-migrate-create-athlete-drawer-to-modal-a/009-SUMMARY.md`
</output>
