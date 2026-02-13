---
name: use-case
description: |
  Provides guidance for creating use cases in Clean Architecture.
  Use this skill when implementing business logic, orchestrating repositories,
  or working with neverthrow for error handling in the application layer.
  Do NOT load for simple CRUD without business rules, API handlers, or domain entity definitions.
---

<objective>
Creates use cases that contain business logic and orchestrate repositories. Use cases are the application layer - they check authorization FIRST, validate via domain entities, and coordinate repository operations.
</objective>

<quick_start>
1. Create file at `src/server/use-cases/{domain}/{action}.ts`
2. Export Input, Output, and Error types
3. Define Dependencies type with `generateId: () => string`
4. Authorization check FIRST (before any logic)
5. Validate via domain entity BEFORE persisting
6. Return `ResultAsync<Output, Error>`
</quick_start>

<critical_context>
**Every use case that creates or modifies data MUST use domain entities for validation.**

Domain entities (`src/core/domain/entities/`) are the source of truth for business rules. Without them, we have no validation of business logic.

The flow is always:
1. Authorization check
2. Business rules validation (duplicates, limits, etc.)
3. **Create/validate entity via domain** - This validates all business rules
4. Persist via repository
</critical_context>

<location>
```
{project_root}/
├── src/server/use-cases/        # or src/core/application/
│   ├── users/
│   │   ├── create-user.ts
│   │   ├── delete-user.ts
│   │   └── ...
│   ├── organizations/
│   │   └── ...
│   └── ...
```
</location>

<use_case_template>
```typescript
// src/server/use-cases/users/create-user.ts
import { hasPermission, type Role } from '@/core/services/authorization'
import { createUser } from '@/core/domain/entities/user'
import type { User, UserRepository } from '@/core/ports/user-repository'
import type { OrganizationContext } from '@/core/ports/types'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type CreateUserInput = {
  organizationId: string
  memberId: string
  memberRole: Role
  user: {
    name: string
    email: string
  }
}

export type CreateUserOutput = User

export type CreateUserError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'duplicate_email'; message: string }
  | { type: 'repository_error'; cause: unknown }

type Dependencies = {
  userRepository: UserRepository
  generateId: () => string  // Always inject ID generation
}

/**
 * Creates a new user in the organization
 */
export const makeCreateUser =
  (deps: Dependencies) =>
  (input: CreateUserInput): ResultAsync<CreateUserOutput, CreateUserError> => {
    const ctx: OrganizationContext = { organizationId: input.organizationId }

    // 1. Authorization check FIRST
    if (!hasPermission(input.memberRole, 'users:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to create users',
      })
    }

    // 2. Check business rules (duplicates, limits, etc.)
    return deps.userRepository
      .existsByEmail(ctx, input.user.email)
      .andThen((exists) => {
        if (exists) {
          return errAsync<CreateUserOutput, CreateUserError>({
            type: 'duplicate_email',
            message: 'A user with this email already exists',
          })
        }

        // 3. Create entity via domain (validates business rules)
        const userResult = createUser({
          id: deps.generateId(),
          organizationId: input.organizationId,
          name: input.user.name,
          email: input.user.email,
        })

        if (userResult.isErr()) {
          return errAsync<CreateUserOutput, CreateUserError>({
            type: 'validation_error',
            message: userResult.error.message,
          })
        }

        // 4. Persist via repository
        return deps.userRepository.create(ctx, userResult.value)
      })
      .mapErr((e): CreateUserError => {
        if ('type' in e) return e
        return { type: 'repository_error', cause: e }
      })
  }
```
</use_case_template>

<key_patterns>
**1. Factory Pattern with Injected Dependencies**
```typescript
type Dependencies = {
  repository: SomeRepository
  generateId: () => string  // Always inject ID generation
}

export const makeUseCaseName =
  (deps: Dependencies) =>
  (input: Input): ResultAsync<Output, Error> => { ... }
```

**2. Export Types**
```typescript
export type CreateUserInput = { ... }
export type CreateUserOutput = User
export type CreateUserError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'not_found'; message: string }
  | { type: 'repository_error'; cause: unknown }
```

**3. Authorization First**
```typescript
if (!hasPermission(input.memberRole, 'users:write')) {
  return errAsync({
    type: 'forbidden',
    message: 'No permission to perform this action',
  })
}
```

**4. Domain Validation Before Persistence**
```typescript
const entityResult = createEntity({ ...input, id: deps.generateId() })

if (entityResult.isErr()) {
  return errAsync<Output, Error>({
    type: 'validation_error',
    message: entityResult.error.message,
  })
}

return deps.repository.create(ctx, entityResult.value)
```

**5. Error Mapping**
```typescript
.mapErr((e): UseCaseError => ({ type: 'repository_error', cause: e.cause }))
```

**6. Null Handling**
```typescript
.andThen((data) => {
  if (!data) {
    return errAsync<Output, Error>({
      type: 'not_found',
      message: 'Resource not found',
    })
  }
  return okAsync<Output, Error>(data)
})
```

**7. Type Annotations**
```typescript
return okAsync<Output, Error>({ ... })
return errAsync<Output, Error>({ type: 'not_found', message: '...' })
```
</key_patterns>

<id_generation>
**Never use external libraries directly in use cases for ID generation.** Instead, inject a `generateId` function as a dependency.

```typescript
type Dependencies = {
  userRepository: UserRepository
  generateId: () => string  // Injected, not hardcoded
}
```

This approach:
- Makes the code testeable (we can mock the generator in tests)
- Follows dependency inversion principle
- Allows changing the implementation without touching use cases
</id_generation>

<wrong_vs_right>
**WRONG - Creating data directly without domain validation**
```typescript
const userId = nanoid()
return deps.userRepository.create(ctx, {
  id: userId,
  name: input.name,  // No validation!
  email: input.email,
})
```

**CORRECT - Using domain entity for validation**
```typescript
const userResult = createUser({
  id: deps.generateId(),
  name: input.name,
  email: input.email,
})

if (userResult.isErr()) {
  return errAsync<Output, Error>({
    type: 'validation_error',
    message: userResult.error.message,
  })
}

return deps.userRepository.create(ctx, userResult.value)
```
</wrong_vs_right>

<imports_pattern>
```typescript
// Authorization (pure functions)
import { hasPermission, type Role } from '@/core/services/authorization'

// Domain entities - ALWAYS import for create/update operations
import { createUser } from '@/core/entities/user'

// Port types
import type { User, UserRepository } from '@/core/ports/user-repository'
import type { OrganizationContext } from '@/core/ports/types'

// neverthrow
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'
```
</imports_pattern>

<success_criteria>
Before creating a use case:

- [ ] Does the domain entity exist? If not, create it first (see `/domain` skill)
- [ ] Is `generateId` included in Dependencies?
- [ ] Does the error union include `validation_error` for domain errors?
- [ ] Is the domain entity used to validate data before persistence?
- [ ] Is authorization checked FIRST before any business logic?
</success_criteria>

<resources>
For complete file structure template, see `references/full-example.md#file-structure-template`.

Order: Imports → Input type → Output type → Error type → Dependencies → Factory function with JSDoc
</resources>
