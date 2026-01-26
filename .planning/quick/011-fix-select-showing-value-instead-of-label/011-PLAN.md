---
phase: quick
plan: 011
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/components/ui/select.tsx
  - apps/coach-web/src/features/athletes/components/athlete-form.tsx
  - apps/coach-web/src/features/exercises/components/exercise-filters.tsx
  - apps/coach-web/src/components/data-table/data-table-pagination.tsx
autonomous: true

must_haves:
  truths:
    - "Select components display the label of the selected item, not the value"
    - "Dropdown list items still display correctly"
    - "All existing Select usages continue to work"
  artifacts:
    - path: "apps/coach-web/src/components/ui/select.tsx"
      provides: "Updated Select component with items prop support"
  key_links:
    - from: "Select component consumers"
      to: "Select.Root items prop"
      via: "items array with {value, label} shape"
---

<objective>
Fix Select/Dropdown components to display the label instead of the value after selection.

Purpose: Base UI Select works differently than Radix - SelectValue renders the raw value by default. The fix requires passing an `items` prop to Select.Root so SelectValue can look up and display the label.

Output: All Select components display human-readable labels when an option is selected.
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/coach-web/src/components/ui/select.tsx
@apps/coach-web/src/features/athletes/components/athlete-form.tsx
@apps/coach-web/src/features/exercises/components/exercise-filters.tsx
@apps/coach-web/src/components/data-table/data-table-pagination.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update Select component to support items prop</name>
  <files>apps/coach-web/src/components/ui/select.tsx</files>
  <action>
    Modify the Select component wrapper to accept and pass through the `items` prop to SelectPrimitive.Root.

    The `items` prop should be an array of `{ value: string, label: string }` objects.

    When `items` is provided to Select.Root, Base UI's SelectValue will automatically display the label of the selected item instead of the raw value.

    1. Create a type for SelectItem: `type SelectItemType = { value: string; label: string }`
    2. Wrap Select to accept optional `items?: SelectItemType[]` prop and forward it to SelectPrimitive.Root
    3. Export the SelectItemType for consumers to use

    The Select component should remain backward compatible - if no items prop is passed, it works as before.
  </action>
  <verify>TypeScript compiles without errors: `pnpm typecheck`</verify>
  <done>Select component accepts optional items prop and passes it to Base UI Root</done>
</task>

<task type="auto">
  <name>Task 2: Update all Select usages to pass items prop</name>
  <files>
    apps/coach-web/src/features/athletes/components/athlete-form.tsx
    apps/coach-web/src/features/exercises/components/exercise-filters.tsx
    apps/coach-web/src/components/data-table/data-table-pagination.tsx
  </files>
  <action>
    Update each Select usage to pass an `items` array that maps values to labels.

    **athlete-form.tsx (gender select):**
    ```tsx
    const GENDER_OPTIONS = [
      { value: 'male', label: 'Masculino' },
      { value: 'female', label: 'Femenino' },
      { value: 'other', label: 'Otro' },
    ]

    <Select items={GENDER_OPTIONS} value={...} onValueChange={...}>
    ```

    **exercise-filters.tsx:**
    - For muscle group: Build items array from muscleGroups data (including "all" option)
    - For movement pattern: Build items array from MOVEMENT_PATTERNS constant

    ```tsx
    const muscleGroupItems = [
      { value: 'all', label: 'Todos los musculos' },
      ...(muscleGroups?.map(mg => ({ value: mg.name, label: mg.displayName })) ?? [])
    ]

    const MOVEMENT_PATTERN_OPTIONS = [
      { value: 'all', label: 'Todos los patrones' },
      { value: 'push', label: 'Push' },
      { value: 'pull', label: 'Pull' },
      { value: 'squat', label: 'Squat' },
      { value: 'hinge', label: 'Hinge' },
      { value: 'carry', label: 'Carry' },
      { value: 'core', label: 'Core' },
    ]
    ```

    **data-table-pagination.tsx:**
    ```tsx
    const PAGE_SIZE_ITEMS = PAGE_SIZE_OPTIONS.map(size => ({
      value: size.toString(),
      label: size.toString()
    }))
    ```

    For pagination, value and label are the same (just numbers), but we still need the items array for consistency.
  </action>
  <verify>
    1. `pnpm typecheck` passes
    2. `pnpm lint` passes
    3. Manual test: Open athlete form, select a gender - should show "Masculino" not "male"
  </verify>
  <done>All Select components display labels instead of values after selection</done>
</task>

</tasks>

<verification>
1. `pnpm typecheck` - No TypeScript errors
2. `pnpm lint` - No linting errors
3. Visual verification:
   - Athlete form gender select shows "Masculino/Femenino/Otro" when selected
   - Exercise filters show translated labels when selected
   - Pagination page size shows numbers correctly
</verification>

<success_criteria>
- All Select components display the label (human-readable text) of the selected option
- No regressions in Select functionality (dropdown still works, selection still works)
- TypeScript and lint checks pass
</success_criteria>

<output>
After completion, create `.planning/quick/011-fix-select-showing-value-instead-of-label/011-SUMMARY.md`
</output>
