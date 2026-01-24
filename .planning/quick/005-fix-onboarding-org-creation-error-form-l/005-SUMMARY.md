---
id: "005"
type: quick
subsystem: auth
tags: [better-auth, react-hook-form, onboarding]

key-files:
  modified:
    - packages/auth/src/auth.ts
    - apps/coach-web/src/features/auth/views/onboarding-view.tsx
    - apps/coach-web/src/features/auth/components/org-form.tsx

key-decisions:
  - "Better-Auth passes metadata as object, not JSON string"
  - "Onboarding uses wider layout (max-w-3xl) vs auth forms (max-w-md)"
  - "Slug auto-generation via onChange callbacks instead of useEffect"

duration: 3min
completed: 2026-01-24
---

# Quick Task 005: Fix Onboarding Org Creation, Layout, and Slug Generation

**Fixed 3 onboarding bugs: JSON.parse on already-parsed metadata, cramped plan grid layout, and slug auto-generation only working for first character**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-24T21:12:44Z
- **Completed:** 2026-01-24T21:15:11Z
- **Tasks:** 3/3
- **Files modified:** 3

## Accomplishments

- Organization creation now succeeds (no more 500 error from JSON.parse)
- Plan selection step displays 3 cards properly in a row on desktop
- Slug auto-generates continuously as user types organization name

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix JSON.parse error on organization metadata** - `f05a76b` (fix)
2. **Task 2: Fix onboarding layout for plan selection grid** - `30022e6` (fix)
3. **Task 3: Fix slug auto-generation using callbacks** - `5dcd734` (fix)
4. **Task 4: Complete layout redesign** - `47c7b9a` (fix) - Removed split branding layout and Card wrapper entirely

## Files Modified

- `packages/auth/src/auth.ts` - Removed JSON.parse on org.metadata (already an object)
- `apps/coach-web/src/features/auth/views/onboarding-view.tsx` - Standalone full-width layout (header + centered content)
- `apps/coach-web/src/features/auth/components/org-form.tsx` - Replaced useEffect with onChange callbacks for slug generation
- `apps/coach-web/src/features/auth/components/plan-selection-step.tsx` - Fixed overflow for "Recomendado" badge

## Decisions Made

- **Better-Auth metadata handling:** The `org.metadata` in `afterCreateOrganization` hook is already a parsed object, not a JSON string. Cast to typed object instead of parsing.
- **Standalone onboarding layout:** Onboarding doesn't belong in AuthLayout. Uses its own full-width layout with simple header + centered content.
- **Callback-based slug generation:** Replaced useEffect with onChange callbacks. Added `userEditedSlug` ref to track if user manually edited the slug field.
- **Plan card overflow:** Added pt-4 to grid container for "Recomendado" badge visibility, shrink-0 on check icons.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing lint warnings (noArrayIndexKey in StepIndicator, import order issues) were auto-fixed by Biome. The noArrayIndexKey warning for static step indicators was left as-is since the items never reorder.

## Next Phase Readiness

- Onboarding flow is now fully functional
- Coaches can complete registration and org creation
- Ready for Phase 3 (Program Builder)

---
*Quick Task: 005*
*Completed: 2026-01-24*
