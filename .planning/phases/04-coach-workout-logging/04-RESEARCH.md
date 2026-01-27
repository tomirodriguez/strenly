# Phase 4: Coach Workout Logging - Research

**Researched:** 2026-01-27
**Domain:** Workout logging, Plan vs Log separation, Form-heavy data entry
**Confidence:** HIGH

## Summary

Phase 4 introduces workout logging where coaches record what athletes actually performed versus what was prescribed. The core domain problem is maintaining clear separation between the Program aggregate (the plan) and a new WorkoutLog aggregate (the actual). This follows the established pattern of aggregate-based persistence with client-side editing and single save endpoint.

The research confirms the existing codebase patterns are well-suited for this feature. The Program aggregate is already correctly structured with weeks, sessions, groups, items, and series. The WorkoutLog aggregate mirrors this structure but captures actual performance data (reps performed, weight used, RPE) instead of prescriptions. The key insight is that logs reference the program structure but store their own data independently.

**Primary recommendation:** Create a new WorkoutLog aggregate that references Program sessions but maintains its own hierarchy (LoggedExercise with LoggedSeries). Use the same client-side editing + single save endpoint pattern established in Phase 3.4. Pre-fill from prescriptions but store as independent data.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.0+ | Client-side log editing state | Already used for grid store, proven pattern |
| TanStack Query | 5.0+ | Data fetching and mutations | Already the standard, cache invalidation |
| React Hook Form | 7.0+ | Form validation | Used throughout for forms |
| Zod | 3.0+ | Schema validation | Contracts pattern already established |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| neverthrow | 8.0+ | Use case error handling | All use cases return ResultAsync |
| Drizzle ORM | 0.39+ | Database operations | Repository implementations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand store | React Hook Form only | React Hook Form alone works for single forms but Zustand provides multi-form state coordination needed for session logging |
| DELETE+INSERT | Upsert per field | DELETE+INSERT is simpler for aggregate replacement, matches program builder pattern |

**Installation:**
No new packages required - all libraries already in use.

## Architecture Patterns

### Recommended Project Structure

```
packages/core/src/domain/entities/
  workout-log/
    types.ts              # LogStatus, LoggedSeries, LoggedExercise, WorkoutLog
    logged-series.ts      # Value object for single logged set
    logged-exercise.ts    # Entity for exercise log with series array
    workout-log.ts        # Aggregate root with factory and reconstitute
    workout-log.test.ts   # 90%+ coverage tests

packages/core/src/ports/
  workout-log-repository.port.ts

packages/backend/src/infrastructure/repositories/
  workout-log.repository.ts

packages/backend/src/use-cases/workout-logs/
  create-log.ts           # Initialize log from session prescription
  save-log.ts             # Full aggregate replace
  get-log.ts              # Load for editing
  list-athlete-logs.ts    # History view
  delete-log.ts           # Remove log entirely

packages/contracts/src/workout-logs/
  workout-log.ts          # Zod schemas for aggregate
  create-log.ts           # Initialize input
  save-log.ts             # Save input
  list-logs.ts            # List with filters

packages/backend/src/procedures/workout-logs/
  router.ts               # Sub-router for workout log operations

apps/coach-web/src/
  features/workout-logs/
    hooks/queries/
      use-athlete-logs.ts
      use-workout-log.ts
    hooks/mutations/
      use-create-log.ts
      use-save-log.ts
      use-delete-log.ts
    views/
      logging-dashboard-view.tsx
      session-logging-view.tsx
      log-history-view.tsx
  stores/
    log-store.ts            # Client-side log editing state
  routes/_authenticated/$orgSlug/
    logging/
      index.tsx             # Dashboard with pending workouts
      $logId.tsx            # Edit existing log
    athletes/$athleteId/
      log/
        $sessionId.tsx      # Log session for athlete
      logs/
        index.tsx           # History view
```

### Pattern 1: Plan vs Log Separation

**What:** Program prescriptions (plan) and workout logs (actual) are completely separate aggregates. Logs reference program structure by ID but store independent data.

**When to use:** Always - this is the core architectural decision for the phase.

