---
name: authorization
description: |
  Provides guidance for implementing role-based access control (RBAC).
  Use this skill when adding permission checks to use cases, restricting actions by role,
  checking if a user can perform an action, or adding new permissions to the system.
  Do NOT load for authentication flows, login/logout, session management, or JWT/token handling.
---

<objective>
Implements role-based access control using pure functions from the core services layer. Defines roles, permissions, and the hasPermission check pattern for use cases.
</objective>

<quick_start>
1. Import `hasPermission` from authorization service
2. Add `memberRole: Role` to use case input type
3. Check permission FIRST in the use case (before any logic)
4. Add `FORBIDDEN` error to procedure and map it

```typescript
import { hasPermission, type Role } from '@/core/services/authorization'

if (!hasPermission(input.memberRole, 'users:write')) {
  return errAsync({ type: 'forbidden', message: 'No permission' })
}
```
</quick_start>

<roles_hierarchy>
| Role | Level | Description |
|------|-------|-------------|
| `owner` | 100 | Full access including billing and org deletion |
| `admin` | 80 | Manage members and resources, no billing |
| `member` | 40 | Standard access to resources |
| `viewer` | 20 | Read-only access |
</roles_hierarchy>

<use_case_pattern>
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
</use_case_pattern>

<procedure_pattern>
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
</procedure_pattern>

<permissions_reference>
| Resource | Permissions |
|----------|-------------|
| Users | `users:read`, `users:write`, `users:delete` |
| Organization | `organization:read`, `organization:manage`, `organization:delete` |
| Members | `members:read`, `members:invite`, `members:remove` |
| Billing | `billing:read`, `billing:manage` |
</permissions_reference>

<adding_permissions>
1. Add to `Permission` type in the authorization service (e.g., `src/core/services/authorization.ts`):
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
</adding_permissions>

<core_functions>
```typescript
// Authorization service (e.g., src/core/services/authorization.ts)
export type Role = 'owner' | 'admin' | 'member' | 'viewer'
export type Permission = 'users:read' | 'users:write' | /* ... */

export const hasPermission = (role: Role, permission: Permission): boolean
export const getPermissions = (role: Role): readonly Permission[]
export const hasHigherOrEqualRole = (role: Role, targetRole: Role): boolean
```
</core_functions>

<key_patterns>
1. **Authorization first**: Check permission before any business logic
2. **Pure functions**: No dependency injection needed for authorization
3. **Principle of least privilege**: Unknown roles default to lowest permissions
4. **User-friendly messages**: Error messages should be clear
</key_patterns>

<success_criteria>
When adding authorization to a use case:

- [ ] Import `hasPermission` from authorization service
- [ ] Add `memberRole: Role` to input type
- [ ] Add `{ type: 'forbidden'; message: string }` to error union
- [ ] Check permission FIRST in the use case
- [ ] Add `FORBIDDEN` error to procedure
- [ ] Map `forbidden` error to `errors.FORBIDDEN()` in procedure
</success_criteria>

<resources>
For full implementation code, see `references/implementation-example.md`.
</resources>
