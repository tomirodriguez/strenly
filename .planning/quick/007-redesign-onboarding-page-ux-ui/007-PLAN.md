---
type: quick
task: 007
title: Redesign Onboarding Page UX/UI
files_modified:
  - apps/coach-web/src/features/auth/views/onboarding-view.tsx
  - apps/coach-web/src/features/auth/components/coach-type-step.tsx
  - apps/coach-web/src/features/auth/components/plan-selection-step.tsx
  - apps/coach-web/src/features/auth/components/org-form-step.tsx
---

<objective>
Redesign the onboarding flow with improved UX/UI: add logout capability, enhance step indicator design, improve visual hierarchy, and add professional polish.

Purpose: Users are currently stuck in onboarding with no escape option, and the UI feels generic. This improves user confidence and flow clarity.

Output: Polished onboarding experience with clear exit path, better step visualization, and cohesive visual design.
</objective>

<context>
@apps/coach-web/src/features/auth/views/onboarding-view.tsx
@apps/coach-web/src/features/auth/components/coach-type-step.tsx
@apps/coach-web/src/features/auth/components/plan-selection-step.tsx
@apps/coach-web/src/features/auth/components/org-form-step.tsx
@apps/coach-web/src/components/layout/user-menu.tsx (reference for logout pattern)
@apps/coach-web/src/lib/auth-client.ts (signOut export)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Header Logout and Improve Step Indicator</name>
  <files>apps/coach-web/src/features/auth/views/onboarding-view.tsx</files>
  <action>
1. **Add logout button to header:**
   - Import `signOut` from `@/lib/auth-client` and `useNavigate` from `@tanstack/react-router`
   - Add logout button on the right side of the header using `Button` with `variant="ghost"` and `size="sm"`
   - Use `LogOut` icon from lucide-react
   - On click: `await signOut()` then `navigate({ to: '/' })`

2. **Redesign StepIndicator component:**
   - Replace simple dots with a numbered step indicator showing step labels
   - Each step shows: number circle + label text
   - States: completed (filled primary bg), current (primary outline), upcoming (muted)
   - Labels: "Tipo", "Plan", "Organizacion"
   - Connect steps with lines (colored for completed, muted for upcoming)
   - Use `Check` icon for completed steps instead of number

3. **Improve welcome section:**
   - Make welcome message more prominent with larger text
   - Add a subtitle describing what the onboarding will accomplish
   - Example: "Configura tu cuenta en 3 simples pasos"

4. **Header layout adjustments:**
   - Use `justify-between` instead of `justify-center` to accommodate logout button
   - Keep logo centered by using a flex spacer pattern or absolute positioning
  </action>
  <verify>
    - `pnpm typecheck` passes
    - `pnpm lint` passes
    - Manually verify: Header shows logo centered with logout button on right
    - Manually verify: Step indicator shows numbered steps with labels and connecting lines
  </verify>
  <done>
    - Logout button visible in header on all onboarding steps
    - Step indicator clearly shows current step, completed steps (with checkmark), and upcoming steps
    - Welcome text is more prominent and includes helpful subtitle
  </done>
</task>

<task type="auto">
  <name>Task 2: Polish Step Components Visual Design</name>
  <files>
    apps/coach-web/src/features/auth/components/coach-type-step.tsx
    apps/coach-web/src/features/auth/components/plan-selection-step.tsx
    apps/coach-web/src/features/auth/components/org-form-step.tsx
  </files>
  <action>
1. **CoachTypeStep improvements:**
   - Increase icon size in cards (`h-10 w-10` instead of `h-8 w-8`)
   - Add subtle gradient or enhanced bg to icon container
   - Improve card hover state with scale transform: `hover:scale-[1.02]`
   - Add `min-h-[200px]` to ensure consistent card heights
   - Better spacing between icon, title, and description

2. **PlanSelectionStep improvements:**
   - Add better visual separation between price and features
   - Increase "Recomendado" badge visibility with larger text or bolder styling
   - Add a subtle animation when cards appear (optional, if simple)
   - Ensure all plan cards have equal heights using `h-full` on grid items

3. **OrgFormStep improvements:**
   - Add a visual element (icon or illustration) above the form to make it feel less bare
   - Could use `Building2` or `Sparkles` icon from lucide-react
   - Add helper text below the form encouraging completion

4. **Common improvements across all steps:**
   - Consistent heading size using `text-2xl` or `text-xl font-bold`
   - Consistent description text styling with `text-muted-foreground text-base`
   - Add fade-in transition for step content (using Tailwind `animate-in fade-in-0`)
  </action>
  <verify>
    - `pnpm typecheck` passes
    - `pnpm lint` passes
    - Manually verify each step has improved visual hierarchy
    - Manually verify cards are properly aligned and sized
  </verify>
  <done>
    - All step components have consistent, polished visual design
    - Coach type cards have enhanced hover states and proper sizing
    - Plan cards have clear visual hierarchy with prominent recommended badge
    - Org form step feels complete with visual element and helper text
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Redesigned onboarding flow with logout button, enhanced step indicator, and polished visual design across all steps</what-built>
  <how-to-verify>
1. Start dev server: `pnpm dev:coach`
2. Navigate to onboarding page (login and trigger onboarding flow, or access `/onboarding` directly)
3. Verify:
   - [ ] Logout button is visible in header (right side)
   - [ ] Clicking logout redirects to home page
   - [ ] Step indicator shows 3 numbered steps with labels
   - [ ] Current step is highlighted, completed steps show checkmark
   - [ ] Coach type cards have good hover effects and consistent sizing
   - [ ] Plan selection shows "Recomendado" badge clearly
   - [ ] Organization form step has visual polish
   - [ ] Overall flow feels professional and cohesive
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues to fix</resume-signal>
</task>

</tasks>

<verification>
- `pnpm typecheck` passes
- `pnpm lint` passes
- All existing functionality preserved (3-step flow, navigation, form submission)
- Visual improvements visible across all steps
</verification>

<success_criteria>
- User can logout from onboarding at any time
- Step indicator clearly communicates progress
- All step components have professional, cohesive visual design
- Existing functionality (coach type selection, plan selection, org creation) works unchanged
</success_criteria>

<output>
After completion, create `.planning/quick/007-redesign-onboarding-page-ux-ui/007-SUMMARY.md`
</output>
