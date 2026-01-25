---
phase: quick
plan: 016
subsystem: coach-web/athletes
tags: [ux, invitation, modal, skeleton, loading]
dependency-graph:
  requires: [quick-014]
  provides: [unified-invitation-action, skeleton-loading]
  affects: []
tech-stack:
  added: []
  patterns: [skeleton-loading, contextual-labels]
key-files:
  created: []
  modified:
    - apps/coach-web/src/features/athletes/components/athletes-table.tsx
    - apps/coach-web/src/features/athletes/components/invitation-modal.tsx
    - apps/coach-web/src/features/athletes/views/athletes-list-view.tsx
decisions: []
metrics:
  duration: 2 min
  completed: 2026-01-25
---

# Quick Task 016: Fix Invitation Modal UX Summary

Unified invitation action in table dropdown and improved modal loading UX with skeletons and contextual button labels.

## What Was Built

### Task 1: Unified Invitation Action
- Replaced two separate actions ("Ver invitacion" + "Generar invitacion") with single "Invitacion" action
- Changed icon from Copy/Eye to Mail for clearer semantics
- Simplified view handlers: removed `handleInvite` and `handleViewInvitation`, now using single `handleInvitation`
- Removed `generateInvitationMutation` from view (generation is handled entirely in modal)

### Task 2: Skeleton Loading and Contextual Labels
- Replaced "Cargando..." text with Skeleton components matching modal content structure
- Button label now shows "Generar Invitacion" when no invitation exists (error state)
- Button label shows "Regenerar Invitacion" when invitation already exists

## Key Changes

**athletes-table.tsx:**
- `onInvite` + `onViewInvitation` props replaced with single `onInvitation`
- Actions array reduced from 4 to 3 items (Editar, Invitacion, Archivar)

**athletes-list-view.tsx:**
- Removed `useGenerateInvitation` import and mutation
- Single `handleInvitation` function that opens modal

**invitation-modal.tsx:**
- Added `Skeleton` import from UI components
- Loading state renders skeleton structure instead of text
- Contextual button labels based on invitation existence

## Verification

- Single "Invitacion" action in row dropdown
- Modal shows skeleton loading during fetch
- Button shows "Generar Invitacion" for no invitation
- Button shows "Regenerar Invitacion" when invitation exists
- TypeScript and lint pass

## Commits

| Commit | Description |
|--------|-------------|
| ae7aba0 | Unify invitation action in table and simplify view handlers |
| a47b32b | Add skeleton loading and contextual button labels to modal |

## Deviations from Plan

None - plan executed exactly as written.
