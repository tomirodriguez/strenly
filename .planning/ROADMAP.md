# Roadmap: Strenly

## Overview

Strenly delivers a training planning platform where coaches can create programs as fast as in Excel, while athletes get a mobile-first experience for viewing workouts and logging execution. The roadmap builds from foundation (auth, multi-tenancy) through data management (exercises, athletes) to the core differentiator (Excel-like grid), then enables athlete participation (PWA), and finally surfaces insights (dashboard analytics).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & Multi-Tenancy** - Auth, organization isolation, subscription structure (backend)
- [x] **Phase 2: Exercise Library & Athlete Management** - Exercise database, athlete profiles, invitations (backend)
- [x] **Phase 2.5: Coach Web Foundation** - Auth UI, athlete management UI, exercise browser (frontend catch-up)
- [x] **Phase 2.6: Design System & Visual Refresh** - Dark theme, blue accent, component styling (frontend, non-blocking)
- [x] **Phase 3: Program Builder** - Excel-like grid editing, prescription system, templates (full-stack)
- [x] **Phase 3.1: Custom Program Grid** - Native HTML table replacing react-datasheet-grid (frontend)
- [x] **Phase 3.2: Prescription Data Structure Refactor** - Series arrays, exercise groups, client-side editing (full-stack)
- [x] **Phase 3.3: Program Builder QA & Bug Fixes** - Fix UI bugs, improve form UX (INSERTED)
- [ ] **Phase 3.4: Domain Restructure - Training Programs** - Correct domain model, eliminate legacy, full-stack alignment (INSERTED)
- [ ] **Phase 4: Athlete PWA** - Mobile app for viewing programs and logging workouts (full-stack)
- [ ] **Phase 5: Dashboard & Analytics** - Coach dashboard, compliance tracking, data export (full-stack)

## Phase Details

