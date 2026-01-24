---
status: diagnosed
trigger: "Investigate the React error when clicking the user menu chip"
created: 2026-01-24T00:00:00Z
updated: 2026-01-24T00:06:30Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: Menu.Group/Menu.GroupLabel nesting issue in user menu dropdown
test: Find and analyze user menu component structure
expecting: Incorrect usage of Base UI Menu.Group component
next_action: Locate user menu component and examine its structure

## Symptoms

expected: Clicking user avatar/chip should open dropdown menu with logout, theme toggle, and other options
actual: App crashes with "Base UI: MenuGroupRootContext is missing. Menu group parts must be used within <Menu.Group>"
errors: Error: Base UI: MenuGroupRootContext is missing. Menu group parts must be used within <Menu.Group>. at useMenuGroupRootContext (@base-ui_react_menu.js) at MenuGroupLabelComponent
reproduction: Click user avatar/chip in top bar
started: Unknown - current issue

## Eliminated

## Evidence

- timestamp: 2026-01-24T00:05:00Z
  checked: apps/coach-web/src/components/layout/user-menu.tsx lines 53-58
  found: DropdownMenuLabel is used directly inside DropdownMenuContent WITHOUT being wrapped in DropdownMenuGroup
  implication: MenuPrimitive.GroupLabel (line 62-67 of dropdown-menu.tsx) requires MenuGroupRootContext which is only provided by MenuPrimitive.Group

- timestamp: 2026-01-24T00:05:30Z
  checked: apps/coach-web/src/components/ui/dropdown-menu.tsx line 54-68
  found: DropdownMenuLabel is implemented as MenuPrimitive.GroupLabel (Base UI component)
  implication: GroupLabel MUST be used within a Group component per Base UI requirements

- timestamp: 2026-01-24T00:06:00Z
  checked: user-menu.tsx structure comparison
  found: Line 60 has DropdownMenuGroup wrapping Settings + Theme submenu, but the initial DropdownMenuLabel (lines 53-58) is OUTSIDE any group
  implication: The user info label needs to be wrapped in its own DropdownMenuGroup

## Resolution

root_cause: DropdownMenuLabel component is used outside of DropdownMenuGroup in user-menu.tsx. The Base UI MenuPrimitive.GroupLabel requires MenuGroupRootContext which is only provided by wrapping it in MenuPrimitive.Group. Lines 53-58 show DropdownMenuLabel used directly inside DropdownMenuContent without the required DropdownMenuGroup wrapper.
fix: Wrap the DropdownMenuLabel (lines 53-58) with DropdownMenuGroup component
verification: Click user avatar should open menu without error
files_changed: [apps/coach-web/src/components/layout/user-menu.tsx]
