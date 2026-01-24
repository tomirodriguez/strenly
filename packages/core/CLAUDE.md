# packages/core

Pure domain layer with **zero external dependencies**. Contains domain entities, ports (interfaces), and authorization logic.

## Purpose

This is the innermost layer of Clean Architecture. Code here defines the business rules and contracts that the rest of the application implements.

## Structure

```
src/
  domain/entities/     # Domain entities with validation
  ports/               # Repository interfaces (contracts)
  services/            # Domain services (authorization)
  types/               # Shared types (OrganizationContext)
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/domain-entity` | **Primary skill.** Guidance for creating domain entities with business validation rules, factory methods, and state machines. Use when creating or modifying entities in `domain/entities/`. |
| `/port` | Guidance for defining repository interfaces. Use when creating contracts in `ports/` that repositories must implement. |
| `/authorization` | Guidance for implementing role-based access control (RBAC). Use when adding or modifying permission checks in `services/authorization.ts`. |

## Conventions

### Domain Entities
- Use factory methods (`create`, `reconstitute`) instead of constructors
- Validate all business rules in the factory method
- Return `Result<Entity, DomainError>` from factory methods
- Keep entities immutable (return new instances on state changes)
- Co-locate tests: `entity.test.ts` next to `entity.ts`

### Ports
- Define interfaces that repositories must implement
- All methods receive `OrganizationContext` for multi-tenancy
- Return `ResultAsync<T, RepositoryError>` for async operations
- Name files: `{entity}-repository.port.ts`

### Authorization
- Define permissions as `RESOURCE:ACTION` (e.g., `athlete:create`)
- Map roles to permission sets
- Use `can(role, permission)` to check access

## Critical Rules

- **No external dependencies** - This package cannot import from other packages
- **90%+ test coverage required** - All entities must have comprehensive tests
- **No `as` casting** - Fix actual type issues
- **No `!` assertions** - Use guards or optional chaining

## Example Entity Pattern

```typescript
// domain/entities/athlete.ts
export class Athlete {
  private constructor(private readonly props: AthleteProps) {}

  static create(input: CreateAthleteInput): Result<Athlete, DomainError> {
    // Validate business rules
    if (!input.name.trim()) {
      return err(new DomainError('Name is required'))
    }
    return ok(new Athlete({ ...input, createdAt: new Date() }))
  }

  static reconstitute(props: AthleteProps): Athlete {
    return new Athlete(props)
  }

  get id() { return this.props.id }
  get name() { return this.props.name }
}
```
