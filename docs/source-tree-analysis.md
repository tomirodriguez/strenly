# Strenly — Source Tree Analysis

**Generated:** 2026-02-17 | **Scan Level:** Deep

## Repository Root

```
strenly/                            # Monorepo root
├── apps/
│   ├── api/                        # 🚀 Hono entry point (Railway deployment)
│   └── coach-web/                  # 💻 React SPA for strength coaches (Vite)
├── packages/
│   ├── core/                       # 🏛️ Domain layer (zero dependencies)
│   ├── backend/                    # ⚙️ Application layer (use cases, repos, procedures)
│   ├── database/                   # 🗄️ Drizzle ORM schemas + migrations
│   ├── contracts/                  # 📋 Shared Zod schemas (API boundary)
│   └── auth/                       # 🔐 Better-Auth configuration
├── docs/                           # 📚 Project documentation (this folder)
├── scripts/                        # 🔧 Development scripts
├── _bmad/                          # 🤖 BMad workflow configuration
├── _bmad-output/                   # 📦 BMad workflow outputs
├── docker-compose.yml              # Local PostgreSQL for development
├── docker-compose.test.yml         # Test database
├── biome.json                      # Biome linter/formatter config
├── turbo.json                      # Turbo build pipeline config
├── pnpm-workspace.yaml             # pnpm workspace + catalog
└── package.json                    # Root scripts + devDependencies
```

## apps/api — API Server Entry Point

```
apps/api/
├── src/
│   ├── server.ts                   # 🎯 Entry point: serve(railwayApp)
│   └── index.ts                    # Re-exports from @strenly/backend
├── package.json                    # Deps: @strenly/backend, @hono/node-server
├── railway.json                    # Railway deployment config
└── tsup.config.ts                  # Build config (tsup)
```

**Key file:** `src/server.ts` — imports `railwayApp` from `@strenly/backend` and starts Node.js HTTP server.

## apps/coach-web — Coach Web Application

