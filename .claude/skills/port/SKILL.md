---
name: port
description: |
  Provides guidance for creating repository ports (interfaces) in Clean Architecture.
  Use this skill when defining data access contracts, creating repository interfaces,
  or working with OrganizationContext for multi-tenancy.
  Do NOT load for repository implementations (use /repository), use case logic, or API contracts.
---

<objective>
Defines repository contracts (interfaces) that implementations must follow. Ports are the core layer interfaces that ensure proper multi-tenancy, error handling, and pagination support.
</objective>

<quick_start>
1. Create file at `src/core/ports/{entity}-repository.port.ts`
2. Define entity type with all fields
3. Define `Create{Entity}Data` and `Update{Entity}Data` types
4. Define `List{Entities}Options` with **limit and offset (REQUIRED)**
5. Define `List{Entities}Result` with **totalCount (REQUIRED)**
6. All methods receive `OrganizationContext` (for tenant-scoped entities)
7. All methods return `ResultAsync<T, RepositoryError>`
</quick_start>

<location>
```
{project_root}/
├── src/core/ports/              # or packages/core/src/ports/
│   ├── types.ts                 # Base types (OrganizationContext, RepositoryError)
│   ├── user-repository.ts       # User data access contract
│   ├── organization-repository.ts
│   └── ...
```
</location>

<base_types>
Located at `src/core/ports/types.ts`:

```typescript
import type { ResultAsync } from 'neverthrow'

/**
 * Repository error - all repository operations return ResultAsync<T, RepositoryError>
 */
export type RepositoryError = {
  type: 'repository_error'
  operation: string
  cause: unknown
}

/**
 * Factory to create RepositoryError
 */
export const repositoryError = (operation: string, cause: unknown): RepositoryError => ({
  type: 'repository_error',
  operation,
  cause,
})

/**
 * Organization context for multi-tenancy enforcement.
 * All tenant-scoped repository operations require this context.
 * Repositories MUST filter queries by ctx.organizationId.
 */
export type OrganizationContext = {
  organizationId: string
}

/**
 * Pagination options for list operations (REQUIRED for all findAll methods)
 */
export type PaginationOptions = {
  limit: number
  offset: number
}

/**
 * Paginated list result (REQUIRED return type for findAll methods)
 * The frontend's DataTable.Pagination REQUIRES totalCount
 */
export type PaginatedResult<T> = {
  items: T[]
  totalCount: number
}

/**
 * Repository result type alias
 */
export type RepositoryResult<T> = ResultAsync<T, RepositoryError>
```
</base_types>

<port_template>
```typescript
// src/core/ports/user-repository.ts
import type { ResultAsync } from 'neverthrow'
import type { OrganizationContext, Pagination, RepositoryError } from './types'

/**
 * User entity type
 */
export type User = {
  id: string
  organizationId: string
  name: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Data for creating a new user
 */
export type CreateUserData = {
  id: string
  name: string
  email: string
  role: string
}

/**
 * Data for updating a user
 */
export type UpdateUserData = {
  name?: string
  email?: string
  role?: string
}

/**
 * Options for listing users (filters + pagination)
 */
export type ListUsersOptions = {
  // Filters
  role?: string
  search?: string
  sortBy?: 'name' | 'createdAt' | 'email'
  sortOrder?: 'asc' | 'desc'
  // Pagination (REQUIRED)
  limit: number
  offset: number
}

/**
 * Result type for paginated user list (REQUIRED pattern)
 * This structure is needed for DataTable.Pagination to work
 */
export type ListUsersResult = {
  users: User[]
  totalCount: number
}

/**
 * User Repository Port
 */
export type UserRepository = {
  /**
   * Create a new user
   */
  create: (ctx: OrganizationContext, data: CreateUserData) => ResultAsync<User, RepositoryError>

  /**
   * Update an existing user. Returns null if not found.
   */
  update: (ctx: OrganizationContext, id: string, data: UpdateUserData) => ResultAsync<User | null, RepositoryError>

  /**
   * Soft delete a user
   */
  softDelete: (ctx: OrganizationContext, id: string) => ResultAsync<void, RepositoryError>

  /**
   * Find user by ID. Returns null if not found.
   */
  findById: (ctx: OrganizationContext, id: string) => ResultAsync<User | null, RepositoryError>

  /**
   * Find all users with filters and pagination.
   * MUST return totalCount for DataTable.Pagination to work.
   * @returns { users: User[], totalCount: number }
   */
  findAll: (ctx: OrganizationContext, options: ListUsersOptions) => ResultAsync<ListUsersResult, RepositoryError>

  /**
   * Check if user email exists (for duplicate validation)
   */
  existsByEmail: (ctx: OrganizationContext, email: string, excludeId?: string) => ResultAsync<boolean, RepositoryError>
}
```
</port_template>

