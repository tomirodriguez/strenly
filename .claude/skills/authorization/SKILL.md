---
name: authorization
description: |
  This skill provides guidance for implementing role-based access control (RBAC).
  Use this skill when adding permission checks to use cases, restricting actions by role,
  checking if a user can perform an action, or adding new permissions to the system.
  Do NOT load for authentication flows, login/logout, session management, or JWT/token handling.
version: 1.0.0
---

# Authorization

Role-based access control using pure functions from the core services layer.

## When to Use

- Adding permission checks to a use case
- Restricting actions by user role
- Checking if a role can perform an action
- Adding new permissions to the system
- Understanding which roles have which permissions

## Location

Authorization logic lives in `src/core/services/authorization.ts` as pure functions (no interface injection needed).

## Roles Hierarchy Example

| Role | Level | Description |
|------|-------|-------------|
| `owner` | 100 | Full access including billing and org deletion |
| `admin` | 80 | Manage members and resources, no billing |
| `member` | 40 | Standard access to resources |
| `viewer` | 20 | Read-only access |

## Using Authorization in Use Cases

Import the `hasPermission` function directly (not injected):

```typescript
import { hasPermission, type Role } from '@/core/services/authorization'
import { errAsync, type ResultAsync } from 'neverthrow'

// Input includes member info
export type MyUseCaseInput = {
  organizationId: string
  memberId: string
  memberRole: Role
  // ... other fields
}

// Error type includes forbidden
export type MyUseCaseError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; message: string }
  | { type: 'repository_error'; cause: unknown }

export const makeMyUseCase =
  (deps: Dependencies) =>
  (input: MyUseCaseInput): ResultAsync<Output, MyUseCaseError> => {
    // 1. Authorization check FIRST (before any business logic)
    if (!hasPermission(input.memberRole, 'users:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to perform this action',
      })
    }

    // 2. Business logic...
    return deps.repository.find(...)
  }
```

## Passing Member Info from Procedure

The procedure passes member info from the authenticated context:

```typescript
const result = await makeMyUseCase({
  myRepository: createMyRepository(context.db),
})({
  organizationId: context.organization.id,
  memberId: context.organization.memberId,  // Member ID from context
  memberRole: context.organization.role,    // Role comes from context
  // ... other input
})
```

## Handling Forbidden in Procedure

Add `FORBIDDEN` to the procedure's error definitions:

```typescript
export const myProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to perform this action' },
    NOT_FOUND: { message: 'Not found' },
  })
  .handler(async ({ input, context, errors }) => {
    const result = await makeMyUseCase(...)({...})

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.NOT_FOUND()
        case 'repository_error':
          console.error('Repository error:', result.error.cause)
          throw new Error('Internal error')
      }
    }

    return result.value
  })
```

## Available Permissions Example

| Resource | Permissions |
|----------|-------------|
| Users | `users:read`, `users:write`, `users:delete` |
| Organization | `organization:read`, `organization:manage`, `organization:delete` |
| Members | `members:read`, `members:invite`, `members:remove` |
| Billing | `billing:read`, `billing:manage` |

## Adding New Permissions

1. Add to `Permission` type in `src/core/services/authorization.ts`:
   ```typescript
   export type Permission =
     | 'users:read'
     // ... existing
     | 'newresource:read'   // Add new permission
     | 'newresource:write'
   ```

2. Add to appropriate roles in `ROLE_PERMISSIONS`:
   ```typescript
   export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
     owner: [
       // ... existing
       'newresource:read',
       'newresource:write',
     ],
     admin: [
       // ... existing
       'newresource:read',
       'newresource:write',
     ],
     member: [
       // ... existing
       'newresource:read',
     ],
     // ...
   }
   ```

3. Use in use case:
   ```typescript
   if (!hasPermission(input.memberRole, 'newresource:write')) {
     return errAsync({ type: 'forbidden', message: '...' })
   }
   ```

## Implementation Example

For full implementation code, see `references/implementation-example.md`.

Core functions:

```typescript
// src/core/services/authorization.ts
export type Role = 'owner' | 'admin' | 'member' | 'viewer'
export type Permission = 'users:read' | 'users:write' | /* ... */

export const hasPermission = (role: Role, permission: Permission): boolean
export const getPermissions = (role: Role): readonly Permission[]
export const hasHigherOrEqualRole = (role: Role, targetRole: Role): boolean
```

## Key Patterns

1. **Authorization first**: Check permission before any business logic
2. **Pure functions**: No dependency injection needed for authorization
3. **Principle of least privilege**: Unknown roles default to lowest permissions
4. **User-friendly messages**: Error messages should be clear

## Checklist

When adding authorization to a use case:

- [ ] Import `hasPermission` from authorization service
- [ ] Add `memberRole: Role` to input type
- [ ] Add `{ type: 'forbidden'; message: string }` to error union
- [ ] Check permission FIRST in the use case
- [ ] Add `FORBIDDEN` error to procedure
- [ ] Map `forbidden` error to `errors.FORBIDDEN()` in procedure
