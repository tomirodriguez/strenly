# Authorization Implementation Example

Complete implementation of the authorization service with role hierarchy and permissions.

```typescript
// src/core/services/authorization.ts
export type Role = 'owner' | 'admin' | 'member' | 'viewer'

export type Permission =
  | 'users:read' | 'users:write' | 'users:delete'
  | 'organization:read' | 'organization:manage' | 'organization:delete'
  | 'members:read' | 'members:invite' | 'members:remove'
  | 'billing:read' | 'billing:manage'

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 100,
  admin: 80,
  member: 40,
  viewer: 20,
}

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: [
    'users:read', 'users:write', 'users:delete',
    'organization:read', 'organization:manage', 'organization:delete',
    'members:read', 'members:invite', 'members:remove',
    'billing:read', 'billing:manage',
  ],
  admin: [
    'users:read', 'users:write', 'users:delete',
    'organization:read', 'organization:manage',
    'members:read', 'members:invite', 'members:remove',
  ],
  member: [
    'users:read',
    'organization:read',
    'members:read',
  ],
  viewer: [
    'organization:read',
  ],
}

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export const getPermissions = (role: Role): readonly Permission[] => {
  return ROLE_PERMISSIONS[role] ?? []
}

export const hasHigherOrEqualRole = (role: Role, targetRole: Role): boolean => {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[targetRole]
}
```
