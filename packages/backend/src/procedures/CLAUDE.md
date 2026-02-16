# procedures/

Thin API handlers using **oRPC**. Procedures validate input, call use cases, and map results to HTTP responses.

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/procedure` | **Primary skill.** Load before creating any procedure. Covers input validation, use case invocation, error mapping, and router composition. |

## Structure

```
{domain}/
  {action}.ts            # Single procedure per file
  index.ts               # Domain router (groups procedures)
router.ts                # Main router (combines all domain routers)
```

## Critical Rules

- **Thin handlers only** — no business logic in procedures
- **Import from `@strenly/contracts`** — never define schemas inline
- **Call use cases, not repositories** — maintain layer separation
- **Map errors properly** — use appropriate HTTP status codes
