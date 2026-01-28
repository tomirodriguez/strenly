---
status: resolved
trigger: "Debug Issue: Base UI console warning about button component - DropdownMenuTrigger rendering as div instead of button"
created: 2026-01-26T00:00:00Z
updated: 2026-01-26T00:00:00Z
---

## Current Focus
Resolution complete - root cause identified and documented.

## Symptoms
Console warning appears: "Base UI: A component that acts as a button was not rendered as a native <button>, which does not match the default. Ensure that the element passed to the `render` prop of the component is a real <button>, or set the `nativeButton` prop on the component to `false`."

Location: Program grid, appears when interacting with dropdown menus.

## Root Cause
The `DropdownMenuTrigger` component in the exercise-row-actions.tsx is using Base UI's `MenuPrimitive.Trigger` which expects either:
1. A native `<button>` element (default)
2. The `nativeButton={false}` prop to accept non-button elements

**Current code (line 145-151 in exercise-row-actions.tsx):**
```tsx
<DropdownMenuTrigger
  className="flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
  onClick={(e) => e.stopPropagation()}
>
  <MoreVerticalIcon className="size-3.5" />
  <span className="sr-only">Opciones de ejercicio</span>
</DropdownMenuTrigger>
```

This renders as a `<div>` (Base UI default when no `render` prop) instead of `<button>`.

## Evidence

1. **Source file identified:** `/Users/tomiardz/Projects/treino/apps/coach-web/src/components/ui/dropdown-menu.tsx`
   - Line 16-18: `DropdownMenuTrigger` wraps `MenuPrimitive.Trigger` with no `nativeButton` prop

2. **Component implementation:** The wrapper passes through all props but doesn't set `nativeButton={false}`
   ```tsx
   function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
     return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
   }
   ```

3. **Usage pattern found:** In exercise-row-actions.tsx (line 145), trigger element receives className and onClick handlers but no `nativeButton` prop

4. **Other instances:** Similar patterns in:
   - app-sidebar.tsx
   - user-menu.tsx
   - week-actions-menu.tsx
   - program-header.tsx

## Solution

The `DropdownMenuTrigger` wrapper component has two options:

**Option A (Recommended): Add `nativeButton={false}` to wrapper component**
Update `/apps/coach-web/src/components/ui/dropdown-menu.tsx` line 16-18:
```tsx
function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" nativeButton={false} {...props} />
}
```

This tells Base UI this trigger is NOT meant to be a native button, suppressing the warning globally.

**Option B: Wrap trigger with button tag where used**
In each usage location (exercise-row-actions.tsx, etc.), wrap children in `<button>`:
```tsx
<DropdownMenuTrigger asChild>
  <button className="flex size-6 items-center justify-center...">
    <MoreVerticalIcon className="size-3.5" />
    <span className="sr-only">Opciones de ejercicio</span>
  </button>
</DropdownMenuTrigger>
```

## Recommendation

**Implement Option A** (add `nativeButton={false}` to wrapper) because:
1. Single change fixes all instances globally
2. Wrapper pattern suggests intentional styling/behavior (not a native button)
3. No need to modify individual usage sites
4. Cleaner code - tells Base UI the intent upfront

## Files to Change
- `/Users/tomiardz/Projects/treino/apps/coach-web/src/components/ui/dropdown-menu.tsx` (line 17)

## Root Cause Summary
Base UI's `MenuPrimitive.Trigger` by default expects a native `<button>` element but the wrapper component doesn't specify this. The `nativeButton={false}` prop was never set, so Base UI warns whenever a styled div is used instead.
