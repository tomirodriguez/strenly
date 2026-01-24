# infrastructure/

Implementation of **ports** defined in `@strenly/core`. Contains repositories that interact with the database via Drizzle ORM.

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/repository` | **Primary skill.** Patterns for implementing repository ports with Drizzle ORM, `ResultAsync.fromPromise` for error handling, and query composition. Load this skill before creating or modifying any repository. |

## Structure

```
repositories/
  {entity}.repository.ts   # Port implementation
```

## Repository Pattern

```typescript
import { ResultAsync } from 'neverthrow'
import type { AthleteRepositoryPort } from '@strenly/core/ports/athlete-repository.port'
import type { OrganizationContext } from '@strenly/core/types/organization-context'
import { Athlete } from '@strenly/core/domain/entities/athlete'
import { db } from '@strenly/database/client'
import { athletes } from '@strenly/database/schema/athletes'

export const athleteRepository: AthleteRepositoryPort = {
  findById: (ctx: OrganizationContext, id: string) =>
    ResultAsync.fromPromise(
      db.query.athletes.findFirst({
        where: and(
          eq(athletes.id, id),
          eq(athletes.organizationId, ctx.organizationId)
        ),
      }),
      (error) => new RepositoryError('FIND_FAILED', error)
    ).map((row) => row ? Athlete.reconstitute(mapRowToProps(row)) : null),

  save: (ctx: OrganizationContext, athlete: Athlete) =>
    ResultAsync.fromPromise(
      db.insert(athletes).values({
        ...mapEntityToRow(athlete),
        organizationId: ctx.organizationId,
      }).returning(),
      (error) => new RepositoryError('SAVE_FAILED', error)
    ).map((rows) => Athlete.reconstitute(mapRowToProps(rows[0]))),

  update: (ctx: OrganizationContext, athlete: Athlete) =>
    ResultAsync.fromPromise(
      db.update(athletes)
        .set(mapEntityToRow(athlete))
        .where(and(
          eq(athletes.id, athlete.id),
          eq(athletes.organizationId, ctx.organizationId)
        ))
        .returning(),
      (error) => new RepositoryError('UPDATE_FAILED', error)
    ).map((rows) => Athlete.reconstitute(mapRowToProps(rows[0]))),
}
```

## Critical Rules

- **Always filter by `organizationId`** - Multi-tenancy is non-negotiable
- **Use `ResultAsync.fromPromise`** - Wrap all Drizzle queries
- **Map to domain entities** - Use `reconstitute` for hydration
- **Implement the port interface exactly** - Type safety matters
- **No business logic** - Repositories are data access only
- **No `as` casting** - Fix actual type issues
