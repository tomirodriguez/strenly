---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain-skipped', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
status: complete
completedAt: 2026-01-17
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-strenly-ai-2026-01-16.md
documentCounts:
  briefCount: 1
projectType: greenfield
workflowType: 'prd'
date: 2026-01-16
author: Tomi
project_name: strenly-ai
document_output_language: English
classification:
  projectType: SaaS B2B
  domain: General (Fitness/Strength Training)
  complexity: Medium-High
  complexityRationale: Technical implementation challenges (multi-tenancy, coach-athlete sync, Excel-like UX, PWA offline capabilities)
  projectContext: greenfield
---

# Product Requirements Document - Strenly

**Author:** Tomi
**Date:** 2026-01-16
**Version:** 1.0

---

## Executive Summary

**Strenly** is a training planning and management platform for strength training coaches. It solves a specific market gap: existing apps offer centralization but make planning tedious, while Excel/Sheets are fast but scattered. Strenly combines the centralization benefits of dedicated apps with the planning velocity of spreadsheets.

**Target Users:**
- Independent strength coaches (15-50 athletes)
- Small/medium gyms (2-10 coaches, 50-200 athletes)
- Starting with Argentine market

**Core Value Proposition:**
- Coach Web App with Excel-like inline editing for fast plan creation
- Athlete PWA for viewing plans and logging workouts
- Centralized dashboard without sacrificing workflow speed
- Plan vs Log separation: what coach prescribed ≠ what athlete executed

**Project Context:** Greenfield personal project. Success = product validation with 5 beta coaches, not commercial metrics.

---

## Success Criteria

### User Success

**Coach Success:**
- **Workflow velocity:** Plan creation and editing feels comparable to Excel - inline editing, no unnecessary modals, fluid navigation
- **Only acceptable overhead:** Save button (mitigable with keyboard shortcut)
- **"Aha!" moment:** Coach sees value in centralized dashboard - athlete overview, history, pending items - without sacrificing creation agility
- **Key indicator:** Coach chooses Strenly over Excel for daily work and reports it via direct feedback

**Athlete Success:**
- **First impression:** Professional app, branded with gym identity, visually attractive - something they want to use
- **Clarity:** Know what to do today without friction
- **Painless tracking:** Log sets/reps as easy as filling an Excel cell
- **Differential value:** See their progress (stats, PRs, gamification) - things Excel doesn't offer
- **Plan vs Log separation:** Athlete records what they did without overwriting what coach planned

### Business Success

**Context:** This is a personal project. Commercial success is secondary to product validation.

**Primary Success (Validation):**
- Functional product that materializes the founder's vision
- 5 coaches in beta actively using and giving feedback
- Positive qualitative feedback: "this works for me" > "I prefer Excel"
- Coach adopts Strenly as primary planning method

**Secondary Success (Nice to Have):**
- Monetization potential validated (coaches willing to pay)
- Foundation for passive income in the future
- Organic growth without aggressive marketing

### Technical Success

**Medium-high complexity challenges:**
- Functional multi-tenancy with data isolation per organization
- Excel-like experience on web (inline editing, keyboard navigation, no perceptible lag)
- Coach → Athlete sync (changes visible quickly)
- PWA with basic offline capabilities for athletes at the gym
- Architecture supporting Plan vs Log separation

### Measurable Outcomes

| Metric | Target | How Measured |
|--------|--------|--------------|
| Coaches in beta | 5 | Direct count |
| Adoption | Coach uses Strenly as primary method | Qualitative feedback |
| Coach satisfaction | "This works" > "I prefer Excel" | Direct interviews |
| Edit velocity | Comparable to Excel (no perceived friction) | User testing |
| Plan/Log separation | Functional and useful | Athlete feedback |

---

## User Journeys

### Journey 1: Martín - Coach Remoto (Planificación Semanal)

**Persona:** Martín, 32 years old, independent coach with 15-30 online athletes.

**Context:** His current workflow with Google Drive works. He has a folder with spreadsheets per athlete. He's not "suffering" - but there are subtle frictions.

**The Journey with Strenly:**

Sunday morning. Martín opens Strenly on his laptop. Instead of a Drive folder with 20+ files, he sees a dashboard. At a glance he knows: 5 athletes need new plans this week, 3 have pending notes to review, everyone else is up to date.

He decides to work only on pending ones today. Opens the first, duplicates the previous week, adjusts loads based on athlete feedback. Editing is inline, like Excel. In 10 minutes he has 3 plans ready. The other 2 he leaves for tomorrow - Strenly will remind him.

