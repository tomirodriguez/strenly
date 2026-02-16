# packages/core

Pure domain layer with **zero external dependencies**. Contains domain entities, ports (interfaces), and authorization logic.

## Structure

```
src/
  domain/
    entities/            # Domain entities with validation
    value-objects/       # Value objects (no identity)
  ports/                 # Repository interfaces (contracts)
    types.ts             # Shared base types (RepositoryError, PaginationOptions)
  services/              # Domain services (authorization)
  types/                 # Shared types (OrganizationContext)
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/domain` | **Primary.** DDD building blocks: entities, value objects, aggregates. Load before creating/modifying `domain/`. |
| `/port` | Repository interface definitions. Load before creating contracts in `ports/`. |
| `/authorization` | Role-based access control. Load when modifying `services/authorization.ts`. |

## Conventions

### Domain Entities
- Use factory methods (`create`, `reconstitute`) — no direct constructors
- Validate all business rules in factory, return `Result<Entity, DomainError>`
- Keep entities immutable (return new instances on state changes)
- Tests in `__tests__/` subfolders

### Ports
- All methods receive `OrganizationContext` for multi-tenancy
- Return `ResultAsync<T, RepositoryError>` for async operations
- Name files: `{entity}-repository.port.ts`

### Authorization
- Permissions as `RESOURCE:ACTION` (e.g., `athlete:create`)
- Map roles to permission sets
- Use `can(role, permission)` to check access

## Critical Rules

- **No external dependencies** — this package cannot import from other packages
- **90%+ test coverage required** — all entities must have comprehensive tests
