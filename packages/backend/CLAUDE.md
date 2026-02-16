# packages/backend

Application layer containing **use cases**, **repositories**, and **procedures**. Orchestrates domain logic and exposes it via oRPC API.

## Structure

```
src/
  infrastructure/
    repositories/      # Port implementations with Drizzle ORM
  use-cases/
    {domain}/          # Business logic orchestration
  procedures/
    {domain}/          # Thin API handlers (oRPC)
    router.ts          # Main router
  lib/
    context.ts         # Request context types
    errors.ts          # Error definitions
    orpc.ts            # oRPC configuration
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/architecture` | **Load FIRST.** Clean Architecture flow overview. |
| `/repository` | Implementing ports with Drizzle ORM. |
| `/use-case` | Business logic orchestration with neverthrow. |
| `/procedure` | Creating thin oRPC API handlers. |
| `/authorization` | Permission checks in use cases. |

## Conventions

### Repositories
- Implement ports from `@strenly/core`
- All methods receive `OrganizationContext`
- Use `ResultAsync.fromPromise` for all Drizzle queries
- Map rows to domain entities using `reconstitute`

### Use Cases
- **Authorization FIRST** — check permissions before any logic
- Chain with `.andThen()` and `.map()`
- No direct DB queries — always use repositories

### Procedures
- **Thin handlers only** — no business logic
- Import schemas from `@strenly/contracts`
- Extract context, call use case, map result

Load the corresponding skill for implementation patterns before writing code for any layer.

## Critical Rules

- **No business logic in procedures**
- **Authorization first in use cases**
- **Use repositories, not direct queries**
- **Import from `@strenly/contracts`** — never define schemas inline
- **Test coverage** — 80%+ on use cases, 75%+ on repositories