**"This is better" moment:** It wasn't the plan creation (that's the same as Excel). It was seeing everything organized, knowing exactly what to do, and being able to choose how much to work today without losing anything.

**Capabilities revealed:** Dashboard with pending items, week duplication, inline editing, reminder system.

---

### Journey 2: Recreational Athlete (Training Day)

**Persona:** 28-year-old athlete, trains 4x/week, intermediate level.

**Context:** Today they have a Drive link with tabs per cycle. It works to see what to do. But it doesn't feel like "their" training app.

**The Journey with Strenly:**

Arrives at the gym, opens the app on their phone. Sees their next workout highlighted. Taps and sees the day's exercises with sets, reps, and prescribed weight.

Starts training. Each set they complete, they tap "done" - the plan is pre-loaded, so if they did exactly what was prescribed, it's one click. Bench press felt heavy - they modify the actual weight and add RPE 9. On the last set of squats they got 2 extra reps - they note it.

When finished, they see they achieved a PR in squat weight. The app celebrates it. They can see their progression from the last weeks in a simple graph.

**"This is better" moment:** The feeling. It's THEIR app, not a shared Excel. Seeing the automatic PR. Feeling like they're using something professional.

**Capabilities revealed:** Next workout view, logging with plan pre-load, real value modification, PR detection, progress visualization.

---

### Journey 3: New Athlete Onboarding

**Situation:** Coach has a new athlete they want to add to Strenly.

**The Journey:**

1. Coach opens Strenly, goes to "Add Athlete"
2. Creates profile: name, basic data, relevant notes (injuries, goals)
3. The athlete exists in the system but without a linked account
4. Coach can create plans and logs without athlete having the app
5. When they want to give access: generates invitation link
6. Athlete receives link, creates account (or uses existing), gets linked
7. Athlete now sees their plans in the app

**Key point:** The athlete app is optional. The coach has full control regardless.

**Capabilities revealed:** Profile creation, invitations, account linking, coach can operate without active athlete.

---

### Journey 4: Gym Owner with Multiple Coaches

**Persona:** Laura, owner of a small gym with 3 coaches and 80 athletes.

**The Journey:**

Laura sets up her gym as an organization in Strenly. She assigns herself as Owner. She invites her 3 coaches with "Coach" role - they can see athletes and create plans, but don't access business metrics or billing.

One of the coaches, who also helps with admin, gets dual role: Coach + Admin. They can manage other coaches and see metrics.

From her Owner dashboard, Laura sees: how many active athletes, retention, team's pending plans. Coaches only see their athletes and tasks.

**Capabilities revealed:** Multi-tenancy, role system (Owner/Admin/Coach), granular permissions, dashboard per role.

---

### Journey Requirements Summary

| Journey | Capabilities Revealed |
|---------|----------------------|
| Coach - Planning | Dashboard, duplication, inline editing, reminders |
| Athlete - Training | Next workout view, pre-loaded logging, PRs, graphs |
| Athlete Onboarding | Profiles, invitations, linking, coach-only mode |
| Multi-Coach Gym | Multi-tenancy, roles, permissions, dashboards per role |

---

## Innovation & Novel Patterns

### Core Innovation

Strenly's innovation is not a single breakthrough feature, but a unique positioning in the market:

**The Problem with Current Solutions:**
- **Excel/Sheets:** Fast and flexible for planning, but no centralization, no athlete experience, scattered data
- **Existing Apps:** Centralized and professional, but planning workflow is tedious → coaches revert to Excel

**Strenly's Innovation:**
Combining the centralization benefits of dedicated apps with the planning velocity of spreadsheets.

**What This Means:**
- Everything in one place: athletes, plans, logs, gym admin, all interconnected
- Without making the planning process tedious
- Coach gets dashboard benefits WITHOUT sacrificing their familiar fast workflow

### Differentiation Summary

| Aspect | Excel | Other Apps | Strenly |
|--------|-------|------------|---------|
| Planning Speed | Fast | Slow/Tedious | Fast |
| Centralization | None | Yes | Yes |
| Athlete Experience | Poor | Good | Good |
| Interconnected Data | No | Yes | Yes |

### Validation Approach

- Beta coaches confirm: "Planning feels as fast as Excel"
- Beta coaches confirm: "I see value in centralization without sacrificing workflow"
- Direct feedback comparison: "This is better than Excel because X, without losing Y"

---

## SaaS B2B Platform Requirements

### Multi-Tenancy Model

**Tenant Structure:**
- **Tenant = Organization** (Gym or Independent Coach)
- Organizations are isolated - data never crosses organization boundaries
- Athletes belong to one organization at a time (but user account can be in multiple orgs)

