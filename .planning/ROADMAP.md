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
- [ ] **Phase 3: Program Builder** - Excel-like grid editing, prescription system, templates (full-stack)
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
**Plans**: 9 plans in 5 waves

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
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD
- [ ] 03-04: TBD

### Phase 4: Athlete PWA
**Goal**: Athletes can view assigned programs and log workout execution on mobile
**Depends on**: Phase 3
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
  2. Coach can view Plan vs Log comparison showing what was prescribed vs what athlete actually did
  3. Coach can navigate from dashboard directly to athlete profiles and programs
  4. Coach can export program data as CSV or JSON
  5. Platform admin can view platform-wide metrics and manage subscription plans
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 2.5 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Multi-Tenancy (backend) | 7/7 | Complete | 2026-01-24 |
| 2. Exercise Library & Athlete Management (backend) | 11/11 | Complete | 2026-01-24 |
| 2.5. Coach Web Foundation (frontend) | 9/9 | Complete | 2026-01-24 |
| 3. Program Builder (full-stack) | 0/4 | Not started | - |
| 4. Athlete PWA (full-stack) | 0/3 | Not started | - |
| 5. Dashboard & Analytics (full-stack) | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-23*
*Last updated: 2026-01-24*
