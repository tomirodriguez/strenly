---
phase: 02-exercise-library-athlete-management
plan: 01
subsystem: database
tags: [drizzle, postgresql, schema, athletes, exercises, muscle-groups]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: organizations and users tables for foreign keys
provides:
  - Athletes table with profile fields and user linking
  - Athlete invitations table for secure token-based invitations
  - Exercises table with curated/custom distinction
  - Muscle groups lookup table with body regions
  - Exercise-muscle junction with primary/secondary mapping
  - Exercise progressions for difficulty chains
affects: [02-02, 02-03, 02-04, 03-program-builder]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - pgEnum for type-safe enums (athlete_gender, athlete_status, body_region, movement_pattern, progression_direction)
    - Nullable organizationId for curated vs custom resources
    - Junction tables for many-to-many relationships

key-files:
  created:
    - packages/database/src/schema/athletes.ts
    - packages/database/src/schema/athlete-invitations.ts
    - packages/database/src/schema/exercises.ts
    - packages/database/src/schema/muscle-groups.ts
    - packages/database/src/schema/exercise-muscles.ts
    - packages/database/src/schema/exercise-progressions.ts
  modified:
    - packages/database/src/schema/index.ts

key-decisions:
  - "Used text IDs (not uuid) to match existing schema patterns"
  - "Curated exercises identified by null organizationId, custom by populated organizationId"
  - "Exercise progressions are self-referential with direction enum (easier/harder)"

patterns-established:
  - "Nullable FK pattern: null organizationId indicates system-wide curated resource"
  - "Soft delete via archivedAt timestamp for exercises"
  - "Junction table with isPrimary flag for weighted relationships"

# Metrics
duration: 2min
completed: 2026-01-24
---

# Phase 02 Plan 01: Database Schema Summary

**Drizzle schema for athletes, exercises, muscle groups with multi-tenant support and curated/custom distinction**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-24T01:20:01Z
- **Completed:** 2026-01-24T01:22:30Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Athletes table with full profile fields (name, email, phone, birthdate, gender, notes, status, linkedUserId)
- Athlete invitations for secure token-based account linking
- Exercise library with curated vs custom distinction (null orgId = curated)
- Muscle groups lookup with body region classification (upper/lower/core)
- Exercise-muscle junction supporting primary/secondary muscle targeting
- Exercise progressions for easier/harder difficulty chains

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Athletes and Invitations Schema** - `c9d260e` (feat)
2. **Task 2: Create Exercise Library Schema** - `b642651` (feat)
3. **Task 3: Export Schema and Push to Database** - `ffecbe3` (feat)

## Files Created/Modified
- `packages/database/src/schema/athletes.ts` - Athletes table with profile fields and indexes
- `packages/database/src/schema/athlete-invitations.ts` - Invitation tokens with expiry tracking
- `packages/database/src/schema/exercises.ts` - Exercises with movement patterns and curated flag
- `packages/database/src/schema/muscle-groups.ts` - Muscle groups lookup with body regions
- `packages/database/src/schema/exercise-muscles.ts` - Junction table for primary/secondary targeting
- `packages/database/src/schema/exercise-progressions.ts` - Self-referential progression chains
- `packages/database/src/schema/index.ts` - Added exports for all new tables

## Decisions Made
- **text IDs over uuid:** Followed existing patterns from auth.ts and plans.ts for consistency
- **Curated via null organizationId:** Avoids separate boolean flag, leverages FK constraint naturally
- **Soft delete for exercises:** Used archivedAt timestamp to preserve historical data
- **Movement pattern enum:** Includes push, pull, hinge, squat, carry, core for categorization

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- db:push failed due to no database connection (ECONNREFUSED) - expected per plan, schema files are the deliverable

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Schema foundation complete for athlete and exercise domain entities
- Ready for domain entity implementation (02-02, 02-03)
- Ready for repository implementations with Drizzle queries
- db:push needed when DATABASE_URL is configured

---
*Phase: 02-exercise-library-athlete-management*
*Completed: 2026-01-24*
