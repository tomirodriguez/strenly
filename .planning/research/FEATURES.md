# Feature Landscape: Training Planning Platforms

**Domain:** Strength training coaching software (TrainHeroic, TrueCoach, TeamBuildr, Hevy Coach, BridgeAthletic)
**Researched:** 2026-01-23
**Confidence:** MEDIUM (verified against multiple sources, official docs, and user reviews)

---

## Table Stakes

Features users expect. Missing = coaches leave, athletes complain, product feels incomplete.

### Coach-Facing (Web/Desktop)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Program/workout builder** | Core product function - create training plans | High | Exercise library | Must support sets, reps, weight prescription |
| **Exercise library (500+ exercises)** | Coaches expect pre-built database with videos | Medium | None | Custom exercise creation required from day one |
| **Client/athlete management** | CRUD for athlete profiles, notes, history | Medium | Auth, multi-tenancy | Minimum: name, email, notes, injury history |
| **Template system** | Reuse programs without recreating | Medium | Program builder | Save, duplicate, customize templates |
| **Week/program duplication** | Copy previous weeks to iterate | Low | Program builder | Critical for periodization workflows |
| **Coach-athlete messaging** | In-app communication channel | Medium | Auth | All competitors have this; WhatsApp fallback acceptable for MVP |
| **Athlete progress/compliance dashboard** | See who logged, who's behind | Medium | Logging system | Non-negotiable for remote coaching |
| **Prescription flexibility** | Sets, reps, weight + at least one intensity method (RPE/RIR/%) | High | Data model | TrainHeroic limits to 2 params - known pain point |
| **Exercise notes/cues** | Per-exercise instructions for athletes | Low | Program builder | Text field sufficient |

### Athlete-Facing (Mobile/PWA)

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **View assigned workouts** | See what coach prescribed | Low | Program sync | Clear, day-by-day view |
| **Log workout execution** | Record actual weight/reps | Medium | Prescription data | Pre-fill from plan; modify as needed |
| **Pre-filled logging** | One-tap if matches plan | Low | Prescription data | Major UX improvement vs blank entry |
| **Rest timer** | Track rest between sets | Low | None | Built-in, not phone's timer app |
| **Exercise demo videos** | Know how to perform movements | Low | Exercise library | Link to video per exercise |
| **Past workout history** | Review previous sessions | Low | Log storage | Searchable by date/exercise |
| **Basic progress visualization** | See improvement over time | Medium | Log data | Simple line charts per exercise |

### Platform/Infrastructure

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Multi-tenancy** | Gym/coach data isolation | High | Database design | Organizations cannot access each other's data |
| **Role system** | Owner/Admin/Coach permissions | Medium | Auth | Minimum viable: Owner + Coach |
| **Athlete invitation flow** | Coach invites, athlete links | Medium | Auth | Link-based onboarding standard |
| **Mobile-responsive or native app** | Athletes train with phones | High | Frontend | PWA acceptable; native better for engagement |

---

## Differentiators

Features that set products apart. Not expected, but create competitive advantage.

### Strenly's Core Differentiators (from PRD)

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Excel-like editing speed** | Keyboard nav, inline editing, no modals | High | Custom grid component | PRIMARY DIFFERENTIATOR - competitors all slower than Excel |
| **Full cycle view** | See 4-6 week mesocycle at once | Medium | Grid UI | TrainHeroic: can't see full program; TeamBuildr: limited |
| **3+ visible prescription params** | Sets, reps, weight, RPE/RIR, rest all visible | Medium | Data model + UI | TrainHeroic limits to 2; TrueCoach unstructured |
| **Plan vs Log separation** | What coach prescribed != what athlete did | Medium | Data model | Enables analytics; most competitors conflate |
| **Structured data + analytics** | Volume per muscle, progression tracking | High | Exercise mapping | TrueCoach: total freedom but no analytics |