<method_naming>
| Pattern | Example | Returns |
|---------|---------|---------|
| `findById` | `findById(ctx, id)` | `T \| null` |
| `findAll` | `findAll(ctx, options)` | `{ items: T[], totalCount: number }` |
| `findBy{X}` | `findByRole(ctx, role)` | `T[]` |
| `create` | `create(ctx, data)` | `T` |
| `update` | `update(ctx, id, data)` | `T \| null` |
| `softDelete` | `softDelete(ctx, id)` | `void` |
| `existsBy{X}` | `existsByEmail(ctx, email)` | `boolean` |
</method_naming>

<pagination_requirements>
**ALL `findAll` methods MUST support pagination and return `totalCount`.**

**Why This Is Required:**
- The frontend uses `DataTable.Pagination` which REQUIRES `totalCount`
- Without pagination, the API loads ALL records (performance disaster)
- Without `totalCount`, pagination controls cannot render

**Required Types Pattern:**
```typescript
// Options type with REQUIRED pagination
export type List{Entities}Options = {
  // Filters (optional)
  search?: string
  status?: string
  // Pagination (REQUIRED - not optional!)
  limit: number
  offset: number
}

// Result type with REQUIRED totalCount
export type List{Entities}Result = {
  {entities}: {Entity}[]
  totalCount: number
}
```

**Method Signature:**
```typescript
findAll: (ctx: OrganizationContext, options: List{Entities}Options)
  => ResultAsync<List{Entities}Result, RepositoryError>
```

**NEVER return just `T[]` from findAll.** Always return `{ items, totalCount }`.
</pagination_requirements>

<tenant_scoping>
**Tenant-Scoped** (require OrganizationContext):
- Users, Members, Invitations
- Project-specific data
- Anything that belongs to an organization

**Global** (no OrganizationContext needed):
- Plans, Subscriptions
- System configuration
- Shared reference data

```typescript
// Tenant-scoped
type UserRepository = {
  findById: (ctx: OrganizationContext, id: string) => ResultAsync<User | null, RepositoryError>
}

// Global (no ctx parameter)
type PlanRepository = {
  findById: (id: string) => ResultAsync<Plan | null, RepositoryError>
}
```
</tenant_scoping>

<key_patterns>
1. **Data types are exported**: Use cases import these types
2. **Return `null` for not found**: Don't throw or return error for missing items
3. **All methods receive `OrganizationContext`**: Multi-tenancy enforcement
4. **Use `ResultAsync<T, RepositoryError>`**: Consistent error handling
5. **JSDoc comments**: Explain what each method returns and when
6. **Separate input types**: `CreateUserData`, `UpdateUserData` are distinct
</key_patterns>

<imports_pattern>
```typescript
// In use cases
import type { User, UserRepository } from '@/core/ports/user-repository'
import type { OrganizationContext, RepositoryError, Pagination } from '@/core/ports/types'
```
</imports_pattern>

<success_criteria>
When creating a new port:

- [ ] Define entity type with all fields
- [ ] Define `Create{Entity}Data` type (id + required fields)
- [ ] Define `Update{Entity}Data` type (all optional except id)
- [ ] Define `List{Entities}Options` type with **limit and offset (REQUIRED)**
- [ ] Define `List{Entities}Result` type with **totalCount (REQUIRED)**
- [ ] All methods receive `OrganizationContext` (for tenant-scoped)
- [ ] All methods return `ResultAsync<T, RepositoryError>`
- [ ] Add JSDoc comments explaining return values
- [ ] Use `T | null` for single-item queries
- [ ] **PAGINATION: `findAll` returns `{ items, totalCount }`, NOT `T[]`**
</success_criteria>