```
apps/coach-web/
├── src/
│   ├── main.tsx                    # 🎯 App entry: TanStack Router + QueryClient
│   ├── routeTree.gen.ts            # Auto-generated route tree (never edit)
│   ├── env.ts                      # Validated VITE_* environment variables
│   │
│   ├── routes/                     # 🗺️ File-based routing (TanStack Router)
│   │   ├── __root.tsx              # Root layout: QueryClientProvider + Toaster
│   │   ├── index.tsx               # / → redirect to /login or /{orgSlug}/dashboard
│   │   ├── _auth.tsx               # Auth layout (login/signup pages)
│   │   ├── _auth/
│   │   │   ├── login.tsx           # /login
│   │   │   └── signup.tsx          # /signup
│   │   ├── _authenticated.tsx      # Auth guard: validates session, loads orgs
│   │   ├── _authenticated/$orgSlug.tsx         # Org context loader
│   │   └── _authenticated/$orgSlug/
│   │       ├── dashboard.tsx       # /{orgSlug}/dashboard
│   │       ├── exercises.tsx       # /{orgSlug}/exercises
│   │       ├── athletes/
│   │       │   ├── index.tsx       # /{orgSlug}/athletes
│   │       │   └── $athleteId/
│   │       │       ├── index.tsx   # /{orgSlug}/athletes/{id}
│   │       │       ├── log/$sessionId.tsx  # Session logging
│   │       │       └── logs/index.tsx      # Log history
│   │       └── programs/
│   │           ├── index.tsx       # /{orgSlug}/programs
│   │           ├── new.tsx         # /{orgSlug}/programs/new
│   │           └── $programId.tsx  # /{orgSlug}/programs/{id} (grid editor)
│   │
│   ├── features/                   # 🧩 Feature modules (domain-based)
│   │   ├── athletes/
│   │   │   ├── components/         # AthleteForm, AthletesTable, InvitationModal
│   │   │   ├── hooks/
│   │   │   │   ├── mutations/      # useCreateAthlete, useUpdateAthlete, useArchiveAthlete, useGenerateInvitation
│   │   │   │   └── queries/        # useAthletes, useAthlete, useAthleteInvitation
│   │   │   └── views/              # AthletesListView, AthleteDetailView
│   │   ├── auth/
│   │   │   ├── components/         # LoginForm, SignupForm, OrgForm, PlanSelectionStep
│   │   │   ├── hooks/mutations/    # useCreateSubscription
│   │   │   └── views/              # LoginView, SignupView, OnboardingView
│   │   ├── dashboard/
│   │   │   ├── components/         # StatsCards, RecentActivity, QuickActions
│   │   │   ├── hooks/              # useDashboardStats
│   │   │   └── views/              # DashboardView
│   │   ├── exercises/
│   │   │   ├── components/         # ExercisesTable, ExerciseFilters, MuscleBadges
│   │   │   ├── hooks/queries/      # useExercises, useMuscleGroups
│   │   │   └── views/              # ExercisesBrowserView
│   │   ├── programs/
│   │   │   ├── components/         # ProgramForm, ProgramsTable, SaveAsTemplateDialog
│   │   │   ├── hooks/
│   │   │   │   ├── mutations/      # useCreateProgram, useSaveDraft, useUpdateProgram, useArchiveProgram, useDuplicateProgram
│   │   │   │   └── queries/        # usePrograms, useProgram, useTemplates, useExercisesMap
│   │   │   └── views/              # ProgramsListView, ProgramEditorView, NewProgramView
│   │   ├── subscriptions/hooks/    # usePlans
│   │   └── workout-logs/
│   │       ├── components/         # LoggingGrid, SeriesRow, LogDetailModal, LogHistoryTable
│   │       ├── hooks/
│   │       │   ├── mutations/      # useCreateLog, useSaveLog, useDeleteLog
│   │       │   └── queries/        # useWorkoutLog, useAthleteLogs, useLogBySession
│   │       └── views/              # SessionLoggingView, LogHistoryView
│   │
│   ├── components/                 # 🎨 Shared components
│   │   ├── ui/                     # shadcn/ui primitives (auto-generated)
│   │   │   ├── button.tsx, dialog.tsx, input.tsx, select.tsx...
│   │   │   ├── field.tsx           # Form field wrapper (React Hook Form integration)
│   │   │   └── server-combobox.tsx # Async combobox for API-backed lists
│   │   ├── data-table/             # DataTable compound component
│   │   │   ├── data-table.tsx      # Main compound component
│   │   │   ├── create-data-table-columns.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   ├── data-table-search.tsx
│   │   │   └── data-table-row-actions.tsx
│   │   ├── layout/                 # App shell components
│   │   │   ├── app-shell.tsx       # Main layout wrapper
│   │   │   ├── app-sidebar.tsx     # Navigation sidebar
│   │   │   ├── app-header.tsx      # Top header
│   │   │   └── breadcrumbs.tsx
│   │   └── programs/               # Program-specific shared components
│   │       └── program-grid/       # Excel-like program editor grid
│   │           ├── program-grid.tsx          # Main grid component
│   │           ├── grid-body.tsx, grid-header.tsx
│   │           ├── exercise-cell.tsx, prescription-cell.tsx
│   │           ├── exercise-row.tsx, session-header-row.tsx
│   │           ├── use-cell-editing.ts       # Cell edit state hook
│   │           ├── use-grid-navigation.ts    # Keyboard navigation hook
│   │           └── transform-program.ts      # Domain → grid display format
│   │
│   ├── contexts/                   # React contexts
│   │   ├── auth-context.tsx        # Current user session
│   │   └── organization-context.tsx # Current org + metadata
│   │
│   ├── hooks/                      # Shared hooks
│   │   ├── use-debounce.ts
│   │   ├── use-mobile.ts
│   │   ├── use-org-slug.ts         # Current org from route params
│   │   └── use-unsaved-changes.ts  # Warn before leaving with unsaved changes
│   │
│   ├── lib/                        # Core libraries
│   │   ├── api-client.ts           # 🔌 oRPC client + RPCLink + X-Organization-Slug
│   │   ├── auth-client.ts          # Better-Auth client
│   │   ├── auth-cache.ts           # 5-min session cache
│   │   ├── query-client.ts         # TanStack Query client config
│   │   ├── api-errors.ts           # Error classification helpers
│   │   ├── toast.ts                # Sonner toast helpers
│   │   └── utils.ts                # cn(), etc.
│   │
│   └── stores/                     # Zustand global state
│       ├── grid-store.ts           # Program editor grid state (pending changes)
│       └── log-store.ts            # Workout logging state
│
├── e2e/                            # Playwright E2E tests
│   └── mocks/                      # API mocks for E2E (no backend needed)
├── public/                         # Static assets
├── playwright.config.ts
├── vite.config.ts
└── components.json                 # shadcn/ui config
```

## packages/core — Domain Layer

