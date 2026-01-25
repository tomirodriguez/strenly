---
type: quick
id: "011"
name: refactor-forms-to-skill-pattern
subsystem: ui
tags: [react-hook-form, zod, forms, standardSchemaResolver, Controller]

key-files:
  modified:
    - apps/coach-web/src/features/auth/components/login-form.tsx
    - apps/coach-web/src/features/auth/components/signup-form.tsx
    - apps/coach-web/src/features/auth/components/org-form.tsx
    - apps/coach-web/src/features/athletes/components/athlete-form.tsx

key-decisions:
  - "Use standardSchemaResolver instead of zodResolver for all forms"
  - "Use Controller for controlled components (Checkbox, Select) instead of watch+setValue"
  - "Keep onChange handlers for derived fields (slug auto-generation)"

patterns-established:
  - "Controller pattern: Use react-hook-form Controller for Checkbox and Select components"
  - "Zod schema first: Define schema with validation messages, then use standardSchemaResolver"

duration: 5min
completed: 2026-01-25
---

# Quick Task 011: Refactor Forms to Skill Pattern Summary

**All 4 coach-web forms migrated to standardSchemaResolver with Controller for controlled components (Checkbox, Select)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-25T11:30:00Z
- **Completed:** 2026-01-25T11:35:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Migrated all forms from deprecated `zodResolver` to `standardSchemaResolver`
- Replaced anti-pattern `watch+setValue` with proper `Controller` for controlled components
- Added Zod schema validation to org-form (previously using inline register validation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor auth forms (login-form, signup-form)** - `5c5b411` (refactor)
2. **Task 2: Refactor org-form and athlete-form** - `05c38a3` (refactor)

## Files Modified

- `apps/coach-web/src/features/auth/components/login-form.tsx` - Use standardSchemaResolver + Controller for Checkbox
- `apps/coach-web/src/features/auth/components/signup-form.tsx` - Use standardSchemaResolver
- `apps/coach-web/src/features/auth/components/org-form.tsx` - Add Zod schema with standardSchemaResolver
- `apps/coach-web/src/features/athletes/components/athlete-form.tsx` - Use standardSchemaResolver + Controller for Select

## Decisions Made

- **standardSchemaResolver over zodResolver**: The /form skill specifies standardSchemaResolver as the modern approach, zodResolver is deprecated
- **Controller for controlled components**: Checkbox and Select are controlled components that don't work with register - Controller pattern is the correct approach per react-hook-form docs
- **Keep setValue for slug sync**: The org-form slug auto-generation uses setValue in an onChange handler, which is a valid derived field pattern (not the anti-pattern of watch+setValue for value sync)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Select component generic type error**
- **Found during:** Task 2 verification (typecheck)
- **Issue:** `SelectPrimitive.Root.Props` requires generic type arguments in @base-ui/react v1.0.0
- **Fix:** Added generic type parameter `<Value = string>` to Select function
- **Files modified:** apps/coach-web/src/components/ui/select.tsx
- **Verification:** `pnpm --filter coach-web typecheck` passes
- **Committed in:** 05c38a3 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix was necessary for typecheck to pass. No scope creep.

## Issues Encountered

None - plan executed as expected.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All forms now follow the /form skill pattern consistently
- Ready to use Controller pattern for any new controlled components
- standardSchemaResolver is the established resolver for all future forms

---
*Quick Task: 011-refactor-forms-to-skill-pattern*
*Completed: 2026-01-25*
