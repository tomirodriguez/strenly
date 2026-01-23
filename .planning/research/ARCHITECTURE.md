# Architecture Patterns

**Domain:** Multi-tenant training planning SaaS (Coach/Athlete platform)
**Researched:** 2026-01-23
**Confidence:** HIGH (verified with official documentation and established patterns)

## Recommended Architecture

```
                                    [Cloudflare Edge]
                                           |
                    +----------------------+----------------------+
                    |                      |                      |
              [Coach App]            [Athlete App]          [Marketing]
              (React/Next)           (React/Next)           (Next.js)
                    |                      |
                    +----------+-----------+
                               |
                        [packages/contracts]
                          (Shared Types)
                               |
                    +----------+-----------+
                    |                      |
              [apps/backend]         [Durable Objects]
              (Hono + oRPC)          (Real-time sync)
              (Cloudflare Workers)   (Optional future)
                    |
              [packages/core]
              (Business Logic)
                    |
              [packages/backend]
              (DB, Auth)
                    |
              [Neon PostgreSQL]
              (with RLS safety net)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `apps/coach-app` | Coach UI: program creation, athlete management, analytics | `packages/contracts`, backend API |
| `apps/athlete-app` | Athlete UI: view prescriptions, log workouts, progress | `packages/contracts`, backend API |
| `apps/marketing` | Public site, landing pages, pricing | None (static/SSG) |
| `apps/backend` | API layer: Hono routes, oRPC handlers, auth endpoints | `packages/core`, `packages/backend` |
| `packages/contracts` | Shared TypeScript types, Zod schemas, API contracts | All apps import this |
| `packages/core` | Pure business logic (validation, calculations, no I/O) | `packages/contracts` |
| `packages/backend` | DB schema (Drizzle), auth config (Better-Auth), queries | `packages/contracts`, Neon |

### Data Flow

```
Coach Action (Create Program)
    |
    v
[Coach App] ---(oRPC call)---> [Backend API]
    |                               |
    |                               v
    |                         [packages/core]
    |                         (validate, transform)
    |                               |
    |                               v
    |                         [packages/backend]
    |                         (Drizzle insert with org_id)
    |                               |
    |                               v
    |                         [Neon PostgreSQL]
    |                         (RLS verifies org_id)
    |
    v
[Athlete App] <---(poll/push)--- [Backend API]
    |
    v
Athlete sees new program
```

## Multi-Tenancy Architecture

### Recommended Pattern: Application-Level + RLS Safety Net

Based on research from simplyblock, Neon, and AWS best practices:

**Primary isolation:** Application-level filtering (WHERE org_id = ?)
**Secondary defense:** PostgreSQL RLS policies as safety net

```typescript
// packages/backend/src/db/schema/organizations.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { pgPolicy, pgRole } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// RLS helper for tenant tables
export const orgRlsPolicy = (table: AnyPgTable) => pgPolicy('org_isolation', {
  as: 'restrictive',
  for: 'all',
  using: sql`org_id = current_setting('app.current_org_id')::uuid`,
  withCheck: sql`org_id = current_setting('app.current_org_id')::uuid`,
});
```

**Why this hybrid approach:**
1. **Performance:** Application filtering uses standard indexes, no RLS overhead
2. **Defense in depth:** RLS catches bugs in application code
3. **Simplicity:** Business logic remains straightforward
4. **Testability:** RLS is notoriously hard to test; application logic is easy

### Setting Tenant Context

```typescript
// packages/backend/src/middleware/tenant.ts
export const setTenantContext = async (db: DrizzleDB, orgId: string) => {
  await db.execute(sql`SET LOCAL app.current_org_id = ${orgId}`);
};

// Usage in API route
app.use(async (c, next) => {
  const session = await getSession(c);
  const orgId = session?.activeOrganizationId;

  if (orgId) {
    await setTenantContext(db, orgId);
  }

  return next();
});
```

### User-Organization Relationship

Users can belong to multiple organizations with different roles. This follows the "Linear model" recommended by Logto.

```typescript
// packages/backend/src/db/schema/memberships.ts
export const organizationMemberships = pgTable('organization_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  role: text('role', { enum: ['owner', 'admin', 'coach', 'athlete'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unique: unique().on(t.userId, t.organizationId),
}));
```

Better-Auth's organization plugin provides this out of the box:
- Built-in roles: owner, admin, member (extensible)
- Invitation workflows
- Active organization switching
- Per-organization permissions

## Coach/Athlete Data Separation

### Role-Based Access Within Organization

```typescript
// packages/backend/src/db/schema/athletes.ts
export const athletes = pgTable('athletes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),

  // Optional link to user account (athlete may or may not have login)
  userId: uuid('user_id').references(() => users.id),

  // Profile data (always present)
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),

  // Assigned coach(es)
  primaryCoachId: uuid('primary_coach_id').references(() => users.id),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Key insight:** An Athlete is a profile, not a user. Athletes may:
