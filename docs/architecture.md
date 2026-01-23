---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-01-18'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-strenly-ai-2026-01-16.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/domain-research-strength-training.md
workflowType: 'architecture'
project_name: 'strenly-ai'
user_name: 'Tomi'
date: '2026-01-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The PRD defines 71 functional requirements across 10 domains:
- User Management & Authentication (FR1-FR6)
- Organization Management (FR7-FR15)
- Subscription & Plans (FR16-FR21)
- Athlete Management (FR22-FR29)
- Training Program Creation (FR30-FR41)
- Exercise & Template Management (FR42-FR48)
- Workout Logging & Tracking (FR49-FR58)
- Progress & Visualization (FR59-FR62)
- Dashboard & Notifications (FR63-FR67)
- Platform Administration (FR68-FR71)

**Non-Functional Requirements:**
- Performance: <100ms inline editing, <2s page loads, <3s PWA load
- Security: Multi-tenant isolation, HTTPS, password hashing (bcrypt/argon2)
- Reliability: Transaction integrity, error handling, regular backups
- Scalability: Support 5-100+ coaches without major refactoring

**Scale & Complexity:**
- Primary domain: Full-stack (Web + PWA + API + Database)
- Complexity level: Medium-High
- Estimated architectural components: 15-20 major components

### Technical Constraints & Dependencies

**From Domain Research (Founder Decisions):**
- Structured prescription fields: Sets, Reps (with ranges), RIR, Tempo, Rest
- Optional block/mesocycle hierarchy
- Per-set logging granularity
- MVP techniques: Supersets, Drop sets, AMRAP, Rest timers
- Metric (kg) as default unit
- Custom exercises allowed from day one

**From UX Specification:**
- Design system: shadcn/ui + Tailwind CSS + Base UI primitives
- Coach App: Desktop-first, dark mode, keyboard-primary navigation
- Athlete App: Mobile-first, light mode, 48px touch targets
- Accessibility: WCAG 2.1 AA compliance

### Cross-Cutting Concerns Identified

1. **Multi-tenant Data Isolation**: All queries must be organization-scoped, RLS at database level
2. **Authentication & Authorization**: Session management, role-based permissions per organization
3. **Keyboard Navigation System**: Reusable hooks for grid navigation in Coach app
4. **State Management**: Track unsaved changes, optimistic updates for logging
5. **Plan vs Log Separation**: Immutable prescriptions, mutable logs linked by foreign key
6. **Real-time Sync**: Coach changes visible to athletes quickly (not instant, but "soon")

## Starter Template Evaluation

### Primary Technology Domain

Full-stack SaaS with dual frontend applications (Coach SPA + Athlete PWA) and edge-deployed API.

### Starter Approach

Rather than using an external starter template, this architecture uses a custom monorepo structure optimized for the specific requirements of dual-app development with shared backend logic.

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Monorepo** | pnpm workspaces + Turbo | Fast installs, excellent caching, task orchestration |
| **Linting/Format** | Biome | Unified tool, faster than ESLint+Prettier |
| **Coach App** | React 19 + Vite + TanStack Router | Desktop SPA, keyboard-first, no SSR needed |
| **Athlete App** | React 19 + Vite + vite-pwa | PWA-first, offline capable, mobile optimized |
| **Marketing** | Next.js 16 | SEO required for landing page, standalone |
| **API** | Hono + oRPC | Edge-ready, full type inference, Cloudflare Workers |
| **Database (Dev)** | PostgreSQL 16 via Docker | Local development, easy reset/seed |
| **Database (Prod)** | Neon PostgreSQL | Serverless, auto-scaling, branching |
| **ORM** | Drizzle | Type-safe queries, RLS support, lightweight |
| **Auth** | Better-Auth | Self-hosted, TypeScript-first, unified for both apps |
| **Validation** | Zod | Runtime + compile-time safety, contract-first |
| **Error Handling** | neverthrow | Functional Result types, no thrown exceptions |

### Monorepo Structure

```
strenly/
├── apps/
│   ├── coach-web/              # React + Vite (desktop SPA)
│   │   └── src/components/     # Coach-specific UI (shadcn installed here)
│   ├── athlete-pwa/            # React + Vite (mobile PWA)
│   │   └── src/components/     # Athlete-specific UI (shadcn installed here)
│   ├── server/                 # Hono entry point (Cloudflare Workers)
│   └── marketing/              # Next.js (landing page, SEO)
├── packages/
│   ├── backend/                # API procedures + use cases + infrastructure
│   ├── contracts/              # Zod schemas (shared API boundary)
│   ├── core/                   # Domain entities + ports (Clean Architecture)
│   ├── database/               # Drizzle schemas + migrations
│   ├── auth/                   # Better-Auth configuration
│   └── typescript-config/      # Shared TSConfig
├── docker-compose.yml          # Local PostgreSQL
└── [config files]
```

### Key Architectural Decisions

**1. Unified Authentication (Better-Auth)**
- Single auth system for both Coach and Athlete apps
- Coaches: Email/password + OAuth (Google)
- Athletes: Magic link invitations → account creation → session
- No separate JWT system needed

**2. Separate UI Per App (No Shared UI Package)**
- Coach and Athlete apps have fundamentally different UX requirements
- Each app installs shadcn/ui components directly and customizes as needed
- Coach: Dense, keyboard-navigation, dark mode
- Athlete: Touch-friendly, large targets, light mode
- No compromise on either experience