### Other High-Value Differentiators

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **PR detection and celebration** | Automatic recognition when athlete beats records | Medium | Log analysis | TrueCoach complaint: no PR celebration on repeat workouts |
| **Superset/giant set grouping** | A1/A2/A3 notation with visual grouping | Medium | Program builder | Universal need; execution varies |
| **Training Max support** | %TM for 5/3/1 and similar programs | Low | Per-athlete maxes | Niche but valued by serious coaches |
| **Rep range support** | 8-12 (not just fixed 10) | Low | Data model | Enables double progression tracking |
| **AMRAP tracking** | Log max reps; system detects performance | Medium | Rep type field | Critical for autoregulated programs |
| **Drag-and-drop program editing** | Reorder exercises, weeks, sessions | Medium | UI | TrainHeroic complaint: can't rearrange movements |
| **Data export (CSV/JSON)** | No vendor lock-in | Low | Export logic | Competitor complaint: no data portability |
| **Custom branding/white-label** | Coach's logo and colors | Medium | Theme system | TrueCoach and others offer; increases perceived value |
| **Wearable integration** | Apple Health, Garmin, WHOOP sync | High | API integrations | TrueCoach strength; defer for MVP |
| **Nutrition tracking** | Macros, meal plans | High | Separate module | TrainHeroic lacks entirely; TrueCoach has it |
| **Leaderboards** | Competition within team/gym | Medium | Group features | TrainHeroic strong; TrueCoach complaint: no inter-client features |
| **Video form checks** | Athlete uploads, coach reviews | High | Video storage | Storage/bandwidth complexity |
| **AI workout builder** | Auto-generate programs | Very High | ML/LLM | Emerging in 2025-2026; TrueCoach has it |
| **Practice planning integration** | Coordinate with team schedules | High | Calendar system | TeamBuildr unique feature (Oct 2025) |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain that add complexity without value.

### Avoid: Overengineered Complexity

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Forced periodization model** | Not all coaches use block periodization; some want simple weeks | Make blocks/mesocycles OPTIONAL; support Program > Week > Day directly |
| **Mandatory fields everywhere** | Slows down fast coaches | Required: exercise, sets. Optional: everything else |
| **Complex permission systems** | Most gyms need Owner + Coach only | Start simple (2-3 roles); expand if validated |
| **In-app video hosting** | Storage costs, bandwidth, moderation | Link to YouTube/Vimeo; athletes can share URLs |
| **Built-in payment processing** | Complex (especially Argentina), not core value | Defer; integrate external (MercadoPago) later |
| **Real-time chat/notifications** | Over-engineering for MVP; coaches use WhatsApp | Basic messaging; push notifications later |
| **Social features between athletes** | TrueCoach complaint but adds major complexity | Start with coach-athlete only; group features later |
| **Wearable data as core feature** | Integration maintenance burden; not core value | Defer entirely; focus on manual logging first |

### Avoid: Feature Creep Traps

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **CrossFit WOD programming** | Different model (AMRAP/For Time/EMOM for whole sessions) | Focus on strength training first; CrossFit is separate product |
| **Nutrition as primary feature** | Different expertise domain; dilutes focus | Omit for MVP; integrate MyFitnessPal later if needed |
| **Appointment/scheduling system** | Separate problem; many SaaS solutions exist | Don't compete with Calendly/Acuity; link externally |
| **CRM/sales funnel features** | Not core coaching value | Focus on plan creation; sales tools are separate |
| **Gamification (badges, XP, RPG)** | High effort, uncertain value | Defer until athlete engagement validated |
| **AI-generated programs** | Technically complex; trust issue with coaches | Focus on making human programming fast; AI later |

### Avoid: UX Mistakes Competitors Made

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Modal-heavy workflows** | Slow; breaks flow | Inline editing everywhere possible |
| **Click-intensive actions** | Excel is fast because it's keyboard-native | Keyboard shortcuts, tab/enter navigation |
| **Hiding prescription params** | TrainHeroic: only 2 visible | Show sets, reps, weight, intensity, rest in grid |
| **Forcing desktop for coaches** | TrueCoach complaint: can't program from phone | Responsive web; but accept desktop primary |
| **Athlete-only identity** | TrainHeroic: "athletes" off-putting to general clients | Use "athlete" internally; "client" in UI configurable |
| **Week rigidity** | TrainHeroic: can't add/remove weeks freely | Flexible week management; no settings tab detour |

---

## Feature Dependencies