### Phase 1: Foundation & Multi-Tenancy
**Goal**: Users can create accounts, form organizations, and operate in isolated multi-tenant environments
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, ORG-01, ORG-02, ORG-03, ORG-04, ORG-05, ORG-06, ORG-07, SUB-01, SUB-02, SUB-03, SUB-04, SUB-05
**Success Criteria** (what must be TRUE):
  1. User can create account with email/password or Google OAuth and stay logged in across sessions
  2. User can create an organization during onboarding and invite coaches with assigned roles
  3. Organization data is completely isolated (users cannot access other organizations' data)
  4. User must select subscription plan before creating organization and system enforces plan limits
  5. User can belong to multiple organizations with different roles
**Plans**: 7 plans in 4 waves

Plans:
- [x] 01-01-PLAN.md - Database schema + Better-Auth setup (Wave 1)
- [x] 01-02-PLAN.md - oRPC procedure hierarchy + Hono app (Wave 1)
- [x] 01-03-PLAN.md - Authentication flows (email/password, OAuth, session, logout, password reset) (Wave 2)
- [x] 01-04-PLAN.md - Organization management + member invitations (Wave 2)
- [x] 01-05-PLAN.md - Subscription plans + limit enforcement (Wave 3)
- [x] 01-06-PLAN.md - [GAP CLOSURE] Domain entities + ports for Plan/Subscription (Wave 4)
- [x] 01-07-PLAN.md - [GAP CLOSURE] Repositories + refactor use cases to proper architecture (Wave 4)

### Phase 2: Exercise Library & Athlete Management
**Goal**: Coaches can manage athletes and access a comprehensive exercise library
**Depends on**: Phase 1
**Requirements**: ATH-01, ATH-02, ATH-03, ATH-04, ATH-05, ATH-06, ATH-07, EXR-01, EXR-02, EXR-03, EXR-04, EXR-05, EXR-06
**Success Criteria** (what must be TRUE):
  1. Coach can create, view, update, and delete athlete profiles within their organization
  2. Coach can generate invitation link and athlete can link their user account to their profile
  3. Coach can search curated exercise database and create custom exercises with muscle/pattern mappings
  4. Coach can operate fully without athletes having linked accounts
  5. Exercises have muscle group mappings and movement pattern classification for future analytics
**Plans**: 11 plans in 5 waves

Plans:
- [x] 02-01-PLAN.md - Database schema for athletes, exercises, muscle groups (Wave 1)
- [x] 02-02-PLAN.md - Athlete and AthleteInvitation domain entities + ports (Wave 1, TDD)
- [x] 02-03-PLAN.md - Exercise domain entity + MuscleGroup/MovementPattern value objects (Wave 1, TDD)
- [x] 02-04-PLAN.md - Athlete and AthleteInvitation repositories (Wave 2)
- [x] 02-05-PLAN.md - Exercise and MuscleGroup repositories (Wave 2)
- [x] 02-06-PLAN.md - Athlete CRUD use cases (Wave 3)
- [x] 02-07-PLAN.md - Athlete invitation flow use cases (Wave 3)
- [x] 02-08-PLAN.md - Exercise CRUD and clone use cases (Wave 3)
- [x] 02-09-PLAN.md - Athletes contracts and procedures (Wave 4)
- [x] 02-10-PLAN.md - Exercises contracts and procedures (Wave 4)
- [x] 02-11-PLAN.md - Seed muscle groups and curated exercises (Wave 5)

### Phase 2.5: Coach Web Foundation
**Goal**: Coaches can use the web app to authenticate, manage athletes, and browse exercises
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, ATH-01, ATH-02, ATH-03, ATH-05, EXR-01, EXR-02
**Success Criteria** (what must be TRUE):
  1. Coach can sign up, log in, and log out using the web UI
  2. Coach can create an organization during onboarding flow
  3. Coach can view athlete list with search and pagination
  4. Coach can create, edit, and archive athletes via forms
  5. Coach can generate invitation links and see invitation status
  6. Coach can browse exercise library with filtering by muscle group and movement pattern
**Plans**: 11 plans in 6 waves

Plans:
- [x] 02.5-01-PLAN.md - App shell, layout, providers, auth guards (Wave 1)
- [x] 02.5-02-PLAN.md - DataTable compound component with pagination, search (Wave 1)
- [x] 02.5-03-PLAN.md - Auth UI: login, signup, onboarding, org creation (Wave 2)
- [x] 02.5-04-PLAN.md - Athletes feature: list, forms, invitations (Wave 3)
- [x] 02.5-05-PLAN.md - Exercises feature: browser with filters (Wave 3)
- [x] 02.5-06-PLAN.md - Dashboard with stats and quick actions (Wave 4)
- [x] 02.5-07-PLAN.md - [GAP CLOSURE] Fix organization header sync (Wave 5)
- [x] 02.5-08-PLAN.md - [GAP CLOSURE] Fix user menu and DataTable crashes (Wave 5)
- [x] 02.5-09-PLAN.md - [GAP CLOSURE] Form polish and Sheet styling (Wave 5)
- [x] 02.5-10-PLAN.md - [GAP CLOSURE] Fix athlete validation and exercise muscles (Wave 6)
- [x] 02.5-11-PLAN.md - [GAP CLOSURE] Add invitation viewing modal (Wave 6)

### Phase 2.6: Design System & Visual Refresh
**Goal**: Transform coach web app visual identity with dark slate theme, blue primary accent, and consistent design system
**Depends on**: Phase 2.5 (non-blocking for Phase 3)
**Requirements**: None (visual refresh, no functional requirements)
**Success Criteria** (what must be TRUE):
  1. App uses dark slate color palette (slate-950 background, slate-900 surfaces, slate-800 borders)
  2. Primary color is blue-600 (#2563eb) used for active states, buttons, and accent elements
  3. Sidebar matches reference design with icon + label navigation, section dividers, and user profile footer
  4. Header has breadcrumb navigation, search/notification icons, and primary action button
  5. All existing UI components (DataTable, forms, modals) work correctly with new design tokens
  6. Design tokens documented in docs/design-system.md for future development consistency
**Plans**: 4 plans in 2 waves

Plans:
- [x] 02.6-01-PLAN.md - Design tokens + CSS variables (Wave 1)
- [x] 02.6-02-PLAN.md - Layout components: sidebar, header, app-shell (Wave 1)
- [x] 02.6-03-PLAN.md - Sidebar active nav styling (Wave 2)
- [x] 02.6-04-PLAN.md - Design system documentation + visual verification (Wave 2)

### Phase 3: Program Builder
**Goal**: Coaches can create and edit training programs with Excel-like speed using keyboard navigation and inline editing
**Depends on**: Phase 2.5
**Requirements**: PRG-01, PRG-02, PRG-03, PRG-04, PRG-05, PRG-06, PRG-07, PRG-08, PRG-09, PRG-10, PRG-11, PRG-12, PRG-13, RX-01, RX-02, RX-03, RX-04, RX-05, RX-06, RX-07, RX-08, RX-09, RX-10, RX-11, TPL-01, TPL-02, TPL-03, TPL-04
**Success Criteria** (what must be TRUE):
  1. Coach can create programs and navigate the grid using keyboard (arrow keys, tab, enter) without using mouse
  2. Coach can edit all prescription parameters inline (sets, reps, weight, RPE/RIR, rest, tempo, notes) without modals
  3. Coach can type natural notation (3x8@120kg, 4x6-8@RIR2, 3x10@75%) that parses to structured data
  4. Coach can view full mesocycle (4-6 weeks) at once with 3+ prescription parameters visible per exercise
  5. Coach can duplicate programs and weeks, save as templates, and create new programs from templates
**Plans**: 16 plans in 8 waves

Plans:
- [ ] 03-01-PLAN.md - Database schema: programs, weeks, sessions, exercises, prescriptions (Wave 1)
- [ ] 03-02-PLAN.md - Prescription notation parser TDD (Wave 1)
- [ ] 03-03-PLAN.md - Program and Prescription domain entities TDD (Wave 1)
- [ ] 03-04-PLAN.md - Program repository port and implementation (Wave 2)
- [ ] 03-05-PLAN.md - Program CRUD and duplicate use cases (Wave 3)
- [ ] 03-06-PLAN.md - Week and session management use cases (Wave 3)
- [ ] 03-07-PLAN.md - Exercise row and prescription use cases (Wave 3)
- [ ] 03-08-PLAN.md - Program contracts and procedures (Wave 4)
- [ ] 03-09-PLAN.md - Grid manipulation contracts and procedures (Wave 4)
- [ ] 03-10-PLAN.md - Programs list and creation pages (Wave 5)
- [ ] 03-11-PLAN.md - react-datasheet-grid integration and custom cells (Wave 5)
- [ ] 03-12-PLAN.md - Program editor page with grid and styling (Wave 6)
- [ ] 03-13-PLAN.md - Grid structure manipulation (add week/session/exercise) (Wave 6)
- [ ] 03-14-PLAN.md - Advanced grid features: week/row actions, reordering (Wave 7)
- [ ] 03-15-PLAN.md - Template system: save as template, create from template (Wave 7)
- [ ] 03-16-PLAN.md - Navigation, polish, and final UAT (Wave 8)

### Phase 3.1: Custom Program Grid (INSERTED)
**Goal**: Replace react-datasheet-grid with custom grid component that matches our design system
**Depends on**: Phase 3 (backend complete, frontend grid needs reimplementation)
**Requirements**: PRG-01, PRG-02, PRG-03, PRG-04, PRG-05, PRG-06, PRG-07 (same as Phase 3 grid requirements)
**Success Criteria** (what must be TRUE):
  1. Program grid uses native HTML table with dark slate theme and blue accents
  2. Keyboard navigation works (arrow keys, tab, enter, escape) without mouse
  3. Inline cell editing uses our Input components with prescription notation parsing
  4. Exercise column uses our Combobox component with search
  5. Week column headers have DropdownMenu for actions (rename, duplicate, delete)
  6. Session grouping displays as visual sections in the grid
  7. All existing mutation hooks (use-grid-mutations.ts) work with new grid
  8. Programs list uses DataTable instead of cards
  9. Create program form has weeks selector (default 4) and improved athlete combobox
**Plans**: 17 plans in 9 waves

**Context:**
- Backend API (procedures, use cases, contracts) is complete and unchanged
- react-datasheet-grid failed UAT - doesn't match design system
- Reference: `.planning/phases/03-program-builder/03-UAT.md` (full issue details)
- Reference: `.planning/phases/03-program-builder/ui-ux-specifications/` (design target)
- Existing hooks: `apps/coach-web/src/features/programs/hooks/mutations/use-grid-mutations.ts`

Plans:
- [x] 03.1-01-PLAN.md - Programs list with DataTable (Wave 1)
- [x] 03.1-02-PLAN.md - Program form improvements (weeks selector, athlete combobox) (Wave 1)
- [x] 03.1-03-PLAN.md - Grid foundation (types, hooks, data transform) (Wave 2)
- [x] 03.1-04-PLAN.md - Grid structural components (header, session rows, superset) (Wave 3)
- [x] 03.1-05-PLAN.md - Exercise cell with combobox (Wave 3)
- [x] 03.1-06-PLAN.md - Prescription cells and grid body (Wave 4)
- [x] 03.1-07-PLAN.md - Grid integration and program editor (Wave 5)
- [x] 03.1-08-PLAN.md - [GAP CLOSURE] Fix athlete selector server search (Wave 6)
- [x] 03.1-09-PLAN.md - [GAP CLOSURE] Fix week ordering on rename (Wave 6)
- [x] 03.1-10-PLAN.md - [GAP CLOSURE] Fix superset groups dynamic + order (Wave 6)
- [x] 03.1-11-PLAN.md - [GAP CLOSURE] Fix keyboard navigation + edit mode (Wave 6)
- [x] 03.1-12-PLAN.md - [GAP CLOSURE] Fix athlete selector keyboard accessibility (Wave 7)
- [x] 03.1-13-PLAN.md - [GAP CLOSURE] Fix superset row repositioning (Wave 7)
- [x] 03.1-14-PLAN.md - [GAP CLOSURE] Remove athlete selector empty option (Wave 8)
- [x] 03.1-15-PLAN.md - [GAP CLOSURE] Fix superset label collision (Wave 8)
- [x] 03.1-16-PLAN.md - [GAP CLOSURE] Fix athlete selector empty state visibility (Wave 9)
- [x] 03.1-17-PLAN.md - [GAP CLOSURE] Fix superset removal repositioning and reorder adjacency (Wave 9)

### Phase 3.2: Prescription Data Structure Refactor (INSERTED)
**Goal**: Restructure program/prescription data model to represent sets as individual series in an ordered array, simplify superset handling via exercise groups, and move to client-side grid editing with manual save
**Depends on**: Phase 3.1 (existing grid UX, but needs data model changes)
**Requirements**: PRG-01 through PRG-13, RX-01 through RX-11 (reimplementation with new structure)
**Success Criteria** (what must be TRUE):
  1. Domain fully represents program structure: Program -> Cycles (weeks) -> Sessions -> Exercise Groups -> Group Items -> Prescriptions (series)
  2. Each exercise has an ordered array of prescriptions where each element = one set (enables 3x8@120kg + 1x1@130kg as [8@120, 8@120, 8@120, 1@130])
  3. Exercise groups replace superset system: standalone = group of 1, bi-series = group of 2, circuit = group of N
  4. Grid editing is 100% client-side with explicit "Guardar" button (no auto-save on each change)
  5. Multi-series per cell displays as multiple lines within same cell (not separate rows)
  6. All existing grid UX (keyboard navigation, accessibility) preserved
  7. Prescription notation parser supports new array-based structure
  8. Database schema updated with proper migration from current structure
**Plans**: 8 plans in 8 waves

**Context:**
- Current structure stores `sets: 3` as a single number, making variations (top sets, drop sets) require separate rows
- New structure: each set is its own prescription object in an array, trivializing set-by-set variations
- Exercise groups unify standalone/superset/circuit under one model (group size determines type)
- Client-side editing removes complexity of per-change API calls and enables instant UX
- Reference: `docs/domain-research-strength-training.md` for domain concepts
- Reference: Current grid in `apps/coach-web/src/components/programs/program-grid/`
- Reference: Current domain in `packages/core/src/domain/entities/`

Plans:
- [x] 03.2-01-PLAN.md - Database schema: exercise_groups table, updated columns (Wave 1)
- [x] 03.2-02-PLAN.md - Domain entities: PrescriptionSeries, ExerciseGroup (Wave 2, TDD)
- [x] 03.2-03-PLAN.md - Parser update: multi-notation to series array (Wave 3, TDD)
- [x] 03.2-04-PLAN.md - Contracts + repository updates for groups/series (Wave 4)
- [x] 03.2-05-PLAN.md - saveDraft use case and procedure (Wave 5)
- [x] 03.2-06-PLAN.md - Frontend state: Zustand grid store (Wave 6)
- [x] 03.2-07-PLAN.md - Frontend UI: multi-series display, Guardar button (Wave 7)
- [x] 03.2-08-PLAN.md - Database migration + human verification (Wave 8)

### Phase 3.3: Program Builder QA & Bug Fixes (INSERTED)
**Goal**: Fix UI/UX bugs in the program builder grid and complete client-side editing transition
**Depends on**: Phase 3.2 (client-side foundation exists but has bugs)
**Requirements**: PRG-01 through PRG-13 (QA and polish of existing features)
**Success Criteria** (what must be TRUE):
  1. Keyboard input in prescription cells only enters edit mode on: Enter, F2, double-click, or numeric keys (0-9); other keys are ignored
  2. Entering edit mode does NOT select all text; cursor is positioned at end of input
  3. Arrow key navigation while in edit mode moves cursor within input (does NOT change selected cell)
  4. Superset menu shows existing groups and allows joining/creating groups with correct labeling
  5. ALL builder operations (add week, add session, add exercise, superset changes, prescription edits) happen client-side only
  6. NO API calls until user clicks "Guardar" - save persists all structural changes
  7. Create program form includes default session count selector (default: 3)
  8. Exercise combobox search is debounced to prevent excessive API calls
**Plans**: 8 plans in 1 wave

**Context:**
- Phase 3.2 established client-side state (Zustand store) and saveDraft endpoint
- UI bugs discovered during UAT: text selection on edit, keyboard input triggers, superset menu missing, arrow key behavior
- Form UX improvements needed for program creation flow
- Core requirement: ALL builder operations must be client-side with explicit save

Plans:
- [x] 03.3-01-PLAN.md - Fix prescription cell edit mode behavior (Wave 1)
- [x] 03.3-02-PLAN.md - Complete client-side add exercise operation (Wave 1)
- [x] 03.3-03-PLAN.md - Fix superset menu visibility (Wave 1)
- [x] 03.3-04-PLAN.md - Add sessionsCount to create program form (Wave 1)
- [x] 03.3-05-PLAN.md - [GAP CLOSURE] Fix arrow keys and superset menu client state (Wave 1)
- [x] 03.3-06-PLAN.md - [GAP CLOSURE] Fix focus state sync and superset labeling (Wave 1)
- [x] 03.3-07-PLAN.md - [GAP CLOSURE] Client-side only operations for add week/session (Wave 2)
- [x] 03.3-08-PLAN.md - [GAP CLOSURE] Exercise combobox debounce (Wave 1)

### Phase 3.4: Domain Restructure - Training Programs (INSERTED)
**Goal**: Restructure the core domain to correctly model training programs with proper aggregation, eliminate legacy code, and ensure full-stack alignment
**Depends on**: Phase 3.3 (existing builder needs foundation fix)
**Requirements**: PRG-01 through PRG-13 (reimplementation with correct domain model)
**Success Criteria** (what must be TRUE):
  1. Program aggregate validates entire training plan in one operation (saveDraft receives complete Program object)
  2. Domain correctly models: Program -> Weeks (cycles) -> Sessions -> ExerciseGroups -> GroupItems -> Series
  3. ExerciseGroups unify standalone/superset/circuit (group size determines type, no separate superset concept)
  4. Each exercise-per-week has an ordered array of Series (not a single "sets" number)
  5. Moving an exercise to another group preserves its prescriptions and repositions correctly
  6. All legacy entities/files removed: old Prescription entity, unused types, deprecated code
  7. Frontend grid uses new domain model with full replace-on-save strategy
  8. 90%+ test coverage on Program aggregate and all domain entities
**Plans**: 8 plans in 6 waves

**Context:**
- Phase 3.2/3.3 made changes that aren't reflected in core domain
- ExerciseGroups exist but don't function as proper groups
- Old Prescription entity still exists (series was inside prescription, not separate)
- Legacy code and files not cleaned up
- This is BLOCKING for Phase 4 - domain must be correct before athlete features
- User decisions:
  - Keep "weeks" naming (document they're not calendar weeks)
  - Allow empty programs (no minimum cycles/sessions required)
  - Preserve prescriptions when moving exercises between groups
  - Replace entire program on save (DELETE + INSERT strategy)
  - Delete all legacy code completely (no deprecated folder)
  - Series stored per exercise-per-week (allows progression)
  - Full stack scope (domain + backend + frontend in this phase)

**Domain Model Target:**
```
Program (Aggregate Root)
├── id, name, athleteId, organizationId, status
├── weeks: Week[] (ordered by orderIndex)
│   ├── id, name, orderIndex
│   └── sessions: Session[] (ordered by orderIndex)
│       ├── id, name, orderIndex
│       └── exerciseGroups: ExerciseGroup[] (ordered by orderIndex)
│           ├── id, name (optional, for named supersets)
│           └── items: GroupItem[] (ordered by orderIndex)
│               ├── id, exerciseId, orderIndex
│               └── series: Series[] (ordered by orderIndex)
│                   └── reps, weight, rpe, rir, tempo, rest, notes
```

Plans:
- [x] 03.4-01-PLAN.md - Program aggregate domain entity (TDD) (Wave 1)
- [x] 03.4-02-PLAN.md - Delete legacy domain code, update port imports (Wave 2)
- [x] 03.4-03-PLAN.md - Repository: saveProgramAggregate + loadProgramAggregate (Wave 2)
- [x] 03.4-04-PLAN.md - Use case updates for aggregate pattern (Wave 3)
- [x] 03.4-05-PLAN.md - Contracts and procedures for aggregate API (Wave 3)
- [x] 03.4-06-PLAN.md - Frontend store and hooks for aggregate (Wave 4)
- [x] 03.4-07-PLAN.md - Integration and UAT verification (Wave 5)
- [ ] 03.4-08-PLAN.md - [GAP CLOSURE] Fix prescription unit, superset UX, Base UI warning (Wave 6)

### Phase 4: Athlete PWA
**Goal**: Athletes can view assigned programs and log workout execution on mobile
**Depends on**: Phase 3.4
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, PWA-06, PWA-07, PWA-08, PWA-09, PWA-10, ATH-08
**Success Criteria** (what must be TRUE):
  1. Athlete can view assigned program and see next/upcoming workout on mobile device
  2. Athlete can log workout execution with pre-filled planned values (one-tap if matching plan)
  3. Athlete can modify logged values when actual differs from plan and add comments
  4. System maintains clear separation between plan (what coach prescribed) and log (what athlete did)
  5. Athlete can view past workout logs, use rest timer between sets, and view exercise demo videos
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Dashboard & Analytics
**Goal**: Coaches can view centralized dashboard with athlete compliance, pending items, and plan vs log comparison
**Depends on**: Phase 4
**Requirements**: DSH-01, DSH-02, DSH-03, DSH-04, DSH-05, DSH-06, EXP-01, EXP-02, ADM-01, ADM-02, ADM-03
**Success Criteria** (what must be TRUE):
  1. Coach can view dashboard showing athletes needing updated programs, recent activity, and pending items
  2. Coach can navigate from dashboard directly to athlete profiles and programs
  3. Coach can view Plan vs Log comparison showing what was prescribed vs what athlete actually did
  4. Coach can export program data as CSV or JSON
  5. Platform admin can view platform-wide metrics and manage subscription plans
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 2.5 -> 2.6 -> 3 -> 3.1 -> 3.2 -> 3.3 -> 3.4 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Multi-Tenancy (backend) | 7/7 | Complete | 2026-01-24 |
| 2. Exercise Library & Athlete Management (backend) | 11/11 | Complete | 2026-01-24 |
| 2.5. Coach Web Foundation (frontend) | 11/11 | Complete | 2026-01-25 |
| 2.6. Design System & Visual Refresh (frontend) | 4/4 | Complete | 2026-01-25 |
| 3. Program Builder (full-stack) | 15/16 | In progress | - |
| 3.1. Custom Program Grid (frontend) | 17/17 | Complete | 2026-01-25 |
| 3.2. Prescription Data Structure Refactor (full-stack) | 8/8 | Complete | 2026-01-25 |
| 3.3. Program Builder QA & Bug Fixes (frontend) | 8/8 | Partial | 2026-01-26 |
| 3.4. Domain Restructure (full-stack) | 8/8 | Complete | 2026-01-27 |
| 4. Athlete PWA (full-stack) | 0/3 | Not started | - |
| 5. Dashboard & Analytics (full-stack) | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-23*
*Last updated: 2026-01-27 (Phase 3.4 complete)*
