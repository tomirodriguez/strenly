# infrastructure/

Implementation of **ports** defined in `@strenly/core`. Contains repositories that interact with the database via Drizzle ORM.

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/repository` | **Primary skill.** Load before creating or modifying any repository. Covers `ResultAsync.fromPromise`, error handling, query composition, and multi-tenancy patterns. |

## Structure

```
repositories/
  {entity}.repository.ts   # Port implementation
```

## Critical Rules

- **Always filter by `organizationId`** — multi-tenancy is non-negotiable
- **Use `ResultAsync.fromPromise`** — wrap all Drizzle queries
- **Map to domain entities** — use `reconstitute` for hydration
- **Implement the port interface exactly** — type safety matters
- **No business logic** — repositories are data access only
