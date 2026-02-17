# Strenly — API Contracts

**Generated:** 2026-02-17 | **Transport:** oRPC (POST) + Better-Auth (REST)

## Wire Format

All oRPC endpoints use POST with JSON body:
- **Request:** `POST /rpc/{domain}/{action}` with body `{ json: { ...input } }`
- **Response:** `{ json: { ...output } }` on success
- **Errors:** oRPC typed errors with HTTP status codes

**Organization context:** All authenticated requests require `X-Organization-Slug: {orgSlug}` header.

---

## Auth Endpoints (Better-Auth)

These are standard Better-Auth REST endpoints at `/api/auth/*`.

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/sign-in/email | Email/password login |
| POST | /api/auth/sign-up/email | Email/password signup |
| POST | /api/auth/sign-out | Logout |
| GET | /api/auth/get-session | Get current session |
| GET | /api/auth/organization/list | List user's organizations |
| POST | /api/auth/organization/create | Create organization |
| GET | /api/auth/organization/get-full-organization | Get org with members |

---

## Programs

### `POST /rpc/programs/get`
Get a program with full aggregate (weeks → sessions → groups → items → prescriptions).

**Input:** `{ programId: string }`
**Output:** `ProgramAggregate` (full nested hierarchy)
**Auth:** `authProcedure` (programs:read)

### `POST /rpc/programs/list`
List programs for the organization with pagination and filters.

**Input:** `{ page?, limit?, search?, status?, athleteId?, isTemplate? }`
**Output:** `{ items: Program[], totalCount: number }`
**Auth:** `authProcedure` (programs:read)

### `POST /rpc/programs/create`
Create a new program.

**Input:** `{ name: string, description?: string, athleteId?: string }`
**Output:** `Program`
**Auth:** `authProcedure` (programs:write)

### `POST /rpc/programs/update`
Update program metadata.

**Input:** `{ programId: string, name?: string, description?: string, athleteId?: string }`
**Output:** `Program`
**Auth:** `authProcedure` (programs:write)

### `POST /rpc/programs/archive`
Archive a program.

**Input:** `{ programId: string }`
**Output:** `Program`
**Auth:** `authProcedure` (programs:write)

### `POST /rpc/programs/duplicate`
Duplicate a program.

**Input:** `{ programId: string, name?: string }`
**Output:** `Program`
**Auth:** `authProcedure` (programs:write)

### `POST /rpc/programs/saveDraft`
Bulk save operation for the program grid editor (new weeks, sessions, exercises, prescriptions).

**Input:** `SaveDraftInput`
```ts
{
  programId: string
  newWeeks?: { tempId: string, name: string, orderIndex: number }[]
  newSessions?: { tempId: string, name: string, orderIndex: number }[]
  newExerciseRows?: { tempId: string, sessionId: string, exerciseId: string, orderIndex: number }[]
  prescriptionUpdates?: { exerciseRowId: string, weekId: string, series: SeriesData[] }[]
  exerciseRowUpdates?: { rowId: string, exerciseId?: string, groupId?: string, orderWithinGroup?: number }[]
  groupUpdates?: { groupId: string, name?: string, orderIndex?: number }[]
}
```
**Output:** `{ updatedAt: Date }`
**Auth:** `authProcedure` (programs:write)

### `POST /rpc/programs/templates`
List reusable program templates.

**Input:** `{ page?, limit? }`
**Output:** `{ items: Program[], totalCount: number }`
**Auth:** `authProcedure` (programs:read)

### `POST /rpc/programs/saveAsTemplate`
Save an existing program as a reusable template.

**Input:** `{ programId: string, name: string }`
**Output:** `Program`
**Auth:** `authProcedure` (programs:write)

### `POST /rpc/programs/createFromTemplate`
Create a new program from a template.

**Input:** `{ templateId: string, name: string, athleteId?: string }`
**Output:** `Program`
**Auth:** `authProcedure` (programs:write)

### Program structure operations (weeks, sessions, exercise rows, prescriptions)

| Endpoint | Input | Description |
|----------|-------|-------------|
| `/rpc/programs/weeks` (various actions) | weekId, name, orderIndex | Add/update/delete/duplicate weeks |
| `/rpc/programs/sessions` (various) | sessionId, name, orderIndex | Add/update/delete sessions |
| `/rpc/programs/exerciseRows` (various) | rowId, sessionId, exerciseId | Add/update/delete exercise rows |
| `/rpc/programs/prescriptions` | exerciseRowId, weekId, series[] | Update prescription for a cell |

---

## Athletes

### `POST /rpc/athletes/list`
**Input:** `{ page?, limit?, search?, status? }`
**Output:** `{ items: Athlete[], totalCount: number }`

