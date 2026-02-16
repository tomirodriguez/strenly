# packages/contracts

Shared **Zod schemas** that define the API boundary between frontend and backend. Single source of truth for request/response validation.

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
| `/contracts` | **Primary skill.** Load for all work in this package. Covers naming conventions, schema composition, and type inference. |

## Conventions

### Naming
- Input schemas: `createAthleteInputSchema`, `updateAthleteInputSchema`
- Query schemas: `listAthletesQuerySchema`
- Output schemas: `athleteOutputSchema`, `athleteListOutputSchema`
- Inferred types: `type CreateAthleteInput = z.infer<typeof createAthleteInputSchema>`

### Composition
- Use `.pick()`, `.extend()`, `.partial()` to compose from base schemas
- Output schemas extend base with server-generated fields (`id`, `createdAt`, `updatedAt`)
- List responses always return `{ items: z.array(outputSchema), totalCount: z.number() }`

## Critical Rules

- **Never define schemas inline** — all validation schemas live here
- **Always export types** — use `z.infer<typeof schema>` for type inference
- **List responses need pagination** — return `{ items, totalCount }`
