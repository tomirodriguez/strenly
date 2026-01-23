---
phase: 01-foundation-multi-tenancy
plan: 02
subsystem: api
tags: [orpc, hono, middleware, auth-hierarchy]

# Dependency graph
requires:
  - phase: 01-foundation-multi-tenancy (01-01)
    provides: Better-Auth factory and database schemas
provides:
  - Three-tier procedure hierarchy (public, session, auth)
  - Hono app with CORS and infrastructure middleware
  - Health check endpoint at /rpc/health
  - oRPC router foundation for all API endpoints
affects: [02-programs, 03-athlete-access, all-api-endpoints]

# Tech tracking
tech-stack:
  added: [@orpc/server, hono, hono/cors]
  patterns: [procedure-hierarchy, factory-middleware]

key-files:
  created:
    - packages/contracts/src/common/errors.ts
    - packages/contracts/src/common/roles.ts
    - packages/backend/src/lib/orpc.ts
    - packages/backend/src/lib/context.ts
    - packages/backend/src/lib/errors.ts
    - packages/backend/src/procedures/router.ts
    - packages/backend/src/procedures/health/health.ts
    - packages/backend/src/app.ts
  modified: []

key-decisions:
  - "Plain object router pattern (oRPC style) instead of os.router() method"
  - "User field mapping to avoid leaking Better-Auth internals"
  - "Role validation via Zod safeParse (no type casting)"
  - "Separate CORS middleware for /api/* and /rpc/* paths"

patterns-established:
  - "publicProcedure for unauthenticated endpoints"
  - "sessionProcedure for user-auth endpoints (onboarding)"
  - "authProcedure for org-scoped endpoints (most features)"
  - "X-Organization-Slug header for organization context"

# Metrics
duration: 5min
completed: 2026-01-23
---

# Phase 01 Plan 02: oRPC Procedure Hierarchy Summary

**Three-tier oRPC procedure hierarchy with Hono app, CORS, infrastructure middleware, and health check endpoint**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-23T22:32:02Z
- **Completed:** 2026-01-23T22:37:02Z
- **Tasks:** 2
- **Files created:** 11

## Accomplishments

- Created @strenly/contracts package with error schemas and role definitions
- Implemented three-tier procedure hierarchy (public, session, auth)
- Built Hono app with CORS and per-request infrastructure middleware
- Added health check endpoint at /rpc/health
- Integrated Better-Auth handler at /api/auth/*

## Task Commits

Each task was committed atomically:

1. **Task 1: Create oRPC Procedure Hierarchy** - `8b9029f` (feat)
2. **Task 2: Create Hono App with Router and Health Check** - `623a4ea` (feat)

## Files Created/Modified

- `packages/contracts/src/common/errors.ts` - Error definitions (Spanish messages)
- `packages/contracts/src/common/roles.ts` - MemberRole schema
- `packages/backend/src/lib/orpc.ts` - Procedure hierarchy
- `packages/backend/src/lib/context.ts` - Context types
- `packages/backend/src/lib/errors.ts` - Error re-exports
- `packages/backend/src/procedures/router.ts` - Main router
- `packages/backend/src/procedures/health/health.ts` - Health endpoint
- `packages/backend/src/app.ts` - Hono app with middleware

## Decisions Made

1. **Plain object router:** oRPC uses plain objects for routers, not os.router() method
2. **User field mapping:** Explicitly map user fields to avoid leaking Better-Auth implementation details
3. **Role validation:** Use Zod safeParse instead of type casting for role validation
4. **CORS duplication:** Separate CORS middleware for /api/* and /rpc/* paths to ensure both get proper headers

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Procedure hierarchy ready for feature endpoints
- Router ready to accept new procedure groups
- Auth integration complete via authProcedure middleware

---
*Phase: 01-foundation-multi-tenancy*
*Completed: 2026-01-23*
