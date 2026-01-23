# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Strenly is a training planning platform for strength coaches. It provides:
- **Coach Web App**: Desktop-first SPA with Excel-like inline editing, keyboard navigation, dark mode
- **Athlete PWA**: Mobile-first PWA for viewing programs and logging workouts, light mode
- **API**: Hono + oRPC on Cloudflare Workers
- **Database**: Neon PostgreSQL with Drizzle ORM

Core differentiator: Program creation as fast as Excel, with centralized athlete management.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm workspaces + Turbo |
| Linting | Biome |
| Frontend | React 19 + Vite + TanStack Router/Query |
| API | Hono + oRPC |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Better-Auth |
| Validation | Zod |
| Error Handling | neverthrow (ResultAsync) |

## Architecture

This project follows **Clean Architecture** with inside-out development. See `/architecture` skill for the mandatory development flow.

### Package Structure

```
apps/
  coach-web/          # React + Vite (Desktop SPA, keyboard-first)
  athlete-pwa/        # React + Vite + PWA (Mobile, touch-friendly)
  server/             # Hono entry point (Cloudflare Workers)
  marketing/          # Next.js (Landing page)

packages/
  core/               # Domain entities + ports (no dependencies on other packages)
  contracts/          # Zod schemas (shared API boundary)
  database/           # Drizzle schemas + migrations
  auth/               # Better-Auth configuration
  backend/            # Procedures + use cases + repositories
  typescript-config/  # Shared TSConfig
```

### Layer Dependencies

```
core (pure domain) → database → auth → backend → contracts (Zod schemas) → apps
```

### Data Flow

```
Frontend → TanStack Query → oRPC Client → HTTP → Hono → oRPC Procedure
  → Use Case (authorization first) → Repository → Drizzle → PostgreSQL
```

## Development Commands

```bash
# Database
pnpm db:start       # Start PostgreSQL container
pnpm db:push        # Push schema changes (dev)
pnpm db:seed        # Seed development data
pnpm db:studio      # Open Drizzle Studio
pnpm db:reset       # Reset database completely

# Development
pnpm dev            # Start all apps
pnpm dev:coach      # Start coach-web only
pnpm dev:athlete    # Start athlete-pwa only
pnpm dev:server     # Start API server only

# Quality
pnpm typecheck      # TypeScript compiler
pnpm lint           # Biome linter
pnpm test           # Unit tests
```

## Code Conventions

### File Naming
- **All files**: `kebab-case` (no exceptions)
- Components: `athlete-card.tsx`
- Tests: `athlete.test.ts` (co-located with source)

### Database
- Tables: `snake_case` plural (`athletes`, `training_plans`)
- Columns: `snake_case` (`organization_id`, `created_at`)

### TypeScript
- Functions/variables: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Multi-Tenancy
- All queries MUST filter by `organizationId`
- Repository methods receive `OrganizationContext` parameter
- RLS policies as database-level safety net

## Critical Rules

### MUST
1. Import schemas from `@strenly/contracts` - never define Zod schemas inline
2. Use `ResultAsync` from neverthrow for all async operations in use cases
3. Pass `OrganizationContext` to all repository methods
4. Check authorization FIRST in use cases (before any other logic)
5. Validate via domain entity BEFORE persisting
6. Return `{ items, totalCount }` from list queries (required for pagination)

### MUST NOT
1. No `as` type casting - fix the actual type issue. Only allowed in tests.
2. No `!` non-null assertion - use optional chaining or guards
3. No barrel files (`index.ts` re-exports) - exception: `procedures/router.ts`
4. No `any` type - use `unknown` and narrow
5. No business logic in procedures - procedures only orchestrate
6. No queries without organization scope on tenant tables

## Clean Architecture Flow

When implementing backend features, follow this order and invoke the corresponding skill:

1. **Domain Entity** (`/domain-entity`) - `packages/core/src/domain/entities/`
2. **Port** (`/port`) - `packages/core/src/ports/`
3. **Repository** (`/repository`) - `packages/backend/src/infrastructure/repositories/`
4. **Use Case** (`/use-case` + `/authorization`) - `packages/backend/src/use-cases/`
5. **Contracts** (`/contracts`) - `packages/contracts/src/`
6. **Procedure** (`/procedure`) - `packages/backend/src/procedures/`

## Reference Implementation

The project at `/Users/tomiardz/Projects/strenly` serves as a reference for:
- Monorepo configuration (turbo.json, biome.json)
- oRPC setup and procedure patterns
- Better-Auth configuration
- Drizzle schema patterns

## Key Documentation

- `docs/architecture.md` - Full architectural decisions
- `docs/prd.md` - Product requirements (71 FRs)
- `docs/domain-research-strength-training.md` - Domain concepts
- `.planning/ROADMAP.md` - Implementation phases
- `.planning/PROJECT.md` - Project context
