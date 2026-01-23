# Requirements: Strenly

**Defined:** 2026-01-23
**Core Value:** Coaches can create and edit training programs as fast as they can in Excel

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Platform

- [ ] **AUTH-01**: User can create account with email/password
- [ ] **AUTH-02**: User can create account with Google OAuth
- [ ] **AUTH-03**: User can log in and stay logged in across sessions
- [ ] **AUTH-04**: User can reset password via email
- [ ] **AUTH-05**: User can log out from any page

### Organization & Multi-Tenancy

- [ ] **ORG-01**: User can create organization during onboarding (Independent Coach or Gym type)
- [ ] **ORG-02**: Organization data is isolated (cannot access other organizations' data)
- [ ] **ORG-03**: Organization Owner can update organization details (name)
- [ ] **ORG-04**: Organization Owner can invite coaches to organization
- [ ] **ORG-05**: Organization Owner can assign roles (Admin, Coach)
- [ ] **ORG-06**: Organization Owner can remove coaches from organization
- [ ] **ORG-07**: User can belong to multiple organizations with different roles

### Subscription & Plans

- [ ] **SUB-01**: User must select subscription plan before creating organization
- [ ] **SUB-02**: System enforces feature limits based on active plan
- [ ] **SUB-03**: System enforces athlete limits based on active plan
- [ ] **SUB-04**: User can view current subscription status
- [ ] **SUB-05**: Plans can be configured differently for Coach vs Gym types

### Athlete Management

- [ ] **ATH-01**: Coach can create athlete profiles within organization
- [ ] **ATH-02**: Coach can view list of all athletes in organization
- [ ] **ATH-03**: Coach can update athlete profile (name, notes, injuries, goals)
- [ ] **ATH-04**: Coach can delete athlete profiles
- [ ] **ATH-05**: Coach can generate invitation link for athlete
- [ ] **ATH-06**: Athlete can link user account to profile via invitation
- [ ] **ATH-07**: Coach can operate fully without athletes having linked accounts
- [ ] **ATH-08**: Coach can log workouts on behalf of athletes

### Exercise Library

- [ ] **EXR-01**: System provides curated exercise database (150-200 exercises)
- [ ] **EXR-02**: Coach can search and select exercises from database
- [ ] **EXR-03**: Coach can create custom exercises (name, muscles, pattern)
- [ ] **EXR-04**: Exercises have muscle group mappings (primary, secondary)
- [ ] **EXR-05**: Exercises have movement pattern classification
- [ ] **EXR-06**: Exercises can have demo video links

### Program Creation (Excel-Like Experience)

- [ ] **PRG-01**: Coach can create training programs
- [ ] **PRG-02**: Coach can assign programs to athletes
- [ ] **PRG-03**: Coach can edit programs using inline editing (click to edit, no modals)
- [ ] **PRG-04**: Coach can navigate grid with keyboard (arrow keys, tab, enter)
- [ ] **PRG-05**: Coach can see full cycle view (4-6 weeks at once)
- [ ] **PRG-06**: Coach can view 3+ prescription params per exercise (sets, reps, weight, intensity, rest)
- [ ] **PRG-07**: Coach can type natural notation that parses to structure (`3x8@120kg`, `3x8@RIR2`, `4x6-8@75%`)
- [ ] **PRG-08**: Coach can duplicate entire programs
- [ ] **PRG-09**: Coach can duplicate weeks within programs
- [ ] **PRG-10**: Coach can add sessions (training days) to programs
- [ ] **PRG-11**: Coach can add exercises to sessions
- [ ] **PRG-12**: Programs remain editable at any time (living documents)
- [ ] **PRG-13**: Changes to programs are visible to athletes quickly

### Prescription System

- [ ] **RX-01**: Coach can specify sets (number)
- [ ] **RX-02**: Coach can specify reps (fixed number or range: 8-12)
- [ ] **RX-03**: Coach can specify AMRAP sets
- [ ] **RX-04**: Coach can specify intensity via RIR (Reps in Reserve)
- [ ] **RX-05**: Coach can specify intensity via RPE
- [ ] **RX-06**: Coach can specify intensity via %1RM or %TM
- [ ] **RX-07**: Coach can specify absolute weight (kg)
- [ ] **RX-08**: Coach can specify rest periods (seconds)
- [ ] **RX-09**: Coach can specify tempo (optional, 4-digit ECCC notation)
- [ ] **RX-10**: Coach can group exercises as supersets (A1/A2 notation)
- [ ] **RX-11**: Coach can add notes/cues per exercise

### Templates

- [ ] **TPL-01**: Coach can save programs as templates
- [ ] **TPL-02**: Coach can create new programs from templates
- [ ] **TPL-03**: Templates can have metadata (name, description, days/week)
- [ ] **TPL-04**: Templates are private to organization

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

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-* | Phase 1 | Pending |
| ORG-* | Phase 1 | Pending |
| SUB-* | Phase 1 | Pending |
| ATH-* | Phase 2 | Pending |
| EXR-* | Phase 2 | Pending |
| PRG-* | Phase 3 | Pending |
| RX-* | Phase 3 | Pending |
| TPL-* | Phase 3 | Pending |
| DSH-* | Phase 4 | Pending |
| EXP-* | Phase 4 | Pending |
| PWA-* | Phase 5 | Pending |
| ADM-* | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 68 total
- Mapped to phases: 68
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-23*
*Last updated: 2026-01-23 after initial definition*
