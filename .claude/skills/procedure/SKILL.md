---
name: procedure
description: |
  Provides guidance for creating API procedures (handlers) in Clean Architecture.
  Use this skill when creating API endpoints, implementing thin handlers,
  or mapping use case results to HTTP responses.
  Do NOT load for business logic (use /use-case), database queries, or frontend API calls.
---

<objective>
Creates thin orchestration layers that call use cases. Procedures are the API layer - they only orchestrate (create repos, call use case, map errors) with no business logic.
</objective>

<quick_start>
A procedure has only 4 responsibilities:
1. Create repositories
2. Create use case with dependencies
3. Execute use case with member info from context
4. Map errors and return result

```typescript
.handler(async ({ input, context, errors }) => {
  // 1. Create repositories
  const repo = createRepository(context.db)

  // 2. Create use case
  const useCase = makeUseCase({ repo, generateId })

  // 3. Execute with member info
  const result = await useCase({
    organizationId: context.organization.id,
    memberRole: context.organization.role,
    ...input,
  })

  // 4. Map errors and return
  if (result.isErr()) { /* switch on error.type */ }
  return result.value
})
```
</quick_start>

<location>
```
{project_root}/
├── src/server/
│   ├── procedures/           # or routes/
│   │   ├── users/
│   │   │   ├── create-user.ts
│   │   │   ├── delete-user.ts
│   │   │   └── ...
│   │   ├── organizations/
│   │   │   └── ...
│   │   └── index.ts           # Aggregates all procedures
│   ├── router/
│   │   └── index.ts           # Main router
│   └── lib/
│       └── orpc.ts            # oRPC/tRPC setup and base procedures
```
</location>

<procedure_template>
```typescript
// src/server/procedures/users/create-user.ts
import { userSchema, createUserInputSchema } from '@/contracts/users/user'
import { makeCreateUser } from '@/server/use-cases/users/create-user'
import { createUserRepository } from '@/server/repositories/user.repository'
import { authProcedure } from '@/server/lib/orpc'

/**
 * Create a new user in the organization
 */
export const createUser = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to create users' },
    DUPLICATE_EMAIL: { message: 'A user with this email already exists' },
  })
  .input(createUserInputSchema)
  .output(userSchema)
  .handler(async ({ input, context, errors }) => {
    // 1. Create repositories
    const userRepository = createUserRepository(context.db)

    // 2. Create use case with dependencies
    const createUserUseCase = makeCreateUser({
      userRepository,
      generateId,
    })

    // 3. Execute use case with member info from context
    const result = await createUserUseCase({
      organizationId: context.organization.id,
      memberId: context.organization.memberId,
      memberRole: context.organization.role,
      user: input,
    })

    // 4. Map result to response
    if (result.isErr()) {
      const error = result.error
      switch (error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'duplicate_email':
          throw errors.DUPLICATE_EMAIL()
        case 'repository_error':
          console.error('Repository error in createUser:', error.cause)
          throw new Error('Internal error')
      }
    }

    return result.value
  })
```
</procedure_template>

<error_mapping>
Use `isErr()` pattern with exhaustive switch:

```typescript
if (result.isErr()) {
  const error = result.error
  switch (error.type) {
    case 'forbidden':
      throw errors.FORBIDDEN()
    case 'not_found':
      throw errors.NOT_FOUND()
    case 'duplicate_email':
      throw errors.DUPLICATE_EMAIL()
    case 'repository_error':
      console.error('Repository error:', error.cause)
      throw new Error('Internal error')
  }
}

return result.value
```
</error_mapping>

<context_usage>
```typescript
context.db                    // Request-scoped database client
context.user                  // Authenticated user
context.user.id               // User ID
context.organization          // Current organization
context.organization.id       // Organization ID
context.organization.slug     // Organization slug
context.organization.memberId // Member ID (for use cases)
context.organization.role     // User's role in this organization
```
</context_usage>

<schemas_and_errors>
**Input/Output Schemas:**
```typescript
import { userSchema, createUserInputSchema } from '@/contracts/users/user'

export const createUser = authProcedure
  .input(createUserInputSchema)
  .output(userSchema)
```

**Error Definitions:**
```typescript
.errors({
  FORBIDDEN: { message: 'No permission to perform this action' },
  NOT_FOUND: { message: 'Resource not found' },
  DUPLICATE_EMAIL: { message: 'A record with this email already exists' },
})
```
</schemas_and_errors>

<what_not_to_do>
- **NO business logic** in procedures
- **NO direct DB queries** (use repositories via use cases)
- **NO domain calculations**
- **NO complex conditionals** (logic belongs in use cases)
</what_not_to_do>

<router_integration>
After creating a procedure, add it to the router:

```typescript
import { createUser } from './procedures/users/create-user'

export const router = {
  // ... existing routes
  users: {
    create: createUser,  // Add here
  },
}
```
</router_integration>

<imports_pattern>
```typescript
// Contracts (shared schemas)
import { userSchema, createUserInputSchema } from '@/contracts/users/user'

// Use case
import { makeCreateUser } from '@/server/use-cases/users/create-user'

// Repositories
import { createUserRepository } from '@/server/repositories/user.repository'

// oRPC/tRPC
import { authProcedure } from '@/server/lib/orpc'
```
</imports_pattern>

<list_procedure_pagination>
**ALL list procedures MUST pass pagination params and return `totalCount`.**

```typescript
import { listUsersInputSchema, listUsersOutputSchema } from '@/contracts/users/user'
import { makeListUsers } from '@/server/use-cases/users/list-users'
import { createUserRepository } from '@/server/repositories/user.repository'

/**
 * List users with pagination
 */
export const listUsers = authProcedure
  .input(listUsersInputSchema)  // Has limit, offset
  .output(listUsersOutputSchema)  // Has totalCount
  .handler(async ({ input, context }) => {
    const userRepository = createUserRepository(context.db)
    const listUsersUseCase = makeListUsers({ userRepository })

    const result = await listUsersUseCase({
      organizationId: context.organization.id,
      // Pass pagination params to use case
      limit: input.limit,
      offset: input.offset,
      // Pass filters
      search: input.search,
      status: input.status,
    })

    if (result.isErr()) {
      console.error('Repository error:', result.error.cause)
      throw new Error('Internal error')
    }

    // Use case returns { users, totalCount }
    const { users, totalCount } = result.value

    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        // ... map fields
      })),
      totalCount,  // REQUIRED for DataTable.Pagination
    }
  })
```

**Key Points:**
1. Input schema has `limit` and `offset` (from `/contracts` skill)
2. Output schema has `totalCount` (from `/contracts` skill)
3. Pass pagination params through to use case
4. Return `totalCount` from use case result
</list_procedure_pagination>

<success_criteria>
When creating a new procedure:

- [ ] Define error types with `.errors({...})`
- [ ] Define input schema with `.input()` (if needed)
- [ ] Define output schema with `.output()`
- [ ] Create repositories in handler (step 1)
- [ ] Create use case with dependencies (step 2)
- [ ] Execute use case with context info (step 3)
- [ ] Map all error types with switch statement (step 4)
- [ ] Add procedure to router
- [ ] NO business logic in the handler
- [ ] **PAGINATION: List procedures pass `limit`/`offset` to use case**
- [ ] **PAGINATION: List procedures return `totalCount` from use case**
</success_criteria>
