---
phase: 01-foundation-multi-tenancy
plan: 07
subsystem: authorization
tags: [rbac, repository-pattern, clean-architecture, use-cases]
dependency-graph:
  requires: [01-06]
  provides: [authorization-service, plan-repository, subscription-repository, refactored-use-cases]
  affects: [02-01, 02-02]
tech-stack:
  added: []
  patterns: [repository-pattern, authorization-first, dependency-injection]
key-files:
  created:
    - packages/core/src/services/authorization.ts
    - packages/core/src/services/authorization.test.ts
    - packages/backend/src/infrastructure/repositories/plan.repository.ts
    - packages/backend/src/infrastructure/repositories/subscription.repository.ts
    - packages/backend/src/use-cases/subscriptions/check-athlete-limit.ts
    - packages/backend/src/use-cases/subscriptions/check-feature-access.ts
    - packages/backend/src/use-cases/subscriptions/get-subscription.ts
  modified:
    - packages/core/src/index.ts
    - packages/backend/package.json
    - packages/backend/src/procedures/subscriptions/list-plans.ts
    - packages/backend/src/procedures/subscriptions/get-subscription.ts
decisions:
  - id: authorization-functions
    choice: Pure functions over service class
    reason: Simpler, testable, no class instantiation overhead
  - id: repository-factory
    choice: Factory functions (createPlanRepository, createSubscriptionRepository)
    reason: Aligns with Cloudflare Workers compatibility, dependency injection friendly
  - id: exhaustive-error-switch
    choice: Use switch statements for error mapping in procedures
    reason: TypeScript ensures exhaustive handling, explicit error-to-HTTP mapping
metrics:
  duration: 7 min
  completed: 2026-01-24
---

# Phase 01 Plan 07: Repository Implementations and Authorization Summary

**One-liner:** RBAC authorization service with repositories implementing ports and authorization-first use cases.

## Objective

Complete gap closure for Phase 1 by creating repositories implementing ports, adding an authorization service, and refactoring use cases to follow Clean Architecture with authorization-first pattern.

## Key Accomplishments

### 1. Authorization Service
Created RBAC authorization service in `packages/core/src/services/authorization.ts`:
- **Role type:** `owner | admin | member`
- **Permission type:** 19 permissions across organization, members, billing, athletes, programs, exercises
- **Functions:** `hasPermission`, `getPermissions`, `hasHigherOrEqualRole`, `isValidRole`
- **Tests:** 17 tests with 100% line coverage

### 2. Plan Repository
Created `packages/backend/src/infrastructure/repositories/plan.repository.ts`:
- Implements `PlanRepositoryPort` from core
- Methods: `findById`, `findBySlug`, `findAll` with pagination support
- Safe parsing for organization type and features
- Returns `{ items, totalCount }` for pagination

### 3. Subscription Repository
Created `packages/backend/src/infrastructure/repositories/subscription.repository.ts`:
- Implements `SubscriptionRepositoryPort` from core
- Methods: `findByOrganizationId`, `save`, `updateAthleteCount`
- Uses `OrganizationContext` for multi-tenancy
- Handles nullable dates with safe defaults

### 4. Refactored Use Cases
Created new use cases in `packages/backend/src/use-cases/subscriptions/`:
- **check-athlete-limit:** Authorization FIRST, then repository calls, uses `canAddAthlete` domain helper
- **check-feature-access:** Authorization FIRST, uses `hasFeature` domain helper
- **get-subscription:** Authorization FIRST (billing:read), returns subscription with plan

All use cases follow the pattern:
1. Check authorization FIRST
2. Fetch data via repositories
3. Use domain helpers for business logic
4. Return ResultAsync with typed errors

### 5. Updated Procedures
Refactored procedures to use new architecture:
- **list-plans:** Uses plan repository, returns `totalCount`
- **get-subscription:** Uses `makeGetSubscription` use case, exhaustive error mapping via switch

## Commits

| Hash | Description |
|------|-------------|
| 2182164 | feat(01-07): add authorization service with RBAC |
| f5c9297 | feat(01-07): add plan repository implementing port |
| 8e72248 | feat(01-07): add subscription repository implementing port |
| 9e6779c | feat(01-07): refactor use cases with authorization-first pattern |
| 157e923 | refactor(01-07): update procedures to use repositories and use cases |
| 72f05d4 | chore(01-07): delete old use cases and apply lint fixes |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @strenly/core as backend dependency**
- **Found during:** Task 2
- **Issue:** Backend package could not import from @strenly/core
- **Fix:** Added `"@strenly/core": "workspace:^"` to package.json
- **Files modified:** packages/backend/package.json

**2. [Rule 1 - Bug] Applied Biome lint fixes**
- **Found during:** Task 6
- **Issue:** Import ordering did not match Biome rules
- **Fix:** Ran `pnpm lint:fix` to reorder imports
- **Files modified:** 7 files in backend package

## Verification Results

| Verification | Status |
|--------------|--------|
| `pnpm typecheck` passes | PASS |
| `pnpm --filter @strenly/core test:coverage` 90%+ | PASS (100% lines) |
| Authorization service exports | PASS |
| Repositories implement ports | PASS |
| Use cases check authorization FIRST | PASS |
| Procedures only orchestrate | PASS |
| No direct DB queries in use cases | PASS |

## Next Phase Readiness

**Phase 1 Complete.** All gap closure items addressed:
- Domain entities with 100% test coverage
- Repository ports defined in core
- Repositories implementing ports in backend
- Authorization service with comprehensive permissions
- Use cases following authorization-first pattern
- Procedures that only orchestrate

**Ready for Phase 2:** Exercise Library & Athlete Management
