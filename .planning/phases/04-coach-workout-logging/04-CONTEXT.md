# Phase 4: Coach Workout Logging - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Coach can track and log athlete workout execution directly from the coach web app. The system maintains clear separation between plan (what coach prescribed) and log (what athlete actually did). Coach logs on behalf of athletes — athletes logging their own workouts is Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Entry Points
- Two entry points for logging: athlete profile page AND dedicated logging section in nav
- Logging dashboard shows pending workouts grouped by athlete
- Must navigate to athlete → their program → log (not accessible from program editor)
- Manual session selection (coach picks week + session to log)

### Logging View
- **Dedicated session logging view** — NOT the program grid overlay
- Vertical list layout: exercises as sections, each set on its own line with inputs
- Pre-fill all fields from planned prescription — coach only changes deviations
- **Client-side-first editing** — all changes in local state, single save endpoint (same pattern as program builder)
- Prompt to save when navigating away with unsaved changes

### Data Capture Per Set
- **Reps** — actual reps performed
- **Weight** — actual weight used
- **RPE** — perceived exertion (optional but dedicated input)

### Data Capture Per Exercise
- **Notes** — optional text field for exercise-specific comments

### Data Capture Per Session
- **Session RPE** — overall workout difficulty rating
- **Session notes** — general comments (injuries, mood, fatigue, etc.)

### Deviation Display
- Inputs pre-filled with planned values
- **Color highlight** on fields that differ from plan (e.g., orange border)
- Hover to see original planned value

### Skip Handling
- Explicit **"Skip" button** per exercise to mark athlete didn't do it
- Skipped exercises cleared and marked with skipped status

### Session Status
- **Completed** — all exercises logged
- **Partial** — some exercises logged, others not or skipped
- **Skipped** — entire session marked as skipped

### Log Persistence
- One log entry per session (not multiple logs for same session)
- Edits overwrite — no audit trail of changes
- Coach can edit past logs anytime (no time window)
- Coach can delete logs entirely

### History View
- Accessed from athlete profile (per-athlete scope, not global)
- Shows: date + session name + status (completed/partial/skipped)
- **Modal** to view log details
- **Navigate to dedicated page** to edit log

### Claude's Discretion
- Exact layout of logging dashboard pending workouts section
- Color scheme for deviation highlighting
- Loading states and transitions
- Empty state design when no logs exist

</decisions>

<specifics>
## Specific Ideas

- "Logs should work exactly like the program builder — client-side until save"
- RPE is what the athlete perceives, so it needs dedicated input per set (not inferred from plan)
- Session-level RPE captures overall workout difficulty beyond per-set data

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-coach-workout-logging*
*Context gathered: 2026-01-27*