**Organization Types:**
| Type | Description | Typical Size |
|------|-------------|--------------|
| Independent Coach | Solo coach, owns their organization | 1 coach, 10-50 athletes |
| Gym | Multi-coach organization | 2-10 coaches, 50-200 athletes |

Both types use the same underlying model - distinction is for plan filtering and UX.

### Role & Permission Model

**Organization Roles:**
| Role | Permissions |
|------|-------------|
| **Owner** | Full access - all features, settings, billing, can delete org |
| **Admin** | Manage coaches, view org metrics, billing - cannot train athletes |
| **Coach** | Create plans, manage assigned athletes - no business metrics |

- Users can have multiple roles (e.g., Admin + Coach)
- Owner is assigned at org creation, cannot be removed

**Platform Role (Global):**
| Role | Permissions |
|------|-------------|
| **Platform Admin** | View all platform data, manage subscription plans, pricing, global settings |

### Subscription & Billing Model

**Subscription Structure:**
- Monthly billing cycle
- Tiers based on: athlete limits, feature access
- Plans filterable by organization type (Coach vs Gym)
- Free tier option (configurable)
- Features and limitations enforced at plan level from day one

**Onboarding Flow:**
1. User creates account (email/password or OAuth)
2. Selects organization type: Independent Coach or Gym
3. **Must select plan** before proceeding (no credit card for free tier)
4. Creates organization (name, basic setup)
5. Enters app with active subscription

**Subscription Enforcement:**
- App locked without active subscription
- Trial periods supported (configurable per plan)
- Expired subscriptions → limited access or lock screen

**Platform Admin Capabilities:**
- View platform metrics (active plans, subscriptions, coaches, gyms, athletes)
- Create/edit subscription plans and pricing
- View subscription status across all organizations

### Data Migration Strategy

**Excel Migration (Critical for Adoption):**
- Coaches have existing data in Excel/Sheets - cannot lose this
- **MVP Approach:** Manual migration
  - Coach sends their Excel format
  - We serialize/transform to Strenly format
  - No standard template expected
- **Future:** AI-powered migration automation
- This is an onboarding feature, not an integration

### Integration Strategy

**MVP:** No external integrations
- No wearables (Garmin, Apple Watch, etc.)
- No calendar sync
- No payment processor integration (billing handled externally initially)

**Post-MVP Considerations:**
- Payment processing integration (TBD - requires research for Argentina-compatible options)
- Calendar sync (Google Calendar, etc.)
- Wearable data import (if demand validated)

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Full Product Validation
- Not a "thin slice" MVP - this is a complete product for validation
- 5 beta coaches need the full experience to give meaningful feedback
- Payment processing deferred, subscription structure in place with free tier/bypass

**Resource Context:** Solo developer, side project
- Everything is essential, but athlete app can ship last
- Excel migration deferred to end or post-MVP

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
| Journey | MVP Support |
|---------|-------------|
| Coach Planning | Full - Excel-like creation, templates, duplication |
| Athlete Training | Full - View plans, log workouts, see progress |
| Athlete Onboarding | Full - Invitations, account linking |
| Multi-Coach Gym | Full - Roles, permissions, org management |

**Must-Have Capabilities:**

**Coach Web App:**
- Authentication (email/OAuth)
- Organization creation (Coach vs Gym type)
- Plan selection (subscription tiers exist, payments bypassed)
- Athlete profile management (CRUD)
- Plan/Program creation with Excel-like editing
- Template system (create, save, reuse)
- Week/cycle duplication
- Exercise database with selection
- Dashboard with pending items, athlete overview
- Invite athletes (generate link)
- View athlete logs (what they actually did)
- Plan vs Log comparison view

**Athlete PWA:**
- Authentication via invitation link
- View assigned plan / next workout
- Log workout (pre-filled from plan, modify as needed)
- RPE/comments per exercise
- View past logs
- Basic progress visualization (PRs, simple graphs)

**Platform Infrastructure:**
- Multi-tenancy (organization isolation)
- Role system (Owner/Admin/Coach)
- Subscription plans structure (tiers, limits - payments bypassed)
- Platform Admin dashboard (view metrics, manage plans)

**Onboarding:**
- User signup → type selection → plan selection → org creation
- Athlete invitation flow

### MVP Release Sequence

Suggested order for development:
1. Auth + Org + Plans structure (foundation)
2. Exercise database + Templates (content)
3. Plan creation with Excel-like editing (core value)
4. Dashboard + Athlete management (coach complete)
5. Athlete PWA (athlete experience)
6. Invitations + Linking (connection)
7. Logging + Plan vs Log (full loop)
8. *(Optional/Final)* Excel migration - if demand exists