**3. Local-First Database Development**
- Docker PostgreSQL for development (standard `postgres` driver)
- Easy reset, seed, and iteration
- Production uses Neon serverless (trivial driver swap)
- Same Drizzle schema works for both environments

**4. oRPC Type-Safe API**
- Full type inference from backend to frontend
- Procedures with auth hierarchy (public, session, auth)
- Contracts-first: Zod schemas define API boundary
- TanStack Query integration for data fetching

**5. Clean Architecture in Core Package**
- Domain entities and ports are framework-agnostic
- Use cases orchestrate business logic
- Repository implementations in backend package
- neverthrow for functional error handling

### Development Environment

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: strenly
      POSTGRES_PASSWORD: strenly
      POSTGRES_DB: strenly
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Database Scripts:**
- `pnpm db:start` - Start PostgreSQL container
- `pnpm db:down` - Stop container
- `pnpm db:reset` - Reset database (drop volume, recreate)
- `pnpm db:push` - Push schema changes
- `pnpm db:seed` - Seed development data
- `pnpm db:studio` - Open Drizzle Studio

### Deployment Strategy

| App | Platform | Notes |
|-----|----------|-------|
| Coach Web | Cloudflare Pages | Static SPA |
| Athlete PWA | Cloudflare Pages | Static SPA with service worker |
| API | Cloudflare Workers | Hono + oRPC |
| Database | Neon PostgreSQL | Serverless, auto-scaling |
| Marketing | Cloudflare Pages or Vercel | Next.js with SSR |

### Initialization Note

Project initialization will be the first implementation story (Epic 0). This includes:
1. Monorepo scaffold with pnpm workspaces
2. Turbo configuration for task orchestration
3. Biome configuration for code quality
4. Docker Compose for local PostgreSQL
5. Shared TypeScript configuration
6. Empty app and package scaffolds

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Multi-tenancy strategy (Hybrid: RLS + application-level)
- Authentication flow (Better-Auth with cookies)
- API procedure hierarchy (public, session, auth)
- Database driver strategy (postgres for dev, neon-serverless for prod)

**Important Decisions (Shape Architecture):**
- Authorization pattern (role-based, derived permissions)
- State management approach (TanStack Query + React Context + React Hook Form)
- Error handling patterns (neverthrow throughout)
- Code organization (Clean Architecture in core, feature-based elsewhere)

**Deferred Decisions (Post-MVP):**
- Server-side caching (Redis/KV)
- Advanced rate limiting configuration
- Real-time subscriptions (WebSockets)
- Analytics beyond Cloudflare built-in

### Data Architecture

**Multi-tenancy Strategy: Hybrid Approach**
- **Application-level filtering**: All repository methods receive `OrganizationContext`, queries explicitly filter by `organization_id`
- **RLS as safety net**: PostgreSQL Row-Level Security policies as additional protection layer
- **Rationale**: Explicit queries are easier to debug and test; RLS prevents accidental data leaks

**Database Connection Strategy:**
- **Development**: Standard `postgres` driver via Docker, synchronous operations
- **Production**: `@neondatabase/serverless` HTTP driver for Cloudflare Workers compatibility
- **Schema**: Single Drizzle schema works for both environments

**Migration Strategy:**
- Drizzle Kit for schema management
- `db:push` for development iteration
- `db:generate` + `db:migrate` for production changes

**Caching Strategy (MVP):**
- Client-side only via TanStack Query (stale-while-revalidate)
- No server-side caching for MVP
- Cloudflare edge caching for static assets

### Authentication & Security

**Session Strategy: Cookie-Based**
- Better-Auth configured with cookie sessions
- `credentials: 'include'` in all API calls
- Automatic session refresh handled by Better-Auth
- Same approach for both Coach and Athlete apps

**Authorization Pattern: Role-Based**
- Roles defined in `@strenly/core`: `Owner`, `Admin`, `Coach`
- Permissions derived from roles (not separate permission entities)
- Authorization checks in `authProcedure` middleware
- Organization membership validated on every authenticated request

**Multi-tenant Isolation:**
- `X-Organization-Slug` header identifies active organization
- Middleware validates user membership in organization
- All data queries scoped to organization context
- RLS policies as database-level safety net

### API & Communication Patterns

**Procedure Hierarchy:**
```
publicProcedure      → No authentication required (health checks, public data)
sessionProcedure     → User authenticated, no organization context (onboarding, org selection)
authProcedure        → User authenticated + organization context (most endpoints)
```

**Error Handling Standards:**
- Procedures define explicit error types with `errors({...})`
- Use cases return `ResultAsync` from neverthrow
- Typed error responses mapped to HTTP status codes
- Client receives structured error objects

**Rate Limiting:**
- Cloudflare Workers built-in rate limiting for MVP
- Configure via `wrangler.jsonc` rules
- Refine with custom middleware post-MVP if needed

### Frontend Architecture

**State Management:**

| State Type | Solution | Scope |
|------------|----------|-------|
| Server state | TanStack Query | API data, caching, sync |
| Auth state | React Context | User session, current org |
| Form state | React Hook Form | Form values, validation |
| UI state | useState/useReducer | Component-local state |

