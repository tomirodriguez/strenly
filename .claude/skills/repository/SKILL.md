---
name: repository
description: |
  This skill provides guidance for implementing repositories in Clean Architecture.
  Use this skill when implementing a port interface with Drizzle ORM, writing database queries,
  or working with ResultAsync.fromPromise for error handling.
  Do NOT load for port definitions (use /port), business logic, or raw SQL without Drizzle.
version: 1.0.0
---

# Repository

Repositories implement port interfaces using Drizzle ORM. They handle data access with proper error handling.

## When to Use

- Implementing a new repository from a port interface
- Adding methods to an existing repository
- Writing Drizzle queries with proper error handling
- Understanding the wrapError and ResultAsync patterns

## Location

```
{project_root}/
├── src/server/repositories/     # or src/infra/db/repositories/
│   ├── user.repository.ts
│   ├── organization.repository.ts
│   └── ...
```

## Repository Structure

```typescript
// src/server/repositories/user.repository.ts
import type { User, UserRepository, CreateUserData } from '@/core/ports/user-repository'
import type { OrganizationContext, RepositoryError } from '@/core/ports/types'
import type { DbClient } from '@/db/client'
import { usersTable } from '@/db/schema/users'
import { and, eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'

/**
 * Wraps database errors in RepositoryError type
 */
const wrapError =
  (operation: string) =>
  (cause: unknown): RepositoryError => ({
    type: 'repository_error',
    operation,
    cause,
  })

/**
 * Creates a user repository instance
 * @param db - Drizzle database client (request-scoped)
 */
export const createUserRepository = (db: DbClient): UserRepository => ({
  findById: (ctx: OrganizationContext, id: string) =>
    ResultAsync.fromPromise(
      db
        .select({
          id: usersTable.id,
          organizationId: usersTable.organizationId,
          name: usersTable.name,
          email: usersTable.email,
          // ... select fields
        })
        .from(usersTable)
        .where(
          and(
            eq(usersTable.id, id),
            eq(usersTable.organizationId, ctx.organizationId),
            eq(usersTable.isDeleted, false),
          ),
        )
        .limit(1)
        .then((rows): User | null => rows[0] ?? null),
      wrapError('findById'),
    ),

  create: (ctx: OrganizationContext, data: CreateUserData) =>
    ResultAsync.fromPromise(
      (async (): Promise<User> => {
        await db.insert(usersTable).values({
          id: data.id,
          organizationId: ctx.organizationId,
          // ... other fields
        })

        // Fetch and return the created record
        const result = await db.select(/* ... */).from(usersTable).where(/* ... */)
        if (!result[0]) throw new Error('Failed to fetch created user')
        return mapToUser(result[0])
      })(),
      wrapError('create'),
    ),

  // ... other methods
})
```

## Key Patterns

### 1. Factory Function

```typescript
export const createRepository = (db: DbClient): RepositoryInterface => ({
  // methods...
})
```

### 2. wrapError Helper

Always define at the top of the file:

```typescript
const wrapError =
  (operation: string) =>
  (cause: unknown): RepositoryError => ({
    type: 'repository_error',
    operation,
    cause,
  })
```

### 3. ResultAsync.fromPromise

Wrap all async operations:

```typescript
findById: (ctx, id) =>
  ResultAsync.fromPromise(
    db.select(...).then((rows) => rows[0] ?? null),
    wrapError('findById'),
  ),
```

### 4. Return null for Not Found

```typescript
.then((rows): User | null => rows[0] ?? null)
```

### 5. Complex Queries with IIFE

For queries requiring multiple steps:

```typescript
create: (ctx, data) =>
  ResultAsync.fromPromise(
    (async (): Promise<User> => {
      // Multiple steps
      await db.insert(usersTable).values({...})
      const result = await db.select(...).where(...)
      if (!result[0]) throw new Error('Failed to fetch')
      return mapToUser(result[0])
    })(),
    wrapError('create'),
  ),
```

### 6. Mapper Functions

For complex joins:

```typescript
const mapToUser = (row: {
  id: string
  organizationId: string
  name: string
  // ...
}): User => ({
  id: row.id,
  organizationId: row.organizationId,
  name: row.name,
  // ...
})
```

