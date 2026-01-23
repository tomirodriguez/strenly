---
name: domain-entity
description: |
  This skill provides guidance for creating domain entities in Clean Architecture.
  Use this skill when creating business entities, adding validation logic, implementing state machines,
  or working with domain types in the core layer.
  Do NOT load for DTOs, API response types, database models, or simple data structures without business rules.
version: 1.0.0
---

# Domain Entity

Domain entities encapsulate business logic, validation, and state transitions. They are the source of truth for business rules.

## CRITICAL: Domain Entities Are Mandatory

**Every entity that can be created or modified MUST have a domain entity.**

Domain entities are the source of truth for business validation. Use cases MUST call the domain factory function before persisting data. Without domain entities, there's no validation of business rules.

## When to Use

- Creating a new business entity
- Adding validation logic to an entity
- Implementing state machines or state transitions
- Working with domain types (like Result, ValidationError)
- Adding query helpers (pure functions that derive state)

## Location

```
{project_root}/
├── src/core/
│   ├── domain/
│   │   └── entities/
│   │       ├── user.ts           # Entity with validation
│   │       ├── user.test.ts      # Unit tests
│   │       ├── subscription.ts   # Entity with state machine
│   │       └── plan.ts           # Entity with limits
│   └── errors/
│       └── index.ts              # Domain error types
```

## Entity Structure

A domain entity file contains:

1. **Types** - Entity type and input types
2. **Validation functions** - Private validators per field
3. **Factory function** - Creates validated instances (receives ID from use case)
4. **Mutation helpers** - Immutable state transitions
5. **Query helpers** - Pure functions to derive state

## Full Example

For complete implementation with all sections, see `references/full-example.md`.

Quick reference structure:

```typescript
// src/core/domain/entities/user.ts
import { err, ok, type Result } from 'neverthrow'
import { type DomainError, validationError } from '@/core/errors'

const ENTITY = 'user'

// Types
export type User = { readonly id: string; /* ... */ }
export type CreateUserInput = { id: string; /* ... */ }

// Private validation functions
const validateName = (name: string): Result<string, DomainError> => { /* ... */ }

// Factory function
export const createUser = (input: CreateUserInput): Result<User, DomainError> => { /* ... */ }

// Query helpers using Pick<>
export const isAdmin = (user: Pick<User, 'role'>): boolean => { /* ... */ }
```

## ID Generation Strategy

**The domain entity receives the ID as input.** It does NOT generate IDs.

Why? Because ID generation is an infrastructure concern:
- The use case injects a `generateId: () => string` dependency
- The use case calls `generateId()` and passes the result to the domain
- This makes the domain pure and testeable

```typescript
// In use case:
type Dependencies = {
  repository: UserRepository
  generateId: () => string  // Injected
}

// Use case creates the ID and passes it to domain
const userResult = createUser({
  id: deps.generateId(),  // ID comes from injected dependency
  organizationId: input.organizationId,
  name: input.user.name,
  email: input.user.email,
})
```

## State Machine Pattern

For entities with state transitions, see `references/full-example.md#state-machine-pattern`.

Key concepts:
- Define state types (`SubscriptionState = 'trial' | 'active' | ...`)
- State query functions receive `now` as parameter for testability
- Mutation helpers return new immutable instance

## Error Types

Located at `src/core/errors/index.ts`:

```typescript
export type ValidationError = {
  type: 'validation_error'
  entity: string
  field: string
  message: string
}

export type DomainError = ValidationError

export const validationError = (entity: string, field: string, message: string): ValidationError => ({
  type: 'validation_error',
  entity,
  field,
  message,
})
```

## Usage in Use Cases

```typescript
import { createUser } from '@/core/domain/entities/user'

// In use case - ID comes from injected generateId
const userResult = createUser({
  id: deps.generateId(),
  organizationId: input.organizationId,
  name: input.user.name,
  email: input.user.email,
})

// Map domain error to use case error
if (userResult.isErr()) {
  return errAsync<Output, UseCaseError>({
    type: 'validation_error',
    message: userResult.error.message,
  })
}

// Only persist after domain validation passes
return deps.userRepository.create(ctx, userResult.value)
```

## Key Patterns

1. **Immutable types**: Use `readonly` on all entity properties
2. **Result type**: Factory returns `Result<Entity, DomainError>`, never throws
3. **Validation isolation**: Each field has its own validation function
4. **ENTITY constant**: Used in error messages for consistency
5. **Pick<> for helpers**: Query functions only require the fields they need
6. **Pure functions**: No side effects, state queries receive `now` as parameter
7. **Immutable mutations**: Return new object with spread operator
8. **ID as input**: Domain receives ID from use case, doesn't generate it

## Checklist Before Creating a Domain Entity

- [ ] Is the entity type using `readonly` on all properties?
- [ ] Does the factory receive ID as input (not generate it)?
- [ ] Does the factory return `Result<Entity, DomainError>`?
- [ ] Does each field have its own validation function?
- [ ] Are there unit tests for all validation rules?
- [ ] Are query helpers using `Pick<>` to minimize required data?