**No global state library needed** - TanStack Query handles the complex parts.

**Code Splitting:**
- TanStack Router lazy routes by default
- Dynamic imports for heavy components (charts, editors)
- Optimize based on actual performance data

**Forms:**
- React Hook Form for all forms
- Zod schemas from `@strenly/contracts` for validation
- `@hookform/resolvers` for Zod integration

### Infrastructure & Deployment

**CI/CD: GitHub Actions**
- Turbo remote caching for fast builds
- Parallel jobs for lint, typecheck, test
- Deploy to Cloudflare on main branch merge
- Preview deployments for PRs

**Environment Configuration:**
- `.env.local` for local development (gitignored)
- Cloudflare Workers secrets for production
- `@t3-oss/env-core` for runtime validation (optional)

**Monitoring & Logging (MVP):**
- Cloudflare Analytics (built-in, free)
- Sentry for error tracking in production
- Console logging in development
- Structured logging post-MVP

### Decision Impact Analysis

**Implementation Sequence:**
1. Monorepo setup + Docker PostgreSQL + Drizzle
2. Better-Auth configuration in `@strenly/auth`
3. Core domain entities and ports in `@strenly/core`
4. Database schemas in `@strenly/database`
5. Backend procedures in `@strenly/backend`
6. Frontend apps with oRPC client integration

**Cross-Component Dependencies:**
- `@strenly/core` has no dependencies on other packages (pure domain)
- `@strenly/database` depends on `@strenly/core` (for entity types)
- `@strenly/auth` depends on `@strenly/database` (for user/session tables)
- `@strenly/backend` depends on all packages (orchestration layer)
- Apps depend on `@strenly/backend` (for type inference) and `@strenly/contracts` (for schemas)

## Reference Implementation

The existing project at `/Users/tomiardz/Projects/strenly` serves as a reference implementation. When implementing this architecture, use the following files as templates:

### Monorepo Configuration

| File | Purpose | Copy/Adapt |
|------|---------|------------|
| `pnpm-workspace.yaml` | Workspace definition | Copy, adjust package names |
| `turbo.json` | Task orchestration | Copy directly |
| `biome.json` | Linting/formatting rules | Copy directly |
| `package.json` (root) | Scripts, catalog dependencies | Copy, update versions |

**Reference paths:**
- `/Users/tomiardz/Projects/strenly/pnpm-workspace.yaml`
- `/Users/tomiardz/Projects/strenly/turbo.json`
- `/Users/tomiardz/Projects/strenly/biome.json`

### TypeScript Configuration

| File | Purpose |
|------|---------|
| `packages/typescript-config/base.json` | Base strict config |
| `packages/typescript-config/library.json` | Non-React packages |
| `packages/typescript-config/react-library.json` | React packages |

**Reference path:** `/Users/tomiardz/Projects/strenly/packages/typescript-config/`

### shadcn/ui + Base UI Setup

The official docs may not cover Base UI integration. Reference:

| File | Purpose |
|------|---------|
| `apps/coach-web/components.json` | shadcn configuration |
| `apps/coach-web/src/components/ui/` | Component implementations |
| `apps/coach-web/tailwind.config.ts` | Tailwind + shadcn setup |

**Reference path:** `/Users/tomiardz/Projects/strenly/apps/coach-web/`

### oRPC Setup

| File | Purpose |
|------|---------|
| `packages/backend/src/lib/orpc.ts` | Procedure definitions (publicProcedure, authProcedure) |
| `packages/backend/src/lib/rpc-handler.ts` | Hono integration |
| `packages/backend/src/procedures/router.ts` | Router aggregation |
| `apps/coach-web/src/lib/orpc-client.ts` | Client setup with org header |
| `apps/coach-web/src/lib/orpc.ts` | TanStack Query integration |

**Reference path:** `/Users/tomiardz/Projects/strenly/packages/backend/src/lib/`

### Hono + Cloudflare Workers

| File | Purpose |
|------|---------|
| `packages/backend/src/app.ts` | Hono app with CORS, middleware |
| `packages/backend/src/env.types.ts` | Cloudflare bindings types |
| `apps/server/src/index.ts` | Worker entry point |
| `apps/server/wrangler.jsonc` | Cloudflare deployment config |

**Reference path:** `/Users/tomiardz/Projects/strenly/apps/server/`

### Better-Auth Configuration

| File | Purpose |
|------|---------|
| `packages/auth/src/index.ts` | Auth factory function |
| `packages/backend/src/app.ts` | Auth handler mounting |

**Reference path:** `/Users/tomiardz/Projects/strenly/packages/auth/`

### Drizzle ORM Setup

| File | Purpose |
|------|---------|
| `packages/database/src/index.ts` | Database client factory |
| `packages/database/src/schema/` | Table definitions |
| `packages/database/drizzle.config.ts` | Drizzle Kit configuration |

**Reference path:** `/Users/tomiardz/Projects/strenly/packages/database/`

### Clean Architecture Patterns

| Directory | Purpose |
|-----------|---------|
| `packages/core/src/domain/entities/` | Domain entities with validation |
| `packages/core/src/ports/` | Repository interfaces |
| `packages/core/src/errors/` | Domain error types |
| `packages/backend/src/application/use-cases/` | Use case implementations |
| `packages/backend/src/infrastructure/` | Repository implementations |

