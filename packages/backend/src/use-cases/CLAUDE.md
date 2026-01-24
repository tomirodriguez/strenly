# use-cases/

Business logic orchestration layer. Use cases coordinate domain entities, repositories, and authorization to implement application features.

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/use-case` | **Primary skill.** Patterns for implementing use cases with neverthrow, authorization-first approach, and Result chaining. Load before creating any use case. |
| `/authorization` | Adding role-based permission checks. Reference when implementing the authorization step in use cases. |

## Structure

```
{domain}/
  {action}.ts            # Single use case per file

# Examples:
athletes/
  create-athlete.ts
  update-athlete.ts
  list-athletes.ts
  archive-athlete.ts
subscriptions/
  get-subscription.ts
  check-feature-access.ts
```

## Use Case Pattern

```typescript
import { ResultAsync, ok, err } from 'neverthrow'
import { authorize } from '@strenly/core/services/authorization'
import { Athlete } from '@strenly/core/domain/entities/athlete'
import type { AthleteRepositoryPort } from '@strenly/core/ports/athlete-repository.port'
import type { OrganizationContext } from '@strenly/core/types/organization-context'
import type { CreateAthleteInput } from '@strenly/contracts/athletes'

interface Dependencies {
  athleteRepo: AthleteRepositoryPort
}

export function createAthlete(deps: Dependencies) {
  return (ctx: OrganizationContext, input: CreateAthleteInput) =>
    // 1. AUTHORIZATION FIRST - Always check permissions before anything else
    authorize(ctx.role, 'athlete:create')
      // 2. Domain validation - Create entity (validates business rules)
      .andThen(() => Athlete.create({
        name: input.name,
        email: input.email,
      }))
      // 3. Persist - Save via repository
      .andThen((athlete) => deps.athleteRepo.save(ctx, athlete))
}
```

## Authorization-First Pattern

**CRITICAL:** Authorization must be the FIRST operation in every use case.

```typescript
// CORRECT - Authorization first
authorize(ctx.role, 'athlete:create')
  .andThen(() => /* domain logic */)
  .andThen(() => /* repository call */)

// WRONG - Doing work before auth check
deps.repo.findById(ctx, id)
  .andThen(() => authorize(ctx.role, 'athlete:update'))  // Too late!
```

## Result Chaining

```typescript
// Chain operations with andThen
authorize(ctx.role, 'program:create')
  .andThen(() => validateAthleteLimit(ctx, deps))
  .andThen(() => Program.create(input))
  .andThen((program) => deps.programRepo.save(ctx, program))
  .map((saved) => mapToOutput(saved))

// Transform values with map
deps.repo.findById(ctx, id)
  .map((entity) => ({ id: entity.id, name: entity.name }))

// Handle errors with mapErr
deps.repo.save(ctx, entity)
  .mapErr((repoError) => new UseCaseError('SAVE_FAILED', repoError))
```

## Critical Rules

- **Authorization FIRST** - Check permissions before ANY other operation
- **Use `ResultAsync`** - All async operations wrapped in neverthrow
- **Domain validation via entities** - Use `Entity.create()` not inline validation
- **No direct DB queries** - Always use repository ports
- **Single responsibility** - One use case per file
- **Dependency injection** - Receive repositories via `deps` parameter
- **No `as` casting** - Fix actual type issues
