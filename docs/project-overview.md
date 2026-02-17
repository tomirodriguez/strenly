# Strenly — Project Overview

**Generated:** 2026-02-17 | **Scan Level:** Deep | **Type:** Monorepo

## What Is Strenly?

Strenly is a **training planning platform for strength coaches**. It provides:

- A **Coach Web App** (desktop SPA) — Excel-like program editor, keyboard-first, dark mode
- An **Athlete PWA** (planned) — mobile-first, touch-friendly
- An **API** — Hono + oRPC on Railway, Neon PostgreSQL

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm workspaces + Turbo |
| Linting | Biome |
| Frontend | React 19 + Vite + TanStack Router/Query |
| API Framework | Hono + oRPC |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Better-Auth (email/password + Google OAuth) |
| Validation | Zod 4 |
| Error Handling | neverthrow (ResultAsync) |
| Deployment | Railway (API) + Vercel (coach-web) |

## Architecture Type

**Clean Architecture + Domain-Driven Design (DDD)** monorepo.

Strict layer separation enforced through package boundaries:
```
core (domain) → database → auth → backend (app layer) → contracts → apps
```

No package can import from a layer above it. Business rules live exclusively in `packages/core`.

## Repository Structure

```
strenly/                        # Monorepo root
├── apps/
│   ├── api/                    # Hono entry point (Railway deployment)
│   └── coach-web/              # React SPA for coaches
├── packages/
│   ├── core/                   # Domain entities + ports (zero dependencies)
│   ├── backend/                # Use cases + repositories + procedures
│   ├── database/               # Drizzle schemas + migrations
│   ├── contracts/              # Shared Zod schemas (API boundary)
│   └── auth/                   # Better-Auth configuration
└── docs/                       # This documentation
```

## Business Domains

| Domain | Description |
|--------|-------------|
| **Programs** | Training programs with weeks → sessions → exercise groups → prescriptions |
| **Exercises** | Curated + custom exercise library with muscle group classification |
| **Athletes** | Athlete profiles managed by an organization (gym/coach) |
| **Workout Logs** | Session-based workout completion tracking |
| **Subscriptions** | Plan-based billing (plans + org subscriptions) |
| **Auth/Organizations** | Multi-tenant organizations via Better-Auth |

## Key Architecture Decisions

1. **oRPC over REST** — Type-safe RPC with TanStack Query integration. URLs are `/rpc/{domain}/{action}`.
2. **Program as Aggregate Root** — The `Program` domain entity owns the full `Week → Session → ExerciseGroup → GroupItem → Series` hierarchy.
3. **Prescriptions are separate** — Training prescriptions (sets/reps/intensity) are stored as JSONB arrays per exercise-row+week combination.
4. **Multi-tenancy via organizationId** — All tenant tables include `organizationId`. Repositories always filter by org context.
5. **Fail-fast environment** — Both frontend and backend use `@t3-oss/env-core` for validated env vars at startup.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start all apps (API + coach-web)
pnpm dev

# Start only coach-web (frontend development)
pnpm dev:coach

# Start only API server
pnpm dev:server

# Run all tests
pnpm test

# Type check all packages
pnpm typecheck
```

See [development-guide.md](./development-guide.md) for full setup instructions.
