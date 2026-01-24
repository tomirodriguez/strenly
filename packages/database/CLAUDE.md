# packages/database

**Drizzle ORM** schemas and database client. Defines the PostgreSQL structure for Neon.

## Purpose

Provides the database layer with type-safe schema definitions, migrations, and the Drizzle client for queries.

## Structure

```
src/
  schema/
    auth.ts            # Better-Auth tables
    plans.ts           # Subscription plans
    subscriptions.ts   # Organization subscriptions
    index.ts           # Schema exports (only allowed barrel)
  client.ts            # Drizzle client configuration
  index.ts             # Main exports
drizzle/
  migrations/          # Generated migration files
drizzle.config.ts      # Drizzle Kit configuration
```

## Relevant Skills

No dedicated skill for this package, but follow the conventions below and reference `/repository` when implementing repository queries.

## Conventions

### Table Naming
- Tables: `snake_case` plural (`athletes`, `training_plans`)
- Columns: `snake_case` (`organization_id`, `created_at`)

### Schema Patterns
```typescript
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const athletes = pgTable('athletes', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  email: text('email'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Relations for query builder
export const athletesRelations = relations(athletes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [athletes.organizationId],
    references: [organizations.id],
  }),
  programs: many(programs),
}))
```

### Multi-Tenancy
- **All tenant tables MUST have `organizationId`**
- Define foreign key to `organizations.id`
- Repositories filter by `organizationId` from context

### Common Columns
```typescript
// Standard audit columns
createdAt: timestamp('created_at').notNull().defaultNow(),
updatedAt: timestamp('updated_at').notNull().defaultNow(),

// Soft delete (when needed)
deletedAt: timestamp('deleted_at'),
```

## Development Commands

```bash
pnpm db:start       # Start PostgreSQL container
pnpm db:push        # Push schema changes (dev only)
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio
pnpm db:reset       # Reset database completely
pnpm db:seed        # Seed development data
```

## Critical Rules

- **Always include `organizationId`** on tenant tables
- **Use `uuid` for IDs** with `defaultRandom()`
- **Include audit timestamps** (`createdAt`, `updatedAt`)
- **Define relations** for the query builder
- **No `as` casting** - Fix actual type issues
- **No barrel files** except `schema/index.ts`

## Migration Workflow

1. Modify schema files in `src/schema/`
2. Run `pnpm db:generate` to create migration
3. Review generated migration in `drizzle/migrations/`
4. Run `pnpm db:migrate` to apply (or `db:push` in dev)
