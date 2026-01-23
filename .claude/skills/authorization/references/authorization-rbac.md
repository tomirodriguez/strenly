# Role-Based Access Control (RBAC) System

## Introduction

This document describes the **Role-Based Access Control (RBAC)** system that manages granular permissions within each organization.

---

## 1. Roles and Hierarchy

### 1.1 Defined Roles

```typescript
// src/core/services/authorization.ts
export type Role = 'owner' | 'admin' | 'member' | 'viewer'
```

**Hierarchy** (from highest to lowest privilege):
```
owner > admin > member > viewer
```

### 1.2 Role Descriptions

| Role | Description | Use Case |
|------|-------------|----------|
| **owner** | Organization creator, full control | User who creates and pays for the org |
| **admin** | Can manage organization and users, no billing | Managers and team leads |
| **member** | Standard user with write access | Regular team members |
| **viewer** | Read-only access | External stakeholders, clients |

**Rules**:
- Only **1 owner** per organization (the creator)
- Multiple **admins** can be assigned by owner
- Most users are **members** or **viewers**

---

## 2. Permissions

### 2.1 Permission Format

**Convention**: `resource:action`

Examples:
- `organization:read` - View organization information
- `organization:manage` - Edit organization (name, logo, settings)
- `users:write` - Create/edit users
- `members:invite` - Invite new members

### 2.2 Permission Catalog

```typescript
// src/core/services/authorization.ts
export type Permission =
  // Organization
  | 'organization:read'
  | 'organization:manage'
  | 'organization:delete'
  // Members
  | 'members:read'
  | 'members:invite'
  | 'members:remove'
  | 'members:update_role'
  // Users/Resources
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  // Billing
  | 'billing:read'
  | 'billing:manage'
```

### 2.3 Permission Matrix

**Permissions by role**:

| Permission | owner | admin | member | viewer |
|------------|-------|-------|--------|--------|
| `organization:read` | ✅ | ✅ | ✅ | ✅ |
| `organization:manage` | ✅ | ✅ | ❌ | ❌ |
| `organization:delete` | ✅ | ❌ | ❌ | ❌ |
| `members:read` | ✅ | ✅ | ✅ | ✅ |
| `members:invite` | ✅ | ✅ | ❌ | ❌ |
| `members:remove` | ✅ | ✅ | ❌ | ❌ |
| `members:update_role` | ✅ | ❌ | ❌ | ❌ |
| `users:read` | ✅ | ✅ | ✅ | ✅ |
| `users:write` | ✅ | ✅ | ✅ | ❌ |
| `users:delete` | ✅ | ✅ | ❌ | ❌ |
| `billing:read` | ✅ | ❌ | ❌ | ❌ |
| `billing:manage` | ✅ | ❌ | ❌ | ❌ |

---

## 3. Implementation

### 3.1 Authorization Service

```typescript
// src/core/services/authorization.ts
export type Role = 'owner' | 'admin' | 'member' | 'viewer'

export type Permission =
  | 'organization:read' | 'organization:manage' | 'organization:delete'
  | 'members:read' | 'members:invite' | 'members:remove' | 'members:update_role'
  | 'users:read' | 'users:write' | 'users:delete'
  | 'billing:read' | 'billing:manage'

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 100,
  admin: 80,
  member: 40,
  viewer: 20,
}

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: [
    'organization:read', 'organization:manage', 'organization:delete',
    'members:read', 'members:invite', 'members:remove', 'members:update_role',
    'users:read', 'users:write', 'users:delete',
    'billing:read', 'billing:manage',
  ],
  admin: [
    'organization:read', 'organization:manage',
    'members:read', 'members:invite', 'members:remove',
    'users:read', 'users:write', 'users:delete',
  ],
  member: [
    'organization:read',
    'members:read',
    'users:read', 'users:write',
  ],
  viewer: [
    'organization:read',
    'members:read',
    'users:read',
  ],
}

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: Role, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Get all permissions for a role
 */
export const getPermissions = (role: Role): readonly Permission[] => {
  return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Check if a role is higher or equal in hierarchy
 */
export const hasHigherOrEqualRole = (role: Role, targetRole: Role): boolean => {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[targetRole]
}

/**
 * Map string to typed Role (with fallback)
 */
export const mapRole = (role: string): Role => {
  if (role === 'owner' || role === 'admin' || role === 'member' || role === 'viewer') {
    return role
  }
  return 'viewer' // Default to lowest privilege
}
```

