---
phase: 01-foundation-multi-tenancy
plan: 01
subsystem: database, auth
tags: [drizzle, better-auth, postgresql, neon, organization-plugin]

# Dependency graph
requires: []
provides:
  - Database schema for Better-Auth (users, sessions, accounts, verifications)
  - Database schema for organizations and members
  - Database schema for subscription plans
  - Better-Auth factory function with organization plugin
affects: [01-02, 01-03, 01-04, 01-05]

# Tech tracking
tech-stack:
  added: [drizzle-orm, better-auth, @neondatabase/serverless]
  patterns: [factory-function, cloudflare-workers-compatibility]

key-files:
  created:
    - packages/database/src/schema/auth.ts
    - packages/database/src/schema/plans.ts
    - packages/database/src/schema/subscriptions.ts
    - packages/database/drizzle.config.ts
    - packages/auth/src/auth.ts
    - packages/auth/src/index.ts
  modified: []

key-decisions:
  - "Used factory function pattern for Better-Auth to support Cloudflare Workers env bindings"
  - "Email/password enabled with note about scrypt CPU limits on Workers free tier"
  - "Organization plugin auto-creates subscription on org creation via hook"
  - "Added organizationType enum to plans table for coach_solo vs gym distinction"

patterns-established:
  - "Factory pattern: createAuth(env, db) for edge runtime compatibility"
  - "Schema exports via barrel file (exception allowed for schema aggregation)"
  - "Cloudflare Workers types via @cloudflare/workers-types"

# Metrics
duration: 4min
completed: 2026-01-23
---

# Phase 1 Plan 01: Database Schema + Better-Auth Setup Summary

**Drizzle schema for Better-Auth with organization plugin and subscription management, plus factory-based auth configuration for Cloudflare Workers**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-23T22:24:51Z
- **Completed:** 2026-01-23T22:29:15Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- Created complete Better-Auth database schema (users, sessions, accounts, verifications, organizations, members, invitations)
- Created subscription management schema (plans with organization types, subscriptions with status tracking)
- Configured Better-Auth factory function with email/password, Google OAuth, and organization plugin
- Established monorepo structure with pnpm workspaces and turbo

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Database Schema for Auth and Organizations** - `0727484` (feat)
2. **Task 2: Configure Better-Auth Factory with Organization Plugin** - `ef2e683` (feat)

## Files Created/Modified

- `packages/database/src/schema/auth.ts` - Better-Auth tables (users, sessions, accounts, verifications, organizations, members, invitations)
- `packages/database/src/schema/plans.ts` - Subscription plans with organization type enum
- `packages/database/src/schema/subscriptions.ts` - Organization subscriptions with status enum
- `packages/database/src/schema/index.ts` - Schema exports for Drizzle adapter
- `packages/database/drizzle.config.ts` - Drizzle Kit configuration
- `packages/database/src/client.ts` - Database client factory for Neon
- `packages/auth/src/auth.ts` - createAuth factory function with organization plugin
- `packages/auth/src/index.ts` - Auth package exports
- `package.json` - Root monorepo package
- `pnpm-workspace.yaml` - Workspace configuration
- `turbo.json` - Turbo task configuration

## Decisions Made

1. **Factory pattern for auth:** Used `createAuth(env, db)` pattern because Cloudflare Workers environment variables are not available at module scope
2. **Email/password enabled:** Enabled with note about scrypt CPU limits on Workers free tier (may need paid tier or Email OTP)
3. **Organization type in plans:** Added `organizationType` enum to plans table to distinguish coach_solo vs gym plans
4. **Auto-subscription on org creation:** Organization plugin hook creates subscription record when organization is created

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created monorepo structure**
- **Found during:** Task 1 (Create Database Schema)
- **Issue:** Plan assumed packages/database directory existed, but project had no monorepo structure
- **Fix:** Created root package.json, pnpm-workspace.yaml, turbo.json, and package directories
- **Files modified:** package.json, pnpm-workspace.yaml, turbo.json, packages/database/package.json, packages/auth/package.json
- **Verification:** pnpm install succeeded, typecheck passes
- **Committed in:** 0727484 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Essential for plan execution. No scope creep.

## Issues Encountered

None - plan executed successfully after creating monorepo structure.

## User Setup Required

**External services require manual configuration.** See plan frontmatter `user_setup` section for:

- **Google OAuth:** Create OAuth 2.0 Client ID in Google Cloud Console, add redirect URIs
- **Better-Auth:** Generate BETTER_AUTH_SECRET with `openssl rand -base64 32`, set BETTER_AUTH_URL

Environment variables needed:
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `BETTER_AUTH_SECRET` - Generate with openssl
- `BETTER_AUTH_URL` - http://localhost:8787 for dev

## Next Phase Readiness

- Database schema ready for `db:push` once DATABASE_URL is configured
- Better-Auth factory ready for Hono integration in 01-02
- Organization plugin configured with roles (owner/admin/member)
- Subscription auto-creation hook ready for plan selection flow

---
*Phase: 01-foundation-multi-tenancy*
*Completed: 2026-01-23*
