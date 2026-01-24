# procedures/

Thin API handlers using **oRPC**. Procedures validate input, call use cases, and map results to HTTP responses.

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/procedure` | **Primary skill.** Patterns for creating thin oRPC handlers, input validation with contracts, use case invocation, and error mapping. Load before creating any procedure. |

## Structure

```
{domain}/
  {action}.ts            # Single procedure per file
  index.ts               # Domain router (groups procedures)
router.ts                # Main router (only allowed barrel file)

# Examples:
athletes/
  create-athlete.ts
  list-athletes.ts
  index.ts               # athleteRouter
subscriptions/
  get-subscription.ts
  index.ts               # subscriptionRouter
router.ts                # Combines all domain routers
```

## Procedure Pattern

```typescript
import { createAthleteInputSchema, athleteOutputSchema } from '@strenly/contracts/athletes'
import { authedProcedure } from '../../lib/orpc'
import { createAthlete as createAthleteUseCase } from '../../use-cases/athletes/create-athlete'
import { athleteRepository } from '../../infrastructure/repositories/athlete.repository'

// Instantiate use case with dependencies
const useCase = createAthleteUseCase({
  athleteRepo: athleteRepository,
})

export const createAthlete = authedProcedure
  .input(createAthleteInputSchema)
  .output(athleteOutputSchema)
  .handler(async ({ input, context }) => {
    // 1. Call use case with context and validated input
    const result = await useCase(context.org, input)

    // 2. Handle result
    if (result.isErr()) {
      throw mapErrorToHTTP(result.error)
    }

    // 3. Return success value
    return result.value
  })
```

## Error Mapping

```typescript
function mapErrorToHTTP(error: UseCaseError): HTTPException {
  switch (error.code) {
    case 'UNAUTHORIZED':
      return new HTTPException(403, { message: error.message })
    case 'NOT_FOUND':
      return new HTTPException(404, { message: error.message })
    case 'VALIDATION_ERROR':
      return new HTTPException(400, { message: error.message })
    case 'LIMIT_EXCEEDED':
      return new HTTPException(402, { message: error.message })
    default:
      return new HTTPException(500, { message: 'Internal server error' })
  }
}
```

## Domain Router

```typescript
// athletes/index.ts
import { router } from '../../lib/orpc'
import { createAthlete } from './create-athlete'
import { listAthletes } from './list-athletes'
import { getAthlete } from './get-athlete'
import { updateAthlete } from './update-athlete'

export const athleteRouter = router({
  create: createAthlete,
  list: listAthletes,
  get: getAthlete,
  update: updateAthlete,
})
```

## Main Router

```typescript
// router.ts (only allowed barrel file)
import { router } from '../lib/orpc'
import { athleteRouter } from './athletes'
import { subscriptionRouter } from './subscriptions'

export const appRouter = router({
  athletes: athleteRouter,
  subscriptions: subscriptionRouter,
})

export type AppRouter = typeof appRouter
```

## Critical Rules

- **Thin handlers only** - No business logic in procedures
- **Import from `@strenly/contracts`** - Never define schemas inline
- **Call use cases, not repositories** - Maintain layer separation
- **Map errors properly** - Use appropriate HTTP status codes
- **No `as` casting** - Fix actual type issues
- **Only `router.ts` can be a barrel file** - Direct imports everywhere else