**Example:**
```typescript
// Program aggregate (existing) - THE PLAN
type Series = {
  orderIndex: number
  reps: number | null        // Prescribed reps
  intensityValue: number | null  // Prescribed weight/intensity
  intensityType: IntensityType | null
  // ... other prescription fields
}

// WorkoutLog aggregate (new) - THE ACTUAL
type LoggedSeries = {
  orderIndex: number
  repsPerformed: number | null   // What athlete actually did
  weightUsed: number | null      // Actual weight in kg
  rpe: number | null             // Actual RPE (1-10)
  skipped: boolean               // Explicitly skipped this set
  // Reference to what was prescribed (for deviation display)
  prescribedReps: number | null
  prescribedWeight: number | null
}
```

**Key insight:** The log stores BOTH actual values AND a snapshot of prescribed values at log time. This enables deviation highlighting without joining to the program, and preserves history if the program is later modified.

### Pattern 2: Session-Scoped Logging

**What:** Each WorkoutLog represents one session's worth of exercises. The log is associated with a specific athlete, program session, and date.

**When to use:** All logging operations.

**Example:**
```typescript
type WorkoutLog = {
  id: string
  organizationId: string
  athleteId: string
  programId: string
  sessionId: string           // References Program session
  weekId: string              // Which week (for progression context)
  logDate: Date               // When the workout was logged
  status: 'completed' | 'partial' | 'skipped'
  sessionRpe: number | null   // Overall session difficulty
  sessionNotes: string | null
  exercises: LoggedExercise[] // The actual exercise data
  createdAt: Date
  updatedAt: Date
}
```

### Pattern 3: Pre-fill from Prescription

**What:** When creating a new log, initialize all fields from the program's prescribed values. Coach only modifies deviations.

**When to use:** Log initialization.

**Example:**
```typescript
// Use case: createLog
function createLog(input: {
  athleteId: string
  programId: string
  sessionId: string
  weekId: string
}): ResultAsync<WorkoutLog, CreateLogError> {
  // 1. Load program aggregate to get prescription data
  // 2. Extract session's exercises and series
  // 3. Map prescription to LoggedSeries with:
  //    - prescribedReps from series.reps
  //    - prescribedWeight from series.intensityValue (when type=absolute)
  //    - repsPerformed = prescribedReps (pre-filled)
  //    - weightUsed = prescribedWeight (pre-filled)
  //    - rpe = null (no pre-fill, athlete-specific)
  //    - skipped = false
  // 4. Create WorkoutLog with status='partial' (not yet saved)
}
```

### Pattern 4: Client-Side Editing with Single Save

**What:** All log edits happen in client state (Zustand store). Changes are batched and persisted via single `saveLog` endpoint. Same pattern as program builder.

**When to use:** The session logging view.

**Example:**
```typescript
// stores/log-store.ts
interface LogStore {
  log: WorkoutLogAggregate | null
  isDirty: boolean

  // Initialize from server data
  initialize: (log: WorkoutLogAggregate) => void

  // Update a logged series
  updateSeries: (exerciseId: string, seriesIndex: number, data: Partial<LoggedSeries>) => void

  // Skip entire exercise
  skipExercise: (exerciseId: string) => void

  // Update session-level data
  updateSession: (data: { sessionRpe?: number; sessionNotes?: string }) => void

  // Get data for save
  getLogForSave: () => SaveLogInput | null

  // Mark as saved
  markSaved: () => void
}
```

### Pattern 5: Deviation Display

**What:** Inputs show colored highlights when actual differs from prescribed. Hover reveals original prescribed value.

**When to use:** Rendering LoggedSeries inputs.

