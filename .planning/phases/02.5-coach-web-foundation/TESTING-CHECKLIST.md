# Phase 2.5 Testing Checklist

## Prerequisites
- [ ] Database running (`pnpm db:start`)
- [ ] Database seeded (`pnpm db:seed`)
- [ ] Server running (`pnpm dev:server`)
- [ ] Coach web running (`pnpm dev:coach`)

---

## 1. App Shell (Plan 02.5-01)
- [ ] App starts without console errors
- [ ] Unauthenticated → redirects to `/login`
- [ ] Sidebar shows: Dashboard, Athletes, Exercises
- [ ] Sidebar collapse/expand works
- [ ] Sidebar state persists after page reload
- [ ] User menu opens with avatar click
- [ ] Theme toggle (Light/Dark/System) works
- [ ] Logout redirects to `/login`
- [ ] Breadcrumbs show current path

## 2. Auth Flows (Plan 02.5-03)
- [ ] `/signup` → create account with email/password
- [ ] `/signup` → Google OAuth button visible (if enabled)
- [ ] `/signup` → redirects to `/onboarding` after signup
- [ ] `/login` → login with email/password
- [ ] `/login` → "Remember me" checkbox present
- [ ] `/login` → redirects to `/dashboard` (if has org) or `/onboarding` (if no org)
- [ ] `/onboarding` → create organization with name
- [ ] `/onboarding` → slug auto-generates from name
- [ ] `/onboarding` → redirects to `/dashboard` after org creation
- [ ] Auth errors show as toast notifications
- [ ] Already authenticated → `/login` redirects to `/dashboard`

## 3. Athletes Management (Plan 02.5-04)
- [ ] `/athletes` → list loads with pagination
- [ ] Search filters athletes by name (debounced)
- [ ] "Show archived" toggle works
- [ ] "Add Athlete" button opens drawer
- [ ] Create athlete form validates required fields
- [ ] Create athlete → list refreshes
- [ ] Edit athlete (row action) → form pre-fills
- [ ] Update athlete → list refreshes
- [ ] Archive athlete (row action) → confirmation → removes from list
- [ ] Generate invitation (row action) → copies link to clipboard
- [ ] Toast shows "Invitation link copied!"
- [ ] Invitation status badges: Not invited, Pending, Accepted, Expired

## 4. Exercises Browser (Plan 02.5-05)
- [ ] `/exercises` → list loads with pagination (25 per page)
- [ ] Search filters exercises by name
- [ ] Muscle group dropdown filters work
- [ ] Movement pattern dropdown filters work
- [ ] Filters can be combined
- [ ] Page resets to 1 when filters change
- [ ] "Curated" badge shows for curated exercises
- [ ] "Custom" badge shows for custom exercises
- [ ] Primary muscles show as default badges
- [ ] Secondary muscles show as outline badges

## 5. Dashboard (Plan 02.5-06)
- [ ] `/` → redirects to `/dashboard` (authenticated)
- [ ] `/` → redirects to `/login` (unauthenticated)
- [ ] Welcome message shows organization name
- [ ] Stats cards: Total Athletes, Active Athletes, Pending Invitations
- [ ] Recent Activity shows last 5 athletes
- [ ] "View all" link goes to `/athletes`
- [ ] Quick Actions: "Manage Athletes" → `/athletes`
- [ ] Quick Actions: "Browse Exercises" → `/exercises`

---

## Quality Checks
- [ ] `pnpm typecheck` — no errors
- [ ] `pnpm lint` — no errors
- [ ] No console errors in browser
- [ ] Responsive layout works (1024px+ desktop)

---

*Generated from Phase 2.5 plans - 2026-01-24*