### `POST /rpc/athletes/get`
**Input:** `{ athleteId: string }`
**Output:** `Athlete`

### `POST /rpc/athletes/create`
**Input:** `{ name: string, email?: string, phone?: string, birthdate?: string, gender?: Gender, notes?: string }`
**Output:** `Athlete`

### `POST /rpc/athletes/update`
**Input:** `{ athleteId: string, name?, email?, phone?, birthdate?, gender?, notes? }`
**Output:** `Athlete`

### `POST /rpc/athletes/archive`
**Input:** `{ athleteId: string }`
**Output:** `Athlete`

### Invitations
| Endpoint | Input | Output | Notes |
|----------|-------|--------|-------|
| `athletes/generateInvitation` | `{ athleteId }` | `{ token, expiresAt }` | Generate invite link |
| `athletes/getAthleteInvitation` | `{ athleteId }` | `AthleteInvitation \| null` | Get current invite |
| `athletes/getInvitationInfo` | `{ token }` | `{ athlete, organization }` | Public (no auth) |
| `athletes/acceptInvitation` | `{ token }` | `{ success }` | Link user to athlete |

---

## Exercises

### `POST /rpc/exercises/list`
**Input:** `{ page?, limit?, search?, muscleGroupId?, movementPattern?, includeArchived? }`
**Output:** `{ items: Exercise[], totalCount: number }`

### `POST /rpc/exercises/get`
**Input:** `{ exerciseId: string }`
**Output:** `Exercise`

### `POST /rpc/exercises/create`
**Input:** `{ name, description?, instructions?, videoUrl?, movementPattern?, isUnilateral?, muscleGroupIds? }`
**Output:** `Exercise`

### `POST /rpc/exercises/update`
**Input:** `{ exerciseId, name?, description?, instructions?, videoUrl?, movementPattern?, isUnilateral?, muscleGroupIds? }`
**Output:** `Exercise`

### `POST /rpc/exercises/archive`
**Input:** `{ exerciseId: string }`
**Output:** `Exercise`

### `POST /rpc/exercises/clone`
Clone a curated exercise to customize for the organization.
**Input:** `{ exerciseId: string }`
**Output:** `Exercise`

### `POST /rpc/exercises/listMuscleGroups`
**Input:** `{}` (no input)
**Output:** `{ items: MuscleGroup[] }`

---

## Workout Logs

### `POST /rpc/workoutLogs/create`
**Input:** `{ athleteId, programId, sessionId, weekId }`
**Output:** `WorkoutLog`

### `POST /rpc/workoutLogs/get`
**Input:** `{ logId: string }`
**Output:** `WorkoutLog`

### `POST /rpc/workoutLogs/save`
Save workout log progress (logged exercises + series).
**Input:** `{ logId, exercises: LoggedExercise[], status?, notes? }`
**Output:** `WorkoutLog`

### `POST /rpc/workoutLogs/delete`
**Input:** `{ logId: string }`
**Output:** `{ success: true }`

### `POST /rpc/workoutLogs/listAthleteLog`
**Input:** `{ athleteId, page?, limit?, programId? }`
**Output:** `{ items: WorkoutLog[], totalCount: number }`

### `POST /rpc/workoutLogs/getBySession`
Get log for a specific session + week combination.
**Input:** `{ athleteId, sessionId, weekId }`
**Output:** `WorkoutLog | null`

---

## Subscriptions

### `POST /rpc/subscriptions/listPlans`
**Input:** `{}` (public — no auth required)
**Output:** `{ items: Plan[] }`

### `POST /rpc/subscriptions/get`
**Input:** `{}` (uses org from header)
**Output:** `Subscription | null`

### `POST /rpc/subscriptions/create`
**Input:** `{ planId: string }`
**Output:** `Subscription`
**Auth:** `sessionProcedure` (org owner only)

---

## Health

### `POST /rpc/health/health`
**Input:** `{}`
**Output:** `{ status: 'ok', timestamp: string }`
**Auth:** public (no auth required)

---

## Common Types

### Prescription Series
```ts
type SeriesData = {
  orderIndex: number
  reps: number | null
  repsMax: number | null
  isAmrap: boolean
  intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  intensityValue: number | null
  tempo: string | null  // e.g., "3010"
  restSeconds: number | null
}
```

### Pagination
```ts
// Input
{ page: number (default 1), limit: number (default 20) }

// Output
{ items: T[], totalCount: number }
```

### Error Codes
| Code | HTTP | Description |
|------|------|-------------|
| UNAUTHORIZED | 401 | No valid session |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| ORG_NOT_FOUND | 404 | Organization not found |
| NOT_A_MEMBER | 403 | User not a member of org |
