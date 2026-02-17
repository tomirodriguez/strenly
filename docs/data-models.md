# Strenly — Data Models

**Generated:** 2026-02-17 | **ORM:** Drizzle | **Database:** Neon PostgreSQL

## Schema Overview

All tables in `packages/database/src/schema/`. Multi-tenancy enforced via `organization_id` FK on all tenant tables.

## Auth Tables (Better-Auth managed)

### users
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | Better-Auth UUID |
| name | text | Display name |
| email | text UNIQUE | |
| emailVerified | boolean | |
| image | text | Avatar URL |
| createdAt, updatedAt | timestamp | |

### organizations
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| name | text | |
| slug | text UNIQUE | URL identifier |
| logo | text | |
| metadata | jsonb | `{type, status}` |
| createdAt | timestamp | |

### members
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| organizationId | text FK → organizations | |
| userId | text FK → users | |
| role | text | 'owner' \| 'admin' \| 'member' |
| createdAt | timestamp | |

### sessions, accounts
Standard Better-Auth session/OAuth account tables.

---

## Athlete Tables

### athletes
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| organizationId | text FK → organizations (cascade) | Required |
| name | text | |
| email | text | Optional |
| phone | text | |
| birthdate | date | |
| gender | enum | 'male' \| 'female' \| 'other' |
| notes | text | |
| status | enum | 'active' \| 'inactive' (default: active) |
| linkedUserId | text FK → users (set null) | Optional: for self-service PWA access |
| createdAt, updatedAt | timestamp | |

**Indexes:** `organization_id`, `linked_user_id`, `status`

### athlete_invitations
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| organizationId | text FK → organizations (cascade) | |
| athleteId | text FK → athletes (cascade) | |
| token | text UNIQUE | Invitation token |
| expiresAt | timestamp | |
| acceptedAt | timestamp | null if pending |
| createdAt, updatedAt | timestamp | |

---

## Exercise Tables

### exercises
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| organizationId | text FK → organizations (cascade) | null = curated (global) |
| name | text | |
| description | text | |
| instructions | text | |
| videoUrl | text | |
| movementPattern | enum | 'push' \| 'pull' \| 'hinge' \| 'squat' \| 'carry' \| 'core' |
| isUnilateral | boolean | Default: false |
| isCurated | boolean | Default: false (system-provided) |
| clonedFromId | text | Source exercise ID if cloned |
| archivedAt | timestamp | null = active |
| createdAt, updatedAt | timestamp | |

**Note:** `organizationId = null` → available to all organizations (curated library).

**Indexes:** `organization_id`, `movement_pattern`, `is_curated`, `archived_at`

### muscle_groups
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| name | text | e.g., "Quadriceps", "Hamstrings" |
| bodyRegion | text | e.g., "lower", "upper", "core" |
| createdAt | timestamp | |

### exercise_muscles (M2M)
| Column | Type | Notes |
|--------|------|-------|
| exerciseId | text FK → exercises (cascade) | |
| muscleGroupId | text FK → muscle_groups (cascade) | |
| role | enum | 'primary' \| 'secondary' |

### exercise_progressions
| Column | Type | Notes |
|--------|------|-------|
| exerciseId | text FK → exercises | |
| progressionExerciseId | text FK → exercises | |
| type | text | Progression relationship type |

---

## Program Tables

### programs
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | Prefixed: `prg-` |
| organizationId | text FK → organizations (cascade) | |
| name | text | Min 3, max 100 chars |
| description | text | |
| athleteId | text FK → athletes (set null) | null + isTemplate=true = template |
| isTemplate | boolean | Default: false |
| status | enum | 'draft' \| 'active' \| 'archived' |
| createdAt, updatedAt | timestamp | |

**Status transitions:** draft→active, active→archived, draft→archived

**Indexes:** `organization_id`, `athlete_id`, `is_template`, `status`

### program_weeks
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | Prefixed: `week-` |
| programId | text FK → programs (cascade) | |
| name | text | Week label (e.g., "Week 1") |
| orderIndex | integer | Sort order |
| createdAt, updatedAt | timestamp | |