**Reference path:** `/Users/tomiardz/Projects/strenly/packages/core/`

### Contracts (Zod Schemas)

| Directory | Purpose |
|-----------|---------|
| `packages/contracts/src/common/` | Shared utilities (pagination, id, dates) |
| `packages/contracts/src/athletes/` | Example domain contracts |

**Reference path:** `/Users/tomiardz/Projects/strenly/packages/contracts/`

### PWA Configuration (vite-pwa)

| File | Purpose |
|------|---------|
| `apps/athlete-pwa/vite.config.ts` | PWA plugin configuration |
| `apps/athlete-pwa/public/manifest.json` | Web app manifest |

**Reference path:** `/Users/tomiardz/Projects/strenly/apps/athlete-pwa/`

### Usage Guidelines

When implementing:
1. **Copy configuration files** (turbo.json, biome.json, tsconfig) directly
2. **Adapt patterns** from reference code, don't copy business logic
3. **Update versions** - check for newer stable versions of dependencies
4. **Simplify where possible** - reference may have features not needed for MVP

## Implementation Patterns & Consistency Rules

These patterns ensure all AI agents write compatible, consistent code.

### Naming Patterns

**File Naming (ALL files):**
- **All files use `kebab-case`** - no exceptions
- TypeScript: `create-athlete.ts`, `training-plan-repository.ts`
- React components: `athlete-card.tsx`, `planning-grid.tsx`
- Tests: `athlete.test.ts`, `create-athlete.test.ts`
- Styles: `coach-theme.css`, `athlete-theme.css`

**Database (PostgreSQL/Drizzle):**
- Tables: `snake_case` plural (`athletes`, `training_plans`, `workout_logs`)
- Columns: `snake_case` (`organization_id`, `created_at`, `assigned_coach_id`)
- Foreign keys: `{referenced_table}_id` (`athlete_id`, `user_id`)
- Indexes: `{table}_{column}_idx` (`athletes_organization_id_idx`)

**API (oRPC):**
- Procedures: `camelCase` verbs (`createAthlete`, `listAthletes`, `updateTrainingPlan`)
- Response JSON: `camelCase` fields (`athleteId`, `createdAt`, `assignedCoachId`)
- Headers: Standard HTTP case (`X-Organization-Slug`)

**Code (TypeScript):**
- Functions: `camelCase` (`getAthleteById`, `validatePrescription`)
- Variables: `camelCase` (`athleteId`, `currentOrganization`)
- Types/Interfaces: `PascalCase` (`Athlete`, `TrainingPlan`, `CreateAthleteInput`)
- Enums: `PascalCase` with `PascalCase` values (`Role.Owner`, `Role.Coach`)
- Constants: `SCREAMING_SNAKE_CASE` (`MAX_ATHLETES_PER_PLAN`, `DEFAULT_REST_SECONDS`)
- React components: `PascalCase` function name, `kebab-case` filename

**Examples:**
```typescript
// File: src/features/athletes/components/athlete-card.tsx
export function AthleteCard({ athlete }: AthleteCardProps) { ... }

// File: packages/core/src/domain/entities/athlete.ts
export interface Athlete { ... }

// File: packages/backend/src/procedures/athletes/create-athlete.ts
export const createAthlete = authProcedure...
```

### Structure Patterns

**Test Location:**
- Unit tests: Co-located with source (`athlete.test.ts` next to `athlete.ts`)
- Integration tests: `__tests__/integration/` in package root
- E2E tests: `apps/{app}/e2e/`

**Frontend Feature Organization:**
```
apps/coach-web/src/
├── features/
│   └── athletes/
│       ├── components/
│       │   ├── athlete-card.tsx
│       │   └── athlete-list.tsx
│       ├── hooks/
│       │   └── use-athletes.ts
│       └── pages/
│           └── athletes-page.tsx
├── components/
│   └── ui/                 # shadcn components (kebab-case)
├── lib/
│   ├── orpc-client.ts
│   └── utils.ts
└── routes/                 # TanStack Router
```

**Backend Organization (Clean Architecture):**
```
packages/core/src/
├── domain/
│   ├── entities/
│   │   └── athlete.ts      # Business entity + validation
│   └── services/
│       └── progression-service.ts
├── ports/
│   └── athlete-repository.ts   # Interface only
└── errors/
    └── index.ts

packages/backend/src/
├── procedures/
│   └── athletes/
│       ├── create-athlete.ts   # Thin handler
│       ├── list-athletes.ts
│       └── index.ts            # EXCEPTION: barrel for router
├── application/
│   └── use-cases/
│       └── athletes/
│           └── create-athlete-use-case.ts
└── infrastructure/
    └── repositories/
        └── drizzle-athlete-repository.ts

packages/contracts/src/
└── athletes/
    ├── athlete.ts          # Entity schema
    ├── create-athlete.ts   # Input/output schemas
    └── list-athletes.ts    # Query/response schemas
```

### Format Patterns

**Error Handling (neverthrow):**
```typescript
// Use cases return ResultAsync with discriminated union errors
import { ResultAsync, err, ok } from 'neverthrow'

type CreateAthleteError =
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'LIMIT_EXCEEDED'; limit: number }
  | { type: 'DUPLICATE_EMAIL'; email: string }

async function createAthlete(
  input: CreateAthleteInput,
  context: OrganizationContext
): ResultAsync<Athlete, CreateAthleteError> {
  // Implementation returns ok(athlete) or err({ type: '...', ... })
}
```

