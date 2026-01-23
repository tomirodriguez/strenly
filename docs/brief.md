---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
inputDocuments:
  - .legacy_docs/product-brief.md
  - .legacy_docs/bmm-brainstorming-session-2025-11-08.md
  - .legacy_docs/research-market-competitive-2025-11-08.md
date: 2026-01-16
author: Tomi
project_name: strenly-ai
document_output_language: English
---

# Product Brief: Strenly

## Executive Summary

**Strenly** is a training planning and management platform designed for strength training coaches. It combines the speed and familiarity of spreadsheet-based planning with the professionalism, centralization, and athlete experience that spreadsheets cannot provide.

**The Opportunity:** Coaches currently use Excel/Google Sheets effectively—they're fast, flexible, and reliable. However, spreadsheets lack centralization, professional presentation, and athlete-facing features. Existing coaching apps attempt to solve this but are tedious to use, requiring excessive clicks and offering poor UX compared to spreadsheet simplicity.

**The Solution:** Strenly delivers an Excel-like planning experience for coaches (keyboard navigation, quick edits, table-based cycle views) while adding centralized athlete management, white-label branding, and a beautiful mobile experience for athletes.

**Target Market:** Strength training coaches—independent trainers, small and medium gyms—starting with the Argentine market. Subscription-based pricing with tiered plans based on features and athlete limits.

**Why Now:** Personal project driven by founder's dual experience as former coach and current developer, enabled by AI/automation tools that allow parallel project development.

---

## Core Vision

### Problem Statement

Strength training coaches face a gap between operational efficiency and professional presentation:

- **Excel works well** for planning—it's fast, flexible, and familiar
- **But Excel lacks** centralization, professional athlete experience, and modern tooling
- **Existing apps** offer professionalism but sacrifice speed and usability—they're tedious, click-heavy, and slower than spreadsheets

Coaches don't need a spreadsheet replacement. They need **spreadsheet-level speed** combined with **app-level value**.

### Problem Impact

**For Coaches:**
- Athlete data scattered across multiple spreadsheets and tabs
- Historical training data buried in hidden tabs or separate files
- No professional presentation when onboarding athletes (sharing a Google Sheet link vs. an app)
- Template reuse is manual and error-prone
- Difficult to track athlete progress across training cycles

**For Athletes:**
- No dedicated interface to view their training plan
- Dependent on coach sharing spreadsheets or messaging workouts
- No visibility into their own progress, PRs, or training history
- No motivation layer or engaging experience

### Why Existing Solutions Fall Short

Based on direct experience with coaching apps:

1. **Tedious Planning UX:** Excessive mouse clicks, clunky interfaces, no keyboard navigation
2. **Slower Than Spreadsheets:** What takes seconds in Excel takes minutes in apps
3. **Poor Cycle Visibility:** Hard to see and edit a 4-6 week training cycle at a glance
4. **Generic Experience:** No white-labeling for coaches to brand as their own
5. **Athlete Experience Afterthought:** Either non-existent or poorly designed mobile experience

**The core failure:** Apps tried to replace Excel entirely instead of preserving what Excel does well (speed, table-based editing) while adding what it cannot do (centralization, athlete experience, professionalism).

### Proposed Solution

**Strenly** is built on a simple principle: **Excel-like planning speed + everything Excel cannot provide.**

**For Coaches (Web App):**
- Table-based planning view similar to Excel for 4-6 week cycles
- Keyboard navigation (arrow keys, quick editing)
- Add exercises as rows, edit on-the-fly
- Centralized athlete profiles and training history
- Templates for faster program creation
- Progress tracking and reporting

**For Athletes (Mobile App):**
- Beautiful, easy-to-use interface during training
- Clear view of planned workouts
- Log actual performance vs. planned
- Progress visibility (PRs, history)
- Future: Gamification layer (RPG-style attribute progression)

**White-Label Branding:**
- Coaches/gyms can customize with their logo
- Configurable primary colors
- Athletes experience "their gym's app" while using Strenly infrastructure

### Key Differentiators

1. **Excel-Like Speed:** Table-based planning with keyboard navigation—as fast as spreadsheets
2. **White-Label Branding:** Coaches present a professional, branded app to athletes
3. **Centralized Data:** All athletes, history, and templates in one place
4. **Beautiful Athlete Experience:** Mobile-first design that athletes enjoy using
5. **Coach-First Priority:** Built by a former coach who understands the planning workflow

### Project Context

Strenly is a personal project, not a venture-backed startup:

- **Primary Goal:** Build the product the founder wished existed as a coach
- **Success Criteria:** Functional product used by real coaches, starting with Argentine market
- **Revenue Model:** Subscription-based SaaS with tiered plans
- **Timeline:** Enabled by AI/automation tools for parallel project development

---

## Target Users

### Primary Users: Coaches

