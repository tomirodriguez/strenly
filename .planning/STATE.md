# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-24)

**Core value:** Coaches can create and edit training programs as fast as they can in Excel
**Current focus:** Phase 3 - Program Builder (full-stack)

## Current Position

Phase: 2.5 of 5 (Coach Web Foundation) ✓ Complete
Plan: 11/11 (all gap closure plans complete)
Status: Phase 2.5 verified and complete
Last activity: 2026-01-25 - Completed quick task 015: Change athletes table default sort to updatedAt descending

Progress: [██████████████████████████████] Phases 1, 2, 2.5 complete

**Note:** Backend (Phases 1-2) and Coach Web Foundation (Phase 2.5) complete. All UAT gaps closed. Ready for Phase 3.

## Performance Metrics

**Velocity:**
- Total plans completed: 29
- Average duration: 4 min
- Total execution time: 116 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 7/7 | 66 min | 9 min |
| 2 | 11/11 | 30 min | 2.7 min |
| 2.5 | 11/11 | ~20 min | ~2 min |

**Recent Trend:**
- Last 5 plans: 02.5-08 (2 min), 02.5-09 (3 min), 02.5-10 (4 min), 02.5-11 (6 min), verification
- Trend: Phase 2.5 complete with all UAT gaps closed

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **Architecture-first planning (MANDATORY)** - All plans must include domain entities, ports, repositories for new concepts.
- **90%+ test coverage on core** - Domain entities and authorization must have comprehensive tests.
- **neverthrow for use cases** - Use cases return ResultAsync<Success, Error> with discriminated unions
- **Factory functions return Result<Entity, Error>** - Domain entities use createEntity() pattern with neverthrow
- **Domain entities are immutable** - All properties are readonly
- **Repository factory functions** - createPlanRepository, createSubscriptionRepository, createAthleteRepository for DI
- **Value objects as const arrays** - MuscleGroup and MovementPattern use const arrays with type guards
- **Curated vs Custom via nullable organizationId** - organizationId: null for curated, string for custom
- **Public invitation token lookup** - findByToken/markAccepted have no OrganizationContext for acceptance flow
- **Cryptographic invitation tokens** - 256-bit random via crypto.randomBytes, base64url encoded (43 chars)
- **Type guards for enum parsing** - isAthleteStatus/isAthleteGender instead of 'as' casting
- **Soft delete via status** - archive() sets status to inactive, preserves data
- **Junction table batch fetching** - Fetch muscle mappings in separate query after main exercise query
- **Lookup repositories without ports** - Simple read-only repositories (MuscleGroup) don't need core ports
- **Authorization-first in use cases** - Always check hasPermission() before any business logic
- **Update merges with existing** - Update use cases merge input with existing entity before validation
- **OrganizationLookup interface** - Simplified interface for name resolution in public endpoints
- **Token-based public endpoints** - Accept/get-info use token as credential, no OrganizationContext
- **Clone provenance tracking** - Clone stores clonedFromId to track source exercise
- **Access control returns not_found** - Unauthorized access returns not_found to prevent information leakage
- **contracts/package.json exports** - Add explicit exports for module path resolution
- **crypto.randomUUID()** - Use built-in Web Crypto API instead of nanoid for ID generation
- **Session auth for acceptInvitation** - Athlete accepting has auth but no org context, use sessionProcedure
- **Public endpoint for invitationInfo** - Invitation display accessible without login via publicProcedure
- **Direct DB queries for org lookup** - Better-Auth API requires headers, public endpoints query DB directly
- **Static exercise IDs** - Descriptive IDs like ex-barbell-bench-press for referential stability
- **Seed orchestrator pattern** - index.ts orchestrates individual seed modules in dependency order
- **Organization sync in AuthenticatedLayout** - useActiveOrganization + setCurrentOrgSlug in layout for API header sync
- **DropdownMenuLabel requires DropdownMenuGroup** - Base UI MenuGroupRootContext is only provided by MenuPrimitive.Group wrapper
- **DataTable compound component children** - DataTable.Content and DataTablePagination must be descendants of DataTable.Root for context access
- **Custom Zod error messages** - Use { message: '...' } in validation rules for user-friendly error text
- **Optional string fields in Zod** - Use .or(z.literal('')) for optional strings that receive empty form values
- **Modal for forms, drawer for context** - Use Dialog for focused forms, Sheet for contextual panels where page awareness matters
- **Single Toaster in __root.tsx** - Toaster component placed in __root.tsx (inside providers), not main.tsx
- **sessionProcedure for createSubscription** - User is authenticated during onboarding but has no org context yet
- **URL-based org routing** - All authenticated routes use `/:orgSlug/*` pattern, org slug synced to X-Organization-Slug header
- **No setActive() needed - URL slug is source of truth** - Organization context from URL, X-Organization-Slug header via setCurrentOrgSlug(), no database calls for active org
- **Better-Auth metadata is already parsed** - org.metadata in hooks is an object, not a JSON string
- **Onboarding uses standalone full-width layout** - Not inside AuthLayout, uses header + centered content pattern
- **Slug auto-generation via onChange** - Use onChange callbacks instead of useEffect for derived input values
- **Context providers for route data caching** - AuthProvider at _authenticated, OrganizationProvider at $orgSlug, use hooks instead of Better-Auth hooks in components
- **zodResolver for forms** - Use zodResolver as primary resolver, standardSchemaResolver as fallback, Controller for controlled components (Checkbox, Select)
- **Select items prop for label display** - Pass items array to Select.Root for Base UI SelectValue to display labels instead of raw values
- **Empty string coercion uses || not ??** - Nullish coalescing doesn't catch empty strings from forms, use || for optional field coercion
- **Database ID prefix handling in repository layer** - Strip/add prefixes like mg- in repository mapToDomain/query, not in domain
- **Node types for crypto module** - Added @types/node to core and backend packages for node:crypto import in athlete-invitation.ts
- **oRPC key() for cache invalidation** - Use orpc.{procedure}.key() instead of custom query key factories for type-safe invalidation

