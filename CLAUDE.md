# CLAUDE.md

Strenly is a training planning platform for strength coaches: Coach Web App (desktop SPA, Excel-like editing), Athlete PWA (mobile), API (Hono + oRPC on Cloudflare Workers), Neon PostgreSQL with Drizzle ORM.

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

## Package Structure

```
apps/
  coach-web/          # React + Vite (Desktop SPA, keyboard-first)
  athlete-pwa/        # React + Vite + PWA (Mobile, touch-friendly)
  server/             # Hono entry point (Cloudflare Workers)
  marketing/          # Next.js (Landing page)
packages/
  core/               # Domain entities + ports (no dependencies)
  contracts/          # Zod schemas (shared API boundary)
  database/           # Drizzle schemas + migrations
  auth/               # Better-Auth configuration
  backend/            # Procedures + use cases + repositories
  typescript-config/  # Shared TSConfig
```

Layer dependencies: `core → database → auth → backend → contracts → apps`

Data flow: `Frontend → TanStack Query → oRPC Client → HTTP → Hono → Procedure → Use Case → Repository → Drizzle → PostgreSQL`

## Development Commands

```bash
pnpm dev            # Start all apps
pnpm dev:coach      # Start coach-web only
pnpm dev:server     # Start API server only
pnpm typecheck      # TypeScript compiler
pnpm lint           # Biome linter
pnpm test           # Unit tests
pnpm db:push        # Push schema changes (dev)
pnpm db:seed        # Seed development data
pnpm db:studio      # Open Drizzle Studio
pnpm db:reset       # Reset database completely
```

## Multi-Tenancy

All queries MUST filter by `organizationId`. Repository methods receive `OrganizationContext`. RLS policies as database-level safety net.

## Critical Rules

### Full-Stack Phases

Every phase MUST deliver user-facing features. Backend-only phases are incomplete. A complete phase includes backend (entities → ports → repos → use cases → contracts → procedures) AND frontend (pages, components, API hooks, forms, user flows).

### Architecture-First (Backend)

Before writing backend code, follow Clean Architecture in order: Domain Entity → Port → Repository → Use Case → Contracts → Procedure. Run `/architecture` skill before planning any backend feature. Each nested package has a CLAUDE.md pointing to the relevant skill.

### Frontend-Flow

After backend is ready: Route → API Hooks → Page → Components → Forms. Run `/orpc-query` for hooks, `/form` for forms, `/data-table` for tables.

### MUST

1. Import schemas from `@strenly/contracts` — never define Zod schemas inline
2. Use `ResultAsync` from neverthrow for all async operations in use cases
3. Pass `OrganizationContext` to all repository methods
4. Check authorization FIRST in use cases
5. Validate via domain entity BEFORE persisting
6. Return `{ items, totalCount }` from list queries
7. Create domain entities and ports before repositories/use cases
8. Maintain 90%+ test coverage on `packages/core`

### MUST NOT

1. No business logic in procedures — procedures only orchestrate
2. No queries without organization scope on tenant tables
3. No use cases with direct DB queries — use repositories
4. No procedures without domain entity validation
5. No `any` type — use `unknown` and narrow
6. Avoid `useEffect` — prefer callbacks, event handlers, or derived state
7. No barrel files except: `procedures/router.ts`, `procedures/{domain}/index.ts`, `infrastructure/repositories/index.ts`, `database/src/schema/index.ts`, package-level `index.ts` entry points

## Key Documentation

- `docs/architecture.md` — Full architectural decisions
- `docs/prd.md` — Product requirements
- `.planning/ROADMAP.md` — Implementation phases

---

## Development Conventions

Before implementing anything, search the codebase for 2-3 existing examples of similar features (list views, forms, API routes). Document the exact pattern found, then implement following it exactly.

When running a dev-story workflow, first use an agent to identify all existing patterns relevant to the story, then implement following those patterns. Run `/quality-gate` after all tasks.

## UI Component Standards

When implementing UI components, proactively consider: empty states, pagination, keyboard navigation, deletion/clearing, portal positioning, and form nesting. Test edge cases before marking complete.

Implement incrementally. After each interaction pattern (create, edit, delete, empty state), stop and tell the user what to test. Do NOT move to the next interaction until confirmed working.

## Architecture Decisions

When making architectural decisions (batch vs individual API calls, data fetching strategies, component composition), proactively flag tradeoffs to the user. Prefer batch endpoints over individual calls, and embed/denormalize data via schema composition rather than extra fetches.
