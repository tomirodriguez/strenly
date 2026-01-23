# Project Research Summary

**Project:** Strenly - Training Planning Platform for Strength Coaches
**Domain:** Multi-tenant SaaS (Coach/Athlete platform)
**Researched:** 2026-01-23
**Confidence:** HIGH

## Executive Summary

Strenly is a training planning platform differentiated by Excel-like editing speed in a web-based environment. Research reveals that the success of this product hinges on three critical architectural decisions made early: (1) grid performance through virtualization from day one, (2) multi-tenant security with defense-in-depth isolation, and (3) offline-capable athlete experience with proper conflict resolution. The recommended stack (React 19, AG Grid Enterprise, Hono + oRPC on Cloudflare Workers, Neon PostgreSQL with RLS) is largely pre-decided and appropriate.

The primary risk is performance death spiral in the grid component. Coaches expect Excel-level responsiveness when editing 12-week programs across 50+ athletes (10,000+ cells). If the grid feels sluggish, coaches will abandon the product within the first session, regardless of other features. This requires AG Grid Enterprise with full virtualization, not a lightweight library that would require weeks of custom keyboard navigation development. The secondary risk is multi-tenant data leakage — a breach would destroy trust and potentially trigger legal action. This requires application-level filtering plus RLS as a safety net, not RLS alone.

Competitive research shows that existing platforms (TrainHeroic, TrueCoach, TeamBuildr) have consistent pain points: modal-heavy workflows, limited prescription parameters visible at once, inability to view full mesocycles, and slow bulk operations. Strenly's differentiation strategy (inline editing, 3+ visible prescription params, full cycle view) directly addresses these gaps. However, table stakes features (exercise library 500+, template system, athlete progress dashboard, offline logging) cannot be compromised.

## Key Findings

### Recommended Stack

The core stack is well-aligned with project requirements. oRPC over tRPC is the right choice for edge compatibility and OpenAPI support. AG Grid Enterprise is justified despite the $999/dev/year cost because building Excel-like keyboard navigation, batch editing, and cell validation with TanStack Table would take 2-4 weeks and still fall short.

**Core technologies:**
- **React 19 + Vite**: Frontend framework with native concurrent features — proven, stable, fast dev experience
- **AG Grid Enterprise v34.3+**: Excel-like grid editing with React 19 support — critical for differentiation, includes batch editing and validation
- **Hono 4.11.x + oRPC 1.0**: Type-safe edge-native API layer — OpenAPI built-in, file uploads native, SSE for real-time
- **Cloudflare Workers**: Edge compute runtime — fast global response, integrates with Durable Objects for future real-time
- **Neon PostgreSQL**: Serverless database with RLS support — cost-effective, scales to zero, but needs Hyperdrive for connection pooling
- **Drizzle ORM 1.0.0-beta.12**: TypeScript-first ORM with RLS support — still beta but production-ready for this use case
- **Better-Auth 1.4.x**: Authentication with organization plugin — multi-tenancy and role management built-in
- **vite-plugin-pwa 1.2.0 + Workbox**: PWA implementation for athlete app — offline capability with background sync

