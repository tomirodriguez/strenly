# application/

Application services that don't fit the use case pattern. Cross-cutting concerns and shared application logic.

Most business logic should be in `use-cases/`. Only place code here when it genuinely spans multiple use cases and doesn't belong in the domain layer.

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/use-case` | Reference for application layer patterns. |
| `/architecture` | Where application services fit in Clean Architecture. |

## Critical Rules

- **Prefer use cases** — most logic belongs in `use-cases/`
- **No direct DB access** — use repositories via dependency injection
- **Use `ResultAsync`** — consistent error handling with neverthrow
