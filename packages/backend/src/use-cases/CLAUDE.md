# use-cases/

Business logic orchestration layer. Use cases coordinate domain entities, repositories, and authorization.

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/use-case` | **Primary skill.** Load before creating any use case. Covers authorization-first pattern, Result chaining, and dependency injection. |
| `/authorization` | Reference when implementing permission checks. |

## Structure

```
{domain}/
  {action}.ts            # Single use case per file
```

## Critical Rules

- **Authorization FIRST** — check permissions before ANY other operation
- **Use `ResultAsync`** — all async operations wrapped in neverthrow
- **Domain validation via entities** — use `Entity.create()` not inline validation
- **No direct DB queries** — always use repository ports
- **Single responsibility** — one use case per file
- **Dependency injection** — receive repositories via `deps` parameter
