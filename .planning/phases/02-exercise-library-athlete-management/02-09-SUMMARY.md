---
phase: 02-exercise-library-athlete-management
plan: 09
subsystem: api
tags: [oRPC, contracts, procedures, athletes, invitations]
dependency-graph:
  requires: [02-06, 02-07]
  provides: [athletes-api, invitation-api]
  affects: [frontend-integration]
tech-stack:
  added: []
  patterns: [exhaustive-error-switch, session-auth-for-accept, public-endpoint-for-info]
key-files:
  created:
    - packages/contracts/src/athletes/athlete.ts
    - packages/contracts/src/athletes/invitation.ts
    - packages/contracts/src/athletes/index.ts
    - packages/backend/src/procedures/athletes/create-athlete.ts
    - packages/backend/src/procedures/athletes/list-athletes.ts
    - packages/backend/src/procedures/athletes/get-athlete.ts
    - packages/backend/src/procedures/athletes/update-athlete.ts
    - packages/backend/src/procedures/athletes/archive-athlete.ts
    - packages/backend/src/procedures/athletes/generate-invitation.ts
    - packages/backend/src/procedures/athletes/accept-invitation.ts
    - packages/backend/src/procedures/athletes/get-invitation-info.ts
    - packages/backend/src/procedures/athletes/index.ts
    - packages/backend/src/infrastructure/services/organization-lookup.ts
  modified:
    - packages/backend/src/procedures/router.ts
    - packages/contracts/package.json
decisions:
  - id: session-auth-for-accept
    choice: sessionProcedure for acceptInvitation
    rationale: Athlete accepting invitation has auth but no org context yet
  - id: public-endpoint-for-info
    choice: publicProcedure for getInvitationInfo
    rationale: Invitation display page must be accessible without login
  - id: organization-lookup-service
    choice: Direct DB queries for organization/user/athlete names
    rationale: Better-Auth API requires headers, public endpoint has none
metrics:
  duration: 6 min
  completed: 2026-01-24
---

# Phase 02 Plan 09: Contracts & Procedures Summary

**One-liner:** Athlete API with Zod contracts, CRUD procedures, and invitation endpoints (public info, session accept).

## What Was Built

### Contracts (packages/contracts/src/athletes/)
- `athleteSchema` - Full athlete representation with status, gender, linkedUserId
- `createAthleteInputSchema` - Name, email, phone, birthdate, gender, notes
- `updateAthleteInputSchema` - Partial updates with athleteId and optional status
- `listAthletesInputSchema` - Filtering by status, search, pagination
- `listAthletesOutputSchema` - Paginated response with totalCount
- `invitationInfoSchema` - Public display: athleteName, organizationName, coachName, expiresAt, isValid
- `generateInvitationOutputSchema` - Returns invitationUrl
- `acceptInvitationOutputSchema` - Returns athleteId and organizationId

### Procedures (packages/backend/src/procedures/athletes/)
- `createAthlete` - authProcedure, creates athlete with domain validation
- `listAthletes` - authProcedure, supports status/search/pagination
- `getAthlete` - authProcedure, returns single athlete
- `updateAthlete` - authProcedure, partial updates with merge
- `archiveAthlete` - authProcedure, soft delete via status
- `generateInvitation` - authProcedure, creates invitation URL
- `acceptInvitation` - sessionProcedure (auth, no org), links user to athlete
- `getInvitationInfo` - publicProcedure, displays invitation details

### Infrastructure
- `organization-lookup.ts` - Service for resolving org/user/athlete names from DB

## Key Decisions

1. **Session auth for acceptInvitation** - The accepting user is authenticated but not yet a member of the organization, so we use sessionProcedure instead of authProcedure.

2. **Public endpoint for invitationInfo** - The invitation display page must be accessible without login so users can see what they're accepting before signing in.

3. **Direct DB queries for lookup** - Better-Auth's getFullOrganization API requires request headers, but public endpoints have none. Created a lightweight service that queries organization/user/athlete tables directly.

## Verification Results

- `pnpm typecheck --filter @strenly/backend` - PASS
- `pnpm typecheck --filter @strenly/contracts` - PASS
- Athletes router mounted at /api/rpc/athletes/*
- All procedures use exhaustive error switches
- invitationInfo is public, acceptInvitation requires session auth

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| 787429c | feat(02-09): create athlete and invitation contracts |
| bea6a61 | feat(02-09): create athlete CRUD procedures |
| 0d1232a | feat(02-09): create invitation procedures and athletes router |

## Next Phase Readiness

**Phase 2 API layer complete.** Athletes and exercises both have:
- Domain entities with validation
- Repository implementations
- Use cases with authorization
- Zod contracts for API boundaries
- oRPC procedures with error handling

Ready for frontend integration or Phase 3 (Training Programs).
