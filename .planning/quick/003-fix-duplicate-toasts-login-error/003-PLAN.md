---
phase: quick
plan: 003
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/main.tsx
  - apps/coach-web/src/routes/__root.tsx
autonomous: true
must_haves:
  truths:
    - "Login errors show a single toast notification"
    - "Toasts appear in consistent position (top-right)"
  artifacts:
    - path: "apps/coach-web/src/main.tsx"
      provides: "App entry point without Toaster"
    - path: "apps/coach-web/src/routes/__root.tsx"
      provides: "Single Toaster with proper configuration"
  key_links:
    - from: "apps/coach-web/src/routes/__root.tsx"
      to: "@/components/ui/sonner"
      via: "import Toaster"
      pattern: "import.*Toaster.*from.*@/components/ui/sonner"
---

<objective>
Fix duplicate toast notifications appearing during login errors by consolidating to a single Toaster provider.

**Problem:** Two Toaster components are mounted:
1. `main.tsx:26` - `<Toaster position="top-right" richColors />` (shadcn wrapper)
2. `__root.tsx:26` - `<Toaster />` (raw sonner import, default bottom-right)

This causes every toast to appear twice at different screen positions.

**Solution:** Keep Toaster only in `__root.tsx` (inside providers), update it to use the shadcn wrapper with proper configuration, remove from `main.tsx`.

**Bonus fix:** Remove duplicate ThemeProvider wrapping (exists in both files).

Output: Single toast notification per event, positioned consistently at top-right
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/coach-web/src/main.tsx
@apps/coach-web/src/routes/__root.tsx
@apps/coach-web/src/components/ui/sonner.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Consolidate Toaster to __root.tsx</name>
  <files>
    apps/coach-web/src/routes/__root.tsx
    apps/coach-web/src/main.tsx
  </files>
  <action>
1. In `apps/coach-web/src/routes/__root.tsx`:
   - Change import from `import { Toaster } from 'sonner'` to `import { Toaster } from '@/components/ui/sonner'`
   - Update the Toaster component to: `<Toaster position="top-right" richColors />`
   - Remove the duplicate ThemeProvider wrapper (keep only QueryClientProvider)

2. In `apps/coach-web/src/main.tsx`:
   - Remove the Toaster import line
   - Remove the `<Toaster position="top-right" richColors />` component
   - Keep ThemeProvider here (it wraps RouterProvider)

Final structure:
- `main.tsx`: ThemeProvider > RouterProvider (no Toaster)
- `__root.tsx`: QueryClientProvider > Outlet + Toaster + DevTools (no ThemeProvider)
  </action>
  <verify>
1. Run `pnpm typecheck` - should pass
2. Run `pnpm dev:coach` and trigger a login error - should see only ONE toast at top-right
3. Grep for Toaster imports: `grep -r "Toaster" apps/coach-web/src/` - should only appear in __root.tsx and ui/sonner.tsx
  </verify>
  <done>
- Single Toaster component in the entire app
- Toast notifications appear only once at top-right position
- No duplicate ThemeProvider wrapping
- TypeScript compilation passes
  </done>
</task>

</tasks>

<verification>
```bash
# Verify single Toaster instance
grep -rn "Toaster" apps/coach-web/src/ | grep -v "ui/sonner.tsx" | wc -l
# Expected: 1 (only __root.tsx)

# Verify correct import
grep -n "@/components/ui/sonner" apps/coach-web/src/routes/__root.tsx
# Expected: shows the import line

# TypeScript check
pnpm typecheck
```

Manual verification:
1. Start dev server: `pnpm dev:coach`
2. Go to login page
3. Enter invalid credentials
4. Verify: Single toast appears at top-right
5. No duplicate toast at bottom-right
</verification>

<success_criteria>
- [ ] Only one Toaster component mounted in the app
- [ ] Toaster uses shadcn wrapper (`@/components/ui/sonner`)
- [ ] Position is top-right with richColors enabled
- [ ] No duplicate ThemeProvider wrapping
- [ ] Login errors show single toast notification
- [ ] `pnpm typecheck` passes
</success_criteria>

<output>
After completion, create `.planning/quick/003-fix-duplicate-toasts-login-error/003-SUMMARY.md`
</output>
