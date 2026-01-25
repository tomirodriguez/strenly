---
phase: quick
plan: 014
subsystem: frontend-coach
tags: [modal, invitation, ux]

dependency-graph:
  requires: [quick-011]
  provides: [unified-invitation-action, truncated-url-display]
  affects: []

tech-stack:
  added: []
  patterns: [helper-functions-for-ui-formatting]

key-files:
  created: []
  modified:
    - apps/coach-web/src/features/athletes/components/invitation-modal.tsx

decisions:
  - id: truncate-url-with-ellipsis
    choice: "Use start...end truncation pattern (25+...+20 chars)"
    rationale: "Shows domain and unique token end while keeping display compact"

metrics:
  duration: 1 min
  completed: 2026-01-25
---

# Quick Task 014: Fix Invitation Modal UX Summary

Unified invitation action button and improved URL display readability.

## One-liner

Single "Invitar" button replaces generate/regenerate with truncated URL display (start...end pattern).

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 6c7ecb8 | fix | Unify invitation action and truncate URL display |

## Changes Made

### Task 1: Unify invitation action and truncate URL display

**What was done:**
1. Added `truncateUrl` helper function that shows first 25 and last 20 characters with ellipsis
2. Changed both button labels from "Generar invitacion" (error state) and "Regenerar invitacion" (existing invitation state) to unified "Invitar"
3. Updated URL display to use truncated version
4. Copy functionality continues to use full URL

**Files modified:**
- `apps/coach-web/src/features/athletes/components/invitation-modal.tsx`

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript: All type checks pass
- Lint: No lint errors

## Artifacts Created

| File | Purpose |
|------|---------|
| `apps/coach-web/src/features/athletes/components/invitation-modal.tsx` | Updated invitation modal with unified action and truncated URL |