```
packages/core/
└── src/
    ├── domain/
    │   ├── entities/               # Domain entities (factory + reconstitute)
    │   │   ├── athlete.ts          # Athlete entity with status lifecycle
    │   │   ├── athlete-invitation.ts
    │   │   ├── exercise.ts         # Exercise with movement pattern
    │   │   ├── plan.ts             # Subscription plan
    │   │   ├── subscription.ts     # Org subscription
    │   │   ├── program/            # Program aggregate (most complex)
    │   │   │   ├── program.ts      # Aggregate root: createProgram, reconstituteProgram
    │   │   │   ├── week.ts         # Week with sessions
    │   │   │   ├── session.ts      # Session with exercise groups
    │   │   │   ├── exercise-group.ts
    │   │   │   ├── group-item.ts   # Exercise in group with series
    │   │   │   ├── series.ts       # Single set (reps + intensity)
    │   │   │   ├── prescription-notation.ts  # Parse/format "3x8" notation
    │   │   │   └── ensure-group-adjacency.ts # Business rule
    │   │   └── workout-log/        # Workout log aggregate
    │   │       ├── workout-log.ts
    │   │       ├── logged-exercise.ts
    │   │       ├── logged-series.ts
    │   │       ├── build-logged-exercises.ts
    │   │       └── calculate-status.ts
    │   └── value-objects/
    │       ├── muscle-group.ts     # Validated muscle group VO
    │       └── movement-pattern.ts # push|pull|hinge|squat|carry|core
    ├── ports/                      # Repository interfaces
    │   ├── types.ts                # RepositoryError, PaginationOptions
    │   ├── athlete-repository.port.ts
    │   ├── athlete-invitation-repository.port.ts
    │   ├── exercise-repository.port.ts
    │   ├── muscle-group-repository.port.ts
    │   ├── program-repository.port.ts
    │   ├── plan-repository.port.ts
    │   ├── subscription-repository.port.ts
    │   └── workout-log-repository.port.ts
    ├── services/
    │   └── authorization.ts        # RBAC: hasPermission(role, permission)
    └── types/
        └── organization-context.ts # OrganizationContext type
```

## packages/backend — Application Layer

```
packages/backend/
└── src/
    ├── app-railway.ts              # 🎯 Hono app: CORS, /health, /api/auth/*, /rpc/*
    ├── index.ts                    # Exports: railwayApp, env, Router, RouterClient
    ├── procedures/                 # Thin API handlers
    │   ├── router.ts               # Main router: { athletes, exercises, programs, subscriptions, workoutLogs }
    │   ├── athletes/               # Athletes + invitation procedures
    │   ├── exercises/              # Exercise library procedures
    │   ├── programs/               # Program CRUD + editor operations
    │   ├── subscriptions/          # Plans + subscription procedures
    │   ├── workout-logs/           # Log create/save/list procedures
    │   └── health/health.ts        # GET /health
    ├── use-cases/                  # Business logic orchestration
    │   ├── athletes/               # 11 use cases (CRUD + invitations)
    │   ├── exercises/              # 7 use cases (CRUD + clone)
    │   ├── programs/               # 19 use cases (full editor operations)
    │   ├── subscriptions/          # 5 use cases (plans + billing limits)
    │   └── workout-logs/           # 7 use cases (log lifecycle)
    ├── infrastructure/
    │   ├── repositories/           # Port implementations (Drizzle ORM)
    │   │   ├── athlete.repository.ts
    │   │   ├── athlete-invitation.repository.ts
    │   │   ├── exercise.repository.ts
    │   │   ├── muscle-group.repository.ts
    │   │   ├── plan.repository.ts
    │   │   ├── program.repository.ts  # Most complex: ~1900 LOC
    │   │   ├── subscription.repository.ts
    │   │   └── workout-log.repository.ts
    │   └── services/
    │       └── organization-lookup.ts
    ├── lib/
    │   ├── context.ts              # BaseContext, SessionContext, AuthContext
    │   ├── orpc.ts                 # publicProcedure, sessionProcedure, authProcedure
    │   ├── env.ts                  # Validated environment variables
    │   ├── errors.ts               # Re-exports from @strenly/contracts
    │   ├── invitation-token.ts     # Invitation token generation
    │   └── logger.ts               # Structured logging
    └── __tests__/
        ├── factories/              # Mock repositories + test data factories
        └── helpers/test-context.ts # Test OrganizationContext helper
```

## packages/database — Database Layer