1. Have a linked user account (can log in, view their own data)
2. Not have an account (coach manages everything)

### Data Visibility Rules

```typescript
// packages/core/src/permissions/visibility.ts
export const canViewAthlete = (
  userRole: Role,
  userId: string,
  athlete: Athlete
): boolean => {
  // Coaches in org can see all athletes
  if (userRole === 'coach' || userRole === 'admin' || userRole === 'owner') {
    return true;
  }

  // Athletes can only see themselves
  if (userRole === 'athlete') {
    return athlete.userId === userId;
  }

  return false;
};

export const canEditPrescription = (
  userRole: Role,
  userId: string,
  prescription: Prescription
): boolean => {
  // Only coaches can edit prescriptions
  return ['coach', 'admin', 'owner'].includes(userRole);
};

export const canEditLog = (
  userRole: Role,
  userId: string,
  log: WorkoutLog,
  athlete: Athlete
): boolean => {
  // Athletes can edit their own logs
  if (athlete.userId === userId) return true;

  // Coaches can edit logs for their athletes
  if (['coach', 'admin', 'owner'].includes(userRole)) return true;

  return false;
};
```

## Plan vs Log Data Model

### Immutable Prescriptions, Mutable Logs

Based on patterns from BridgeAthletic, TeamBuildr, and event sourcing principles:

```
Program (template)
    |
    +-- Block (optional grouping, e.g., "Hypertrophy Phase")
         |
         +-- Week
              |
              +-- Session (scheduled workout)
                   |
                   +-- PrescribedExercise (immutable prescription)
                        |
                        Athlete performs workout
                        |
                        +-- WorkoutLog (when performed)
                             |
                             +-- LoggedSet (mutable: actual reps, weight, RPE)
```

### Schema Design

```typescript
// packages/backend/src/db/schema/prescriptions.ts

// Prescriptions are IMMUTABLE after publication
export const prescribedExercises = pgTable('prescribed_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id),
  exerciseId: uuid('exercise_id').notNull().references(() => exercises.id),

  // Prescription details (immutable)
  orderIndex: integer('order_index').notNull(),
  sets: integer('sets').notNull(),
  repsMin: integer('reps_min'),
  repsMax: integer('reps_max'),
  rpeTarget: decimal('rpe_target', { precision: 3, scale: 1 }),
  restSeconds: integer('rest_seconds'),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  // No updatedAt - prescriptions don't update, they're versioned
});

// packages/backend/src/db/schema/logs.ts

// Logs are MUTABLE (athlete can correct entries)
export const workoutLogs = pgTable('workout_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  athleteId: uuid('athlete_id').notNull().references(() => athletes.id),
  sessionId: uuid('session_id').notNull().references(() => sessions.id),

  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  overallRpe: decimal('overall_rpe', { precision: 3, scale: 1 }),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const loggedSets = pgTable('logged_sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  workoutLogId: uuid('workout_log_id').notNull().references(() => workoutLogs.id),
  prescribedExerciseId: uuid('prescribed_exercise_id').notNull()
    .references(() => prescribedExercises.id),

  // Actual performance (mutable)
  setNumber: integer('set_number').notNull(),
  repsCompleted: integer('reps_completed'),
  weight: decimal('weight', { precision: 7, scale: 2 }),
  weightUnit: text('weight_unit', { enum: ['kg', 'lb'] }).default('kg'),
  rpe: decimal('rpe', { precision: 3, scale: 1 }),
  skipped: boolean('skipped').default(false),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Why Separate Prescriptions from Logs

1. **Historical accuracy:** What was prescribed shouldn't change retroactively
2. **Comparison analytics:** Compare prescribed vs actual over time
3. **Versioning:** New prescriptions create new records, old ones remain
4. **Compliance:** For regulated sports, audit trail is required

### Prescription Versioning Strategy

When a coach updates a program:

```typescript
// packages/core/src/programs/versioning.ts
export const updatePrescription = async (
  originalId: string,
  updates: PrescriptionUpdate,
  options: { affectsFuture: boolean }
) => {
  if (options.affectsFuture) {
    // Create new prescription, link to future sessions only
    // Past sessions retain original prescription
  } else {
    // Only new sessions use updated prescription
    // Create entirely new prescription record
  }
};
```

## Monorepo Structure for Shared Contracts

Based on patterns from TypeScript monorepo best practices and oRPC architecture:

```
/
+-- apps/
|   +-- coach-app/          # React/Next.js coach dashboard
|   |   +-- package.json    # depends on @strenly/contracts
|   +-- athlete-app/        # React/Next.js athlete app
|   |   +-- package.json    # depends on @strenly/contracts
|   +-- marketing/          # Marketing site
|   +-- backend/            # Hono + oRPC API
|       +-- package.json    # depends on @strenly/core, @strenly/backend
|
+-- packages/
|   +-- contracts/          # SHARED TYPES (the contract)
|   |   +-- src/
|   |   |   +-- schemas/    # Zod schemas (single source of truth)
|   |   |   +-- types/      # TypeScript types (inferred from schemas)
|   |   |   +-- api/        # oRPC router type exports
|   |   +-- package.json
|   |
|   +-- core/               # Pure business logic (no I/O)
|   |   +-- src/
|   |   |   +-- permissions/
|   |   |   +-- validation/
|   |   |   +-- calculations/
|   |   +-- package.json    # depends on @strenly/contracts
|   |
|   +-- backend/            # DB + Auth (I/O layer)
|       +-- src/
|       |   +-- db/
|       |   |   +-- schema/ # Drizzle schemas
|       |   |   +-- queries/
|       |   +-- auth/       # Better-Auth config
|       +-- package.json    # depends on @strenly/contracts
|
+-- pnpm-workspace.yaml
+-- tsconfig.base.json      # Shared TS config
```

### The Contract Pattern

```typescript
// packages/contracts/src/schemas/athlete.ts
import { z } from 'zod';

