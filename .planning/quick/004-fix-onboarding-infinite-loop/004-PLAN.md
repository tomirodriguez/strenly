# Quick Task 004: Fix Onboarding Infinite Loop

## Problem

After signing in or signing up, users get stuck in an infinite loop when redirected to `/onboarding`:
- Repeated calls to `/api/auth/organization/list` and `/api/auth/get-session`
- Page never loads, browser hangs

## Root Cause

The `/onboarding` route was nested under the `_auth` layout (`/_auth/onboarding`):

1. `_auth.tsx` has `beforeLoad` that redirects authenticated users without orgs to `/onboarding`
2. When visiting `/onboarding`, the `_auth.tsx` `beforeLoad` runs again
3. User is authenticated with no orgs → redirect to `/onboarding`
4. Infinite loop

## Solution

Move `/onboarding` outside of the `_auth` layout to be a standalone route at `/onboarding`.

## Tasks

1. **Create new standalone onboarding route**
   - File: `apps/coach-web/src/routes/onboarding.tsx`
   - Auth check in its own `beforeLoad`
   - Redirect to dashboard if user already has orgs (prevents accessing onboarding twice)

2. **Delete old nested route**
   - Remove: `apps/coach-web/src/routes/_auth/onboarding.tsx`

## Files Changed

- `apps/coach-web/src/routes/onboarding.tsx` (created)
- `apps/coach-web/src/routes/_auth/onboarding.tsx` (deleted)
