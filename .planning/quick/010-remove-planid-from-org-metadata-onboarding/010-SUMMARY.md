---
phase: quick-010
plan: 01
subsystem: auth
tags: [better-auth, cleanup, dead-code]

dependency-graph:
  requires: []
  provides:
    - Clean Better-Auth configuration without dead subscription logic
  affects: []

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - packages/auth/src/auth.ts

decisions:
  - key: subscription-creation-flow
    choice: oRPC procedure only
    reason: Frontend creates orgs without planId in metadata and calls createSubscription via oRPC

metrics:
  duration: 1 min
  completed: 2026-01-25
---

# Quick Task 010: Remove planId from Org Metadata Onboarding Summary

**One-liner:** Removed dead subscription creation logic from Better-Auth afterCreateOrganization hook that was logging misleading errors.

## What Was Done

### Task 1: Remove planId subscription logic from afterCreateOrganization hook

**Changes to `packages/auth/src/auth.ts`:**

1. Removed unused imports:
   - `eq` from `@strenly/database`
   - `plans, subscriptions` from `@strenly/database/schemas`

2. Removed dead code from `afterCreateOrganization` hook:
   - Metadata type assertion and planId extraction
   - Early return when planId is missing (was logging errors)
   - Plan lookup query
   - Subscription insert

3. Replaced with a comment explaining the actual flow:
   ```typescript
   // Subscription creation handled by oRPC createSubscription procedure after org creation
   ```

**Why this was dead code:**
- The frontend creates organizations without `planId` in metadata
- After org creation, the frontend calls the `createSubscription` oRPC procedure
- The hook was just logging `[auth] No planId in organization metadata for org:` errors and returning early

## Verification

- `pnpm typecheck` on auth package: Passed
- `pnpm lint`: Passed
- `grep -r "planId" packages/auth/`: No results (verified removal)

## Commits

| Hash | Message |
|------|---------|
| a20679a | fix(quick-010): remove dead planId subscription logic from auth hook |

## Deviations from Plan

None - plan executed exactly as written.

## Lines Changed

- **packages/auth/src/auth.ts**: -33 lines (removed dead code), +1 line (comment)