```
packages/database/
├── src/
│   ├── schema/
│   │   ├── index.ts                # Barrel (allowed — Drizzle Kit needs it)
│   │   ├── auth.ts                 # Better-Auth tables: users, sessions, accounts, organizations, members
│   │   ├── athletes.ts             # athletes table + enum (active/inactive, gender)
│   │   ├── athlete-invitations.ts  # Athlete invitation tokens
│   │   ├── exercises.ts            # exercises table + movement_pattern enum
│   │   ├── muscle-groups.ts        # muscle_groups lookup table
│   │   ├── exercise-muscles.ts     # M2M: exercise ↔ muscle_group
│   │   ├── exercise-groups.ts      # Exercise groups within sessions
│   │   ├── exercise-progressions.ts # Progression tracking
│   │   ├── programs.ts             # programs table + program_status enum
│   │   ├── program-weeks.ts        # program_weeks table
│   │   ├── program-sessions.ts     # program_sessions table
│   │   ├── program-exercises.ts    # program_exercises (exercise rows in sessions)
│   │   ├── prescriptions.ts        # prescriptions (JSONB series per exercise+week)
│   │   ├── workout-logs.ts         # workout_logs table
│   │   ├── logged-exercises.ts     # logged_exercises per workout log
│   │   ├── plans.ts                # subscription plans
│   │   └── subscriptions.ts        # organization subscriptions
│   ├── client.ts                   # createDb(url) factory
│   └── index.ts                    # Main exports
├── drizzle/migrations/             # Generated SQL migrations
├── scripts/
│   ├── seed.ts                     # Development seed data
│   └── migrate-to-series.ts        # Data migration script
└── drizzle.config.ts               # Drizzle Kit configuration
```

## packages/contracts — API Contracts

```
packages/contracts/
└── src/
    ├── common/
    │   ├── errors.ts               # authErrors, commonErrors (oRPC error definitions)
    │   ├── pagination.ts           # PaginationInput, PaginationOutput schemas
    │   ├── roles.ts                # memberRoleSchema: 'owner' | 'admin' | 'member'
    │   ├── id.ts                   # ID schemas with prefixes
    │   ├── dates.ts                # Date/timestamp schemas
    │   └── success.ts              # Generic success response
    ├── athletes/
    │   ├── athlete.ts              # AthleteInput, AthleteOutput schemas
    │   └── invitation.ts           # InvitationInput, InvitationOutput schemas
    ├── auth/
    │   ├── auth.ts                 # Auth-related schemas
    │   └── organization.ts         # Organization schemas
    ├── exercises/
    │   ├── exercise.ts             # ExerciseInput, ExerciseOutput schemas
    │   └── muscle-group.ts         # MuscleGroupOutput schema
    ├── programs/
    │   ├── program.ts              # ProgramInput, ProgramOutput, ProgramAggregateSchema
    │   ├── week.ts, session.ts     # Week/Session schemas
    │   ├── exercise-group.ts       # ExerciseGroup schema
    │   ├── exercise-row.ts         # ExerciseRow with prescriptions
    │   ├── prescription.ts         # Prescription series schema
    │   ├── save-draft.ts           # SaveDraftInput (bulk edit operations)
    │   └── template.ts             # Template-specific schemas
    ├── subscriptions/
    │   ├── plan.ts                 # PlanOutput schema
    │   └── subscription.ts         # SubscriptionOutput schema
    ├── workout-logs/
    │   ├── workout-log.ts          # WorkoutLog schemas
    │   ├── create-log.ts           # CreateLogInput
    │   ├── save-log.ts             # SaveLogInput
    │   ├── list-logs.ts            # ListLogsInput/Output
    │   └── session-log-search.ts   # Session-based log search
    └── health/health.ts            # HealthOutput schema
```

## packages/auth — Auth Configuration

```
packages/auth/
└── src/
    ├── auth.ts                     # createAuth(env, db) factory + TAuth type
    └── index.ts                    # Exports
```

## Critical Entry Points

| Entry Point | File | Description |
|------------|------|-------------|
| API Server | `apps/api/src/server.ts` | Node.js server bootstrap |
| Hono App | `packages/backend/src/app-railway.ts` | Request handling: CORS, auth, RPC |
| oRPC Router | `packages/backend/src/procedures/router.ts` | All procedure registrations |
| Frontend App | `apps/coach-web/src/main.tsx` | React + Router bootstrap |
| Auth Guard | `apps/coach-web/src/routes/_authenticated.tsx` | Route-level auth check |
| API Client | `apps/coach-web/src/lib/api-client.ts` | oRPC client + org header |
