# Strenly — Project Documentation Index

**Generated:** 2026-02-17 | **Mode:** Initial Scan (Deep) | **Version:** 1.2.0

> **AI Development Reference** — This is the primary entry point for AI-assisted development on the Strenly codebase.

## Project Overview

- **Type:** Monorepo (pnpm + Turbo) — 2 apps + 5 packages
- **Primary Language:** TypeScript (strict)
- **Architecture:** Clean Architecture + Domain-Driven Design
- **Stack:** React 19 + Vite (frontend) · Hono + oRPC (backend) · Neon PostgreSQL + Drizzle (database)

## Quick Reference

### Apps
| App | Path | Type | Description |
|-----|------|------|-------------|
| `api` | `apps/api/` | backend | Hono entry point on Railway (:8787) |
| `coach-web` | `apps/coach-web/` | web SPA | React coach interface on Vercel (:5173) |

### Packages
| Package | Path | Description |
|---------|------|-------------|
| `@strenly/core` | `packages/core/` | Domain entities, ports, authorization |
| `@strenly/backend` | `packages/backend/` | Use cases, repositories, procedures |
| `@strenly/database` | `packages/database/` | Drizzle schemas + migrations |
| `@strenly/contracts` | `packages/contracts/` | Shared Zod schemas (API boundary) |
| `@strenly/auth` | `packages/auth/` | Better-Auth configuration |

### Key Entry Points
| File | Purpose |
|------|---------|
| `apps/api/src/server.ts` | Server bootstrap |
| `packages/backend/src/app-railway.ts` | Hono app (CORS, auth, RPC handler) |
| `packages/backend/src/procedures/router.ts` | All oRPC procedure registrations |
| `apps/coach-web/src/main.tsx` | React app bootstrap |
| `apps/coach-web/src/lib/api-client.ts` | oRPC client + org header injection |

### Development Workflow
```bash
pnpm install       # Install all deps
pnpm dev           # Start all apps
pnpm typecheck     # TypeScript check
pnpm lint          # Biome linter
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests (Playwright, no backend needed)
pnpm db:push       # Push schema changes
pnpm db:studio     # Visual DB browser
```

---

## Generated Documentation

- [Project Overview](./project-overview.md) — Tech stack, business domains, key decisions
- [Architecture](./architecture.md) — Clean Architecture layers, data flow, RBAC, error handling
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory structure for all packages
- [Data Models](./data-models.md) — Database schemas, entity relationships, JSONB formats
- [API Contracts](./api-contracts.md) — oRPC endpoints, request/response types, error codes
- [Integration Architecture](./integration-architecture.md) — How parts communicate, deployment
- [Development Guide](./development-guide.md) — Setup, commands, testing, common tasks

---

## Existing Documentation

- [domain-research-strength-training.md](./domain-research-strength-training.md) — Domain research on strength training concepts
- [CLAUDE.md](../CLAUDE.md) — AI coding assistant rules and architecture guidelines

---

## Architecture Navigation Guide

### When implementing a **new backend feature**:
1. Read [architecture.md](./architecture.md) → "Architecture Patterns"
2. Start with domain entity in `packages/core/`
3. Follow Clean Architecture order: Entity → Port → Repository → Use Case → Contract → Procedure

### When implementing a **new frontend feature**:
1. Read [api-contracts.md](./api-contracts.md) for the relevant endpoints
2. Follow route → hooks → view → components pattern
3. Check `apps/coach-web/src/features/` for existing patterns to copy

### When debugging an **API issue**:
1. Check [integration-architecture.md](./integration-architecture.md) for request flow
2. Verify `X-Organization-Slug` header is sent
3. Check CORS origins in `packages/backend/src/app-railway.ts`

### When modifying the **database schema**:
1. Read [data-models.md](./data-models.md) for current schema
2. Edit `packages/database/src/schema/{table}.ts`
3. Run `pnpm db:generate` → review migration → `pnpm db:push`

### When working on the **program editor** (most complex feature):
1. Read [data-models.md](./data-models.md) → "Program Tables" section
2. Key insight: Sessions define structure; Prescriptions define values per week
3. `saveDraft` in [api-contracts.md](./api-contracts.md) for bulk grid operations
4. `grid-store.ts` in `apps/coach-web/src/stores/` for frontend state

---

## Getting Started (AI Context)

For AI-assisted development, load the relevant skill before implementing:

```bash
/architecture    # ALWAYS load before planning backend features
/domain          # Creating/modifying domain entities in packages/core
/repository      # Implementing Drizzle repositories
/use-case        # Business logic with neverthrow ResultAsync
/contracts       # Zod schemas for API boundary
/procedure       # Thin oRPC handlers
/orpc-query      # Frontend hooks with TanStack Query
/form            # React Hook Form + Field component
/data-table      # DataTable compound component
```

**State file:** [project-scan-report.json](./project-scan-report.json) — workflow resumption data
