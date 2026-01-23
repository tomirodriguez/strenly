---
name: use-case
description: |
  This skill provides guidance for creating use cases in Clean Architecture.
  Use this skill when implementing business logic, orchestrating repositories,
  or working with neverthrow for error handling in the application layer.
  Do NOT load for simple CRUD without business rules, API handlers, or domain entity definitions.
version: 1.0.0
---

# Use Case

Use cases contain business logic and orchestrate repositories. They are the application layer.

## When to Use

- Creating a new use case for business logic
- Orchestrating multiple repositories
- Handling errors with neverthrow (errAsync, okAsync, andThen, mapErr)
- Adding authorization checks (see also `/authorization` skill)

## Location

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

## CRITICAL: Domain Entities Are Mandatory

**Every use case that creates or modifies data MUST use domain entities for validation.**

Domain entities (`src/core/domain/entities/`) are the source of truth for business rules. Without them, we have no validation of business logic.

The flow is always:
1. Authorization check
2. Business rules validation (duplicates, limits, etc.)
3. **Create/validate entity via domain** - This validates all business rules
4. Persist via repository

```typescript
// WRONG - Creating data directly without domain validation
const userId = nanoid()
return deps.userRepository.create(ctx, {
  id: userId,
  name: input.name,  // No validation!
  email: input.email,
})

// CORRECT - Using domain entity for validation
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

## ID Generation as Dependency

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

## Use Case Structure

For complete implementation example, see `references/full-example.md`.

Quick reference:

```typescript
// src/server/use-cases/users/create-user.ts
export type CreateUserInput = { organizationId: string; memberRole: Role; /* ... */ }
export type CreateUserOutput = User
export type CreateUserError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; cause: unknown }

type Dependencies = { userRepository: UserRepository; generateId: () => string }

export const makeCreateUser =
  (deps: Dependencies) =>
  (input: CreateUserInput): ResultAsync<CreateUserOutput, CreateUserError> => {
    // 1. Authorization check FIRST
    // 2. Business rules validation
    // 3. Create entity via domain
    // 4. Persist via repository
  }
```

## Key Patterns

### 1. Factory Pattern with Injected Dependencies

```typescript
type Dependencies = {
  repository: SomeRepository
  generateId: () => string  // Always inject ID generation
}

export const makeUseCaseName =
  (deps: Dependencies) =>
  (input: Input): ResultAsync<Output, Error> => { ... }
```

### 2. Export Types

Always export Input, Output, and Error types:

```typescript
export type CreateUserInput = { ... }
export type CreateUserOutput = User
export type CreateUserError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'not_found'; message: string }
  | { type: 'repository_error'; cause: unknown }
```

### 3. Authorization First

Always check permission before any business logic:

```typescript
if (!hasPermission(input.memberRole, 'users:write')) {
  return errAsync({
    type: 'forbidden',
    message: 'No permission to perform this action',
  })
}
```

### 4. Domain Validation Before Persistence

Always create/validate via domain entity before persisting:

```typescript
// Create entity via domain
const entityResult = createEntity({ ...input, id: deps.generateId() })

if (entityResult.isErr()) {
  return errAsync<Output, Error>({
    type: 'validation_error',
    message: entityResult.error.message,
  })
}

// Only persist after domain validation passes
return deps.repository.create(ctx, entityResult.value)
```

### 5. Error Mapping

Transform domain and repository errors to use case errors:

```typescript
// Repository error
.mapErr((e): UseCaseError => ({ type: 'repository_error', cause: e.cause }))

// Domain validation error
if (entityResult.isErr()) {
  return errAsync<Output, UseCaseError>({
    type: 'validation_error',
    message: entityResult.error.message,
  })
}
```

### 6. Null Handling

Use errAsync for not found:

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

### 7. Type Annotations

Always annotate okAsync/errAsync generics:

```typescript
return okAsync<Output, Error>({ ... })
return errAsync<Output, Error>({ type: 'not_found', message: '...' })
```

## Imports Pattern

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

## File Structure

For complete file structure template, see `references/full-example.md#file-structure-template`.

Order: Imports → Input type → Output type → Error type → Dependencies → Factory function with JSDoc

## Checklist Before Creating a Use Case

- [ ] Does the domain entity exist? If not, create it first (see `/domain-entity` skill)
- [ ] Is `generateId` included in Dependencies?
- [ ] Does the error union include `validation_error` for domain errors?
- [ ] Is the domain entity used to validate data before persistence?
- [ ] Is authorization checked FIRST before any business logic?
