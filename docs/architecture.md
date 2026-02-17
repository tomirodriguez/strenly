# Strenly — Architecture

**Generated:** 2026-02-17 | **Pattern:** Clean Architecture + DDD

## Executive Summary

Strenly follows **Clean Architecture** with explicit layer separation enforced through pnpm workspace packages. Business rules live in `packages/core` with zero external dependencies. The application layer in `packages/backend` orchestrates use cases, repositories, and API procedures. Frontend apps consume a type-safe oRPC client.

## Layer Dependency Graph

```
┌─────────────────────────────────────────────┐
│              apps/coach-web                  │  React SPA (Vite)
│              apps/api                        │  Hono entry point
└────────────────────┬────────────────────────┘
                     │ imports
┌────────────────────▼────────────────────────┐
│           packages/contracts                 │  Zod schemas (API boundary)
└────────────────────┬────────────────────────┘
                     │ imports
┌────────────────────▼────────────────────────┐
│           packages/backend                   │  Use cases, repos, procedures
└──────┬──────────────────────────┬────────────┘
       │ imports                  │ imports
┌──────▼──────────┐   ┌──────────▼──────────────┐
│ packages/core   │   │    packages/database      │
│ (domain)        │   │    (Drizzle schemas)      │
└─────────────────┘   └──────────┬───────────────┘
         No deps                  │ imports
                       ┌──────────▼──────────────┐
                       │     packages/auth         │
                       │     (Better-Auth)         │
                       └─────────────────────────-┘
```

## Data Flow

```
Frontend Component
  └→ TanStack Query hook (useQuery / useMutation)
       └→ oRPC client (RPCLink → POST /rpc/{domain}/{action})
            └→ Hono app (apps/api → packages/backend/app-railway.ts)
                 └→ oRPC Procedure (packages/backend/procedures/{domain})
                      └→ Use Case (packages/backend/use-cases/{domain})
                           └→ Repository Port (packages/core/ports)
                                └→ Repository Implementation (packages/backend/infrastructure/repositories)
                                     └→ Drizzle ORM → Neon PostgreSQL
```

## Architecture Patterns

### Clean Architecture Layers

#### 1. Domain Layer — `packages/core`
- **Zero external dependencies** — only neverthrow
- **Entities** with factory methods (`create`, `reconstitute`) returning `Result<Entity, Error>`
- **Value Objects** for validated concepts (MuscleGroup, MovementPattern)
- **Port interfaces** (`{Entity}RepositoryPort`) defining data access contracts
- **Authorization service** — `hasPermission(role, permission)` RBAC

Key entities:
- `Program` (aggregate root) → Week → Session → ExerciseGroup → GroupItem → Series
- `Athlete` — with status lifecycle (active/inactive)
- `Exercise` — curated vs custom, movement pattern classification
- `WorkoutLog` — session logging with `LoggedExercise` and `LoggedSeries`
- `Plan` / `Subscription` — billing entities

#### 2. Database Layer — `packages/database`
- Drizzle ORM schemas for Neon PostgreSQL
- All tenant tables include `organizationId` FK → `organizations.id`
- UUIDs for primary keys with prefixes (e.g., `prg-`, `week-`, `rx-`)
- Drizzle `relations()` for type-safe query builder
- Better-Auth tables managed through `drizzle-adapter`

#### 3. Auth Layer — `packages/auth`
- Better-Auth factory function (`createAuth(env, db)`)
- Plugins: `organization` (multi-tenancy)
- Social: Google OAuth (optional)
- Session cookie cache: 5-minute TTL

#### 4. Application Layer — `packages/backend`

**Procedures** (`procedures/{domain}/`):
- Thin handlers: validate input, call use case, map result
- Three procedure types: `publicProcedure`, `sessionProcedure`, `authProcedure`
- `authProcedure` validates: session → X-Organization-Slug header → org membership → role

**Use Cases** (`use-cases/{domain}/`):
- Orchestrate repositories with neverthrow `ResultAsync`
- Pattern: check auth → validate → call repository → return result
- Errors: typed discriminated unions (e.g., `'forbidden' | 'not_found' | 'repository_error'`)

**Repositories** (`infrastructure/repositories/`):
- Implement ports from `@strenly/core`
- Factory pattern: `createProgramRepository(db): ProgramRepositoryPort`
- All methods receive `OrganizationContext` — always filter by `organizationId`
- Wrap Drizzle calls with `ResultAsync.fromPromise(query, wrapDbError)`

#### 5. Contracts Layer — `packages/contracts`
- Zod 4 schemas defining API input/output shapes
- Organized by domain: `athletes/`, `exercises/`, `programs/`, `subscriptions/`, `workout-logs/`
- Common schemas: `pagination`, `roles`, `errors`, `id`, `dates`
- Both frontend and backend import from here — single source of truth

