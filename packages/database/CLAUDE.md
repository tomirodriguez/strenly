# packages/database

**Drizzle ORM** schemas and database client for Neon PostgreSQL.

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

Reference `/repository` skill when implementing repository queries against these schemas.

## Multi-Tenancy

- **All tenant tables MUST have `organizationId`** with foreign key to `organizations.id`
- Repositories filter by `organizationId` from context

## Critical Rules

- **Use `uuid` for IDs** with `defaultRandom()`
- **Include audit timestamps** (`createdAt`, `updatedAt`)
- **Define relations** for the query builder

## Migration Workflow

1. Modify schema files in `src/schema/`
2. Run `pnpm db:generate` to create migration
3. Review generated migration in `drizzle/migrations/`
4. Run `pnpm db:migrate` to apply (or `db:push` in dev)

## Development Commands

```bash
pnpm db:push        # Push schema changes (dev only)
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio
pnpm db:reset       # Reset database completely
pnpm db:seed        # Seed development data
```