export const athleteSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
});

export const createAthleteSchema = athleteSchema.omit({ id: true, orgId: true });
export const updateAthleteSchema = createAthleteSchema.partial();

// Types are INFERRED, not duplicated
export type Athlete = z.infer<typeof athleteSchema>;
export type CreateAthlete = z.infer<typeof createAthleteSchema>;
export type UpdateAthlete = z.infer<typeof updateAthleteSchema>;

// packages/contracts/src/api/athletes.ts
import { createRouterContract } from '@orpc/contract';
import { athleteSchema, createAthleteSchema } from '../schemas/athlete';

export const athletesContract = createRouterContract({
  list: {
    input: z.object({ cursor: z.string().optional() }),
    output: z.object({
      athletes: z.array(athleteSchema),
      nextCursor: z.string().optional(),
    }),
  },
  create: {
    input: createAthleteSchema,
    output: athleteSchema,
  },
});
```

### Raw TypeScript Sources (No Build Step)

Following the lesson learned: share raw TypeScript, don't pre-compile.

```json
// packages/contracts/package.json
{
  "name": "@strenly/contracts",
  "exports": {
    ".": "./src/index.ts",
    "./schemas/*": "./src/schemas/*.ts",
    "./api/*": "./src/api/*.ts"
  }
}
```

Apps transpile everything together, ensuring:
- No module format mismatches
- Source maps work correctly
- Type inference is immediate

## Real-Time/Optimistic Updates for Coach-Athlete Sync

### Recommended: Start Simple, Add Real-Time Later

For MVP, use polling + optimistic updates. Add real-time when needed.

```typescript
// Optimistic update pattern (TanStack Query)
// apps/coach-app/src/hooks/useUpdatePrescription.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePrescription) => api.prescriptions.update(data),

    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['prescriptions'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['prescriptions']);

      // Optimistically update
      queryClient.setQueryData(['prescriptions'], (old) => ({
        ...old,
        data: old.data.map((p) =>
          p.id === newData.id ? { ...p, ...newData } : p
        ),
      }));

      return { previous };
    },

    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['prescriptions'], context?.previous);
    },

    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};
