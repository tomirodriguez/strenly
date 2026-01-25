---
phase: quick
plan: 016
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/features/athletes/components/athletes-table.tsx
  - apps/coach-web/src/features/athletes/components/invitation-modal.tsx
  - apps/coach-web/src/features/athletes/views/athletes-list-view.tsx
autonomous: true

must_haves:
  truths:
    - "Single 'Invitacion' action in row dropdown opens invitation modal"
    - "Modal shows skeleton loading instead of 'Cargando...' text"
    - "Button shows 'Regenerar Invitacion' when invitation exists, 'Generar Invitacion' when none"
  artifacts:
    - path: "apps/coach-web/src/features/athletes/components/athletes-table.tsx"
      provides: "Unified invitation action"
    - path: "apps/coach-web/src/features/athletes/components/invitation-modal.tsx"
      provides: "Skeleton loading and contextual button label"
  key_links:
    - from: "athletes-table.tsx"
      to: "invitation-modal.tsx"
      via: "onInvitation callback opens modal"
---

<objective>
Fix invitation action UX on athletes tables: unify "Ver invitacion" and "Generar invitacion" into a single "Invitacion" action. Replace "Cargando..." text with skeleton loading. Rename button label based on context - "Generar Invitacion" when no invitation exists, "Regenerar Invitacion" when one already exists.

Purpose: Cleaner, more intuitive invitation management UX
Output: Unified invitation workflow with proper loading states
</objective>

<execution_context>
@/Users/tomiardz/.claude/get-shit-done/workflows/execute-plan.md
@/Users/tomiardz/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/coach-web/src/features/athletes/components/athletes-table.tsx
@apps/coach-web/src/features/athletes/components/invitation-modal.tsx
@apps/coach-web/src/features/athletes/views/athletes-list-view.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Unify invitation action in table and simplify view handlers</name>
  <files>
    apps/coach-web/src/features/athletes/components/athletes-table.tsx
    apps/coach-web/src/features/athletes/views/athletes-list-view.tsx
  </files>
  <action>
1. In athletes-table.tsx:
   - Remove `onViewInvitation` and `onInvite` props
   - Add single `onInvitation: (athlete: Athlete) => void` prop
   - Replace the two invitation actions with single action:
     ```typescript
     {
       label: 'Invitacion',
       icon: Mail, // or appropriate icon
       onClick: onInvitation,
     }
     ```
   - Update AthletesTableProps type accordingly

2. In athletes-list-view.tsx:
   - Remove `handleInvite` function
   - Remove `handleViewInvitation` function
   - Remove `generateInvitationMutation` import and usage (invitation generation is handled in modal)
   - Create single `handleInvitation` that sets `setInvitationAthlete(athlete)`
   - Update AthletesTable usage to use `onInvitation={handleInvitation}`
  </action>
  <verify>TypeScript compiles with `pnpm typecheck`</verify>
  <done>Single "Invitacion" action in dropdown, view has single handler</done>
</task>

<task type="auto">
  <name>Task 2: Add skeleton loading and contextual button label to modal</name>
  <files>apps/coach-web/src/features/athletes/components/invitation-modal.tsx</files>
  <action>
1. Replace loading text with skeleton:
   - Import Skeleton from '@/components/ui/skeleton'
   - Replace `{isLoading && <p className="text-muted-foreground text-sm">Cargando...</p>}` with skeleton UI:
     ```tsx
     {isLoading && (
       <div className="space-y-4">
         <div className="flex items-center gap-2">
           <Skeleton className="h-4 w-16" />
           <Skeleton className="h-5 w-20" />
         </div>
         <div className="space-y-1">
           <Skeleton className="h-4 w-12" />
           <Skeleton className="h-4 w-48" />
         </div>
         <div className="space-y-2">
           <Skeleton className="h-4 w-28" />
           <Skeleton className="h-10 w-full" />
         </div>
       </div>
     )}
     ```

2. Change button label from "Invitar" to contextual:
   - When error (no invitation): "Generar Invitacion"
   - When invitation exists and status !== 'accepted': "Regenerar Invitacion"
   - Update both Button components in the modal
  </action>
  <verify>Open modal for athlete without invitation - shows "Generar Invitacion". Open modal for athlete with invitation - shows "Regenerar Invitacion". Loading state shows skeletons.</verify>
  <done>Modal uses skeleton loading and shows contextual button labels</done>
</task>

</tasks>

<verification>
1. Open athletes page
2. Click row actions dropdown - should show single "Invitacion" action (not two)
3. Click "Invitacion" for athlete without invitation - modal opens, shows skeleton briefly, then shows "Generar Invitacion" button
4. Click "Invitacion" for athlete with pending invitation - modal shows skeleton, then invitation details with "Regenerar Invitacion" button
5. `pnpm typecheck && pnpm lint` passes
</verification>

<success_criteria>
- Single "Invitacion" action in row dropdown (not "Ver invitacion" + "Generar invitacion")
- Modal loading state uses Skeleton components, not "Cargando..." text
- Button label is "Generar Invitacion" when no invitation exists
- Button label is "Regenerar Invitacion" when invitation already exists
- TypeScript and lint pass
</success_criteria>

<output>
After completion, create `.planning/quick/016-fix-invitation-modal-unified-action-skeleton-loading/016-SUMMARY.md`
</output>
