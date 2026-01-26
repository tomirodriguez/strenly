---
phase: quick
plan: 014
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/coach-web/src/features/athletes/components/invitation-modal.tsx
autonomous: true

must_haves:
  truths:
    - "Modal shows single 'Invitar' button that generates or regenerates invitation"
    - "Invitation URL is truncated with ellipsis in the middle for readability"
    - "Copy functionality still works with full URL"
  artifacts:
    - path: "apps/coach-web/src/features/athletes/components/invitation-modal.tsx"
      provides: "Unified invitation action and truncated URL display"
---

<objective>
Fix the invitation modal UX to have a unified "Invitar" action button and truncate the displayed URL for better readability.

Purpose: Currently the modal has two separate buttons ("Generar invitacion" when no invitation exists, "Regenerar invitacion" when one exists). This should be unified into a single "Invitar" action that works in both cases. Additionally, the full URL is hard to read - it should be truncated with ellipsis in the middle while still copying the full URL.

Output: Improved invitation modal with unified action and truncated URL display.
</objective>

<context>
@apps/coach-web/src/features/athletes/components/invitation-modal.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Unify invitation action and truncate URL display</name>
  <files>apps/coach-web/src/features/athletes/components/invitation-modal.tsx</files>
  <action>
  Update the InvitationModal component with these changes:

  1. **Unified "Invitar" button**: Replace the two separate buttons with a single button that:
     - Shows "Invitar" (not "Generar invitacion" or "Regenerar invitacion")
     - Appears in both error state (no invitation) and when invitation exists with status !== 'accepted'
     - Calls the same handleRegenerate function (generateMutation handles both cases)
     - Position it consistently at the bottom of the modal content

  2. **Truncate URL display**: Create a helper function to truncate the URL:
     ```typescript
     function truncateUrl(url: string, maxLength = 50): string {
       if (url.length <= maxLength) return url
       const start = url.slice(0, 25)
       const end = url.slice(-20)
       return `${start}...${end}`
     }
     ```
     - Display truncated URL in the code block
     - Keep full URL for clipboard copy (handleCopy already uses invitation.invitationUrl)

  3. **Simplify error state**: When there's no invitation (error state), show:
     - "No hay invitacion activa para este atleta." message
     - The unified "Invitar" button (same as regenerate case)

  4. **Keep existing functionality**:
     - Badge showing invitation status
     - Expiration date display
     - Copy button functionality
     - Accepted date message for accepted invitations
  </action>
  <verify>
  - pnpm typecheck (no type errors)
  - pnpm lint (no lint errors)
  - Visual verification: Open modal for athlete, see single "Invitar" button
  - Visual verification: URL is truncated with ellipsis in middle
  - Functional verification: Copy button still copies full URL
  </verify>
  <done>
  - Modal shows single "Invitar" button in both error and invitation states
  - URL displays truncated (e.g., "https://app.strenly.com/...abc123")
  - Copy functionality works with full URL
  - Typecheck and lint pass
  </done>
</task>

</tasks>

<verification>
```bash
pnpm typecheck && pnpm lint
```
</verification>

<success_criteria>
- Unified "Invitar" button replaces "Generar invitacion" and "Regenerar invitacion"
- URL truncated with ellipsis for readability
- Full URL still copied to clipboard
- No type or lint errors
</success_criteria>

<output>
After completion, create `.planning/quick/014-fix-invitation-modal-unified-invitar-act/014-SUMMARY.md`
</output>