### Phase 2: Growth (Post-MVP)

**Payment & Billing:**
- Payment processing integration (requires research - Argentina-compatible options: MercadoPago, manual transfers, or other solutions)
- Billing management, invoices
- Subscription upgrade/downgrade flows

**Enhanced Experience:**
- Gamification (badges, streaks, leaderboards)
- Push notifications
- Advanced analytics for coaches
- Complete white-label branding

**Data Migration:**
- Excel migration (manual or AI-powered automation)

### Phase 3: Vision (Future)

- AI coach assistant (learns planning style)
- Template marketplace
- Wearable integrations
- Calendar sync
- Expansion beyond Argentina

### Risk Mitigation Strategy

**Technical Risks:**
| Risk | Mitigation |
|------|------------|
| Excel-like UX performance | Prototype early, test with real data volumes |
| Multi-tenancy complexity | Use established patterns (RLS in Postgres) |
| PWA offline capabilities | Start simple, expand based on real usage |

**Market Risks:**
| Risk | Mitigation |
|------|------------|
| Coaches prefer Excel anyway | Direct feedback loops with 5 beta coaches |
| Athlete app not used | Coach can operate without it, measure actual usage |

**Resource Risks:**
| Risk | Mitigation |
|------|------------|
| Solo dev, limited time | Athlete app ships last if needed |
| Scope creep | Everything defined - no new features during MVP |

---

## Functional Requirements

### User Management & Authentication

- **FR1:** Users can create an account using email/password
- **FR2:** Users can create an account using OAuth providers (Google)
- **FR3:** Users can log in to their account
- **FR4:** Users can reset their password via email
- **FR5:** Users can log out from their account
- **FR6:** Users can belong to multiple organizations with a single account

### Organization Management

- **FR7:** Users can create a new organization during onboarding
- **FR8:** Users can select organization type (Independent Coach or Gym) during creation
- **FR9:** Organization Owners can update organization details (name, branding)
- **FR10:** Organization Owners can invite coaches to the organization
- **FR11:** Organization Owners can remove coaches from the organization
- **FR12:** Organization Owners can assign roles to organization members (Admin, Coach)
- **FR13:** Users with Admin role can manage organization settings
- **FR14:** Users with Admin role can view organization metrics
- **FR15:** Users can have multiple roles within an organization (e.g., Admin + Coach)

### Subscription & Plans

- **FR16:** Users must select a subscription plan before creating an organization
- **FR17:** System enforces feature limits based on active subscription plan
- **FR18:** System enforces athlete limits based on active subscription plan
- **FR19:** Users can view their current subscription status
- **FR20:** System locks application access when subscription is inactive
- **FR21:** Plans can be configured differently for Coach vs Gym organization types

### Athlete Management

- **FR22:** Coaches can create athlete profiles within their organization
- **FR23:** Coaches can view list of all athletes in their organization
- **FR24:** Coaches can update athlete profile information (name, notes, injuries, goals)
- **FR25:** Coaches can delete athlete profiles
- **FR26:** Coaches can generate invitation links for athletes
- **FR27:** Athletes can link their user account to an existing profile via invitation link
- **FR28:** Coaches can operate fully without athletes having linked accounts
- **FR29:** Coaches can log workouts on behalf of athletes

### Training Program Creation

- **FR30:** Coaches can create training programs (plans)
- **FR31:** Coaches can assign programs to athletes
- **FR32:** Coaches can edit programs using inline editing (Excel-like experience)
  - *Example acceptance criteria: Click on cell → cell becomes editable; Arrow keys navigate between cells; Tab moves to next cell; Enter confirms edit and moves down; Escape cancels edit*
- **FR33:** Coaches can duplicate entire programs
- **FR34:** Coaches can duplicate weeks/cycles within programs
- **FR35:** Coaches can add sessions to programs
- **FR36:** Coaches can add exercises to sessions
- **FR37:** Coaches can specify exercise prescriptions (sets, reps, weight, intensity methods)
- **FR38:** Coaches can group exercises (supersets, circuits)
- **FR39:** Coaches can add notes/comments to exercises, sessions, or programs
- **FR40:** Programs remain editable at any time (living documents)
- **FR41:** Changes to programs are visible to athletes immediately

### Exercise & Template Management

