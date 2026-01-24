# application/

Application services that don't fit the use case pattern. Contains cross-cutting concerns and shared application logic.

## Purpose

Houses application-level services that are used across multiple use cases but aren't domain services (those belong in `@strenly/core`).

## When to Use

- Services that coordinate multiple use cases
- Application-level event handling
- Cross-cutting concerns specific to the application layer

## Note

Most business logic should be in `use-cases/`. Only place code here when it genuinely spans multiple use cases and doesn't belong in the domain layer.

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/use-case` | Reference for understanding the application layer patterns. |
| `/architecture` | Overview of where application services fit in Clean Architecture. |

## Critical Rules

- **Prefer use cases** - Most logic belongs in `use-cases/`
- **No direct DB access** - Use repositories via dependency injection
- **Use `ResultAsync`** - Consistent error handling with neverthrow
- **No `as` casting** - Fix actual type issues
