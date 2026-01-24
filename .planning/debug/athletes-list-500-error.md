---
status: diagnosed
trigger: "Investigate the 500 Internal Server Error on /rpc/athletes/list endpoint."
created: 2026-01-24T00:00:00Z
updated: 2026-01-24T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: authProcedure middleware is failing to construct context because X-Organization-Slug header is missing or organization lookup fails
test: Examining authProcedure middleware flow and error handling
expecting: Find why ORG_NOT_FOUND error is thrown before reaching the procedure handler
next_action: Check how frontend sends X-Organization-Slug header and verify organization data

## Symptoms

expected: POST /rpc/athletes/list should return 200 with list of athletes
actual: Returns 500 Internal Server Error
errors: "Organization no encontrada" in create athlete flow, 500 on list endpoint
reproduction: Call POST /rpc/athletes/list endpoint
started: Currently broken

## Eliminated

## Evidence

- timestamp: 2026-01-24T00:01:00Z
  checked: list-athletes.ts procedure (line 30)
  found: Procedure calls useCase with `organizationId: context.organization.id, userId: context.user.id, memberRole: context.membership.role`
  implication: Procedure is passing correct structure

- timestamp: 2026-01-24T00:02:00Z
  checked: list-athletes.ts use case (line 44)
  found: Use case receives `ListAthletesInput` which extends `OrganizationContext & { memberRole, status?, search?, limit?, offset? }`
  implication: Use case expects organizationId, userId, memberRole

- timestamp: 2026-01-24T00:03:00Z
  checked: list-athletes.ts use case (line 44)
  found: Use case passes `{ organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole }` to repository.findAll()
  implication: Use case is passing OrganizationContext correctly

- timestamp: 2026-01-24T00:04:00Z
  checked: athlete.repository.ts findAll method (line 106-108)
  found: Method signature is `findAll(ctx: OrganizationContext, options?: ListAthletesOptions)`
  implication: Repository expects TWO parameters: ctx and options

- timestamp: 2026-01-24T00:05:00Z
  checked: list-athletes.ts use case (line 42-51)
  found: Use case calls `deps.athleteRepository.findAll()` with TWO arguments correctly: ctx object and options object
  implication: Use case implementation is correct per port definition

- timestamp: 2026-01-24T00:06:00Z
  checked: Error message source
  found: "Organization no encontrada" comes from ORG_NOT_FOUND error in packages/contracts/src/common/errors.ts
  implication: Error is thrown by authProcedure middleware, NOT by the procedure handler

- timestamp: 2026-01-24T00:07:00Z
  checked: orpc.ts authProcedure middleware (lines 64-79)
  found: Middleware gets X-Organization-Slug from headers, calls Better-Auth's getFullOrganization, throws ORG_NOT_FOUND if org is null
  implication: Either header is missing OR organization doesn't exist OR user is not a member

- timestamp: 2026-01-24T00:08:00Z
  checked: apps/coach-web/src/lib/api-client.ts (lines 13-21)
  found: setCurrentOrgSlug function exists with comment "called by OrganizationApiProvider", but provider doesn't exist
  implication: currentOrgSlug is never set, remains null

- timestamp: 2026-01-24T00:09:00Z
  checked: apps/coach-web/src/lib/api-client.ts (lines 34-41)
  found: RPC link only sets X-Organization-Slug header if currentOrgSlug is truthy
  implication: **ROOT CAUSE FOUND - Header is never sent because OrganizationApiProvider was never implemented**

## Resolution

root_cause: Missing organization context initialization in frontend. The oRPC client in apps/coach-web/src/lib/api-client.ts conditionally sets the X-Organization-Slug header based on the `currentOrgSlug` variable (line 39-41). However, this variable is never set because the app doesn't call `setCurrentOrgSlug()` anywhere.

When requests are made without this header, the authProcedure middleware in packages/backend/src/lib/orpc.ts (line 65-68) throws ORG_NOT_FOUND error ("Organization no encontrada") because it cannot find the X-Organization-Slug header.

The flow is:
1. Frontend makes API request
2. api-client.ts checks currentOrgSlug (always null)
3. Doesn't set X-Organization-Slug header
4. Backend authProcedure middleware checks for header
5. Header missing → throws ORG_NOT_FOUND
6. Frontend receives 500 error

fix: Create a component/hook that reads the active organization from Better-Auth's useActiveOrganization hook and calls setCurrentOrgSlug(org.slug). This should be placed in the _authenticated layout or AppShell to ensure it runs for all authenticated routes.

verification:
- Verify X-Organization-Slug header is sent in API requests
- Verify POST /rpc/athletes/list returns 200
- Verify dashboard stats load correctly

files_changed:
- 'apps/coach-web/src/routes/_authenticated.tsx' OR
- 'apps/coach-web/src/components/layout/app-shell.tsx' OR
- 'apps/coach-web/src/routes/__root.tsx' (new effect to sync org slug)
