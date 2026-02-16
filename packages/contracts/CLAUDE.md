# packages/contracts

Shared **Zod schemas** that define the API boundary between frontend and backend. The single source of truth for request/response validation.

## Purpose

Contracts ensure type safety and validation across the entire stack. Both frontend (oRPC client) and backend (procedures) import from here.

## Structure

```
src/
  {domain}/
    {entity}.ts        # Schemas for a domain entity
  common/
    errors.ts          # Shared error schemas
    roles.ts           # Role definitions
  index.ts             # Main exports
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/contracts` | **Primary skill.** Guidelines for creating Zod 4 schemas including naming conventions, schema composition, and type inference. Use for all work in this package. |

## Conventions

### File Organization
- Group by domain: `subscriptions/`, `athletes/`, `programs/`
- One file per entity with related schemas
- Export all schemas from the domain file

### Naming Convention
```typescript
// Input schemas (what procedures receive)
export const createAthleteInputSchema = z.object({ ... })
export const updateAthleteInputSchema = z.object({ ... })

// Query schemas (list/filter parameters)
export const listAthletesQuerySchema = z.object({ ... })

// Output schemas (what procedures return)
export const athleteOutputSchema = z.object({ ... })
export const athleteListOutputSchema = z.object({
  items: z.array(athleteOutputSchema),
  totalCount: z.number(),
})

// Inferred types
export type CreateAthleteInput = z.infer<typeof createAthleteInputSchema>
export type AthleteOutput = z.infer<typeof athleteOutputSchema>
```

### Schema Patterns
```typescript
// Reuse base schemas
const athleteBaseSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

// Extend for specific operations
export const createAthleteInputSchema = athleteBaseSchema.extend({
  teamId: z.string().uuid().optional(),
})

export const updateAthleteInputSchema = athleteBaseSchema.partial().extend({
  id: z.string().uuid(),
})

// Output includes server-generated fields
export const athleteOutputSchema = athleteBaseSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
```

## Critical Rules

- **Never define schemas inline** - All validation schemas live here
- **Always export types** - Use `z.infer<typeof schema>` for type inference
- **List responses need pagination** - Return `{ items, totalCount }`
- **No `as` casting** - Fix actual type issues
- **No barrel files except index.ts** - Direct imports preferred

## Usage Example

```typescript
// In procedure (backend)
import { createAthleteInputSchema, athleteOutputSchema } from '@strenly/contracts'

export const createAthlete = authedProcedure
  .input(createAthleteInputSchema)
  .output(athleteOutputSchema)
  .handler(...)

// In frontend
import type { CreateAthleteInput } from '@strenly/contracts'

const form = useForm<CreateAthleteInput>()
```