**Indexes:** `program_id`, `order_index`

### program_sessions
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| programId | text FK → programs (cascade) | |
| name | text | Session label (e.g., "Day A") |
| orderIndex | integer | Sort order |
| createdAt, updatedAt | timestamp | |

**Key insight:** Sessions are shared across ALL weeks. The structure (exercises) is defined once per session; prescriptions (volumes) vary per week.

**Indexes:** `program_id`, `order_index`

### exercise_groups
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | Prefixed: `eg-` |
| sessionId | text FK → program_sessions (cascade) | |
| orderIndex | integer | |
| name | text | Optional label (e.g., "Superset A") |
| createdAt, updatedAt | timestamp | |

### program_exercises
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| sessionId | text FK → program_sessions (cascade) | |
| exerciseId | text FK → exercises | |
| orderIndex | integer | Position in session |
| groupId | text FK → exercise_groups (set null) | null = ungrouped |
| orderWithinGroup | integer | Position within group |
| setTypeLabel | text | e.g., "Superset", "Drop set" |
| notes | text | Coach notes |
| restSeconds | integer | Rest between sets |
| createdAt, updatedAt | timestamp | |

### prescriptions
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | Prefixed: `rx-` |
| programExerciseId | text FK → program_exercises (cascade) | |
| weekId | text FK → program_weeks (cascade) | |
| series | jsonb | `PrescriptionSeriesData[]` (see below) |
| createdAt, updatedAt | timestamp | |

**Unique constraint:** `(programExerciseId, weekId)` — one prescription per exercise per week.

**JSONB series format:**
```json
[
  {
    "orderIndex": 0,
    "reps": 8,
    "repsMax": 10,
    "isAmrap": false,
    "intensityType": "percentage",
    "intensityValue": 75,
    "intensityUnit": "%",
    "tempo": "3010",
    "restSeconds": 120
  }
]
```

**Intensity types:** `absolute` (kg/lb) | `percentage` (%1RM) | `rpe` (1-10) | `rir` (reps in reserve)

---

## Workout Log Tables

### workout_logs
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| organizationId | text FK → organizations (cascade) | |
| athleteId | text FK → athletes | |
| programId | text FK → programs | |
| sessionId | text FK → program_sessions | |
| weekId | text FK → program_weeks | |
| status | enum | 'pending' \| 'in_progress' \| 'completed' \| 'skipped' |
| completedAt | timestamp | |
| notes | text | Athlete notes |
| createdAt, updatedAt | timestamp | |

### logged_exercises
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| workoutLogId | text FK → workout_logs (cascade) | |
| programExerciseId | text FK → program_exercises | |
| exerciseId | text FK → exercises | |
| orderIndex | integer | |
| series | jsonb | `LoggedSeriesData[]` (actual completed sets) |
| notes | text | |
| createdAt, updatedAt | timestamp | |

---

## Subscription Tables

### plans
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| name | text | |
| description | text | |
| price | numeric | Monthly price |
| currency | text | 'ARS', 'USD', etc. |
| maxAthletes | integer | Athlete limit |
| features | jsonb | Feature flags |
| isActive | boolean | |
| createdAt, updatedAt | timestamp | |

### subscriptions
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| organizationId | text FK → organizations (cascade) UNIQUE | |
| planId | text FK → plans | |
| status | enum | 'active' \| 'cancelled' \| 'past_due' |
| startedAt | timestamp | |
| expiresAt | timestamp | |
| createdAt, updatedAt | timestamp | |

---

## Entity Relationship Summary

```
organizations
├── members (userId FK)
├── athletes
│   └── athlete_invitations
├── exercises (custom; curated have organizationId=null)
│   ├── exercise_muscles → muscle_groups
│   └── exercise_progressions
├── programs
│   ├── program_weeks
│   ├── program_sessions
│   │   ├── exercise_groups
│   │   └── program_exercises → prescriptions (× weeks)
│   └── workout_logs
│       └── logged_exercises
└── subscriptions → plans
```