**oRPC Procedure Errors:**
```typescript
export const createAthlete = authProcedure
  .errors({
    VALIDATION_ERROR: { message: 'Datos inválidos' },
    LIMIT_EXCEEDED: { message: 'Has alcanzado el límite de atletas' },
    DUPLICATE_EMAIL: { message: 'Ya existe un atleta con ese email' },
  })
  .input(createAthleteInputSchema)
  .output(athleteSchema)
  .handler(async ({ input, context, errors }) => {
    const result = await createAthleteUseCase(input, context.organization)

    if (result.isErr()) {
      throw errors[result.error.type](result.error)
    }

    return result.value
  })
```

**API Response Formats:**
- Success: Direct data (oRPC handles wrapping)
- Pagination: `{ items: T[], total: number }`
- No custom wrapper objects

**Date Formats:**
- Database: `timestamp with time zone`
- API: ISO 8601 strings (`2026-01-18T14:30:00.000Z`)
- Display: Localized via `date-fns` with user's locale

### State Management Patterns

**Server State (TanStack Query):**
```typescript
// Query
const { data, isLoading, error } = useQuery(
  orpc.athletes.list.queryOptions({ limit: 50 })
)

// Mutation with cache invalidation
const mutation = useMutation({
  ...orpc.athletes.create.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['athletes'] })
  },
})
```

**Client State:**
- Auth/Org context: React Context
- Form state: React Hook Form
- UI state: `useState` / `useReducer` (component-local)
- No Zustand/Redux needed

**Loading States:**
- Use TanStack Query's `isLoading`, `isPending`, `isFetching`
- Skeleton components for loading UI
- No manual loading state for server data

**Error Handling (React):**
- Error boundaries for unexpected errors
- `onError` in mutations for expected errors
- Toast notifications via Sonner

### Mandatory Rules for AI Agents

**MUST (Obligatorio):**

1. **Import schemas from `@strenly/contracts`** - never define Zod schemas inline in procedures or components
2. **Use `ResultAsync` from neverthrow** for all async operations in use cases
3. **Pass `OrganizationContext`** to all repository methods that access tenant data
4. **Use `kebab-case` for ALL filenames** - no exceptions
5. **Write user-facing messages in Spanish** - log messages in English
6. **Validate with Zod schemas** from contracts, not manual validation

**MUST NOT (Prohibido):**