### 7. Multi-tenancy Enforcement

Always filter by `ctx.organizationId` for tenant-scoped entities:

```typescript
.where(
  and(
    eq(usersTable.id, id),
    eq(usersTable.organizationId, ctx.organizationId),  // REQUIRED
    eq(usersTable.isDeleted, false),
  ),
)
```

## Imports Pattern

```typescript
// Port types
import type { User, UserRepository, CreateUserData } from '@/core/ports/user-repository'
import type { OrganizationContext, RepositoryError, Pagination } from '@/core/ports/types'

// Database
import type { DbClient } from '@/db/client'
import { usersTable } from '@/db/schema/users'
import { and, eq, desc, asc, count, ilike, inArray, type SQL } from 'drizzle-orm'

// neverthrow
import { ResultAsync } from 'neverthrow'
```

## Common Query Patterns

### Paginated List with totalCount (REQUIRED Pattern)

**ALL `findAll` methods MUST return `{ items, totalCount }`** for DataTable.Pagination to work.

```typescript
import type { ListUsersOptions, ListUsersResult } from '@/core/ports/user-repository'

findAll: (ctx, options: ListUsersOptions) =>
  ResultAsync.fromPromise(
    (async (): Promise<ListUsersResult> => {
      // 1. Build where conditions
      const conditions: SQL[] = [
        eq(usersTable.organizationId, ctx.organizationId),
        eq(usersTable.isDeleted, false),
      ]

      if (options.status) {
        conditions.push(eq(usersTable.status, options.status))
      }

      if (options.search) {
        const escaped = options.search.replace(/[%_]/g, '\\$&')
        conditions.push(ilike(usersTable.name, `%${escaped}%`))
      }

      const whereClause = and(...conditions)

      // 2. Get total count FIRST (REQUIRED for pagination)
      const [countResult] = await db
        .select({ count: count() })
        .from(usersTable)
        .where(whereClause)

      const totalCount = countResult?.count ?? 0

      // 3. Get paginated items
      const rows = await db
        .select(/* fields */)
        .from(usersTable)
        .where(whereClause)
        .orderBy(desc(usersTable.createdAt))
        .limit(options.limit)
        .offset(options.offset)

      // 4. Return BOTH items and totalCount
      return {
        users: rows.map(mapToUser),
        totalCount,
      }
    })(),
    wrapError('findAll'),
  ),
```

**Key Points:**
1. Query count BEFORE applying limit/offset (to get total matching items)
2. Use same `whereClause` for both count and items queries
3. ALWAYS return `{ items, totalCount }` structure

### Sorting

```typescript
const sortOrder = filters?.sortOrder === 'desc' ? desc : asc
let orderBy: SQL
switch (filters?.sortBy) {
  case 'createdAt':
    orderBy = sortOrder(usersTable.createdAt)
    break
  default:
    orderBy = sortOrder(usersTable.name)
}
query.orderBy(orderBy)
```

### Standalone Count (for non-list operations)

Use this pattern only for standalone count needs (e.g., dashboard stats).
For list operations, always use the paginated pattern above.

```typescript
count: (ctx) =>
  ResultAsync.fromPromise(
    db
      .select({ count: count() })
      .from(usersTable)
      .where(and(eq(usersTable.organizationId, ctx.organizationId), eq(usersTable.isDeleted, false)))
      .then((rows) => rows[0]?.count ?? 0),
    wrapError('count'),
  ),
```

## Checklist

When creating a new repository:

- [ ] Create factory function that receives `DbClient`
- [ ] Define `wrapError` helper at top of file
- [ ] All methods receive `OrganizationContext` (for tenant-scoped entities)
- [ ] All queries filter by `organizationId`
- [ ] All methods return `ResultAsync<T, RepositoryError>`
- [ ] Return `null` for not found (don't throw)
- [ ] Use IIFE for multi-step operations
- [ ] **PAGINATION: `findAll` queries count FIRST, then items**
- [ ] **PAGINATION: `findAll` returns `{ items, totalCount }`, NOT just `items[]`**
- [ ] **PAGINATION: Count query uses same `whereClause` as items query**
