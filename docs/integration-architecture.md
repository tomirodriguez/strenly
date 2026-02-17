# Strenly — Integration Architecture

**Generated:** 2026-02-17 | **Type:** Monorepo with shared packages

## Overview

Strenly's monorepo parts communicate through:
1. **Build-time type sharing** — packages import from each other via pnpm workspace
2. **HTTP at runtime** — frontend apps call the API over HTTP
3. **Shared package boundaries** — all business logic shared via packages, not duplication

## Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  apps/coach-web (React SPA @ :5173)                       │   │
│  │                                                            │   │
│  │  imports (build-time):                                     │   │
│  │  • @strenly/contracts — Zod types for API responses        │   │
│  │  • @strenly/backend — RouterClient type (for oRPC)         │   │
│  │                                                            │   │
│  │  calls (runtime HTTP):                                     │   │
│  │  • POST /rpc/* → oRPC procedures                          │   │
│  │  • GET/POST /api/auth/* → Better-Auth endpoints           │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                 │ HTTP (credentials: include, X-Organization-Slug header)
┌───────────────────────────────▼─────────────────────────────────┐
│                    RAILWAY (apps/api @ :8787)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  apps/api (Node.js/Hono entry point)                      │   │
│  │  imports: @strenly/backend (railwayApp)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  packages/backend (application layer)                     │   │
│  │  imports: @strenly/core, @strenly/database,               │   │
│  │           @strenly/auth, @strenly/contracts               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                               │                                    │
│              ┌────────────────┼────────────────┐                  │
│              ▼                ▼                ▼                  │
│  ┌──────────────┐  ┌────────────────┐  ┌───────────────┐        │
│  │packages/core  │  │packages/database│  │packages/auth  │        │
│  │(domain layer) │  │(Drizzle schemas)│  │(Better-Auth)  │        │
│  └──────────────┘  └────────┬───────┘  └───────────────┘        │
└───────────────────────────────┼─────────────────────────────────┘
                                 │ SQL (postgres-js)
┌───────────────────────────────▼─────────────────────────────────┐
│                    NEON POSTGRESQL                                 │
│  Database: strenly                                                │
│  Tables: auth tables, athletes, exercises, programs, etc.        │
└──────────────────────────────────────────────────────────────────┘
```

## Integration Point Details

### 1. Coach Web → API (Runtime HTTP)

**Protocol:** oRPC over HTTP
**Transport:** POST requests via `RPCLink`
**Auth:** Session cookie (HttpOnly, Secure in production)
**Org context:** `X-Organization-Slug` header injected by `api-client.ts`

```
URL pattern: POST {VITE_API_URL}/rpc/{domain}/{action}
Request body: { json: { ...input } }
Response body: { json: { ...output } }
```

**Client setup** (`apps/coach-web/src/lib/api-client.ts`):
- `RPCLink` with custom `fetch` that injects `X-Organization-Slug` header
- Organization slug sourced from: module-level state → URL pathname fallback
- `createORPCClient` → `RouterClient<Router>` — full TypeScript inference
- `createORPCReactQueryUtils` → `orpc` helper for TanStack Query integration

### 2. Coach Web → Better-Auth (Runtime HTTP)

**Protocol:** REST (Better-Auth native)
**Client:** `authClient` from `apps/coach-web/src/lib/auth-client.ts`

```
GET /api/auth/get-session      → session data
GET /api/auth/organization/list → user's organizations
POST /api/auth/sign-in/email   → login
POST /api/auth/sign-up/email   → signup
POST /api/auth/sign-out        → logout
```

Session cached in `auth-cache.ts` (5-minute TTL) to avoid repeated API calls during navigation.

### 3. Build-time Type Sharing

The monorepo shares types through workspace package imports:

```
@strenly/backend (RouterClient type)
  └── imported by apps/coach-web for oRPC client type inference
      • RouterClient<Router> from packages/backend/src/index.ts
      • Provides full end-to-end TypeScript types for all procedures

@strenly/contracts (Zod schemas)
  └── imported by both packages/backend AND apps/coach-web
      • Single source of truth for API input/output shapes
      • No schema duplication

@strenly/core (domain types)
  └── imported by packages/backend
      • Port interfaces define repository contracts
      • Domain entities define business objects
```

### 4. Database Connection

**Client:** `postgres-js` (connection pooling built-in)
**ORM:** Drizzle (type-safe, no magic)
**Connection:** Created once in `packages/backend/src/app-railway.ts`:

```ts
const db = createDb(env.DATABASE_URL)
```

Passed via `BaseContext` to all procedures through oRPC middleware.

### 5. Auth-Database Integration

Better-Auth uses a Drizzle adapter pointing to the same database:

```ts
drizzleAdapter(db, {
  provider: 'pg',
  schema,           // packages/database/src/schema/index.ts
  usePlural: true,  // users, sessions, etc.
})
```

Auth tables (`users`, `sessions`, `accounts`, `organizations`, `members`) are defined in `packages/database/src/schema/auth.ts` and managed by Better-Auth's migration system.

## CORS Configuration

```
Allowed origins (development):
  - http://localhost:5173 (coach-web)
  - http://localhost:5174 (athlete-pwa)

Allowed origins (production):
  - https://app.strenly.com.ar (coach-web)
  - https://athlete.strenly.com.ar (athlete-pwa)

Allowed headers: Content-Type, Authorization, X-Organization-Slug
Credentials: true (cookie-based sessions)
```

## Request Flow Example: Loading a Program

```
1. User navigates to /{orgSlug}/programs/{programId}
2. TanStack Router → beforeLoad in _authenticated/$orgSlug.tsx sets org context
3. useProgram({ programId }) hook triggers TanStack Query
4. orpc.programs.get.query({ programId }) → RPCLink
5. POST /rpc/programs/get
   Headers: X-Organization-Slug: {orgSlug}, Cookie: strenly.session=...
   Body: { json: { programId: "prg-..." } }
6. Hono → /rpc/* middleware:
   a. Auth validation via Better-Auth (session cookie)
   b. Org lookup via getFullOrganization (X-Organization-Slug)
   c. Membership validation
   d. BaseContext → AuthContext
7. getProgram procedure → getProgramUseCase → programRepository.loadProgramAggregate
8. Drizzle query → Neon PostgreSQL
9. Domain entity reconstituted → mapped to contract schema
10. Response: { json: { id, name, weeks: [...], ... } }
11. React component re-renders with program data
```

## Deployment

| Part | Platform | Trigger |
|------|----------|---------|
| `apps/api` | Railway | Push to `main` (railway.json) |
| `apps/coach-web` | Vercel | Push to `main` (vercel.json) |
| Database | Neon | Managed (migrations via `pnpm db:migrate`) |

**Railway config** (`apps/api/railway.json`): builds with tsup, starts `node dist/server.js`.
