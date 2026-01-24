# packages/auth

**Better-Auth** configuration for authentication and session management.

## Purpose

Centralizes authentication setup including providers, session handling, and integration with the database schema.

## Structure

```
src/
  auth.ts              # Better-Auth configuration
  index.ts             # Main exports
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/better-auth-best-practices` | Best practices for integrating Better-Auth in TypeScript applications. Use when configuring auth, adding providers, or handling sessions. |
| `/create-auth-skill` | Guidance for creating auth layers with Better-Auth. Use when setting up new auth features or customizing authentication flow. |

## Conventions

### Configuration Pattern
```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  // ... providers and plugins
})
```

### Session Context
```typescript
// Extract from request in procedures
const session = await auth.api.getSession({
  headers: request.headers,
})

if (!session) {
  throw new UnauthorizedError()
}

// Build OrganizationContext for use cases
const ctx: OrganizationContext = {
  userId: session.user.id,
  organizationId: session.user.organizationId,
  role: session.user.role,
}
```

### Multi-Tenancy Integration
- Users belong to organizations
- Session includes `organizationId` and `role`
- All downstream operations use `OrganizationContext`

## Critical Rules

- **Never expose secrets** - Use environment variables
- **Validate sessions in procedures** - Before any protected operation
- **Include organization context** - Required for multi-tenancy
- **No `as` casting** - Fix actual type issues
- **No `!` assertions** - Use guards for session checks

## Database Schema

Auth tables are defined in `@strenly/database`:
- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth provider links
- `organizations` - Multi-tenant organizations
- `members` - User-organization relationships with roles
