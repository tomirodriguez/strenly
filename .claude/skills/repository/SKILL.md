---
name: repository
description: |
  Provides guidance for implementing repositories in Clean Architecture.
  Use this skill when implementing a port interface with Drizzle ORM, writing database queries,
  or working with ResultAsync.fromPromise for error handling.
  Do NOT load for port definitions (use /port), business logic, or raw SQL without Drizzle.
---

<objective>
Implements port interfaces using Drizzle ORM with proper error handling, multi-tenancy enforcement, and pagination support. All methods return `ResultAsync<T, RepositoryError>`.
</objective>

<quick_start>
1. Create file at `src/server/repositories/{entity}.repository.ts`
2. Define `wrapError` helper at top
3. Create factory function that receives `DbClient`
4. All methods receive `OrganizationContext` and filter by `organizationId`
5. All methods return `ResultAsync<T, RepositoryError>`
6. `findAll` returns `{ items, totalCount }` (REQUIRED for pagination)
</quick_start>

<location>
```
{project_root}/
├── src/server/repositories/     # or src/infra/db/repositories/
│   ├── user.repository.ts
│   ├── organization.repository.ts
│   └── ...
```
</location>

<repository_template>
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
</repository_template>

<key_patterns>
**1. Factory Function**
```typescript
export const createRepository = (db: DbClient): RepositoryInterface => ({
  // methods...
})
```

**2. wrapError Helper**
```typescript
const wrapError =
  (operation: string) =>
  (cause: unknown): RepositoryError => ({
    type: 'repository_error',
    operation,
    cause,
  })
```

**3. ResultAsync.fromPromise**
```typescript
findById: (ctx, id) =>
  ResultAsync.fromPromise(
    db.select(...).then((rows) => rows[0] ?? null),
    wrapError('findById'),
  ),
```

**4. Return null for Not Found**
```typescript
.then((rows): User | null => rows[0] ?? null)
```

**5. Complex Queries with IIFE**
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

**6. Multi-tenancy Enforcement**
```typescript
.where(
  and(
    eq(usersTable.id, id),
    eq(usersTable.organizationId, ctx.organizationId),  // REQUIRED
    eq(usersTable.isDeleted, false),
  ),
)
```
</key_patterns>

<imports_pattern>
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
</imports_pattern>

<paginated_list_pattern>
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
</paginated_list_pattern>

<sorting_pattern>
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
</sorting_pattern>

<mapper_functions>
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
</mapper_functions>

<success_criteria>
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
</success_criteria>