```
Auth System
    |
    +-- Multi-tenancy (org isolation)
    |       |
    |       +-- Role System (Owner/Admin/Coach)
    |       |       |
    |       +-- Athlete Profiles
    |               |
    |               +-- Invitation Flow
    |
    +-- User Accounts
            |
            +-- Athlete App Access

Exercise Library
    |
    +-- Custom Exercises
    |
    +-- Muscle Group Mapping --> Volume Analytics
    |
    +-- Movement Patterns --> Exercise Substitution (future)

Program Builder
    |
    +-- Week/Session Structure
    |       |
    |       +-- Prescription Data Model
    |               |
    |               +-- Sets/Reps (required)
    |               +-- Intensity (RPE/RIR/%)
    |               +-- Tempo/Rest (optional)
    |               +-- Superset Grouping
    |
    +-- Template System --> Program Duplication
    |
    +-- Excel-like Grid UI (differentiator)

Workout Logging (Athlete)
    |
    +-- Pre-fill from Prescription
    |
    +-- Plan vs Log Separation --> Analytics
    |       |
    |       +-- PR Detection
    |       +-- Compliance Tracking
    |       +-- Progress Graphs
    |
    +-- Rest Timer
```

---

## MVP Recommendation

### Must Ship (Table Stakes)

1. **Coach Web App**
   - Program builder with inline editing (differentiator from day 1)
   - Exercise library (150-200 curated + custom allowed)
   - Athlete profile management
   - Template save/duplicate
   - Basic compliance dashboard

2. **Athlete PWA**
   - View assigned workout
   - Log sets with pre-fill
   - Rest timer
   - Past workout history

3. **Platform**
   - Auth (email + OAuth)
   - Multi-tenancy (organization isolation)
   - Basic roles (Owner, Coach)
   - Athlete invitation flow

### Ship Early (Low-Effort Differentiators)

- Rep ranges (not just fixed reps)
- 3+ visible prescription params
- PR detection
- Superset grouping (A1/A2)
- Plan vs Log separation
- CSV export

### Defer to Post-MVP

| Feature | Reason to Defer |
|---------|-----------------|
| AI workout builder | Complex; focus on fast manual creation |
| Nutrition tracking | Separate domain; use MyFitnessPal integration later |
| Wearable integrations | Maintenance burden; not core value |
| Video hosting | Storage/bandwidth costs |
| Advanced gamification | Uncertain value; validate athlete engagement first |
| Payment processing | Argentina-specific complexity; bypass for beta |
| White-label branding | Nice-to-have; not blocking adoption |
| Leaderboards | Requires group features; start with individual |
| Practice planning | TeamBuildr niche; not relevant for target users |

---

## Sources

### Official Platform Documentation
- [TrainHeroic Coach Features](https://www.trainheroic.com/coach/)
- [TrueCoach Features](https://truecoach.co/features/)
- [TeamBuildr Platform](https://www.teambuildr.com/)
- [Hevy Coach Features](https://hevycoach.com/)
- [BridgeAthletic](https://www.bridgeathletic.com/)

### Reviews and Comparisons
- [PT Pioneer TrainHeroic Review](https://www.ptpioneer.com/personal-training/tools/train-heroic-review/)
- [TrueCoach vs TrainHeroic](https://truecoach.co/truecoach-vs-trainheroic/)
- [TeamBuildr vs TrainHeroic](https://www.teambuildr.com/trainheroic-vs-teambuildr)
- [GetApp TrueCoach Reviews](https://www.getapp.com/recreation-wellness-software/a/truecoach/)
- [Software Advice Reviews](https://www.softwareadvice.com/fitness/trainheroic-profile/)

### Industry Analysis
- [Coaching Software Comparison 2025](https://joinit.com/blog/best-coaching-software)
- [Best Personal Training Software 2025](https://blog.trainero.com/the-complete-2026-guide-to-personal-trainer-software-features-pricing-how-to-choose-the-right-platform/)
- [QuickCoach on Bloated Software](https://quickcoach.fit/)

### Project-Specific Context
- `docs/prd.md` - Strenly PRD with competitive analysis
- `docs/domain-research-strength-training.md` - Prescription methods and data model decisions
