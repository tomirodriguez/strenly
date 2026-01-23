# Use Case Full Example

Complete implementation of a CreateUser use case with authorization, domain validation, and error handling.

```typescript
// src/server/use-cases/users/create-user.ts
import { hasPermission, type Role } from '@/core/services/authorization'
import { createUser } from '@/core/entities/user'
import type { User, UserRepository } from '@/core/ports/user-repository'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

// Input
export type CreateUserInput = {
  organizationId: string
  memberId: string
  memberRole: Role
  user: {
    name: string
    email: string
  }
}

// Output
export type CreateUserOutput = User

// Errors - discriminated union
export type CreateUserError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'duplicate_email'; message: string }
  | { type: 'repository_error'; cause: unknown }

// Dependencies - include generateId
type Dependencies = {
  userRepository: UserRepository
  generateId: () => string
}

/**
 * Create a new user in the organization
 *
 * Authorization: Requires 'users:write' permission
 *
 * Flow:
 * 1. Verify actor has users:write permission
 * 2. Check for duplicate email
 * 3. Create user entity via domain (validates business rules)
 * 4. Persist user
 */
export const makeCreateUser =
  (deps: Dependencies) =>
  (input: CreateUserInput): ResultAsync<CreateUserOutput, CreateUserError> => {
    // 1. Authorization check FIRST
    if (!hasPermission(input.memberRole, 'users:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to create users',
      })
    }

    const ctx = { organizationId: input.organizationId }

    // 2. Check for duplicate email (business rule)
    return deps.userRepository
      .existsByEmail(ctx, input.user.email)
      .mapErr((e): CreateUserError => ({ type: 'repository_error', cause: e.cause }))
      .andThen((exists) => {
        if (exists) {
          return errAsync<CreateUserOutput, CreateUserError>({
            type: 'duplicate_email',
            message: 'A user with this email already exists',
          })
        }

        // 3. Create user entity via domain (validates all fields)
        const userResult = createUser({
          id: deps.generateId(),
          organizationId: input.organizationId,
          name: input.user.name,
          email: input.user.email,
        })

        // Map domain validation error to use case error
        if (userResult.isErr()) {
          return errAsync<CreateUserOutput, CreateUserError>({
            type: 'validation_error',
            message: userResult.error.message,
          })
        }

        // 4. Persist the validated entity
        return deps.userRepository
          .create(ctx, userResult.value)
          .mapErr((e): CreateUserError => ({ type: 'repository_error', cause: e.cause }))
      })
  }
```

## File Structure Template

```typescript
// 1. Imports

// 2. Input type (exported)
export type UseCaseInput = { ... }

// 3. Output type (exported)
export type UseCaseOutput = { ... }

// 4. Error type (exported, discriminated union)
export type UseCaseError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'not_found'; message: string }
  | { type: 'repository_error'; cause: unknown }

// 5. Dependencies type (internal, includes generateId)
type Dependencies = {
  repository: SomeRepository
  generateId: () => string
}

// 6. Factory function with JSDoc
/**
 * Description of what the use case does
 *
 * Authorization: Required permission
 *
 * Flow:
 * 1. Authorization check
 * 2. Business rules validation
 * 3. Create entity via domain
 * 4. Persist
 */
export const makeUseCaseName = (deps: Dependencies) => (input: UseCaseInput): ResultAsync<UseCaseOutput, UseCaseError> => {
  // Implementation following the flow above
}
```
