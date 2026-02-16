# packages/auth

**Better-Auth** configuration for authentication and session management.

## Structure

```
src/
  auth.ts              # Better-Auth configuration
  index.ts             # Main exports
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/better-auth-best-practices` | Best practices for integrating Better-Auth. |
| `/create-auth-skill` | Guidance for setting up new auth features. |

## Conventions

- Users belong to organizations; session includes `organizationId` and `role`
- All downstream operations use `OrganizationContext` built from session
- Validate sessions in procedures before any protected operation

## Critical Rules

- **Never expose secrets** — use environment variables
- **Validate sessions in procedures** — before any protected operation
- **Include organization context** — required for multi-tenancy

## Database Schema

Auth tables defined in `@strenly/database`: `users`, `sessions`, `accounts`, `organizations`, `members`
