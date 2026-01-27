# Requirements: Strenly

**Defined:** 2026-01-23
**Core Value:** Coaches can create and edit training programs as fast as they can in Excel

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Platform

- [x] **AUTH-01**: User can create account with email/password
- [x] **AUTH-02**: User can create account with Google OAuth
- [x] **AUTH-03**: User can log in and stay logged in across sessions
- [x] **AUTH-04**: User can reset password via email
- [x] **AUTH-05**: User can log out from any page

### Organization & Multi-Tenancy

- [x] **ORG-01**: User can create organization during onboarding (Independent Coach or Gym type)
- [x] **ORG-02**: Organization data is isolated (cannot access other organizations' data)
- [x] **ORG-03**: Organization Owner can update organization details (name)
- [x] **ORG-04**: Organization Owner can invite coaches to organization
- [x] **ORG-05**: Organization Owner can assign roles (Admin, Coach)
- [x] **ORG-06**: Organization Owner can remove coaches from organization
- [x] **ORG-07**: User can belong to multiple organizations with different roles

### Subscription & Plans

- [x] **SUB-01**: User must select subscription plan before creating organization
- [x] **SUB-02**: System enforces feature limits based on active plan
- [x] **SUB-03**: System enforces athlete limits based on active plan
- [x] **SUB-04**: User can view current subscription status
- [x] **SUB-05**: Plans can be configured differently for Coach vs Gym types

### Athlete Management

- [x] **ATH-01**: Coach can create athlete profiles within organization
- [x] **ATH-02**: Coach can view list of all athletes in organization
- [x] **ATH-03**: Coach can update athlete profile (name, notes, injuries, goals)
- [x] **ATH-04**: Coach can delete athlete profiles
- [x] **ATH-05**: Coach can generate invitation link for athlete
- [x] **ATH-06**: Athlete can link user account to profile via invitation
- [x] **ATH-07**: Coach can operate fully without athletes having linked accounts
- [ ] **ATH-08**: Coach can log workouts on behalf of athletes

### Exercise Library

- [x] **EXR-01**: System provides curated exercise database (150-200 exercises)
- [x] **EXR-02**: Coach can search and select exercises from database
- [x] **EXR-03**: Coach can create custom exercises (name, muscles, pattern)
- [x] **EXR-04**: Exercises have muscle group mappings (primary, secondary)
- [x] **EXR-05**: Exercises have movement pattern classification
- [x] **EXR-06**: Exercises can have demo video links

### Program Creation (Excel-Like Experience)

- [x] **PRG-01**: Coach can create training programs
- [x] **PRG-02**: Coach can assign programs to athletes
- [x] **PRG-03**: Coach can edit programs using inline editing (click to edit, no modals)
- [x] **PRG-04**: Coach can navigate grid with keyboard (arrow keys, tab, enter)
- [x] **PRG-05**: Coach can see full cycle view (4-6 weeks at once)
- [x] **PRG-06**: Coach can view 3+ prescription params per exercise (sets, reps, weight, intensity, rest)
- [x] **PRG-07**: Coach can type natural notation that parses to structure (`3x8@120kg`, `3x8@RIR2`, `4x6-8@75%`)
- [x] **PRG-08**: Coach can duplicate entire programs
- [x] **PRG-09**: Coach can duplicate weeks within programs
- [x] **PRG-10**: Coach can add sessions (training days) to programs
- [x] **PRG-11**: Coach can add exercises to sessions
- [x] **PRG-12**: Programs remain editable at any time (living documents)
- [x] **PRG-13**: Changes to programs are visible to athletes quickly

### Prescription System

- [x] **RX-01**: Coach can specify sets (number)
- [x] **RX-02**: Coach can specify reps (fixed number or range: 8-12)
- [x] **RX-03**: Coach can specify AMRAP sets
- [x] **RX-04**: Coach can specify intensity via RIR (Reps in Reserve)
- [x] **RX-05**: Coach can specify intensity via RPE
- [x] **RX-06**: Coach can specify intensity via %1RM or %TM
- [x] **RX-07**: Coach can specify absolute weight (kg)
- [x] **RX-08**: Coach can specify rest periods (seconds)
- [x] **RX-09**: Coach can specify tempo (optional, 4-digit ECCC notation)
- [x] **RX-10**: Coach can group exercises as supersets (A1/A2 notation)
- [x] **RX-11**: Coach can add notes/cues per exercise

### Templates

- [x] **TPL-01**: Coach can save programs as templates
- [x] **TPL-02**: Coach can create new programs from templates
- [x] **TPL-03**: Templates can have metadata (name, description, days/week)
- [x] **TPL-04**: Templates are private to organization

### Dashboard & Compliance

- [ ] **DSH-01**: Coach can view dashboard with centralized information
- [ ] **DSH-02**: Dashboard shows athletes needing updated programs
- [ ] **DSH-03**: Dashboard shows recent athlete activity
- [ ] **DSH-04**: Dashboard shows pending items requiring attention
- [ ] **DSH-05**: Coach can navigate from dashboard to athlete/program
- [ ] **DSH-06**: Coach can view Plan vs Log comparison (what prescribed vs what athlete did)

### Data Export

- [ ] **EXP-01**: Coach can export program data as CSV
- [ ] **EXP-02**: Coach can export program data as JSON

### Athlete PWA

- [ ] **PWA-01**: Athlete can view assigned program
- [ ] **PWA-02**: Athlete can view next/upcoming workout
- [ ] **PWA-03**: Athlete can log workout execution (actual sets, reps, weight)
- [ ] **PWA-04**: Workout log is pre-filled with planned prescription
- [ ] **PWA-05**: Athlete can modify logged values when actual differs from plan
- [ ] **PWA-06**: Athlete can add comments per exercise or session
- [ ] **PWA-07**: System maintains separation between plan and log (Plan vs Log)
- [ ] **PWA-08**: Athlete can view past workout logs
- [ ] **PWA-09**: Athlete can use rest timer between sets
- [ ] **PWA-10**: Athlete can view exercise demo videos (links)

### Platform Admin

- [ ] **ADM-01**: Platform admin can view platform-wide metrics
- [ ] **ADM-02**: Platform admin can create/edit subscription plans
- [ ] **ADM-03**: Platform admin can modify plan pricing and limits

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Athlete Experience Enhancements

- **PWA-V2-01**: Automatic PR detection when athlete beats previous records
- **PWA-V2-02**: PR celebration notification
- **PWA-V2-03**: Basic progress graphs (weight progression per exercise)
- **PWA-V2-04**: RPE/RIR logging per set

### Coach Experience Enhancements

- **PRG-V2-01**: Drag-and-drop reordering of exercises
- **PRG-V2-02**: Drag-and-drop reordering of sessions/weeks
- **PRG-V2-03**: White-label branding (logo, colors)
- **PRG-V2-04**: Advanced analytics (volume per muscle group, progression tracking)

### Platform Enhancements

- **PLT-V2-01**: In-app coach-athlete messaging
- **PLT-V2-02**: Push notifications
- **PLT-V2-03**: Payment processing integration

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| In-app messaging | WhatsApp/existing channels work; adds complexity |
| Video hosting/form checks | Storage/bandwidth costs; defer to video links |
| Wearable integrations | Maintenance burden; not core value |
| Nutrition tracking | Different domain; use MyFitnessPal integration later |
| Gamification (badges, XP, RPG) | High effort, uncertain value; validate engagement first |
| AI workout generation | Complex; focus on fast manual creation |
| Payment processing (MVP) | Argentina complexity; bypass for beta |
| CrossFit WOD programming | Different model; separate product consideration |
| Real-time chat | Over-engineering; basic notifications sufficient |
| Appointment scheduling | Separate problem; link to Calendly externally |
| Mobile coach programming | Desktop primary for Excel-like experience; responsive acceptable |

## Traceability

Phase mappings for all v1 requirements.

### Phase 1: Foundation & Multi-Tenancy

| Requirement | Description | Status |
|-------------|-------------|--------|
| AUTH-01 | User can create account with email/password | Complete |
| AUTH-02 | User can create account with Google OAuth | Complete |
| AUTH-03 | User can log in and stay logged in across sessions | Complete |
| AUTH-04 | User can reset password via email | Complete |
| AUTH-05 | User can log out from any page | Complete |
| ORG-01 | User can create organization during onboarding | Complete |
| ORG-02 | Organization data is isolated | Complete |
| ORG-03 | Organization Owner can update organization details | Complete |
| ORG-04 | Organization Owner can invite coaches | Complete |
| ORG-05 | Organization Owner can assign roles | Complete |
| ORG-06 | Organization Owner can remove coaches | Complete |
| ORG-07 | User can belong to multiple organizations | Complete |
| SUB-01 | User must select subscription plan before creating org | Complete |
| SUB-02 | System enforces feature limits based on plan | Complete |
| SUB-03 | System enforces athlete limits based on plan | Complete |
| SUB-04 | User can view current subscription status | Complete |
| SUB-05 | Plans can be configured by org type | Complete |

### Phase 2: Exercise Library & Athlete Management

| Requirement | Description | Status |
|-------------|-------------|--------|
| ATH-01 | Coach can create athlete profiles | Complete |
| ATH-02 | Coach can view list of all athletes | Complete |
| ATH-03 | Coach can update athlete profile | Complete |
| ATH-04 | Coach can delete athlete profiles | Complete |
| ATH-05 | Coach can generate invitation link | Complete |
| ATH-06 | Athlete can link user account via invitation | Complete |
| ATH-07 | Coach can operate without athlete accounts | Complete |
| EXR-01 | System provides curated exercise database | Complete |
| EXR-02 | Coach can search and select exercises | Complete |
| EXR-03 | Coach can create custom exercises | Complete |
| EXR-04 | Exercises have muscle group mappings | Complete |
| EXR-05 | Exercises have movement pattern classification | Complete |
| EXR-06 | Exercises can have demo video links | Complete |

### Phase 3: Program Builder

| Requirement | Description | Status |
|-------------|-------------|--------|
| PRG-01 | Coach can create training programs | Complete |
| PRG-02 | Coach can assign programs to athletes | Complete |
| PRG-03 | Coach can edit programs using inline editing | Complete |
| PRG-04 | Coach can navigate grid with keyboard | Complete |
| PRG-05 | Coach can see full cycle view | Complete |
| PRG-06 | Coach can view 3+ prescription params | Complete |
| PRG-07 | Coach can type natural notation | Complete |
| PRG-08 | Coach can duplicate entire programs | Complete |
| PRG-09 | Coach can duplicate weeks | Complete |
| PRG-10 | Coach can add sessions to programs | Complete |
| PRG-11 | Coach can add exercises to sessions | Complete |
| PRG-12 | Programs remain editable at any time | Complete |
| PRG-13 | Changes visible to athletes quickly | Complete |
| RX-01 | Coach can specify sets | Complete |
| RX-02 | Coach can specify reps (fixed or range) | Complete |
| RX-03 | Coach can specify AMRAP sets | Complete |
| RX-04 | Coach can specify intensity via RIR | Complete |
| RX-05 | Coach can specify intensity via RPE | Complete |
| RX-06 | Coach can specify intensity via %1RM or %TM | Complete |
| RX-07 | Coach can specify absolute weight | Complete |
| RX-08 | Coach can specify rest periods | Complete |
| RX-09 | Coach can specify tempo | Complete |
| RX-10 | Coach can group exercises as supersets | Complete |
| RX-11 | Coach can add notes/cues per exercise | Complete |
| TPL-01 | Coach can save programs as templates | Complete |
| TPL-02 | Coach can create programs from templates | Complete |
| TPL-03 | Templates can have metadata | Complete |
| TPL-04 | Templates are private to organization | Complete |

### Phase 4: Athlete PWA

| Requirement | Description | Status |
|-------------|-------------|--------|
| PWA-01 | Athlete can view assigned program | Pending |
| PWA-02 | Athlete can view next/upcoming workout | Pending |
| PWA-03 | Athlete can log workout execution | Pending |
| PWA-04 | Workout log pre-filled with plan | Pending |
| PWA-05 | Athlete can modify logged values | Pending |
| PWA-06 | Athlete can add comments | Pending |
| PWA-07 | System maintains plan vs log separation | Pending |
| PWA-08 | Athlete can view past workout logs | Pending |
| PWA-09 | Athlete can use rest timer | Pending |
| PWA-10 | Athlete can view exercise demo videos | Pending |
| ATH-08 | Coach can log workouts on behalf of athletes | Pending |

### Phase 5: Dashboard & Analytics

| Requirement | Description | Status |
|-------------|-------------|--------|
| DSH-01 | Coach can view dashboard | Pending |
| DSH-02 | Dashboard shows athletes needing programs | Pending |
| DSH-03 | Dashboard shows recent athlete activity | Pending |
| DSH-04 | Dashboard shows pending items | Pending |
| DSH-05 | Coach can navigate from dashboard | Pending |
| DSH-06 | Coach can view Plan vs Log comparison | Pending |
| EXP-01 | Coach can export program data as CSV | Pending |
| EXP-02 | Coach can export program data as JSON | Pending |
| ADM-01 | Platform admin can view metrics | Pending |
| ADM-02 | Platform admin can create/edit plans | Pending |
| ADM-03 | Platform admin can modify plan pricing | Pending |

### Coverage Summary

| Phase | Requirements | Count |
|-------|--------------|-------|
| Phase 1 | AUTH-01 to AUTH-05, ORG-01 to ORG-07, SUB-01 to SUB-05 | 17 |
| Phase 2 | ATH-01 to ATH-07, EXR-01 to EXR-06 | 13 |
| Phase 3 | PRG-01 to PRG-13, RX-01 to RX-11, TPL-01 to TPL-04 | 28 |
| Phase 4 | PWA-01 to PWA-10, ATH-08 | 11 |
| Phase 5 | DSH-01 to DSH-06, EXP-01 to EXP-02, ADM-01 to ADM-03 | 11 |
| **Total** | | **80** |

**Coverage:**
- v1 requirements: 80 total
- Mapped to phases: 80
- Unmapped: 0

---
*Requirements defined: 2026-01-23*
*Last updated: 2026-01-27 after Phase 3.4 completion*