- **FR42:** System provides a database of exercises
- **FR43:** Coaches can search and select exercises from the database
- **FR44:** Coaches can create custom exercises
- **FR45:** Coaches can save programs as templates
- **FR46:** Coaches can create new programs from existing templates
- **FR47:** Templates can have metadata (level, type, days/week)
- **FR48:** Templates can be private or shared within organization

### Workout Logging & Tracking

- **FR49:** Athletes can view their assigned program
- **FR50:** Athletes can view their next/upcoming workout
- **FR51:** Athletes can log workout execution (actual sets, reps, weight)
- **FR52:** Workout log is pre-filled with planned prescription
- **FR53:** Athletes can modify logged values when actual differs from plan
- **FR54:** Athletes can add RPE per exercise or session
- **FR55:** Athletes can add comments/observations to exercises or sessions
- **FR56:** System maintains separation between planned prescription and actual execution (Plan vs Log)
- **FR57:** Coaches can view comparison between planned and executed workouts
- **FR58:** Athletes can view their past workout logs

### Progress & Visualization

- **FR59:** System automatically detects and records Personal Records (PRs)
  - *Example acceptance criteria: PR detected when logged weight > previous max for same exercise; PR detected when logged reps > previous max at same weight; System displays "New PR!" notification; PR history viewable per exercise*
- **FR60:** Athletes can view their PRs
- **FR61:** Athletes can view basic progress graphs (weight progression over time)
- **FR62:** System displays achievement when PR is reached

### Dashboard & Notifications

- **FR63:** Coaches can view a dashboard with centralized information
- **FR64:** Dashboard shows athletes needing updated programs
- **FR65:** Dashboard shows recent athlete activity/submissions
- **FR66:** Dashboard shows pending items requiring coach attention
- **FR67:** Coaches can navigate directly from dashboard items to relevant athlete/program

### Platform Administration

- **FR68:** Platform Admins can view platform-wide metrics (total orgs, coaches, athletes, subscriptions)
- **FR69:** Platform Admins can create and edit subscription plans
- **FR70:** Platform Admins can modify plan pricing and limits
- **FR71:** Platform Admins can view subscription status across all organizations

### Domain Research Prerequisite

> **Note:** Before Architecture phase, conduct domain research on strength training methodologies to inform data modeling:
>
> **Prescription Methods:**
> - Intensity: RPE (Rate of Perceived Exertion), RIR (Reps in Reserve), percentage of 1RM, tempo notation (e.g., 3-1-2-0)
> - Volume: sets × reps, rep ranges (8-12), AMRAP (As Many Reps As Possible)
> - Advanced: cluster sets, drop sets, rest-pause, supersets, circuits
>
> **Program Structures:**
> - Periodization models: linear, undulating, block
> - Cycle hierarchy: macrocycle → mesocycle → microcycle → session
> - Deload patterns and autoregulation approaches
>
> **Exercise Organization:**
> - Categorization: compound vs isolation, push/pull/legs, movement patterns
> - Muscle group mapping and primary/secondary movers
> - Equipment requirements and exercise variations
>
> This research will inform detailed acceptance criteria in Epic/Story breakdown, not the PRD functional requirements.

---

## Non-Functional Requirements

### Performance

- **NFR1:** Inline editing interactions (typing, selecting, navigating cells) respond in < 100ms (target to be validated in beta)
- **NFR2:** Page loads (dashboard, athlete list, program view) complete in < 2 seconds (target to be validated in beta)
- **NFR3:** Save operations provide clear feedback (loading state → success/error)
- **NFR4:** PWA initial load completes in < 3 seconds on 4G connection (target to be validated in beta)

*Note: Performance targets above are initial placeholders. Final targets to be validated with real user feedback during beta. Functionality takes priority over micro-optimizations.*

### Security

- **NFR5:** User passwords are hashed using industry-standard algorithms (bcrypt/argon2)
- **NFR6:** All data transmission uses HTTPS
- **NFR7:** Multi-tenant data isolation enforced at database level (organizations cannot access each other's data)
- **NFR8:** Authentication tokens have appropriate expiration and refresh mechanisms
- **NFR9:** User sessions can be invalidated (logout works correctly)
- **NFR10:** Basic GDPR compliance: users can request data export/deletion

### Reliability

- **NFR11:** User data is not lost due to application errors (proper error handling and database transactions)
- **NFR12:** System provides clear error messages when operations fail
- **NFR13:** Database backups are performed regularly

### Scalability

- **NFR14:** System architecture supports growth from 5 to 100+ coaches without major refactoring
- **NFR15:** Database design accommodates organizations with up to 200 athletes each

*Note: MVP targets 5 coaches. Scalability beyond this is post-MVP concern, but architecture should not preclude growth.*

