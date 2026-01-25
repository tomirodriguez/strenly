---
status: diagnosed
trigger: "Investigate the invitation links UX issue: After generating an invitation link, success toast appears, link is copied, but there's no way to view previously generated links. Coach must regenerate if they lose the link."
created: 2026-01-25T12:00:00Z
updated: 2026-01-25T12:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - Invitation data IS stored in DB but NOT exposed to frontend for viewing
test: Traced full data flow from DB schema to UI components
expecting: N/A - Root cause confirmed
next_action: Document findings and recommended solution

## Symptoms

expected: After generating invitation link, coach should be able to view/copy existing invitations
actual: Success toast appears, link copied, but no way to view previously generated links
errors: N/A (UX issue, not error)
reproduction: Generate invitation for athlete, close toast, try to find the link again
started: Always this way (missing feature)

## Eliminated

## Evidence

- timestamp: 2026-01-25T12:05:00Z
  checked: Database schema (athlete-invitations.ts)
  found: Full invitation data stored including token, expiresAt, acceptedAt, revokedAt, createdAt
  implication: Backend HAS the data needed to show invitation history

- timestamp: 2026-01-25T12:06:00Z
  checked: generateInvitation use case
  found: Returns { invitation, invitationUrl } but invitation object is not passed to frontend
  implication: Use case already returns full invitation data, just not used by UI

- timestamp: 2026-01-25T12:07:00Z
  checked: generateInvitation procedure output schema (contracts/athletes/invitation.ts)
  found: generateInvitationOutputSchema only exports { invitationUrl: string }
  implication: Contract deliberately limits what's returned to frontend

- timestamp: 2026-01-25T12:08:00Z
  checked: useGenerateInvitation hook
  found: Only uses data.invitationUrl for clipboard copy, shows toast, invalidates queries
  implication: Frontend only receives URL, no invitation metadata

- timestamp: 2026-01-25T12:09:00Z
  checked: Athlete contract schema (contracts/athletes/athlete.ts)
  found: Athlete schema does NOT include invitation details (no invitationStatus, invitationUrl, etc.)
  implication: Athletes list query returns no invitation data for display

- timestamp: 2026-01-25T12:10:00Z
  checked: InvitationStatus component
  found: Only checks linkedUserId to show "Aceptada" or "Sin invitar" - no pending/expired states
  implication: UI cannot show actual invitation status without invitation data

- timestamp: 2026-01-25T12:11:00Z
  checked: Athletes table row actions
  found: Only action is "Generar invitacion" - no "Ver invitacion" or "Copiar enlace" option
  implication: No UI path to retrieve existing invitation

- timestamp: 2026-01-25T12:12:00Z
  checked: Repository port (athlete-invitation-repository.port.ts)
  found: findByAthleteId(ctx, athleteId) exists - can fetch active invitation for an athlete
  implication: Backend capability exists to retrieve invitation, just not exposed via API

- timestamp: 2026-01-25T12:13:00Z
  checked: Procedures router (athletes/index.ts)
  found: Only invitation-related endpoints are generateInvitation and invitationInfo (public, token-based)
  implication: No authenticated endpoint to get athlete's invitation by athleteId

## Resolution

root_cause: |
  The invitation system stores complete invitation data in the database but the frontend has no way to access it after generation because:

  1. **Missing API endpoint**: No procedure exists to fetch an athlete's current invitation by athleteId (only token-based public lookup for acceptance flow)

  2. **Incomplete contract**: The Athlete schema doesn't include invitation details, so the list athletes query returns no invitation status

  3. **Limited UI**: InvitationStatus component only shows binary state (linked vs not linked), cannot show pending/expired invitations

  4. **No view invitation action**: Row actions only offer "Generate invitation", not "View/Copy existing invitation"

fix:
verification:
files_changed: []