### Pending Todos

- Configure Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- Generate BETTER_AUTH_SECRET
- Set DATABASE_URL for database operations

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Translate UI and error messages to Spanish | 2026-01-24 | 0a9874a | [001-translate-ui-and-error-messages-to-spani](./quick/001-translate-ui-and-error-messages-to-spani/) |
| 002 | Fix onboarding flow: coach type, plan selection, org routing | 2026-01-24 | 59944c2 | [002-fix-onboarding-flow-coach-type-plan-org-routing](./quick/002-fix-onboarding-flow-coach-type-plan-org-routing/) |
| 003 | Fix duplicate toasts on login error | 2026-01-24 | 21b88b7 | [003-fix-duplicate-toasts-login-error](./quick/003-fix-duplicate-toasts-login-error/) |
| 004 | Fix onboarding infinite loop after sign-in | 2026-01-24 | a909deb | [004-fix-onboarding-infinite-loop](./quick/004-fix-onboarding-infinite-loop/) |
| 005 | Fix onboarding org creation, layout, slug generation | 2026-01-24 | 47c7b9a | [005-fix-onboarding-org-creation-error-form-l](./quick/005-fix-onboarding-org-creation-error-form-l/) |
| 006 | Add AuthProvider and OrganizationProvider for context caching | 2026-01-24 | 33083ce | [006-add-authprovider-and-organizationprovide](./quick/006-add-authprovider-and-organizationprovide/) |
| 007 | Polish step components visual design | 2026-01-24 | 8885ba2 | - |
| 008 | Fix session and organization API calls on navigation | 2026-01-24 | 6d28f99 | [008-fix-session-and-organization-api-calls-o](./quick/008-fix-session-and-organization-api-calls-o/) |
| 009 | Migrate create athlete drawer to modal and add modal vs drawer rules | 2026-01-24 | 5742c7d | [009-migrate-create-athlete-drawer-to-modal-a](./quick/009-migrate-create-athlete-drawer-to-modal-a/) |
| 010 | Remove planId subscription logic from auth hook | 2026-01-25 | a20679a | [010-remove-planid-from-org-metadata-onboarding](./quick/010-remove-planid-from-org-metadata-onboarding/) |
| 011 | Fix Select showing value instead of label | 2026-01-25 | 34ebdfd | [011-fix-select-showing-value-instead-of-label](./quick/011-fix-select-showing-value-instead-of-label/) |
| 012 | Audit and refactor forms to skill pattern | 2026-01-25 | 50ef1fd | [012-audit-and-refactor-forms-to-skill-patter](./quick/012-audit-and-refactor-forms-to-skill-patter/) |
| 013 | Update oRPC query skill and refactor query invalidations | 2026-01-25 | 25934b3 | [013-update-orpc-query-skill-and-refactor-que](./quick/013-update-orpc-query-skill-and-refactor-que/) |
| 014 | Fix invitation modal unified invitar action | 2026-01-25 | 6c7ecb8 | [014-fix-invitation-modal-unified-invitar-act](./quick/014-fix-invitation-modal-unified-invitar-act/) |
| 015 | Change athletes table default sort to updatedAt descending | 2026-01-25 | 2e8e339 | [015-change-athletes-table-default-sort-to-up](./quick/015-change-athletes-table-default-sort-to-up/) |

## Phase 2 Progress

**Exercise Library & Athlete Management IN PROGRESS:**