### 3.2 Using in Use Cases

```typescript
// src/server/use-cases/users/update-user.ts
import { hasPermission, type Role } from '@/core/services/authorization'
import { errAsync, type ResultAsync } from 'neverthrow'

export type UpdateUserInput = {
  organizationId: string
  memberRole: Role
  userId: string
  data: { name?: string; email?: string }
}

export type UpdateUserError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; message: string }
  | { type: 'repository_error'; cause: unknown }

export const makeUpdateUser =
  (deps: Dependencies) =>
  (input: UpdateUserInput): ResultAsync<User, UpdateUserError> => {
    // 1. Authorization check FIRST
    if (!hasPermission(input.memberRole, 'users:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to update users',
      })
    }

    // 2. Business logic after authorization passes
    const ctx = { organizationId: input.organizationId }

    return deps.userRepository
      .findById(ctx, input.userId)
      .andThen((user) => {
        if (!user) {
          return errAsync({ type: 'not_found', message: 'User not found' })
        }
        return deps.userRepository.update(ctx, input.userId, input.data)
      })
  }
```

### 3.3 Handling in Procedures

```typescript
// src/server/procedures/users/update-user.ts
export const updateUser = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to update users' },
    NOT_FOUND: { message: 'User not found' },
  })
  .input(updateUserInputSchema)
  .output(userSchema)
  .handler(async ({ input, context, errors }) => {
    const result = await makeUpdateUser({
      userRepository: createUserRepository(context.db),
    })({
      organizationId: context.organization.id,
      memberRole: context.organization.role, // Role from middleware
      userId: input.id,
      data: input,
    })

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

---

## 4. Adding New Permissions

### Step 1: Add to Permission Type

```typescript
export type Permission =
  | 'organization:read'
  // ... existing
  | 'reports:read'   // New permission
  | 'reports:write'  // New permission
```

### Step 2: Assign to Roles

```typescript
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: [
    // ... existing
    'reports:read',
    'reports:write',
  ],
  admin: [
    // ... existing
    'reports:read',
    'reports:write',
  ],
  member: [
    // ... existing
    'reports:read',
  ],
  viewer: [
    // ... existing
    'reports:read',
  ],
}
```

### Step 3: Use in Use Case

```typescript
if (!hasPermission(input.memberRole, 'reports:write')) {
  return errAsync({ type: 'forbidden', message: 'No permission to create reports' })
}
```

---

## 5. Role Hierarchy Use Cases

### Preventing Role Escalation

```typescript
// User can only assign roles lower than their own
export const canAssignRole = (actorRole: Role, targetRole: Role): boolean => {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole]
}

// In use case
if (!canAssignRole(input.memberRole, input.newRole)) {
  return errAsync({
    type: 'forbidden',
    message: 'Cannot assign a role higher than or equal to your own',
  })
}
```

### Owner-Only Actions

```typescript
if (input.memberRole !== 'owner') {
  return errAsync({
    type: 'forbidden',
    message: 'Only the organization owner can perform this action',
  })
}
```

---

## 6. Best Practices

1. **Authorization first**: Always check permissions before any business logic
2. **Principle of least privilege**: Default unknown roles to lowest permissions
3. **Explicit deny**: If permission not in list, it's denied
4. **Log authorization failures**: For security auditing
5. **Use typed roles**: Never use raw strings for roles

---

## 7. Checklist

When adding authorization to a use case:

- [ ] Import `hasPermission` from authorization service
- [ ] Add `memberRole: Role` to input type
- [ ] Add `{ type: 'forbidden'; message: string }` to error union
- [ ] Check permission FIRST in the use case
- [ ] Add `FORBIDDEN` error to procedure
- [ ] Map `forbidden` error to `errors.FORBIDDEN()` in procedure

---

## See Also

- `/authorization` skill - Quick reference for authorization
- `/use-case` skill - Use case implementation patterns
- `/procedure` skill - Procedure implementation patterns
