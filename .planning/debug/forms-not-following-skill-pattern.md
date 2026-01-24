---
status: diagnosed
trigger: "Investigate why forms don't follow the /form skill pattern"
created: 2026-01-24T00:00:00Z
updated: 2026-01-24T00:15:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: Forms were implemented without following the /form skill pattern requirements
test: Check auth forms, athlete forms, and contract schemas for compliance
expecting: Find missing React Hook Form usage, custom error messages, and Field components
next_action: Gather evidence from auth routes, athlete forms, and contract schemas

## Symptoms

expected: Forms should use React Hook Form with zodResolver, shadcn Field components, and custom Zod error messages
actual: Signup/login forms don't use React Hook Form + Zod, athlete form shows default Zod messages ("String must contain at least 1 character(s)"), drawer styling has issues (no padding, footer not at bottom)
errors: Default Zod error messages appearing in UI
reproduction: Open create athlete form and submit with empty fields
started: Forms were implemented without /form skill compliance

## Eliminated

## Evidence

- timestamp: 2026-01-24T00:05:00Z
  checked: apps/coach-web/src/features/athletes/components/athlete-form.tsx
  found: AthleteForm DOES use React Hook Form with zodResolver, Field components, and imports schema from @strenly/contracts
  implication: Athlete form follows the /form skill pattern correctly

- timestamp: 2026-01-24T00:08:00Z
  checked: apps/coach-web/src/features/auth/components/signup-form.tsx and login-form.tsx
  found: Auth forms use React Hook Form with Field components BUT use inline validation rules (register('name', { required: '...', minLength: {...} })) instead of zodResolver
  implication: Auth forms DO NOT follow the /form skill pattern - missing Zod schema integration

- timestamp: 2026-01-24T00:10:00Z
  checked: packages/contracts/src/athletes/athlete.ts
  found: createAthleteInputSchema uses default Zod messages (z.string().min(1) without custom message)
  implication: Contract schemas lack custom error messages as required by /form skill

- timestamp: 2026-01-24T00:12:00Z
  checked: apps/coach-web/src/features/athletes/views/athletes-list-view.tsx
  found: AthleteForm is rendered inside Sheet component with mt-6 wrapper, form buttons are inline (not in SheetFooter)
  implication: Form is not using SheetFooter, which causes footer not to be at bottom

- timestamp: 2026-01-24T00:13:00Z
  checked: apps/coach-web/src/components/ui/sheet.tsx
  found: SheetContent has gap-4 and padding is only on SheetHeader (p-4) and SheetFooter (p-4), not on content area
  implication: Content between header and footer needs manual padding, explaining "no padding" issue

## Resolution

root_cause: Multiple compliance issues with /form skill pattern:
1. Auth forms (login, signup) use inline React Hook Form validation instead of zodResolver with Zod schemas
2. Contract schemas (@strenly/contracts) lack custom error messages, causing default Zod messages to appear ("String must contain at least 1 character(s)")
3. Sheet-based forms don't use SheetFooter component for form buttons, causing poor visual hierarchy
4. SheetContent doesn't provide padding to content area (only header/footer have p-4), requiring manual padding
fix:
verification:
files_changed: []