| Plan | Name | Status |
|------|------|--------|
| 02-01 | Database Schema | Complete |
| 02-02 | Athlete Domain Entity | Complete |
| 02-03 | Exercise Domain Entity | Complete |
| 02-04 | Athlete Repositories | Complete |
| 02-05 | Exercise Repositories | Complete |
| 02-06 | Athlete Use Cases | Complete |
| 02-07 | Athlete Invitation Use Cases | Complete |
| 02-08 | Exercise Use Cases | Complete |
| 02-09 | Athlete Contracts & Procedures | Complete |
| 02-10 | Exercise Contracts & Procedures | Complete |
| 02-11 | Database Seed | Complete |

**Key artifacts so far:**
- `packages/database/src/schema/athletes.ts` - Athletes table schema
- `packages/database/src/schema/athlete-invitations.ts` - Athlete invitations schema
- `packages/database/src/schema/exercises.ts` - Exercises table schema
- `packages/database/src/schema/muscle-groups.ts` - Muscle groups lookup table
- `packages/database/src/schema/exercise-muscles.ts` - Exercise-muscle junction
- `packages/database/src/schema/exercise-progressions.ts` - Exercise progressions
- `packages/core/src/domain/entities/exercise.ts` - Exercise entity with validation
- `packages/core/src/domain/entities/muscle-group.ts` - MuscleGroup value object
- `packages/core/src/domain/entities/movement-pattern.ts` - MovementPattern value object
- `packages/core/src/ports/exercise-repository.port.ts` - Repository interface
- `packages/core/src/domain/entities/athlete.ts` - Athlete entity with validation
- `packages/core/src/domain/entities/athlete-invitation.ts` - AthleteInvitation with secure tokens
- `packages/core/src/ports/athlete-repository.port.ts` - AthleteRepositoryPort interface
- `packages/core/src/ports/athlete-invitation-repository.port.ts` - AthleteInvitationRepositoryPort interface
- `packages/backend/src/infrastructure/repositories/athlete.repository.ts` - Athlete repository implementation
- `packages/backend/src/infrastructure/repositories/athlete-invitation.repository.ts` - AthleteInvitation repository implementation
- `packages/backend/src/infrastructure/repositories/exercise.repository.ts` - Exercise repository with filtering
- `packages/backend/src/infrastructure/repositories/muscle-group.repository.ts` - MuscleGroup lookup repository
- `packages/backend/src/infrastructure/repositories/index.ts` - Repository exports
- `packages/backend/src/use-cases/athletes/create-athlete.ts` - Create athlete use case
- `packages/backend/src/use-cases/athletes/list-athletes.ts` - List athletes with pagination
- `packages/backend/src/use-cases/athletes/get-athlete.ts` - Get athlete by ID
- `packages/backend/src/use-cases/athletes/update-athlete.ts` - Update athlete with merge
- `packages/backend/src/use-cases/athletes/archive-athlete.ts` - Archive (soft delete) athlete
- `packages/backend/src/use-cases/athletes/generate-invitation.ts` - Generate invitation with URL
- `packages/backend/src/use-cases/athletes/accept-invitation.ts` - Accept invitation, link user
- `packages/backend/src/use-cases/athletes/get-invitation-info.ts` - Public invite info lookup
- `packages/backend/src/use-cases/athletes/revoke-invitation.ts` - Manual invitation revocation
- `packages/backend/src/use-cases/exercises/create-exercise.ts` - Create custom exercise
- `packages/backend/src/use-cases/exercises/clone-exercise.ts` - Clone exercise with provenance
- `packages/backend/src/use-cases/exercises/list-exercises.ts` - List curated + custom exercises
- `packages/backend/src/use-cases/exercises/get-exercise.ts` - Get exercise with access control
- `packages/backend/src/use-cases/exercises/update-exercise.ts` - Update custom exercises only
- `packages/backend/src/use-cases/exercises/archive-exercise.ts` - Soft delete via archivedAt
- `packages/contracts/src/athletes/` - Athlete and invitation contracts
- `packages/contracts/src/exercises/` - Exercise and muscle group contracts
- `packages/backend/src/procedures/athletes/` - Athlete CRUD and invitation procedures
- `packages/backend/src/procedures/exercises/` - Exercise CRUD, clone, and muscle groups procedures
- `packages/database/src/seed/muscle-groups.ts` - 10 muscle groups seed data
- `packages/database/src/seed/exercises.ts` - 60 curated exercises seed data
- `packages/database/src/seed/index.ts` - Seed orchestrator
- `packages/database/scripts/seed.ts` - CLI seed runner

## Session Continuity

Last session: 2026-01-25
Stopped at: Completed quick task 015 - Change athletes table default sort
Resume file: None

**Next:** Begin Phase 3 planning with /gsd:discuss-phase 3 or /gsd:plan-phase 3
