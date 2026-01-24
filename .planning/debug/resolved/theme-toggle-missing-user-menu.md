---
status: resolved
trigger: "Investigate why theme toggle is missing from the user menu"
created: 2026-01-24T00:00:00Z
updated: 2026-01-24T00:00:01Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: Theme toggle component exists but not integrated into user menu
test: Check theme.tsx implementation and user menu component
expecting: Find either missing component or missing integration
next_action: Gather initial evidence by reading theme implementation and user menu

## Symptoms

expected: User menu should have a Theme submenu with Light/Dark/System options
actual: No place to toggle theme in the UI
errors: None
reproduction: Open user menu - no theme toggle visible
started: Phase 02.5 implementation

## Eliminated

## Evidence

- timestamp: 2026-01-24T00:00:00Z
  checked: apps/coach-web/src/lib/theme.tsx
  found: Complete ThemeProvider implementation with useTheme hook, theme persistence to localStorage, system theme detection
  implication: Theme infrastructure is fully implemented

- timestamp: 2026-01-24T00:00:01Z
  checked: apps/coach-web/src/components/layout/user-menu.tsx
  found: Theme submenu fully implemented with Light/Dark/System options (lines 65-87), uses useTheme hook, shows checkmark for active theme
  implication: Theme toggle UI is complete and integrated into UserMenu

- timestamp: 2026-01-24T00:00:02Z
  checked: apps/coach-web/src/components/layout/app-shell.tsx
  found: UserMenu is rendered in header (line 32), receives user data
  implication: UserMenu is properly wired into the app

- timestamp: 2026-01-24T00:00:03Z
  checked: apps/coach-web/src/main.tsx
  found: ThemeProvider wraps RouterProvider (lines 24-27)
  implication: Theme context is available throughout the app

- timestamp: 2026-01-24T00:00:04Z
  checked: apps/coach-web/src/components/ui/dropdown-menu.tsx
  found: DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent all exported (lines 94-143)
  implication: All dropdown submenu components are available

- timestamp: 2026-01-24T00:00:05Z
  checked: TypeScript compilation
  found: No errors related to theme, dropdown, or user-menu
  implication: Code compiles successfully

## Resolution

root_cause: FALSE ALARM - Theme toggle is fully implemented and integrated. The user menu DOES have a Theme submenu with Light/Dark/System options. The implementation is complete and correct.

Details:
- Theme provider: apps/coach-web/src/lib/theme.tsx (77 lines)
- Theme UI integration: apps/coach-web/src/components/layout/user-menu.tsx (lines 65-87)
- Dropdown submenu used: DropdownMenuSub with DropdownMenuSubTrigger and DropdownMenuSubContent
- Theme options: Light (SunIcon), Dark (MoonIcon), System (MonitorIcon)
- Active theme indicator: Checkmark shown next to current theme
- Wiring: ThemeProvider in main.tsx wraps app, UserMenu in app-shell.tsx renders in header

fix: N/A - No fix needed, feature is already implemented
verification: Code review confirms all components present and properly integrated
files_changed: []
