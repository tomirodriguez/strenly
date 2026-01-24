# Phase 2: Exercise Library & Athlete Management - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Coaches can manage athlete profiles within their organization and access a comprehensive exercise library. Athletes can link their user accounts to profiles via invitation links. This phase does NOT include program creation, workout logging, or analytics — those are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Athlete Profiles
- Rich profile data: name (required), email, phone, birthdate, gender (optional), notes
- Avatar from linked account (Google/auth provider), initials placeholder if none
- Status: Active / Inactive (simple toggle — inactive hides from main views, preserves history)
- No delete — only archive (set to inactive)
- Shared within org — all coaches can view/manage any athlete
- Table list view with sortable columns (not card grid)
- Search by name + filter by status (active/inactive dropdown)
- Full page detail view with tabs: Profile, Programs, History
- No body metrics in profile (future phase)
- Dates in user's locale format
- Gender is optional

### Invitation Flow
- Copy link only — coach copies and sends via their own channel (WhatsApp, email, etc.)
- Links expire after 7 days — coach can regenerate
- Coach can regenerate or explicitly revoke links
- Athlete opens link in PWA (not web) — dedicated `/invite/{token}` route
- Inline sign-up on invite page if not logged in
- Show org name + coach name on invite page before linking
- If already logged in: show confirmation before linking
- Athletes can join multiple orgs (same user account links to different athlete profiles)
- Coach can unlink an athlete's account (revert to coach-managed)
- Show pending/linked badge on athlete list
- Post-link: onboarding for first-time users, straight to home for returning users

### Exercise Structure
- Categorization: muscle groups + movement patterns (no equipment in exercise definition)
- External video links for demos (YouTube/Vimeo URLs)
- Major muscle groups (8-10): Chest, Back, Shoulders, Biceps, Triceps, Quads, Hamstrings, Glutes, Core, Calves
- Movement patterns (Basic 6): Push, Pull, Hinge, Squat, Carry, Core
- Primary + secondary muscle groups per exercise
- Linked progressions (exercises link to easier/harder variations)
- Show related exercises when viewing an exercise
- Laterality flag (unilateral vs bilateral)
- Optional description field for instructions
- Search + filters (text search + filter by muscle group and movement pattern)
- Curated and custom exercises mixed together (badge distinguishes them)
- Seed database with 50-100 common strength exercises

### Custom Exercises
- Any coach in org can create custom exercises
- Org-wide visibility — all coaches see all custom exercises
- Full edit by any coach (no creator-only restriction)
- No delete, only archive
- Can link to any exercise (curated or custom) as progressions
- Can clone curated exercises to customize
- Minimal required fields — only name required, categorization optional

### Claude's Discretion
- Clone provenance tracking (whether cloned exercises link back to original)
- Exercise detail page layout
- Muscle group and pattern icons/colors
- Empty state designs
- Error message wording

</decisions>

<specifics>
## Specific Ideas

- Linking happens entirely within the PWA — coach shares link, athlete opens on mobile
- First-time users see onboarding after linking, returning users go straight to home
- Table view for athletes (coach web) — optimized for large rosters
- "Join [Org Name] with Coach [Name]" shown before athlete creates account

</specifics>

<deferred>
## Deferred Ideas

- Body metrics tracking (height, weight, time-series) — future phase
- Email invitations sent by system — keep copy-link only for now
- Equipment categorization on exercises — may add later for filtering

</deferred>

---

*Phase: 02-exercise-library-athlete-management*
*Context gathered: 2026-01-23*