1. **No `as` type casting** - fix the actual type issue
2. **No `!` non-null assertion** - use optional chaining or guards
3. **No barrel files** (`index.ts` re-exports) - EXCEPTION: `procedures/router.ts`
4. **No `any` type** - use `unknown` and narrow
5. **No components in packages/** - UI components live in apps only
6. **No queries without organization scope** on multi-tenant tables
7. **No `.env` files committed** - use `.env.example` as template

### Pattern Examples

**Good:**
```typescript
// File: packages/contracts/src/athletes/create-athlete.ts
export const createAthleteInputSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional(),
})

// File: packages/backend/src/procedures/athletes/create-athlete.ts
import { createAthleteInputSchema } from '@strenly/contracts/athletes/create-athlete'

export const createAthlete = authProcedure
  .input(createAthleteInputSchema)  // Imported, not defined here
  ...
```

**Bad (Anti-patterns):**
```typescript
// ❌ Inline schema definition
export const createAthlete = authProcedure
  .input(z.object({ name: z.string() }))  // Should import from contracts

// ❌ Type casting
const athlete = data as Athlete  // Should use schema validation

// ❌ Missing org context
const athletes = await db.select().from(athletesTable)  // Missing .where(eq(..., orgId))

// ❌ Wrong file naming
// UserCard.tsx ❌ → user-card.tsx ✅
// createAthlete.ts ❌ → create-athlete.ts ✅
```

### Validation & Enforcement

**Automated Checks:**
- Biome enforces code style (no semicolons, single quotes, trailing commas)
- TypeScript strict mode catches type issues
- `pnpm lint` and `pnpm typecheck` in CI

**Manual Review Points:**
- Schema imports from contracts (not inline)
- Organization context in queries
- File naming conventions
- Error handling with neverthrow

## Project Structure & Boundaries

### Complete Project Directory Structure

```
strenly/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, typecheck, test on PR
│       └── deploy.yml                # Deploy to Cloudflare on merge
├── apps/
│   ├── coach-web/                    # React + Vite (Desktop SPA)
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── ui/               # shadcn components
│   │   │   ├── features/
│   │   │   │   ├── athletes/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   └── pages/
│   │   │   │   ├── exercises/
│   │   │   │   ├── organizations/
│   │   │   │   ├── planning/         # Training plan editor
│   │   │   │   └── dashboard/
│   │   │   ├── lib/
│   │   │   │   ├── orpc-client.ts
│   │   │   │   ├── orpc.ts
│   │   │   │   └── utils.ts
│   │   │   ├── providers/
│   │   │   │   ├── auth-provider.tsx
│   │   │   │   └── organization-provider.tsx
│   │   │   ├── routes/               # TanStack Router
│   │   │   │   ├── __root.tsx
│   │   │   │   └── _authenticated/
│   │   │   ├── styles/
│   │   │   │   └── globals.css
│   │   │   └── main.tsx
│   │   ├── e2e/                      # Playwright tests
│   │   ├── index.html
│   │   ├── components.json           # shadcn config
│   │   ├── tailwind.config.ts
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── athlete-pwa/                  # React + Vite + PWA (Mobile)
│   │   ├── public/
│   │   │   ├── manifest.json
│   │   │   └── icons/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── ui/               # shadcn components
│   │   │   ├── features/
│   │   │   │   ├── workouts/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── workout-day-card.tsx
│   │   │   │   │   │   ├── set-chip.tsx
│   │   │   │   │   │   └── rpe-selector.tsx
│   │   │   │   │   └── pages/
│   │   │   │   ├── progress/
│   │   │   │   └── profile/
│   │   │   ├── lib/
│   │   │   ├── providers/
│   │   │   ├── routes/
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   ├── vite.config.ts            # Includes vite-pwa config
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── server/                       # Hono entry point (Cloudflare Workers)
│   │   ├── src/
│   │   │   └── index.ts              # Re-exports from @strenly/backend
│   │   ├── wrangler.jsonc
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── marketing/                    # Next.js (Landing page)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   └── globals.css
│       │   └── components/
│       ├── public/
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── backend/                      # API logic (Hono + oRPC)
│   │   ├── src/
│   │   │   ├── app.ts                # Hono app setup, CORS, middleware
│   │   │   ├── index.ts              # Exports AppType, app
│   │   │   ├── env.types.ts          # Cloudflare bindings
│   │   │   ├── lib/
│   │   │   │   ├── orpc.ts           # publicProcedure, authProcedure
│   │   │   │   ├── rpc-handler.ts
│   │   │   │   └── monitoring.ts
│   │   │   ├── middleware/
│   │   │   │   └── infrastructure.ts
│   │   │   ├── procedures/
│   │   │   │   ├── router.ts         # Main router
│   │   │   │   ├── health/
│   │   │   │   ├── athletes/
│   │   │   │   ├── exercises/
│   │   │   │   ├── training-plans/
│   │   │   │   ├── workout-logging/
│   │   │   │   └── organizations/
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   │       ├── athletes/
│   │   │   │       ├── exercises/
│   │   │   │       ├── training-plans/
│   │   │   │       └── workout-logging/
│   │   │   └── infrastructure/
│   │   │       └── repositories/
│   │   │           ├── drizzle-athlete-repository.ts
│   │   │           ├── drizzle-exercise-repository.ts
│   │   │           └── drizzle-training-plan-repository.ts
│   │   ├── __tests__/
│   │   │   └── integration/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── contracts/                    # Zod schemas (API boundary)
│   │   ├── src/
│   │   │   ├── common/
│   │   │   │   ├── id.ts
│   │   │   │   ├── pagination.ts
│   │   │   │   ├── dates.ts
│   │   │   │   └── roles.ts
│   │   │   ├── athletes/
│   │   │   │   ├── athlete.ts
│   │   │   │   ├── create-athlete.ts
│   │   │   │   └── list-athletes.ts
│   │   │   ├── exercises/
│   │   │   ├── training-plans/
│   │   │   ├── prescriptions/
│   │   │   ├── workout-logging/
│   │   │   ├── organizations/
│   │   │   └── auth/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── core/                         # Domain layer (Clean Architecture)
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── athlete.ts
│   │   │   │   │   ├── exercise.ts
│   │   │   │   │   ├── training-plan.ts
│   │   │   │   │   ├── week.ts
│   │   │   │   │   ├── session.ts
│   │   │   │   │   ├── prescription.ts
│   │   │   │   │   └── workout-log.ts
│   │   │   │   └── services/
│   │   │   │       └── progression-service.ts
│   │   │   ├── ports/
│   │   │   │   ├── athlete-repository.ts
│   │   │   │   ├── exercise-repository.ts
│   │   │   │   ├── training-plan-repository.ts
│   │   │   │   └── workout-log-repository.ts
│   │   │   ├── errors/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── database/                     # Drizzle schemas + client
│   │   ├── src/
│   │   │   ├── index.ts              # createDb factory
│   │   │   ├── client.ts
│   │   │   └── schema/
│   │   │       ├── index.ts          # Re-exports all schemas
│   │   │       ├── users.ts
│   │   │       ├── organizations.ts
│   │   │       ├── athletes.ts
│   │   │       ├── exercises.ts
│   │   │       ├── training-plans.ts
│   │   │       ├── weeks.ts
│   │   │       ├── sessions.ts
│   │   │       ├── prescriptions.ts
│   │   │       └── workout-logs.ts
│   │   ├── drizzle/
│   │   │   └── migrations/
│   │   ├── scripts/
│   │   │   ├── seed-exercises.ts
│   │   │   └── seed-plans.ts
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── auth/                         # Better-Auth configuration
│   │   ├── src/
│   │   │   └── index.ts              # createAuth factory
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── typescript-config/            # Shared TSConfig
│       ├── base.json
│       ├── library.json
│       └── react-library.json
│
├── docker-compose.yml                # Local PostgreSQL
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
├── package.json                      # Root scripts, catalog
├── .env.example
├── .gitignore
└── README.md
```

### Architectural Boundaries

**Package Dependency Graph:**
```
@strenly/typescript-config (no deps)
         ↓
@strenly/core ← neverthrow
         ↓
@strenly/contracts ← zod, @strenly/core
         ↓
@strenly/database ← drizzle-orm, @strenly/core
         ↓
@strenly/auth ← better-auth, @strenly/database
         ↓
@strenly/backend ← hono, oRPC, all packages above
         ↓
apps/* ← @strenly/backend (types only), @strenly/contracts
```

**API Boundaries:**
```
[Coach Web App] ──┐
                  ├──→ /rpc/* ──→ [Hono + oRPC Procedures]
[Athlete PWA] ────┘                       ↓
                                   [Use Cases]
                                   (@strenly/backend/application)
                                         ↓
                                   [Domain Logic]
                                   (@strenly/core)
                                         ↓
                                   [Repositories]
                                   (@strenly/backend/infrastructure)
                                         ↓
                                   [PostgreSQL]
                                   (via @strenly/database)
```

**Data Boundaries:**
- All tenant data includes `organization_id` column
- Repository methods require `OrganizationContext` parameter
- RLS policies as database-level safety net
- No cross-tenant data access possible

### Requirements to Structure Mapping

| PRD Domain | Contracts | Core Entities | Backend Procedures | Coach Features | Athlete Features |
|------------|-----------|---------------|-------------------|----------------|------------------|
| User Management | `auth/` | - | `auth/` | `auth/` | `auth/` |
| Organization | `organizations/` | - | `organizations/` | `organizations/` | - |
| Athletes | `athletes/` | `athlete.ts` | `athletes/` | `athletes/` | `profile/` |
| Training Programs | `training-plans/` | `training-plan.ts`, `week.ts`, `session.ts` | `training-plans/` | `planning/` | `workouts/` |
| Prescriptions | `prescriptions/` | `prescription.ts` | (within training-plans) | `planning/` | `workouts/` |
| Exercises | `exercises/` | `exercise.ts` | `exercises/` | `exercises/` | - |
| Workout Logging | `workout-logging/` | `workout-log.ts` | `workout-logging/` | - | `workouts/` |
| Progress | `progress/` | - | `progress/` | `dashboard/` | `progress/` |

### Integration Points

**Internal Communication:**
- Frontend → Backend: oRPC over HTTPS (`/rpc/*`)
- Auth flow: Better-Auth handlers at `/api/auth/*`
- Organization context: `X-Organization-Slug` header on all authenticated requests

**External Integrations (Post-MVP):**
- Payment: Stripe (checkout, webhooks)
- Email: Resend or similar
- Analytics: Cloudflare Analytics (built-in)

**Data Flow:**
```
User Action → React Component → TanStack Query → oRPC Client
    → HTTP Request → Hono Middleware → oRPC Procedure
    → Use Case → Repository → Drizzle → PostgreSQL
    → Response flows back through the same layers
```

### Development Workflow

**Local Development:**
```bash
pnpm db:start          # Start PostgreSQL container
pnpm dev            # Start all apps in parallel (Turbo)
pnpm dev:coach      # Start only coach-web
pnpm dev:athlete    # Start only athlete-pwa
pnpm dev:server     # Start only API server
```

**Database Operations:**
```bash
pnpm db:push        # Push schema changes (dev)
pnpm db:generate    # Generate migration (prod)
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed development data
pnpm db:studio      # Open Drizzle Studio
pnpm db:reset       # Reset database completely
```

**Quality Checks:**
```bash
pnpm lint           # Run Biome linter
pnpm typecheck      # Run TypeScript compiler
pnpm test           # Run unit tests
pnpm test:e2e       # Run Playwright tests
```

**Build & Deploy:**
```bash
pnpm build          # Build all packages and apps
pnpm deploy         # Deploy to Cloudflare (requires wrangler auth)
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts:
- React 19 + Vite + TanStack Router/Query (frontend stack)
- Hono + oRPC + Drizzle (backend stack)
- Better-Auth with Drizzle adapter (authentication)
- PostgreSQL with standard driver (dev) and neon-serverless (prod)
- Cloudflare Workers compatible with all chosen technologies

**Pattern Consistency:**
Implementation patterns support all architectural decisions:
- Naming conventions are consistent across all layers
- Error handling flows from neverthrow through oRPC to frontend
- Clean Architecture boundaries are respected in package structure
- File naming (kebab-case) is uniform throughout

**Structure Alignment:**
Project structure fully supports the architecture:
- Monorepo enables code sharing while maintaining boundaries
- Package dependencies follow a clear hierarchy
- Integration points (oRPC, contracts) are well-defined
- Feature-based frontend organization aligns with PRD domains

### Requirements Coverage Validation ✅

**Functional Requirements Coverage (71 FRs):**

| Domain | FRs | Status | Notes |
|--------|-----|--------|-------|
| User Management | FR1-FR6 | ✅ MVP | Better-Auth handles all auth flows |
| Organization | FR7-FR15 | ✅ MVP | Multi-tenancy with RLS |
| Subscriptions | FR16-FR21 | ✅ MVP | Full subscription logic, mocked payment gateway |
| Athletes | FR22-FR29 | ✅ MVP | CRUD + invitations + magic links |
| Training Programs | FR30-FR41 | ✅ MVP | Full hierarchy (Program > Block > Week > Session) |
| Exercises | FR42-FR48 | ✅ MVP | Library + custom exercises |
| Workout Logging | FR49-FR58 | ✅ MVP | Per-set logging with comparison |
| Progress | FR59-FR62 | ✅ MVP | Basic PR detection and history |
| Dashboard | FR63-FR67 | ✅ MVP | Coach overview dashboard |
| Admin | FR68-FR71 | ⏳ Post-MVP | Platform administration |

**Non-Functional Requirements Coverage:**

| NFR | Requirement | Architectural Support |
|-----|-------------|----------------------|
| Performance | <100ms inline editing | TanStack Query caching + optimistic updates |
| Performance | <2s page loads | Vite code splitting + Cloudflare CDN |
| Performance | <3s PWA initial load | vite-pwa service worker |
| Security | Multi-tenant isolation | RLS policies + organization context |
| Security | Password hashing | Better-Auth (argon2 by default) |
| Reliability | Transaction integrity | PostgreSQL ACID transactions |
| Scalability | 5-100+ coaches | Cloudflare Workers auto-scaling + Neon serverless |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical technologies specified with clear rationale
- Reference implementation available at `/Users/tomiardz/Projects/strenly`
- Configuration patterns documented with file paths
- Version decisions based on current stable releases

**Structure Completeness:**
- Complete project tree with all files and directories
- Package boundaries clearly defined
- Requirements mapped to specific locations
- Development workflow commands documented

**Pattern Completeness:**
- Naming conventions cover all cases (files, DB, API, code)
- Error handling patterns with code examples
- State management patterns for all state types
- Mandatory rules (MUST/MUST NOT) for AI agents

### Gap Analysis Results

**Critical Gaps:** None identified

**Important Clarifications Made:**
- Subscriptions: Full logic is MVP, only payment gateway is mocked
- UI packages: Separate per app, no shared UI package
- Auth: Unified Better-Auth for both Coach and Athlete apps
- Database: Docker PostgreSQL for dev, Neon for prod

**Deferred to Post-MVP:**
- Real payment gateway integration (Stripe/MercadoPago)
- Platform administration dashboard
- Real-time WebSocket updates (if needed)
- Server-side caching (Cloudflare KV)
- Email notification service

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium-High)
- [x] Technical constraints identified (from domain research)
- [x] Cross-cutting concerns mapped (multi-tenancy, auth, state)

**✅ Architectural Decisions**
- [x] Critical decisions documented with technologies
- [x] Technology stack fully specified
- [x] Integration patterns defined (oRPC, contracts)
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established (kebab-case files)
- [x] Structure patterns defined (Clean Architecture)
- [x] Communication patterns specified (oRPC procedures)
- [x] Process patterns documented (error handling, loading states)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

**✅ Reference Implementation**
- [x] Existing project documented as reference
- [x] File paths provided for key configurations
- [x] Usage guidelines specified

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
1. Proven technology stack with reference implementation
2. Clean Architecture enables testability and maintainability
3. Type-safe from database to frontend via oRPC + Zod
4. Dual-app structure optimized for each user type
5. Local-first development with Docker PostgreSQL

**Areas for Future Enhancement:**
1. Real payment gateway (post-MVP)
2. Real-time updates if user feedback indicates need
3. Server-side caching for high-traffic scenarios
4. Native mobile apps (post-PWA validation)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Import schemas from `@strenly/contracts`, never define inline
- Use reference implementation for configuration patterns
- All files in `kebab-case`, no exceptions

**First Implementation Priority (Epic 0):**
1. Initialize monorepo with pnpm workspaces
2. Configure Turbo, Biome, TypeScript
3. Set up Docker Compose for PostgreSQL
4. Create empty package scaffolds
5. Set up Drizzle with initial schema
6. Configure Better-Auth
7. Create minimal Hono app with health endpoint
8. Set up coach-web with TanStack Router skeleton

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-18
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific technologies and rationale
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping (71 FRs → specific components)
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**

- 25+ architectural decisions made across 6 major areas
- 15+ implementation patterns defined
- 4 application components (coach-web, athlete-pwa, server, marketing)
- 6 shared packages (backend, contracts, core, database, auth, typescript-config)
- 71 functional requirements fully supported

**📚 AI Agent Implementation Guide**

- Technology stack with current stable versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards
- Reference implementation paths documented

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing Strenly. Follow all decisions, patterns, and structures exactly as documented.

**Development Sequence:**

1. Initialize project using documented monorepo structure
2. Set up development environment (Docker PostgreSQL, Turbo, Biome)
3. Implement core architectural foundations (`@strenly/core`, `@strenly/database`)
4. Configure authentication (`@strenly/auth` with Better-Auth)
5. Build API procedures (`@strenly/backend` with oRPC)
6. Create frontend applications following feature-based structure
7. Maintain consistency with documented rules (kebab-case, contracts import, neverthrow)

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible (React 19 + Vite + TanStack + Hono + oRPC + Drizzle)
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**

- [x] All 71 functional requirements are supported
- [x] All 15 non-functional requirements are addressed
- [x] Cross-cutting concerns are handled (multi-tenancy, auth, state)
- [x] Integration points are defined

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Reference implementation provided for complex configurations

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The chosen monorepo structure and architectural patterns provide a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