Strenly's primary users are strength training coaches aged 20-50 who manage multiple athletes and seek a more professional, centralized solution than spreadsheets.

#### Persona 1: The Independent Remote Coach

**Profile:** Martín, 32 years old
- Independent coach working remotely with 15-30 online athletes
- Former gym employee who went independent for flexibility
- Tech-comfortable, uses smartphone and laptop daily

**Current Workflow:**
- Plans training on Sundays for the upcoming week
- Uses Google Drive with separate spreadsheets per athlete
- Communicates via WhatsApp for questions and updates
- Manually checks each spreadsheet to see progress

**Pain Points:**
- Cognitive overload navigating dozens of spreadsheets
- No way to know if he forgot to complete someone's plan
- Can't easily see which athletes completed their workouts
- Presenting a Google Sheets link feels unprofessional
- Difficult to scale beyond 30 athletes without burning out

**What Success Looks Like:**
- Dashboard showing all athletes at a glance
- Alerts for incomplete plans or athletes who haven't logged
- Professional app that elevates his brand
- Ability to manage 50+ athletes without extra mental load
- Athletes saying "your app is so pro"

**"Aha!" Moment:** Finding an app that provides useful stats and insights WITHOUT sacrificing the planning speed he had with Excel.

#### Persona 2: The Gym-Based Coach

**Profile:** Laura, 28 years old
- Works at a small/medium gym with 20-40 in-person clients
- Uses gym computers to manage training plans
- Some clients train independently, others with her supervision

**Current Workflow:**
- Creates plans on gym computer (Excel or paper-based)
- Updates plans during or after training sessions
- Limited visibility when not at the gym

**Pain Points:**
- Plans scattered across gym computers
- No centralized view of all clients
- Clients can't easily access their plan outside the gym
- No professional athlete-facing experience

**What Success Looks Like:**
- Centralized app accessible from any gym computer
- Athletes can check their plan on their phones
- Easy to update plans during training sessions
- Future: Administrative features (dues, payments, attendance)

### Secondary Users: Athletes

Athletes are the end-users who receive training plans but don't pay directly—coaches/gyms pay on their behalf.

#### Athlete Profile

**Demographics:**
- Recreational to semi-competitive, amateur level
- Age range: 18-45 (varies widely)
- Training frequency: 2-6 times per week (most common: 2-3)
- Tech comfort: Variable, but familiar with mobile apps

**NOT Target:**
- Professional athletes (require specialized, high-touch follow-up)
- Elite competitors (different needs, out of scope)

**What They Want:**
- Beautiful, easy-to-use mobile app
- Clear view of today's workout
- Easy logging of what they actually did
- Visibility into their progress and PRs
- Future: Gamification, social features, RPG-style progression

**Their Experience:**
- Open the app, see their workout for today
- Follow the plan during training
- Log actual weights/reps completed
- See their progress over time

### Explicit Exclusions

The following are NOT target users for the MVP:

1. **Professional Athletes:** Require specialized tracking, biomechanics analysis, and high-touch coaching beyond Strenly's scope
2. **CrossFit Boxes:** WOD-based programming for entire groups is a different model—potentially future scope
3. **Team Sports / Universities:** Enterprise complexity with compliance requirements—out of scope

### Future: Organization Model

As Strenly grows, the platform will support an organization model:

- **Gym = Organization** with roles (Owner, Admin, Coach)
- **Independent Coach = Organization of 1**
- **Administrative Features:** Dues tracking, payment collection, attendance, financial stats
- This provides value that Excel fundamentally cannot deliver

---

## Success Metrics

Strenly's success is measured in progressive phases, reflecting its nature as a personal project with commercial potential.

### Phase 1: Product Completion (Primary Success)

The first and most important measure of success is completing the product as envisioned.

**Success Criteria:**
- Functional MVP deployed and accessible
- Core planning workflow works as intended (Excel-like speed)
- Athlete mobile experience is beautiful and usable
- White-label branding is configurable
- The product matches what the founder would want as a coach

**Key Question:** "Is this the app I wished I had when I was coaching?"

### Phase 2: Beta Validation (Secondary Success)

After launch, validate with real coaches from the founder's network.

**Success Criteria:**
- 5-10 coach friends/contacts actively using Strenly
- Coaches provide genuine feedback (not just using out of obligation)
- Coaches prefer Strenly over returning to Excel for daily work
- Coaches voluntarily recommend it to other coaches
- Athletes engage with the app (open it, log workouts)

**Key Indicators:**
- Coaches continue using after initial trial period
- Unsolicited positive feedback
- Word-of-mouth referrals without prompting
- Coaches ask for new features (sign of investment in the product)

**Key Question:** "Do coaches genuinely find this useful, or are they just being polite?"

### Phase 3: Commercial Viability (Tertiary Success)

