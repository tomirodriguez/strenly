---
type: quick
plan: 002
title: "Fix Onboarding Flow - Coach Type, Plan Selection, Org Routing"
subsystem: auth, onboarding, routing
tags: [onboarding, subscription, routing, multi-tenant]
completed: 2026-01-24
duration: 7 min

dependency-graph:
  requires:
    - phase-01 (subscriptions domain)
    - phase-02.5 (coach-web foundation)
  provides:
    - createSubscription procedure
    - multi-step onboarding wizard
    - URL-based org slug routing
  affects:
    - all authenticated routes use /$orgSlug/* pattern
    - X-Organization-Slug header from URL param

tech-stack:
  added: []
  patterns:
    - state-machine-wizard
    - url-based-multi-tenancy

key-files:
  created:
    - packages/contracts/src/subscriptions/index.ts
    - packages/backend/src/use-cases/subscriptions/create-subscription.ts
    - packages/backend/src/procedures/subscriptions/create-subscription.ts
    - apps/coach-web/src/features/auth/components/coach-type-step.tsx
    - apps/coach-web/src/features/auth/components/plan-selection-step.tsx
    - apps/coach-web/src/features/auth/components/org-form-step.tsx
    - apps/coach-web/src/routes/_authenticated/$orgSlug.tsx
    - apps/coach-web/src/routes/_authenticated/$orgSlug/dashboard.tsx
    - apps/coach-web/src/routes/_authenticated/$orgSlug/athletes.tsx
    - apps/coach-web/src/routes/_authenticated/$orgSlug/exercises.tsx
  modified:
    - packages/core/src/ports/subscription-repository.port.ts
    - packages/backend/src/infrastructure/repositories/subscription.repository.ts
    - packages/backend/src/procedures/subscriptions/index.ts
    - packages/contracts/package.json
    - apps/coach-web/src/features/auth/views/onboarding-view.tsx
    - apps/coach-web/src/routes/_authenticated.tsx
    - apps/coach-web/src/routes/index.tsx
    - apps/coach-web/src/routes/_auth.tsx
    - apps/coach-web/src/components/layout/app-sidebar.tsx

decisions:
  - id: session-procedure-for-create-subscription
    decision: Use sessionProcedure for createSubscription
    reason: User is authenticated but no org context yet during onboarding
    alternatives: authProcedure (requires org context), publicProcedure (no auth)
  - id: window-location-redirect
    decision: Use window.location.href for post-onboarding redirect
    reason: TanStack Router route tree needs regeneration for dynamic routes
    alternatives: navigate() with params (type errors before route tree update)
  - id: always-set-active-org
    decision: Always set active org in $orgSlug beforeLoad
    reason: Simpler than checking current active org, ensures consistency
    alternatives: Check active org and only set if different

metrics:
  tasks_completed: 3
  tasks_total: 3
---

# Quick Task 002: Fix Onboarding Flow Summary

Multi-step onboarding wizard with coach type selection, plan selection, org creation, and URL-based org routing.

## One-liner

Full onboarding flow: coach type -> plan selection -> org creation with subscription atomically, all routes prefixed with /$orgSlug.

## What Was Done

### Task 1: Create subscription procedure for onboarding

Added the ability to create subscriptions during onboarding:

- Extended `SubscriptionRepositoryPort` with `create()` method
- Implemented `create()` in subscription repository
- Added `createSubscriptionInputSchema` to contracts
- Created `makeCreateSubscription` use case
- Created `createSubscription` procedure using `sessionProcedure`

Key decisions:
- Used `sessionProcedure` since user is authenticated but has no org context yet
- 30-day subscription period starting from creation time

### Task 2: Build multi-step onboarding wizard

Created a 3-step wizard for new user onboarding:

1. **Coach Type Step**: Choose between "Coach Individual" or "Gimnasio / Equipo"
2. **Plan Selection Step**: View available plans filtered by coach type, select one
3. **Org Form Step**: Enter organization name and slug

The wizard:
- Maintains state across steps
- Allows going back to previous steps
- Shows progress indicator (1/3, 2/3, 3/3)
- Creates organization and subscription atomically on submit
- Redirects to `/$orgSlug/dashboard` after completion

### Task 3: Implement URL-based org slug routing

Restructured routing to use URL-based organization context:

- Created `/_authenticated/$orgSlug.tsx` layout that validates org access
- Moved dashboard, athletes, exercises routes under `$orgSlug`
- Updated all navigation links to include org slug
- Root redirect (`/`) now goes to first org's dashboard or onboarding
- Auth routes redirect authenticated users to correct org-prefixed route

The `$orgSlug` layout:
- Validates user has access to the org in URL
- Sets active organization in Better-Auth
- Syncs `X-Organization-Slug` header with API client

## Verification

1. `pnpm typecheck` passes
2. All 3 tasks committed atomically
3. User flow: signup -> coach type -> plan -> org -> /$orgSlug/dashboard

## Deviations from Plan

None - plan executed exactly as written.

## Files Changed

### Backend (7 files)

| File | Change |
|------|--------|
| `packages/core/src/ports/subscription-repository.port.ts` | Added `create()` method |
| `packages/backend/src/infrastructure/repositories/subscription.repository.ts` | Implemented `create()` |
| `packages/contracts/src/subscriptions/index.ts` | Created with `createSubscriptionInputSchema` |
| `packages/contracts/package.json` | Added `./subscriptions` export |
| `packages/backend/src/use-cases/subscriptions/create-subscription.ts` | Created use case |
| `packages/backend/src/procedures/subscriptions/create-subscription.ts` | Created procedure |
| `packages/backend/src/procedures/subscriptions/index.ts` | Added to router |

### Frontend (14 files)

| File | Change |
|------|--------|
| `apps/coach-web/src/features/auth/components/coach-type-step.tsx` | Created |
| `apps/coach-web/src/features/auth/components/plan-selection-step.tsx` | Created |
| `apps/coach-web/src/features/auth/components/org-form-step.tsx` | Created |
| `apps/coach-web/src/features/auth/views/onboarding-view.tsx` | Refactored to wizard |
| `apps/coach-web/src/routes/_authenticated/$orgSlug.tsx` | Created layout |
| `apps/coach-web/src/routes/_authenticated/$orgSlug/dashboard.tsx` | Moved |
| `apps/coach-web/src/routes/_authenticated/$orgSlug/athletes.tsx` | Moved |
| `apps/coach-web/src/routes/_authenticated/$orgSlug/exercises.tsx` | Moved |
| `apps/coach-web/src/routes/_authenticated.tsx` | Removed org sync |
| `apps/coach-web/src/routes/index.tsx` | Updated redirect logic |
| `apps/coach-web/src/routes/_auth.tsx` | Updated redirect logic |
| `apps/coach-web/src/components/layout/app-sidebar.tsx` | Updated links |
| `apps/coach-web/src/features/auth/views/login-view.tsx` | Updated redirect |
| `apps/coach-web/src/features/dashboard/components/*.tsx` | Updated links |

## Commits

| Task | Hash | Message |
|------|------|---------|
| 1 | `e1c4fcc` | feat(quick-002): create subscription procedure for onboarding |
| 2 | `3a76bba` | feat(quick-002): build multi-step onboarding wizard |
| 3 | `891b832` | feat(quick-002): implement URL-based org slug routing |
