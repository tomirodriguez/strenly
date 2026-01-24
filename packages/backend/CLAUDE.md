# packages/backend

Application layer containing **use cases**, **repositories**, and **procedures**. Orchestrates domain logic and exposes it via oRPC API.

## Purpose

Implements the ports defined in `@strenly/core` and provides the API surface for frontend apps. This is where business orchestration happens.

## Structure

```
src/
  infrastructure/
    repositories/      # Port implementations with Drizzle ORM
  use-cases/
    {domain}/          # Business logic orchestration
  procedures/
    {domain}/          # Thin API handlers (oRPC)
    router.ts          # Main router (only allowed barrel file)
  lib/
    context.ts         # Request context types
    errors.ts          # Error definitions
    orpc.ts            # oRPC configuration
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/architecture` | **Load FIRST.** Mandatory overview of Clean Architecture flow before planning any backend feature. |
| `/repository` | Implementing port interfaces with Drizzle ORM. Use when creating files in `infrastructure/repositories/`. Covers `ResultAsync.fromPromise`, error handling, and query patterns. |
| `/use-case` | Business logic orchestration with neverthrow. Use when creating files in `use-cases/`. Covers authorization-first pattern and Result chaining. |
| `/procedure` | Creating thin API handlers with oRPC. Use when creating files in `procedures/`. Covers input validation, use case invocation, and response mapping. |
| `/authorization` | Adding permission checks to use cases. Reference when implementing authorization in use cases. |

## Conventions

### Repositories
- Implement ports from `@strenly/core`
- All methods receive `OrganizationContext`
- Use `ResultAsync.fromPromise` for all Drizzle queries
- Map database rows to domain entities using `reconstitute`
- Name files: `{entity}.repository.ts`

### Use Cases
- **Authorization FIRST** - Check permissions before any logic
- Use `ResultAsync` from neverthrow for all operations
- Chain operations with `.andThen()` and `.map()`
- No direct DB queries - always use repositories
- Name files: `{action}.ts` (e.g., `create-athlete.ts`)

### Procedures
- **Thin handlers only** - No business logic
- Import schemas from `@strenly/contracts`
- Extract context, call use case, map result
- Handle errors with proper HTTP status codes

## Critical Rules

- **No business logic in procedures** - Procedures only orchestrate
- **Authorization first in use cases** - Check before any other operation
- **Use repositories, not direct queries** - Maintain Clean Architecture
- **Import from `@strenly/contracts`** - Never define Zod schemas inline
- **No `as` casting** - Fix actual type issues
- **No `!` assertions** - Use guards or optional chaining

## Example Patterns

### Repository
```typescript
export const athleteRepository: AthleteRepositoryPort = {
  findById: (ctx, id) =>
    ResultAsync.fromPromise(
      db.query.athletes.findFirst({
        where: and(
          eq(athletes.id, id),
          eq(athletes.organizationId, ctx.organizationId)
        ),
      }),
      (e) => new RepositoryError('Failed to find athlete', e)
    ).map((row) => row ? Athlete.reconstitute(row) : null),
}
```

### Use Case
```typescript
export function createAthlete(deps: Dependencies) {
  return (ctx: OrganizationContext, input: CreateAthleteInput) =>
    // 1. Authorization FIRST
    authorize(ctx.role, 'athlete:create')
      // 2. Domain validation
      .andThen(() => Athlete.create(input))
      // 3. Persist via repository
      .andThen((athlete) => deps.athleteRepo.save(ctx, athlete))
}
```

### Procedure
```typescript
export const createAthlete = authedProcedure
  .input(createAthleteSchema)
  .handler(async ({ input, context }) => {
    const result = await createAthleteUseCase(deps)(context, input)
    if (result.isErr()) {
      throw mapErrorToHTTP(result.error)
    }
    return result.value
  })
```