#### 6. Frontend — `apps/coach-web`
- TanStack Router (file-based routing) with `_authenticated` layout guard
- oRPC client with `X-Organization-Slug` header injection
- Feature-based structure: `features/{domain}/{components,hooks,views}`
- Zustand stores for complex grid state (`grid-store.ts`, `log-store.ts`)
- shadcn/ui component library (Radix primitives + Tailwind)

## Authentication & Authorization Flow

```
1. User visits /{orgSlug}/... route
2. TanStack Router beforeLoad → Better-Auth getSession()
3. If no session → redirect to /login
4. Session + org list cached (5 min TTL) in AuthCache
5. API requests: oRPC client injects X-Organization-Slug header
6. authProcedure middleware: validates session + org membership + role
7. Use cases: hasPermission(role, 'resource:action') check
```

### RBAC Role Matrix

| Permission | Owner | Admin | Member |
|-----------|-------|-------|--------|
| organization:manage | ✓ | ✓ | |
| organization:delete | ✓ | | |
| members:invite/remove | ✓ | ✓ | |
| members:update-role | ✓ | | |
| athletes:write/delete | ✓ | ✓ | |
| programs:write/delete | ✓ | ✓ | |
| exercises:write | ✓ | ✓ | |
| workout_log:create/update/delete | ✓ | ✓ | |
| *:read | ✓ | ✓ | ✓ |
| billing:manage | ✓ | | |

## Program Data Model (Core Domain)

The Program is the most complex aggregate:

```
Program
└── weeks: Week[]
    └── sessions: Session[]            (shared across all weeks)
        └── exerciseGroups: ExerciseGroup[]
            └── items: GroupItem[]     (exercises)
                └── series: Series[]  (sets with reps/intensity/tempo)
```

**Key insight:** Sessions define the structure (exercises, groups). Prescriptions define the values (reps/intensity) per week. This allows different training volumes per week while maintaining the same session structure.

## API Endpoints

### Better-Auth (handled at `/api/auth/*`)
- `GET /api/auth/get-session` — get current session
- `POST /api/auth/sign-in/email` — email login
- `POST /api/auth/sign-up/email` — email signup
- `GET /api/auth/organization/list` — list user's organizations

### oRPC (`/rpc/{domain}/{action}`, all POST)

**Programs:** `programs/get`, `programs/list`, `programs/create`, `programs/update`, `programs/archive`, `programs/duplicate`, `programs/saveDraft`, `programs/templates`, `programs/sessions`, `programs/weeks`, `programs/exerciseRows`, `programs/prescriptions`

**Athletes:** `athletes/get`, `athletes/list`, `athletes/create`, `athletes/update`, `athletes/archive`, `athletes/generateInvitation`, `athletes/acceptInvitation`, `athletes/getAthleteInvitation`, `athletes/getInvitationInfo`

**Exercises:** `exercises/get`, `exercises/list`, `exercises/create`, `exercises/update`, `exercises/archive`, `exercises/clone`, `exercises/listMuscleGroups`

**Workout Logs:** `workoutLogs/get`, `workoutLogs/create`, `workoutLogs/save`, `workoutLogs/delete`, `workoutLogs/listAthleteLog`, `workoutLogs/getBySession`

**Subscriptions:** `subscriptions/get`, `subscriptions/create`, `subscriptions/listPlans`

**Health:** `health/health`

## Error Handling Strategy

### Backend
- Procedures throw typed oRPC errors: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `ORG_NOT_FOUND`, `NOT_A_MEMBER`
- Use cases return `ResultAsync<T, DomainError>` — never throw
- Repositories return `ResultAsync<T, RepositoryError>` — never throw

### Frontend
- TanStack Query error state for query failures
- Mutation hooks handle: UNAUTHORIZED → redirect to /login, typed errors → toast messages
- Root error boundary for unexpected errors

## Testing Strategy

| Layer | Coverage Target | Test Type |
|-------|----------------|-----------|
| `packages/core` (entities) | 90%+ | Unit (Vitest) |
| `packages/backend` (use cases) | 80%+ | Unit with mock repos (Vitest) |
| `packages/backend` (repositories) | 75%+ | Unit with mock DB |
| `apps/coach-web` | E2E critical flows | Playwright |

Test factories in `packages/backend/src/__tests__/factories/` — mock repositories implementing port interfaces.

## Environment Variables

### API Server
```
DATABASE_URL          # Neon PostgreSQL connection string
BETTER_AUTH_SECRET    # Min 32 chars (openssl rand -base64 32)
BETTER_AUTH_URL       # Public URL of this API server
GOOGLE_CLIENT_ID      # Optional: Google OAuth
GOOGLE_CLIENT_SECRET  # Optional: Google OAuth
APP_URL               # Optional: Application URL
ENVIRONMENT           # development | production | test
PORT                  # Default: 8787
```

### Coach Web (Vite)
```
VITE_API_URL          # API server URL (e.g., http://localhost:8787)
```
