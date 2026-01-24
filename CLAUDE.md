# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Strenly is a training planning platform for strength coaches. It provides:
- **Coach Web App**: Desktop-first SPA with Excel-like inline editing, keyboard navigation
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

### FULL-STACK PHASES (HIGHEST PRIORITY)

**Every phase MUST deliver user-facing features.** Backend-only phases are incomplete.

A complete phase includes:
1. **Backend**: Domain entities → Ports → Repositories → Use Cases → Contracts → Procedures
2. **Frontend**: Pages → Components → API hooks → Forms → User flows

**If a plan does not include frontend pages/components that use the backend, the plan is incomplete.**

### ARCHITECTURE-FIRST (Backend)

**BEFORE writing any backend code, you MUST follow the Clean Architecture flow.** This is non-negotiable.

For each domain concept (e.g., subscription, athlete, program), create layers in this order:

1. **Domain Entity** → `packages/core/src/domain/entities/{entity}.ts`
2. **Port** → `packages/core/src/ports/{entity}-repository.port.ts`
3. **Repository** → `packages/backend/src/infrastructure/repositories/{entity}.repository.ts`
4. **Use Case** → `packages/backend/src/use-cases/{domain}/{action}.ts`
5. **Contracts** → `packages/contracts/src/{domain}/`
6. **Procedure** → `packages/backend/src/procedures/{domain}/`

Run `/architecture` skill before planning any backend feature.

### FRONTEND-FLOW (Frontend)

**AFTER backend is ready, build the frontend to use it.** Follow this order:

1. **Route** → `apps/coach-web/src/routes/{feature}/` (TanStack Router)
2. **API Hooks** → `apps/coach-web/src/lib/api/{feature}.ts` (oRPC + TanStack Query)
3. **Page Component** → `apps/coach-web/src/routes/{feature}/index.tsx`
4. **Feature Components** → `apps/coach-web/src/components/{feature}/`
5. **Forms** → React Hook Form + shadcn Field pattern

Run `/orpc-query` skill for API hooks, `/form` skill for forms, `/data-table` skill for tables.

### MUST
1. Import schemas from `@strenly/contracts` - never define Zod schemas inline
2. Use `ResultAsync` from neverthrow for all async operations in use cases
3. Pass `OrganizationContext` to all repository methods
4. Check authorization FIRST in use cases (before any other logic)
5. Validate via domain entity BEFORE persisting
6. Return `{ items, totalCount }` from list queries (required for pagination)
7. **Create domain entities for ALL domain concepts before repositories/use cases**
8. **Create ports (interfaces) before implementing repositories**
9. **Maintain 90%+ test coverage on `packages/core`** — domain entities must have comprehensive tests

### MUST NOT
1. No `as` type casting - fix the actual type issue. Only allowed in tests.
2. No `!` non-null assertion - use optional chaining or guards
3. No barrel files (`index.ts` re-exports) - exception: `procedures/router.ts`
4. No `any` type - use `unknown` and narrow
5. No business logic in procedures - procedures only orchestrate
6. No queries without organization scope on tenant tables
7. **No use cases with direct DB queries - use repositories**
8. **No procedures without domain entity validation**
9. **Avoid `useEffect`** - prefer callback functions, event handlers, or derived state

## Clean Architecture Flow

When implementing backend features, follow this order and invoke the corresponding skill:

1. **Domain Entity** (`/domain-entity`) - `packages/core/src/domain/entities/`
2. **Port** (`/port`) - `packages/core/src/ports/`
3. **Repository** (`/repository`) - `packages/backend/src/infrastructure/repositories/`
4. **Use Case** (`/use-case` + `/authorization`) - `packages/backend/src/use-cases/`
5. **Contracts** (`/contracts`) - `packages/contracts/src/`
6. **Procedure** (`/procedure`) - `packages/backend/src/procedures/`

## Mandatory Skills Reference

**IMPORTANT:** Load the corresponding skill BEFORE writing code for each layer. Plans MUST reference required skills for each task.

### Backend Skills (Load in Order)

| Skill | When to Load | Location |
|-------|--------------|----------|
| `/architecture` | **ALWAYS FIRST** - Before planning or implementing any backend feature | Understanding flow |
| `/domain-entity` | Creating entities with business validation rules | `packages/core/src/domain/entities/` |
| `/port` | Defining repository interfaces | `packages/core/src/ports/` |
| `/repository` | Implementing ports with Drizzle ORM | `packages/backend/src/infrastructure/repositories/` |
| `/authorization` | Adding permission checks to use cases | `packages/core/src/services/authorization.ts` |
| `/use-case` | Implementing business logic orchestration | `packages/backend/src/use-cases/` |
| `/contracts` | Creating Zod schemas for API input/output | `packages/contracts/src/` |
| `/procedure` | Creating thin API handlers | `packages/backend/src/procedures/` |

### Frontend Skills (Load for UI Work)

| Skill | When to Load | Location |
|-------|--------------|----------|
| `/orpc-query` | Creating query/mutation hooks with TanStack Query | `apps/*/src/lib/api/` |
| `/mutation-errors` | Handling errors in mutation hooks | Components using mutations |
| `/form` | Creating forms with React Hook Form + shadcn Field | Form components |
| `/data-table` | Building tables with pagination, filtering | Table components |
| `/frontend-design` | Creating new pages or complex UI components | `apps/*/src/routes/`, `apps/*/src/components/` |

### Frontend Patterns

**Route Structure (TanStack Router):**
```
apps/coach-web/src/routes/
  __root.tsx              # Root layout with providers
  _authenticated.tsx      # Auth-required layout
  _authenticated/
    dashboard.tsx         # /dashboard
    athletes/
      index.tsx           # /athletes (list)
      $athleteId.tsx      # /athletes/:athleteId (detail)
      new.tsx             # /athletes/new (create)
```

**API Hooks Pattern:**
```typescript
// apps/coach-web/src/lib/api/athletes.ts
import { orpc } from './client'
import { useQuery, useMutation } from '@tanstack/react-query'

export function useAthletes(filters) {
  return useQuery(orpc.athletes.list.queryOptions({ input: filters }))
}

export function useCreateAthlete() {
  return useMutation(orpc.athletes.create.mutationOptions())
}
```

**Component Structure:**
```
apps/coach-web/src/components/
  ui/                     # shadcn/ui primitives (auto-generated)
  athletes/               # Feature-specific components
    athlete-card.tsx
    athlete-form.tsx
    athlete-table.tsx
  layout/                 # App-wide layout components
    sidebar.tsx
    header.tsx
```

### Validation Skills

| Skill | When to Load |
|-------|--------------|
| `/test-runner` | After completing code, before committing |

### Planning Enforcement

When creating plans, each task MUST specify which skills to load:

```markdown
<task type="auto">
  <name>Create Athlete Domain Entity</name>
  <skills>/domain-entity</skills>  <!-- Required for this task -->
  <files>packages/core/src/domain/entities/athlete.ts</files>
  ...
</task>
```

**Plans are INCOMPLETE if they don't reference appropriate skills for each task.**

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