If Phase 1 and 2 succeed, explore commercial potential.

**Success Criteria:**
- Coaches willing to pay for the service
- Subscription revenue covers hosting and operational costs
- Organic growth beyond initial network
- Positive unit economics (revenue per coach > cost to serve)

**Aspirational Targets (Not Requirements):**
- 50-100 paying coaches in Year 1
- Revenue covering costs + modest profit
- Sustainable growth without aggressive marketing

### Anti-Metrics (What We're NOT Optimizing For)

- **Vanity metrics:** Raw user counts without engagement
- **Forced growth:** Aggressive marketing before product-market fit
- **Revenue at all costs:** Monetizing before validating real value

### Business Objectives

| Timeframe | Objective | Measure |
|-----------|-----------|---------|
| MVP Launch | Product completion | App live, core features working |
| 3 months post-launch | Beta validation | 5-10 coaches actively using |
| 6 months post-launch | Product-market fit signals | Coaches prefer Strenly over Excel |
| 12 months post-launch | Commercial validation | First paying customers, costs covered |

### Key Performance Indicators

**User Success KPIs:**
- Coach retention: % of coaches still using after 30 days
- Planning adoption: % of plans created in Strenly vs. Excel
- Athlete engagement: % of athletes logging workouts weekly
- Recommendation rate: Coaches who refer others

**Product Quality KPIs:**
- Planning speed: Time to create a 4-week program
- Mobile experience: Athlete app session duration
- Feature utilization: % of core features being used

**Business KPIs (Phase 3):**
- Monthly Recurring Revenue (MRR)
- Cost per coach served
- Churn rate (coaches who stop paying)
- Organic vs. paid acquisition ratio

---

## MVP Scope

### Core Features (Coach Web App)

The MVP focuses exclusively on the coach web application. The athlete mobile app will follow once the coach experience is complete.

#### 1. Coach Dashboard
- Centralized view of all athletes
- Quick access to active plans and pending tasks
- Overview of athlete activity and completion status

#### 2. Athlete Management
- Create, edit, and manage athlete profiles
- View athlete training history
- Track PRs and progress over time
- Centralized athlete data (replacing scattered spreadsheets)

#### 3. Template System
- Create reusable planning templates
- Save and organize templates for different training phases
- Templates as starting point for new plans (not required, but accelerates workflow)

#### 4. Planning Creation (Excel-Like Experience)
- Table-based view for creating training cycles
- Flexible duration: 1, 2, 3, 4, or more weeks
- Keyboard navigation and quick editing
- Assign plans to athletes

**Technical Note:** The specifics of planning structure require dedicated discussion:
- Exercise repetition patterns with varying intensity/load/volume
- Dosification: sets, reps, set types, rep types
- Intensity prescriptions: weight, RPE, RIR, %1RM, tempo
- This will be detailed in the PRD phase

#### 5. Statistics & Analytics
- Training volume per week (sets, reps, tonnage)
- Intensity tracking over time
- PR history and progression
- Comprehensive data that provides real coaching value

### Out of Scope for MVP

The following features are explicitly deferred to future versions:

1. **Athlete Mobile App:** Will be built after coach app is complete and validated
2. **AI-Assisted Planning:** Automated program generation, exercise suggestions
3. **Real-Time Notifications:** Basic notifications OK, but not real-time push
4. **Gamification:** RPG-style progression, badges, achievements
5. **Administrative Features:** Dues tracking, payment processing, attendance
6. **Organization Roles:** Multi-coach permissions, admin hierarchy
7. **White-Label Branding:** Custom logos and colors (can be added post-MVP)

### MVP Success Criteria

The MVP is successful when:

1. **Planning Speed:** Creating a 4-week program feels as fast as Excel
2. **Data Centralization:** All athlete data accessible from one dashboard
3. **Statistics Value:** Coach sees insights they couldn't easily get from spreadsheets
4. **Personal Validation:** "This is the app I would have wanted as a coach"

### Phased Approach

**Phase 1 (MVP):** Coach Web App
- Complete planning and athlete management
- Full statistics and analytics
- Template system

**Phase 2:** Athlete Mobile App
- View assigned plans
- Log workouts (planned vs. actual)
- Basic progress visibility

**Phase 3:** Enhanced Features
- White-label branding
- Gamification
- AI assistance
- Administrative features

### Future Vision

If Strenly succeeds, the long-term vision includes:

**Platform Evolution:**
- Full organization model with roles (Owner, Admin, Coach)
- Payment and subscription management for gyms
- AI-powered planning assistance
- Marketplace for coach templates

**Athlete Experience:**
- Gamification layer (RPG-style attribute progression)
- Social features and community
- Advanced progress visualization
- Personal records celebration

**Business Expansion:**
- CrossFit box support (WOD-based programming)
- Enterprise features for larger gyms
- International expansion beyond Argentina