**Critical version notes:**
- AG Grid v34.0+ required for batch editing and cell validation (new features)
- React 19.2 support in AG Grid v34.3+ (don't use earlier versions)
- Drizzle 1.0 beta has architecture rewrite for RLS and faster schema introspection (<1s vs 10s)

### Expected Features

Research into competitors (TrainHeroic, TrueCoach, TeamBuildr, Hevy Coach, BridgeAthletic) reveals a clear hierarchy of features.

**Must have (table stakes):**
- Program/workout builder with sets, reps, weight prescription
- Exercise library (500+ exercises with demos) plus custom exercise creation
- Client/athlete management with basic CRUD and notes
- Template system for program reuse
- Week/program duplication for periodization workflows
- Athlete progress/compliance dashboard (who logged, who's behind)
- Prescription flexibility (sets, reps, weight + at least one intensity method like RPE/RIR/%)
- Athlete app: view workouts, log execution with pre-fill, rest timer, workout history
- Multi-tenancy with organization isolation and role system (Owner/Admin/Coach)

**Should have (competitive differentiators):**
- **Excel-like editing speed** (PRIMARY DIFFERENTIATOR) — keyboard nav, inline editing, no modals
- **Full cycle view** — see 4-6 week mesocycle at once (TrainHeroic can't do this)
- **3+ visible prescription params** — sets, reps, weight, RPE/RIR, rest all visible (TrainHeroic limits to 2)
- **Plan vs Log separation** — what coach prescribed vs what athlete did (enables analytics)
- **Structured data + analytics** — volume per muscle, progression tracking (TrueCoach has total freedom but no analytics)
- PR detection and celebration (automatic recognition of personal records)
- Superset/giant set grouping with A1/A2/A3 notation
- Rep range support (8-12, not just fixed 10) for double progression
- AMRAP tracking for autoregulated programs
- Data export (CSV/JSON) to prevent vendor lock-in

**Defer (v2+):**
- AI workout builder (technically complex, trust issue with coaches)
- Nutrition tracking (separate expertise domain, use MyFitnessPal integration later)
- Wearable integrations (Apple Health, Garmin, WHOOP) — maintenance burden, not core value
- Video hosting in-app (storage/bandwidth costs; link to YouTube/Vimeo instead)
- Advanced gamification (badges, XP) — uncertain value until athlete engagement validated
- White-label branding — nice-to-have, not blocking adoption
- Leaderboards — requires group features, defer to post-MVP
- Payment processing — Argentina-specific complexity, bypass for beta

### Architecture Approach

The recommended architecture follows a layered monorepo structure with shared TypeScript contracts, application-level multi-tenancy with RLS as safety net, and immutable prescriptions with mutable logs.

**Major components:**
1. **packages/contracts** — Shared Zod schemas and TypeScript types (single source of truth), consumed by all apps without pre-compilation
2. **packages/core** — Pure business logic (validation, permissions, calculations) with no I/O dependencies
3. **packages/backend** — Drizzle schemas, Better-Auth config, database queries (I/O layer)
4. **apps/backend** — Hono + oRPC API layer running on Cloudflare Workers
5. **apps/coach-app** — React SPA for coaches (dark theme, keyboard-dense, desktop-first)
6. **apps/athlete-app** — React PWA for athletes (light theme, touch-friendly, offline-capable)

**Key architectural patterns:**
- **Multi-tenancy**: Application-level filtering (WHERE org_id = ?) as primary, RLS policies as secondary defense. Connection context set via `SET LOCAL app.current_org_id` at request start.
- **Coach/Athlete separation**: Athletes are profiles (may or may not have user accounts). Coaches are users with roles. One-to-many relationship with visibility rules enforced in core logic.
- **Plan vs Log data model**: Prescriptions are immutable after publication (audit trail, historical accuracy). Logs are mutable (athletes can correct). Separate tables enable prescribed vs actual analytics.
- **Monorepo sharing**: Raw TypeScript sources shared across packages, apps transpile everything together (avoids module format mismatches and source map issues).
- **Real-time strategy**: Start with polling + optimistic updates for MVP. Add Durable Objects for WebSocket-based real-time only when live coaching features are validated.

**Critical dependencies for build order:**
- Foundation: contracts → backend schema → core logic → API
- Applications: coach app and athlete app can develop in parallel once API exists
- Real-time features require Durable Objects architecture (defer to post-MVP)

### Critical Pitfalls

Based on competitor mistakes and domain-specific research, five pitfalls are identified as critical (can cause rewrites, security breaches, or adoption failure):

1. **Grid performance death spiral** — Building custom grid without virtualization leads to 10,000+ DOM cells. React re-renders cascade. UI becomes slower than Excel. Coaches abandon product within first session. PREVENTION: AG Grid Enterprise with row AND column virtualization from day 1. Benchmark with 20 athletes x 12 weeks x 5 exercises/day = 8,400 cells. Budget 16ms per interaction (60fps). Use React.memo and stable references.

2. **Multi-tenant data leakage via connection pool contamination** — Tenant A sees Tenant B's data due to connection pool returning connection with previous tenant's context, async context leaks, or cache serving wrong tenant's data. PREVENTION: Defense-in-depth (RLS + application layer + cache scoping). Fresh connections per request with Neon serverless driver. Cache keys MUST include tenantId. Never infer tenant from user without explicit context. Include penetration testing in auth phase.

3. **PWA offline sync corruption** — Athlete logs offline, coach edits online, data corrupts on sync or silently overwrites. iOS clears IndexedDB after 7 days. PREVENTION: CRDTs or operational transforms (Yjs). Version vectors, not timestamps. Sync aggressively with "sync needed" warnings. Workout logs are append-only. Show conflict resolution UI when needed. Design for iOS's 7-day storage cap.

4. **Cloudflare Workers CPU time budget exhaustion** — Complex operations (program generation, bulk updates, analytics) exceed 50ms CPU limit. Workers terminate mid-operation. PREVENTION: Profile every endpoint. Use Cloudflare Queues for bulk operations. Batch database operations. Lightweight libraries only (date-fns, not moment). Move compute-heavy work to Durable Objects or client-side. Design for interruptibility (idempotent operations).

5. **Neon database cold start + edge latency double-penalty** — First query takes 3-5 seconds (Neon cold start), subsequent queries add 50-150ms each (edge-to-database latency). Grid feels unresponsive despite edge deployment. PREVENTION: Use Neon serverless driver with WebSocket connections. Enable connection pooling. Implement optimistic updates (show change immediately, sync in background). Batch reads (fetch entire week's program in one query). Keep compute warm with scheduled ping or minimum compute size.

**Additional moderate pitfalls:**
- React 19 concurrent rendering + grid state tearing (use useSyncExternalStore)
- Service worker update nightmare (implement versioning and "update available" toast)
- Two-sided platform chicken-and-egg (focus on coach value first, they bring athletes)
- Training data model rigidity (use flexible JSONB for sport-specific metrics)
- oRPC/tRPC type safety false confidence (validate at every boundary, not just compile-time)

## Implications for Roadmap

Based on cross-cutting concerns and dependency analysis, a 5-phase structure is recommended:

### Phase 1: Foundation & Multi-Tenancy
**Rationale:** Multi-tenant architecture is the hardest to retrofit. Database schema changes are expensive. Connection strategy and tenant isolation must be correct from day one. This phase establishes the contracts, database schema, and auth system that everything else depends on.

**Delivers:**
- Monorepo structure (Turborepo + pnpm workspaces)
- packages/contracts with shared Zod schemas
- packages/backend with Drizzle schema and Better-Auth config
- Multi-tenancy with org isolation (RLS + application-level)
- User/organization/membership models
- apps/backend skeleton with Hono + oRPC

**Addresses:**
- P2 (Multi-tenant data leakage) — defense-in-depth from start
- P11 (Data model rigidity) — flexible schema with JSONB for extensibility
- P5 (Neon cold start) — connection strategy established early
- Table stakes: Auth system, role system, multi-tenancy

**Avoids:**
- Retrofitting RLS after data exists
- Connection pool contamination from unclear tenant context
- Schema migrations with production data

**Research needs:** None (standard patterns, well-documented)

### Phase 2: Exercise Library & Coach Profile Management
**Rationale:** Coaches need exercises and athlete profiles before they can create programs. This phase delivers standalone value (coach can organize their client base and explore the exercise library even before program builder exists). Provides data foundation for Phase 3.

**Delivers:**
- Exercise library (150-200 curated exercises + custom creation)
- Exercise taxonomy (muscle groups, movement patterns)
- Athlete profile CRUD (name, email, notes, injury history)
- Athlete invitation flow (link-based onboarding)
- Basic coach dashboard with athlete list

**Addresses:**
- Table stakes: Exercise library, client management, invitation flow
- Differentiator: Allow custom exercises from day 1 (competitor pain point)

**Uses:**
- packages/contracts for exercise and athlete schemas
- oRPC for type-safe CRUD operations
- Drizzle for database interactions

**Avoids:**
- P11 (Data model rigidity) — taxonomy designed for analytics (volume per muscle)
- Building program builder before having exercises to assign

**Research needs:** None (standard CRUD patterns)

### Phase 3: Program Builder with Excel-Like Grid
**Rationale:** This is the PRIMARY DIFFERENTIATOR and the make-or-break feature. Grid performance directly impacts coach satisfaction. If this fails, the product fails. Dependencies: needs exercises (Phase 2) and athletes (Phase 2) to assign programs to. This is the highest-risk phase and requires the most careful execution.

**Delivers:**
- AG Grid Enterprise integration with keyboard navigation
- Program structure (weeks → sessions → prescribed exercises)
- Inline editing with sets, reps, weight, RPE, rest, notes
- Template system (save, duplicate, customize)
- Week/program duplication for periodization
- Superset grouping (A1/A2/A3 notation)
- Batch editing ("apply to all sets")
- Cell validation (prevent invalid RPE/percentage entries)

**Addresses:**
- PRIMARY DIFFERENTIATOR: Excel-like editing speed
- DIFFERENTIATOR: Full cycle view (4-6 week mesocycle visible)
- DIFFERENTIATOR: 3+ visible prescription params
- DIFFERENTIATOR: Rep ranges (8-12, not just fixed 10)
- Table stakes: Program builder, template system, duplication
- P1 (Grid performance death spiral) — virtualization from day 1
- P6 (Grid accessibility) — AG Grid has built-in ARIA roles
- P7 (Clipboard operations) — AG Grid handles cross-browser clipboard
- P8 (React 19 concurrent rendering) — test with Strict Mode and concurrent features

**Uses:**
- AG Grid Enterprise v34.3+ (React 19 support)
- TanStack Query for optimistic updates
- Immutable prescription data model from Phase 1

**Avoids:**
- Custom grid development (2-4 weeks, falls short of Excel UX)
- Modal-heavy workflows (competitor pain point)
- Performance issues from non-virtualized rendering
- Accessibility lawsuit risk from keyboard-only nav gaps

**Research needs:** CRITICAL — needs research-phase for:
- AG Grid license management in monorepo (one license for multiple apps?)
- Keyboard navigation flow for sets/reps/weight cell progression
- Clipboard format for Excel import/export compatibility
- Performance benchmarking strategy (8,400 cells target)

### Phase 4: Athlete App with Offline Logging
**Rationale:** Athletes need to view assigned workouts and log execution. Offline capability is table stakes (athletes train in gyms with poor connectivity). This is the second highest-risk phase due to PWA complexity and sync challenges. Depends on program data structure from Phase 3.

**Delivers:**
- Athlete PWA (React + vite-plugin-pwa)
- View assigned workouts (day-by-day)
- Log workout execution with pre-filled values
- Plan vs Log separation (actual reps/weight/RPE recorded separately)
- Rest timer between sets
- Past workout history (searchable by date/exercise)
- Basic progress visualization (line charts per exercise)
- Offline-first architecture with background sync
- Service worker with caching strategy (programs: StaleWhileRevalidate, workouts: NetworkFirst)

**Addresses:**
- Table stakes: View workouts, log execution, rest timer, workout history, progress visualization
- DIFFERENTIATOR: Plan vs Log separation (enables analytics)
- DIFFERENTIATOR: Pre-filled logging (one-tap if matches plan)
- P3 (PWA offline sync corruption) — conflict resolution strategy
- P9 (Service worker update nightmare) — versioning and update toast

**Uses:**
- vite-plugin-pwa 1.2.0 with Workbox Background Sync
- Immutable prescriptions, mutable logs (from Phase 1 data model)
- IndexedDB for offline storage

**Avoids:**
- Last-write-wins sync (causes data loss)
- iOS storage clearing surprises (sync aggressively, warn users)
- Conflating prescription with execution (loses historical accuracy)

**Research needs:** MODERATE — needs research-phase for:
- CRDT vs operational transform for conflict resolution (Yjs evaluation)
- iOS PWA storage limits and mitigation strategies
- Background sync queue management (idempotency, retry logic)
- Service worker update strategies (skipWaiting vs manual update)

### Phase 5: Analytics & Coach Dashboard
**Rationale:** With programs created (Phase 3) and workouts logged (Phase 4), analytics can show value. This is where Plan vs Log separation pays off. Enables coach to see compliance, progression, and volume metrics. Differentiates from TrueCoach (unstructured, no analytics).

**Delivers:**
- Compliance dashboard (who logged, who's behind)
- PR detection and celebration (automatic personal records)
- Progression tracking per exercise (weight/reps over time)
- Volume analytics per muscle group (leverages exercise taxonomy from Phase 2)
- Comparison: prescribed vs actual (sets completed, RPE adherence)
- Athlete performance summary (for coach review)

**Addresses:**
- Table stakes: Athlete progress/compliance dashboard
- DIFFERENTIATOR: Structured data + analytics (TrueCoach pain point)
- DIFFERENTIATOR: PR detection (TrueCoach complaint: no PR celebration)
- DIFFERENTIATOR: Plan vs Log comparison (coaching insights)

**Uses:**
- Plan vs Log data model (immutable prescriptions, mutable logs)
- Exercise taxonomy (muscle groups) for volume calculations
- TanStack Query for data fetching

**Avoids:**
- P4 (Workers CPU exhaustion) — pre-aggregate analytics, don't compute on-the-fly
- Real-time analytics (not needed, poll or refresh on demand)

**Research needs:** LOW — needs validation but not full research-phase:
- Volume calculation formulas (sets x reps x weight, tonnage vs relative intensity)
- PR detection logic (account for rep ranges, e.g., 5RM vs 10RM)
- Dashboard layout patterns (what coaches want to see first)

### Phase Ordering Rationale

This order is driven by three factors:

1. **Dependency chain**: Contracts → Schema → Auth → Exercises/Athletes → Programs → Logging → Analytics. Each phase builds on previous phase's data structures.

2. **Risk mitigation**: Highest-risk items (multi-tenancy in Phase 1, grid performance in Phase 3, offline sync in Phase 4) are isolated into focused phases where they can receive proper attention. Spreading high-risk items across phases would dilute focus.

3. **Value delivery**: Phase 2 delivers standalone value (coach organizes clients, browses exercises). Phase 3 delivers primary differentiator (Excel-like program editing). Phase 4 enables athlete participation (two-sided platform). Phase 5 shows coaching insights (analytics ROI). Each phase has a clear user-facing deliverable.

**Cross-cutting concerns identified:**
- Multi-tenancy affects all phases (org_id filtering in every query)
- Type safety via contracts affects all phases (shared schemas)
- Optimistic UI affects Phases 3-5 (grid edits, logging, dashboard updates)
- Offline considerations affect Phases 4-5 (athlete app, sync strategy)

**Deferred to post-MVP:**
- Real-time sync (Durable Objects) — Start with polling, add WebSockets when live coaching validated
- Advanced analytics (ML-based insights) — Need sufficient logged data first
- Mobile coach experience — Desktop-first for program building (coach workflow)
- Nutrition tracking — Separate domain, integrate MyFitnessPal if validated
- Wearable integrations — Maintenance burden, defer until core value proven

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 3 (Program Builder):** CRITICAL research needed for AG Grid license management, keyboard navigation patterns, performance benchmarking methodology, clipboard format compatibility. This phase has highest technical risk.

- **Phase 4 (Athlete PWA):** MODERATE research needed for CRDT evaluation (Yjs vs alternatives), iOS PWA limitations and workarounds, background sync queue patterns, service worker update strategies. Offline-first has many edge cases.

Phases with standard patterns (skip dedicated research-phase):

- **Phase 1 (Foundation):** Well-documented patterns for monorepo setup, Drizzle schema, Better-Auth configuration, RLS policies. Execute with existing research.

- **Phase 2 (Exercise Library):** Standard CRUD operations, straightforward data model. No novel patterns.

- **Phase 5 (Analytics):** May need validation on calculation formulas and dashboard layout, but not full research. User testing can guide this.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified with official docs and current releases. AG Grid v34.3+ has React 19 support confirmed. oRPC 1.0 stable as of Dec 2025. Drizzle 1.0 beta is production-ready for this use case (architecture rewrite complete). |
| Features | MEDIUM | Competitive analysis based on official docs and user reviews from multiple sources (PT Pioneer, GetApp, Software Advice). Table stakes vs differentiators clearly defined. However, specific coach workflows would benefit from user interviews. |
| Architecture | HIGH | Multi-tenancy patterns verified across multiple authoritative sources (Neon, AWS, simplyblock). Monorepo patterns and oRPC integration well-documented. Plan vs Log separation validated in BridgeAthletic and TeamBuildr patterns. |
| Pitfalls | HIGH | Grid performance pitfalls verified in AG Grid and MUI X docs. Multi-tenant leakage patterns documented in security sources. PWA offline challenges confirmed in RxDB and Safari/iOS limitation docs. Cloudflare Workers limits are official. |

**Overall confidence:** HIGH

The stack is proven and appropriate. The architecture patterns are well-established in the industry. The feature prioritization is based on competitive analysis and domain research. The pitfalls are documented with credible sources and prevention strategies.

### Gaps to Address

Areas where research was inconclusive or needs validation during implementation:

- **AG Grid Enterprise licensing in monorepo context** — Official docs don't specify if one license covers multiple apps in same monorepo. Need to contact AG Grid sales for clarification before Phase 3. May affect cost projections.

- **Drizzle RLS migration strategy for production** — RLS support is new in Drizzle 1.0 beta. Migration path from dev to production with RLS policies enabled needs validation. Recommend testing migration on staging environment before Phase 1 completion.

- **iOS PWA storage limits (7-day cap)** — Documentation exists but real-world behavior varies by iOS version. Need device testing on iOS 16, 17, 18+ to confirm storage clearing behavior. Plan for Phase 4 testing.

- **CRDT library choice (Yjs vs alternatives)** — Yjs is recommended for offline sync but integration with React Query and oRPC needs prototyping. Consider spike in Phase 4 planning to validate approach.

- **Coach workflow preferences** — Feature research based on competitive analysis and reviews, but direct coach interviews would validate assumptions about keyboard navigation preferences, prescription parameter priorities, and dashboard layout. Recommend 5-10 coach interviews before Phase 3 to validate grid UX decisions.

- **Volume calculation formulas** — Research identified that volume analytics are a differentiator, but specific formulas (tonnage vs relative intensity vs inol) vary by coaching philosophy. Recommend coach input during Phase 5 planning to decide which metrics to surface.

## Sources

### Primary (HIGH confidence)

**Stack documentation:**
- React 19 Release (react.dev) — React 19 features and concurrent rendering
- oRPC v1 Announcement (orpc.dev) — oRPC vs tRPC comparison and OpenAPI support
- Drizzle ORM RLS (orm.drizzle.team) — Row-level security implementation in Drizzle 1.0
- Neon + Drizzle RLS Guide (neon.com) — Multi-tenancy patterns with RLS
- Cloudflare Hyperdrive + Neon (neon.com) — Connection pooling strategy
- Hono Cloudflare Workers (hono.dev) — Edge-first framework patterns
- vite-plugin-pwa (github.com/vite-pwa) — PWA plugin for Vite with Workbox
- AG Grid v34 Release Notes (ag-grid.com) — Batch editing, cell validation, React 19 support
- Better-Auth Docs (better-auth.com) — Organization plugin and multi-tenancy

**Architecture patterns:**
- simplyblock - Row-Level Security for Multi-Tenant Applications — RLS as safety net, not primary
- Neon - Shipping multi-tenant SaaS using Postgres RLS — Application-level + RLS hybrid approach
- AWS - RLS recommendations — Defense-in-depth multi-tenancy
- Cloudflare - Durable Objects Overview — Real-time architecture for future phases
- Cloudflare - WebSocket Hibernation — Cost-effective WebSocket connections

**Pitfalls documentation:**
- MUI X Data Grid Performance (mui.com) — Virtualization requirements
- AG Grid Accessibility (ag-grid.com) — WCAG 2.1 compliance and ARIA roles
- MUI X React 19 Issue #15770 (github.com) — Ref prop bug in React 19
- Cloudflare Workers Limits (developers.cloudflare.com) — CPU time and memory limits
- Neon with Cloudflare Workers (neon.com) — Cold start mitigation
- RxDB - Downsides of Offline First (rxdb.info) — Conflict resolution patterns
- Safari/iOS PWA Limitations (vinova.sg) — iOS storage clearing behavior

### Secondary (MEDIUM confidence)

**Competitive analysis:**
- PT Pioneer TrainHeroic Review — Coach pain points (slow editing, limited params)
- TrueCoach vs TrainHeroic (truecoach.co) — Feature comparison
- TeamBuildr vs TrainHeroic (teambuildr.com) — Feature comparison
- GetApp TrueCoach Reviews — User complaints (no PR celebration, no inter-client features)
- Software Advice Reviews — TrainHeroic limitations (can't rearrange movements)
- Coaching Software Comparison 2025 (joinit.com) — Industry landscape
- Best Personal Training Software 2025 (trainero.com) — Feature expectations

**Architecture resources:**
- Outstand - TypeScript Monorepo Setup — Monorepo best practices
- Dev.to - Ultimate Guide to TypeScript Monorepos — Sharing raw TypeScript sources
- oRPC Hono Adapter (orpc.dev) — Integration patterns
- Hono RPC Monorepo Example (github.com/sor4chi) — Reference implementation

**Domain patterns:**
- BridgeAthletic — Program delivery patterns (plan vs log separation)
- TeamBuildr — Workout tracking patterns (athlete experience)
- Vitruve AMS Guide — Athlete management patterns (coach workflows)

### Tertiary (LOW confidence)

- QuickCoach on Bloated Software (quickcoach.fit) — Anecdotal complaints about feature creep
- Blog posts on training spreadsheet limitations — Motivation for software but not technical guidance
- Fitness app UX mistakes (sportfitnessapps.com) — General UX principles, not training-specific

---
*Research completed: 2026-01-23*
*Ready for roadmap: yes*