```

### Future: Durable Objects for Real-Time

When real-time becomes necessary (e.g., live coaching during workout):

```typescript
// Durable Object per workout session
// apps/backend/src/durable-objects/live-workout.ts
export class LiveWorkoutSession extends DurableObject {
  private connections: Set<WebSocket> = new Set();
  private state: WorkoutState;

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === '/websocket') {
      const pair = new WebSocketPair();
      const [client, server] = pair;

      this.ctx.acceptWebSocket(server);
      this.connections.add(server);

      return new Response(null, { status: 101, webSocket: client });
    }

    // Handle REST updates from athlete app
    if (request.method === 'POST') {
      const update = await request.json();
      await this.handleSetComplete(update);
      return new Response('OK');
    }
  }

  async handleSetComplete(update: SetComplete) {
    // Persist to SQL storage
    await this.ctx.storage.sql.exec(
      `INSERT INTO set_logs (set_number, reps, weight) VALUES (?, ?, ?)`,
      [update.setNumber, update.reps, update.weight]
    );

    // Broadcast to all connected clients (coach watching live)
    for (const ws of this.connections) {
      ws.send(JSON.stringify({ type: 'SET_COMPLETE', data: update }));
    }
  }
}
```

**When to add real-time:**
- Live coaching during workouts
- Collaborative program editing
- Instant notifications for new assignments

**Why Durable Objects:**
- Single coordination point per session
- WebSocket hibernation (cost-effective)
- Built-in SQLite storage
- No Redis/separate infrastructure

## Anti-Patterns to Avoid

### Anti-Pattern 1: RLS as Primary Authorization

**What:** Expressing all authorization logic in RLS policies
**Why bad:**
- Hard to test
- Infinite recursion with complex relationships
- Difficult to debug
- Performance overhead

**Instead:** Use application-level authorization with RLS as safety net.

### Anti-Pattern 2: Single User Table for Athletes

**What:** Making every athlete a user in the auth system
**Why bad:**
- Athletes without logins still need accounts
- Invitation flows become mandatory
- Bloats user table with inactive accounts

**Instead:** Separate Athlete profile from User account. Link when athlete creates login.

### Anti-Pattern 3: Mutable Prescriptions

**What:** Updating prescription records in place
**Why bad:**
- Loses history of what was actually prescribed
- Can't compare prescribed vs actual accurately
- Retroactively changes past workout context

**Instead:** Prescriptions are immutable. Updates create new versions.

### Anti-Pattern 4: Compiling Packages to JS

**What:** Building packages to JavaScript before consuming in apps
**Why bad:**
- Module format mismatches (ESM/CJS)
- Source map complexity
- Type definition drift
- Slower development cycle

**Instead:** Share raw TypeScript sources. Apps compile everything together.

### Anti-Pattern 5: Putting Business Logic in API Layer

**What:** Writing validation/permissions directly in Hono handlers
**Why bad:**
- Can't reuse logic across apps
- Hard to unit test
- Couples business rules to HTTP

**Instead:** Business logic in `packages/core`. API layer just orchestrates.

## Scalability Considerations

| Concern | MVP (100 users) | Growth (10K users) | Scale (1M users) |
|---------|-----------------|--------------------|--------------------|
| **Multi-tenancy** | App-level filtering | Add RLS policies | Shard by org |
| **Real-time** | Polling (5s) | WebSockets per session | Durable Objects |
| **Workouts logs** | Direct writes | Batch inserts | Event sourcing |
| **Analytics** | Live queries | Materialized views | Separate analytics DB |
| **File storage** | Cloudflare R2 | R2 + CDN | R2 + CDN + compression |

## Build Order (Dependencies)

Based on component dependencies, build in this order:

### Phase 1: Foundation
1. **packages/contracts** - Shared types and schemas
2. **packages/backend/db** - Database schema (Drizzle)
3. **packages/backend/auth** - Better-Auth configuration

### Phase 2: Core Logic
4. **packages/core** - Business logic (validation, permissions)
5. **apps/backend** - API layer (Hono + oRPC)

### Phase 3: Client Applications
6. **apps/coach-app** - Coach dashboard (can start parallel with athlete-app)
7. **apps/athlete-app** - Athlete experience

### Phase 4: Enhancements
8. **apps/marketing** - Public site (independent)
9. **Real-time sync** - Durable Objects (when needed)

**Critical path:** contracts -> backend schema -> core -> API -> apps

## Sources

### Multi-Tenancy and RLS
- simplyblock - Row-Level Security for Multi-Tenant Applications (HIGH confidence)
- Neon - Shipping multi-tenant SaaS using Postgres RLS (HIGH confidence)
- AWS - RLS recommendations (HIGH confidence)
- Drizzle ORM - Row-Level Security (HIGH confidence)
- Neon - Is Postgres RLS for Everything? (HIGH confidence)

### Better-Auth Organization
- Better-Auth Organization Plugin (HIGH confidence)
- ZenStack - Better-Auth Multi-Tenant (MEDIUM confidence)

### Monorepo and Contracts
- Outstand - TypeScript Monorepo Setup (HIGH confidence)
- Dev.to - Ultimate Guide to TypeScript Monorepos (MEDIUM confidence)
- oRPC Hono Adapter (HIGH confidence)
- InfoQ - oRPC Version 1.0 (HIGH confidence)

### Real-Time and Durable Objects
- Cloudflare - Durable Objects Overview (HIGH confidence)
- Cloudflare - Rules of Durable Objects (HIGH confidence)
- Cloudflare - WebSocket Hibernation (HIGH confidence)

### Training Domain
- BridgeAthletic - Program delivery patterns (MEDIUM confidence)
- TeamBuildr - Workout tracking patterns (MEDIUM confidence)
- Vitruve AMS Guide - Athlete management patterns (MEDIUM confidence)
