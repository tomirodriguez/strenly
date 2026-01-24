# Quick Task 004: Summary

## Fix Onboarding Infinite Loop

**Problem:** After signing in/up, users got stuck in an infinite loop on `/onboarding` with repeated API calls to `organization/list` and `get-session`.

**Root Cause:** `/onboarding` was nested under `_auth` layout, which redirects authenticated users to `/onboarding`, creating a redirect loop.

**Solution:** Moved `/onboarding` to a standalone route outside `_auth` layout.

### Changes

| Action | File |
|--------|------|
| Created | `apps/coach-web/src/routes/onboarding.tsx` |
| Deleted | `apps/coach-web/src/routes/_auth/onboarding.tsx` |

### New Route Behavior

The new standalone `/onboarding` route:
1. Checks authentication (redirects to `/login` if not authenticated)
2. Checks if user already has orgs (redirects to dashboard if yes)
3. Renders `OnboardingView` component for users without orgs

### Verification

- [x] Typecheck passes
- [x] New file lint clean
- [x] Route no longer under `_auth` layout
