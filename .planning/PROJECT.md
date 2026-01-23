# Strenly

## What This Is

Strenly is a training planning and management platform for strength training coaches. It combines the speed and familiarity of spreadsheet-based planning (keyboard navigation, inline editing, table views) with the centralization, professionalism, and athlete experience that spreadsheets cannot provide. The coach web app delivers Excel-like workflow velocity; the athlete PWA provides a beautiful mobile experience for viewing plans and logging workouts.

## Core Value

**Coaches can create and edit training programs as fast as they can in Excel** — if planning feels slower than a spreadsheet, the product fails.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Coach Web App:**
- [ ] Excel-like inline editing for program creation (keyboard navigation, arrow keys, tab, enter)
- [ ] Centralized athlete management (profiles, history, PRs)
- [ ] Template system for reusable programs
- [ ] Week/cycle duplication
- [ ] Dashboard with pending items and athlete overview
- [ ] Plan vs Log comparison view
- [ ] Multi-tenancy (organization isolation)
- [ ] Role system (Owner, Admin, Coach)
- [ ] Subscription plan structure (payments bypassed for beta)

**Athlete PWA:**
- [ ] View assigned plan and next workout
- [ ] Log workouts with plan pre-fill (one-tap if matching)
- [ ] Modify actual values when different from plan
- [ ] RPE/RIR and comments per exercise
- [ ] View past logs and basic progress graphs
- [ ] Automatic PR detection and celebration

**Domain-Specific:**
- [ ] Exercise database (150-200 exercises, custom allowed)
- [ ] Flexible prescription: sets, reps (fixed/range/AMRAP), intensity (%1RM, RPE, RIR, absolute)
- [ ] Supersets (A1/A2 grouping)
- [ ] Drop set labels
- [ ] Optional tempo (4-digit ECCC notation)
- [ ] Rest periods per exercise
- [ ] Optional blocks/mesocycles in program hierarchy

### Out of Scope

- Real-time chat — use WhatsApp/existing channels
- Video posts/form checks — storage/bandwidth complexity, defer
- Wearable integrations — no Garmin/Apple Watch for MVP
- AI-assisted planning — automated program generation deferred
- Gamification — RPG-style progression deferred to post-MVP
- Payment processing — bypass for beta, research Argentina-compatible options later
- CrossFit WOD programming — different model, future consideration
- Professional/elite athletes — require specialized tracking beyond scope

## Context

**Market position:** Existing coaching apps (TrainHeroic, TrueCoach) offer centralization but tedious planning UX. Excel/Sheets are fast but scattered. Strenly bridges this gap.

**Target users:**
- Independent strength coaches (15-50 remote athletes)
- Small/medium gyms (2-10 coaches, 50-200 athletes)
- Starting with Argentine market

**Domain complexity:** Strength training prescriptions involve multiple intensity methods (%1RM, RPE, RIR), rep ranges for double progression, supersets, and optional periodization structures. Research completed in `docs/domain-research-strength-training.md`.

**Founder background:** Former strength coach and current developer. Building the product he wished existed when coaching.

**Existing documentation:**
- `docs/brief.md` — Product brief with vision and personas
- `docs/prd.md` — Detailed functional requirements (FR1-FR71)
- `docs/domain-research-strength-training.md` — Prescription methods, program structures, data model decisions
- `docs/architecture.md` — Tech stack and architectural patterns

## Constraints

- **Tech stack**: React 19 + Vite (coach SPA, athlete PWA), Hono + oRPC on Cloudflare Workers, Neon PostgreSQL, Drizzle ORM, Better-Auth
- **Code conventions**: kebab-case files, neverthrow for errors, no `as` casting, no `!` assertions, no barrel files
- **Monorepo**: pnpm workspaces + Turbo, packages for contracts/core/backend/apps
- **Multi-tenancy**: Application-level filtering + RLS safety net
- **Solo developer**: Side project, athlete app ships after coach app is complete
- **Market**: Argentina-first, metric (kg) as default

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| RIR over RPE as primary intensity metric | More intuitive for athletes to understand "reps left in tank" | — Pending |
| Separate coach/athlete apps (not one responsive app) | Fundamentally different UX needs: keyboard-dense vs touch-friendly | — Pending |
| Optional blocks/mesocycles | Some coaches want simple Program > Week > Day, others want full periodization | — Pending |
| Per-set logging (not per-exercise) | Enables set-by-set comparison and AMRAP tracking | — Pending |
| Custom exercises allowed from day one | Coaches have unique exercise names and variations | — Pending |
| Structured prescription fields + freeform notes | Balance analytics capability with coach flexibility | — Pending |

---
*Last updated: 2026-01-23 after initialization*
