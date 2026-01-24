# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-24)

**Core value:** Coaches can create and edit training programs as fast as they can in Excel
**Current focus:** Phase 2 - Exercise Library & Athlete Management

## Current Position

Phase: 2 of 5 (Exercise Library & Athlete Management)
Plan: 6 of TBD in current phase
Status: In progress
Last activity: 2026-01-24 - Completed 02-06-PLAN.md (Athlete Use Cases)

Progress: [======----] Phase 2 progressing

## Performance Metrics

**Velocity:**
- Total plans completed: 13
- Average duration: 6 min
- Total execution time: 78 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 7/7 | 66 min | 9 min |
| 2 | 6/TBD | 12 min | 2 min |

**Recent Trend:**
- Last 5 plans: 02-02 (3 min), 02-03 (2 min), 02-04 (2 min), 02-05 (2 min), 02-06 (4 min)
- Trend: Phase 2 layers executing efficiently with established patterns

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

### Pending Todos

- Configure Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- Generate BETTER_AUTH_SECRET
- Set DATABASE_URL for database operations

### Blockers/Concerns

None.

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
| 02-07 | Exercise Contracts & Procedures | Pending |

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

## Session Continuity

Last session: 2026-01-24
Stopped at: Completed 02-06-PLAN.md (Athlete Use Cases)
Resume file: None

**Next:** Continue Phase 2 - Athlete Contracts & Procedures (02-07)