**Example:**
```typescript
// Component pattern
function SetInput({ series }: { series: LoggedSeries }) {
  const hasDeviation = series.repsPerformed !== series.prescribedReps

  return (
    <div className="relative">
      <Input
        value={series.repsPerformed}
        className={cn(hasDeviation && 'border-amber-500')}
      />
      {hasDeviation && (
        <Tooltip content={`Planificado: ${series.prescribedReps}`}>
          <InfoIcon className="absolute right-2 top-2" />
        </Tooltip>
      )}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Storing logs inside Program aggregate:** Logs must be separate. Programs are templates; logs are instances.
- **Real-time save per field:** Defeats the purpose of client-side editing. Batch everything to single save.
- **Joining to program at render time for prescribed values:** Snapshot prescribed values in log for history preservation.
- **Multiple log entries per session:** Decision was one log per session, edits overwrite.
- **Audit trail of log changes:** Explicitly deferred - edits overwrite without history.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom useState per field | Zustand store (like grid-store) | Coordinated multi-form state, dirty tracking, save batching |
| Numeric input validation | Manual onChange handlers | Zod schemas + React Hook Form | Consistent validation, type safety |
| Deviation detection | Manual comparison logic | Computed from stored prescribed values | Already captured at log creation |
| List pagination | Custom offset/limit | Existing DataTable pattern | Already implemented in athletes list |
| Cache invalidation | Manual queryClient calls | oRPC .key() pattern | Type-safe, consistent with codebase |

**Key insight:** This phase introduces new domain concepts but reuses all established frontend and backend patterns. No new infrastructure needed.

## Common Pitfalls

### Pitfall 1: Storing Logs Without Prescribed Snapshot

**What goes wrong:** Log only stores actual values. Later, program is modified. Now deviation display is wrong or impossible.

**Why it happens:** Seems like duplication to store prescribed values in log when program has them.

**How to avoid:** Always capture `prescribedReps`, `prescribedWeight` at log creation time. These are immutable once captured.

**Warning signs:** Log schema doesn't have `prescribed*` fields.

### Pitfall 2: Creating Log on Page Load

**What goes wrong:** Coach navigates to log page, empty log is created in database immediately. Coach navigates away. Orphan empty log in database.

**Why it happens:** Natural to "initialize" by creating database record.

**How to avoid:** Log is created client-side only until first save. Use `createLog` use case only when user explicitly starts logging (or on first save).

**Warning signs:** `createLog` called in route loader or useEffect.

### Pitfall 3: Complex State Sync Between Forms

**What goes wrong:** Session-level RPE, exercise notes, and series inputs all have separate state. Keeping them in sync becomes a nightmare.

**Why it happens:** Using React Hook Form for the entire log with nested arrays.

**How to avoid:** Use Zustand store as single source of truth. Individual inputs read from and write to store. No form-level state coordination needed.

**Warning signs:** Multiple `useForm` hooks in session logging view.

### Pitfall 4: N+1 Queries for Log History

**What goes wrong:** History view loads athlete, then each log, then each exercise name. Slow and many queries.

**Why it happens:** Fetching logs without eager loading.

**How to avoid:** Repository method joins exercises at query time. Return denormalized view data.

**Warning signs:** Multiple round trips in network tab for history list.

### Pitfall 5: Forgetting Organization Scope

**What goes wrong:** Coach A can see Coach B's athlete logs because query doesn't filter by organizationId.

**Why it happens:** Logs feel like they "belong to" athletes, forget multi-tenancy.

**How to avoid:** All log repository methods receive OrganizationContext. All queries filter by organizationId.

**Warning signs:** Repository methods without OrganizationContext parameter.

## Code Examples

Verified patterns from official sources and codebase:

### WorkoutLog Domain Entity

```typescript
// packages/core/src/domain/entities/workout-log/types.ts
export const LOG_STATUSES = ['completed', 'partial', 'skipped'] as const
export type LogStatus = (typeof LOG_STATUSES)[number]

export type LoggedSeries = {
  readonly orderIndex: number
  readonly repsPerformed: number | null
  readonly weightUsed: number | null     // Always in kg
  readonly rpe: number | null            // 1-10 scale
  readonly skipped: boolean
  // Snapshot of prescription for deviation display
  readonly prescribedReps: number | null
  readonly prescribedWeight: number | null
}

export type LoggedExercise = {
  readonly id: string
  readonly exerciseId: string            // Reference to exercise catalog
  readonly groupItemId: string           // Reference to program group item
  readonly orderIndex: number
  readonly notes: string | null
  readonly skipped: boolean
  readonly series: ReadonlyArray<LoggedSeries>
}

export type WorkoutLog = {
  readonly id: string
  readonly organizationId: string
  readonly athleteId: string
  readonly programId: string
  readonly sessionId: string
  readonly weekId: string
  readonly logDate: Date
  readonly status: LogStatus
  readonly sessionRpe: number | null
  readonly sessionNotes: string | null
  readonly exercises: ReadonlyArray<LoggedExercise>
  readonly createdAt: Date
  readonly updatedAt: Date
}
```

### Database Schema

```typescript
// packages/database/src/schema/workout-logs.ts
import { pgEnum, pgTable, text, timestamp, integer, boolean, jsonb, index, unique } from 'drizzle-orm/pg-core'

export const logStatusEnum = pgEnum('log_status', ['completed', 'partial', 'skipped'])

export const workoutLogs = pgTable(
  'workout_logs',
  {
    id: text('id').primaryKey(),                    // prefixed 'log-'
    organizationId: text('organization_id').notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    athleteId: text('athlete_id').notNull()
      .references(() => athletes.id, { onDelete: 'cascade' }),
    programId: text('program_id').notNull()
      .references(() => programs.id, { onDelete: 'cascade' }),
    sessionId: text('session_id').notNull(),        // Reference to program session
    weekId: text('week_id').notNull(),              // Reference to program week
    logDate: timestamp('log_date').notNull(),
    status: logStatusEnum('status').notNull().default('partial'),
    sessionRpe: integer('session_rpe'),             // 1-10
    sessionNotes: text('session_notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index('workout_logs_organization_id_idx').on(table.organizationId),
    index('workout_logs_athlete_id_idx').on(table.athleteId),
    index('workout_logs_program_id_idx').on(table.programId),
    // Unique constraint: one log per athlete per session per week
    unique('workout_logs_athlete_session_week_unique').on(table.athleteId, table.sessionId, table.weekId),
  ],
)

export interface LoggedSeriesData {
  orderIndex: number
  repsPerformed: number | null
  weightUsed: number | null
  rpe: number | null
  skipped: boolean
  prescribedReps: number | null
  prescribedWeight: number | null
}

export const loggedExercises = pgTable(
  'logged_exercises',
  {
    id: text('id').primaryKey(),                    // prefixed 'lex-'
    logId: text('log_id').notNull()
      .references(() => workoutLogs.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    groupItemId: text('group_item_id').notNull(),   // Reference to program group item
    orderIndex: integer('order_index').notNull(),
    notes: text('notes'),
    skipped: boolean('skipped').notNull().default(false),
    series: jsonb('series').$type<LoggedSeriesData[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index('logged_exercises_log_id_idx').on(table.logId),
    index('logged_exercises_exercise_id_idx').on(table.exerciseId),
  ],
)
```

### Zustand Store Pattern

```typescript
// apps/coach-web/src/stores/log-store.ts
import type { WorkoutLogAggregate, LoggedExerciseAggregate, LoggedSeriesInput } from '@strenly/contracts/workout-logs/workout-log'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

interface LogState {
  log: WorkoutLogAggregate | null
  isDirty: boolean
}

interface LogActions {
  initialize: (log: WorkoutLogAggregate) => void
  updateSeries: (exerciseId: string, seriesIndex: number, data: Partial<LoggedSeriesInput>) => void
  skipExercise: (exerciseId: string) => void
  unskipExercise: (exerciseId: string) => void
  updateExerciseNotes: (exerciseId: string, notes: string) => void
  updateSession: (data: { sessionRpe?: number; sessionNotes?: string }) => void
  markSaved: () => void
  reset: () => void
  getLogForSave: () => SaveLogInput | null
}

export const useLogStore = create<LogState & LogActions>((set, get) => ({
  log: null,
  isDirty: false,

  initialize: (log) => set({ log: structuredClone(log), isDirty: false }),

  updateSeries: (exerciseId, seriesIndex, data) => set((state) => {
    if (!state.log) return state
    const newLog = structuredClone(state.log)
    const exercise = newLog.exercises.find(e => e.id === exerciseId)
    if (exercise && exercise.series[seriesIndex]) {
      exercise.series[seriesIndex] = { ...exercise.series[seriesIndex], ...data }
    }
    return { log: newLog, isDirty: true }
  }),

  skipExercise: (exerciseId) => set((state) => {
    if (!state.log) return state
    const newLog = structuredClone(state.log)
    const exercise = newLog.exercises.find(e => e.id === exerciseId)
    if (exercise) {
      exercise.skipped = true
      exercise.series.forEach(s => { s.skipped = true })
    }
    return { log: newLog, isDirty: true }
  }),

  // ... other actions follow same pattern

  getLogForSave: () => {
    const state = get()
    if (!state.log) return null
    return {
      logId: state.log.id,
      status: calculateStatus(state.log),
      sessionRpe: state.log.sessionRpe,
      sessionNotes: state.log.sessionNotes,
      exercises: state.log.exercises.map(e => ({
        id: e.id,
        notes: e.notes,
        skipped: e.skipped,
        series: e.series,
      })),
    }
  },
}))
```

### Repository Port

```typescript
// packages/core/src/ports/workout-log-repository.port.ts
import type { OrganizationContext } from '../types/organization-context'
import type { WorkoutLog } from '../domain/entities/workout-log/types'
import type { ResultAsync } from 'neverthrow'

export type WorkoutLogRepositoryError =
  | { type: 'not_found'; message: string }
  | { type: 'conflict'; message: string }
  | { type: 'database_error'; message: string }

export interface WorkoutLogRepository {
  save(ctx: OrganizationContext, log: WorkoutLog): ResultAsync<void, WorkoutLogRepositoryError>

  findById(ctx: OrganizationContext, logId: string): ResultAsync<WorkoutLog | null, WorkoutLogRepositoryError>

  findByAthleteSessionWeek(
    ctx: OrganizationContext,
    athleteId: string,
    sessionId: string,
    weekId: string
  ): ResultAsync<WorkoutLog | null, WorkoutLogRepositoryError>

  listByAthlete(
    ctx: OrganizationContext,
    athleteId: string,
    pagination: { limit: number; offset: number }
  ): ResultAsync<{ items: WorkoutLog[]; totalCount: number }, WorkoutLogRepositoryError>

  delete(ctx: OrganizationContext, logId: string): ResultAsync<void, WorkoutLogRepositoryError>
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Auto-save per field | Client-side batched save | Phase 3.2/3.3 | Established in program builder, same pattern here |
| Separate forms per section | Zustand store | Phase 3.2 | Single source of truth for complex forms |
| Fetch on deviation check | Snapshot at log creation | This phase | Preserves history, enables offline display |

**Deprecated/outdated:**
- useEffect for derived state: Use callbacks or store actions instead
- Multiple useForm hooks: Use Zustand for coordinated state

## Open Questions

Things that couldn't be fully resolved:

1. **Log ID generation strategy**
   - What we know: Other entities use prefixed UUIDs (prg-, ath-, etc.)
   - What's unclear: Should logs use log- prefix? Or wlog-?
   - Recommendation: Use `log-` prefix for consistency. Short and clear.

2. **Handling program structure changes after log creation**
   - What we know: Logs snapshot prescribed values. Sessions/exercises don't change.
   - What's unclear: What if coach deletes a session that has logs?
   - Recommendation: Cascade delete on session deletion (logs are coach-generated, not permanent records). Alternative: Add confirmation dialog before deleting sessions with logs.

3. **Log date semantics**
   - What we know: Decision says "one log per session"
   - What's unclear: Is logDate when workout occurred or when logged?
   - Recommendation: logDate = when workout occurred (user-editable). createdAt = when log was created. This allows logging workouts that happened yesterday.

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `packages/core/src/domain/entities/program/` - Program aggregate pattern
- Existing codebase analysis: `apps/coach-web/src/stores/grid-store.ts` - Zustand client-side editing pattern
- Existing codebase analysis: `packages/backend/src/use-cases/programs/save-draft.ts` - Aggregate save pattern
- CONTEXT.md decisions: Session logging view design, pre-fill behavior, skip handling

### Secondary (MEDIUM confidence)
- [Dittofi - How to design a scalable data model for a workout tracking app](https://www.dittofi.com/learn/how-to-design-a-data-model-for-a-workout-tracking-app) - Plan vs Log separation patterns
- [1df.co - Designing a data structure to track workouts](https://1df.co/designing-data-structure-to-track-workouts/) - Session-based logging approach
- [TanStack Query Optimistic Updates](https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates) - Mutation patterns
- [React useOptimistic](https://react.dev/reference/react/useOptimistic) - Optimistic UI patterns

### Tertiary (LOW confidence)
- Various fitness app database schemas found via web search - general patterns but not specific to strength training domain

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, no new dependencies
- Architecture: HIGH - Patterns mirror existing Program aggregate approach
- Pitfalls: MEDIUM - Based on domain experience, not production-tested
- Code examples: HIGH - Directly adapted from existing codebase patterns

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable domain, no library changes)
