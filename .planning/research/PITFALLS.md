# Domain Pitfalls

**Domain:** Training Planning SaaS (Coach/Athlete Platform)
**Project:** Strenly
**Researched:** 2026-01-23
**Overall Confidence:** HIGH (verified against official docs and multiple sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, security breaches, or complete adoption failure.

---

### P1: Grid Performance Death Spiral

**What goes wrong:** Building a custom Excel-like grid without virtualization. Once coaches have 50+ athletes with 12-week programs, the DOM bloats to 10,000+ cells. React re-renders cascade. UI becomes sluggish. Coaches abandon the product because "it's slower than Excel."

**Why it happens:**
- Underestimating data volume (52 weeks x 7 days x multiple exercises per day x dozens of athletes)
- Choosing a "simple" grid library that doesn't virtualize
- Prioritizing features over performance in early phases

**Consequences:**
- Coaches switch back to Excel/Google Sheets within first session
- Performance fixes require architecture rewrite (virtualizing retrofit is painful)
- The founder's core insight ("match Excel speed") becomes impossible

**Warning signs:**
- Grid feels sluggish with 500+ cells visible
- Memory usage spikes when scrolling
- "Layout thrashing" warnings in Chrome DevTools
- Frame drops below 60fps during cell edits

**Prevention:**
1. Choose virtualized grid library from day 1 (AG Grid, TanStack Virtual, Handsontable)
2. Implement row AND column virtualization (training grids are wide, not just tall)
3. Benchmark with realistic data: 20 athletes x 12 weeks x 5 exercises/day = 8,400 cells
4. Budget 16ms per interaction (60fps target)
5. Use `React.memo` and stable references for all grid props

**Phase mapping:** Phase 1 (Foundation) - Grid library selection is architectural decision, not feature decision

---

### P2: Multi-Tenant Data Leakage via Connection Pool Contamination

**What goes wrong:** Tenant A sees Tenant B's athlete data. This happens when:
- Connection pool returns connection with previous tenant's context still set
- Async context (AsyncLocalStorage) leaks between requests
- Cache serves wrong tenant's data
- Row-Level Security (RLS) policy has a gap

**Why it happens:**
- Over-reliance on RLS as "the solution" (it's a safety net, not a fortress)
- Shared connection pools without proper reset between requests
- Caching athlete/program data without tenant-scoping keys
- Race conditions in serverless cold starts

**Consequences:**
- Security breach (potential lawsuit, reputation destruction)
- GDPR/privacy violations
- Coaches lose trust, churn immediately
- May require public disclosure

**Warning signs:**
- Intermittent "wrong data" reports from users
- Cache hit ratios mysteriously high
- `SET LOCAL tenant_id` not appearing in query logs
- Tests pass individually but fail in parallel

**Prevention:**
1. Defense-in-depth: RLS + Application layer + Cache scoping
2. Use Neon's virtual tenant databases OR PostgreSQL RLS with `SET LOCAL` in every transaction
3. For Cloudflare Workers: use fresh database connections per request (Neon serverless driver handles this)
4. Cache keys MUST include `tenantId`: `cache.get(\`tenant:\${tenantId}:athlete:\${athleteId}\`)`
5. Never infer tenant from user without explicit context
6. Implement tenant isolation audit: query with wrong tenant context should return empty, not error

**Phase mapping:** Phase 2 (Auth/Multi-tenancy) - This is THE critical phase. Do not rush. Include penetration testing.

---

### P3: PWA Offline Sync Corruption

**What goes wrong:** Athlete logs workout offline. Coach edits the same day's program online. Athlete comes online. Data corrupts or silently overwrites coach's changes. Or worse: athlete's logged data disappears.

**Why it happens:**
- "Last write wins" is the default, but wrong for training data
- No conflict detection/resolution strategy
- IndexedDB cleared by iOS after 7 days of non-use
- Service worker caches stale program data

**Consequences:**
- Athletes lose workout logs (trust destroyed)
- Coaches lose program edits (productivity destroyed)
- Data integrity compromised silently
- iOS users especially affected (Apple's aggressive storage clearing)

**Warning signs:**
- QA can't reproduce bugs ("it worked when I tested it")
- Users report "my workout disappeared"
- Sync queue grows unbounded
- Network tab shows duplicate POST requests

**Prevention:**
1. Use CRDTs or operational transforms for concurrent edits (Yjs is excellent)
2. Implement version vectors, not timestamps, for conflict detection
3. Design for iOS's 7-day storage cap: sync aggressively, show "sync needed" warnings
4. Separate read cache (programs) from write queue (workout logs)
5. Workout logs are append-only; never overwrite, only merge
6. Show conflict resolution UI when needed (athlete sees: "Coach changed this. Keep your log or update?")

**Phase mapping:** Phase 4 (Athlete PWA) - Research CRDT patterns before planning this phase

---

### P4: Cloudflare Workers CPU Time Budget Exhaustion

**What goes wrong:** Complex operations (program generation, bulk updates, analytics) exceed 50ms CPU limit. Workers terminate mid-operation. Data left in inconsistent state.

**Why it happens:**
- Treating Workers like traditional Node servers
- Bundling heavy libraries (moment.js, lodash full)
- Running loops over large datasets server-side
- Not understanding CPU time vs wall-clock time

**Consequences:**
- Random "502 Bad Gateway" errors for coaches
- Bulk operations (copy program to 20 athletes) fail unpredictably
- Partial writes corrupt data
- Users blame the product, not the infrastructure

**Warning signs:**
- Sporadic timeouts on operations that usually work
- Wrangler logs show "exceeded CPU time limit"
- Operations work locally but fail in production
- Bundle size exceeds 1MB

**Prevention:**
1. Profile every endpoint with Wrangler's CPU time metrics
2. Use Cloudflare Queues for bulk operations (not inline processing)
3. Batch database operations (one query with 20 inserts, not 20 queries)
4. Lightweight libraries only: date-fns over moment, native over lodash
5. Move compute-heavy work to Cloudflare Durable Objects or client-side
6. Design for interruptibility: idempotent operations that can resume

**Phase mapping:** Phase 1 (Foundation) - Set up monitoring and patterns from start. Phase 3+ needs queue architecture.

---

### P5: Neon Database Cold Start + Edge Latency Double-Penalty

**What goes wrong:** Coach opens grid. First query takes 3-5 seconds (Neon cold start). Then each subsequent query adds 50-150ms (edge-to-database latency). Grid feels unresponsive despite edge deployment.

**Why it happens:**
- Neon scales to zero (great for cost, bad for latency)
- Edge function is fast, but database is still centralized
- Each cell edit triggers a round-trip
- No connection pooling strategy

**Consequences:**
- First load feels broken ("is this thing working?")
- Rapid edits (typing in cells) queue up, feel laggy
- Coaches perceive product as slow despite edge deployment
- Competitive disadvantage vs. native apps

**Warning signs:**
- p50 latency fine, p95 terrible (cold starts)
- "First request is slow" user reports
- Grid edits feel delayed by 200ms+
- Neon dashboard shows frequent scale-to-zero events

**Prevention:**
1. Use Neon's serverless driver with WebSocket connections (eliminates TLS handshake per query)
2. Enable Neon connection pooling (10K concurrent connections supported)
3. Consider Cloudflare Hyperdrive for connection pooling (but note: can't use with Neon serverless driver)
4. Implement optimistic updates: show change immediately, sync in background
5. Batch reads: fetch entire week's program in one query, not cell-by-cell
6. Keep Neon compute warm: scheduled ping or minimum compute size

**Phase mapping:** Phase 1 (Foundation) - Connection strategy is foundational. Phase 3 (Grid) needs optimistic UI.

---

### P6: Grid Accessibility Lawsuit Risk

**What goes wrong:** Grid works great with mouse, but:
- Keyboard users can't navigate cells
- Screen readers announce nothing useful
- Focus traps prevent Tab navigation
- WCAG 2.1 AA requirements unmet

A disabled coach or athlete (or their employer) files ADA complaint.

**Why it happens:**
- Accessibility deferred to "later"
- Custom grid built without ARIA roles
- Virtualization breaks screen reader assumptions
- Testing only with mouse/touch

**Consequences:**
- Legal action (ADA lawsuits are increasing)
- Public relations damage
- Retrofitting accessibility into grid is expensive
- Some organizations legally cannot adopt non-accessible software

**Warning signs:**
- Tab key doesn't move between cells
- Arrow keys don't navigate grid
- VoiceOver/NVDA reads nonsense
- Lighthouse Accessibility score < 90

**Prevention:**
1. Choose grid library with built-in accessibility (AG Grid, Handsontable)
2. Implement `role="grid"`, `aria-rowcount`, `aria-colcount` from day 1
3. Single tabstop for entire grid, arrow keys for internal navigation (WAI-ARIA pattern)
4. Test with keyboard-only every sprint
5. Test with VoiceOver (Mac) and NVDA (Windows) monthly
6. Document accessibility features for enterprise sales

**Phase mapping:** Phase 3 (Grid) - Accessibility is a requirement, not a feature. Block launch if unmet.

---

### P7: Clipboard Operations Browser Sandboxing

**What goes wrong:** Coach tries to copy cells from Excel, paste into grid. Nothing happens. Or: copy from grid, paste to Excel, formatting is wrong. Context menu "Paste" is grayed out.

**Why it happens:**
- Browser security blocks JavaScript clipboard read without user gesture
- Clipboard API requires secure context (HTTPS) and permission
- Different browsers handle `text/html` vs `text/plain` differently
- Safari/iOS has additional restrictions

**Consequences:**
- Core workflow (Excel-like editing) breaks
- Coaches can't migrate existing programs from Excel
- Feature that demos well in Chrome fails in Safari
- "Copy program" feature doesn't work reliably

**Warning signs:**
- Clipboard tests pass locally, fail in CI
- Safari users report "paste doesn't work"
- Context menu paste always disabled
- `navigator.clipboard.readText()` throws permission error

**Prevention:**
1. Use established grid library's clipboard handling (they've solved this)
2. Support keyboard shortcuts (Ctrl+V) not just context menu
3. Use `\t` (tab) and `\n` (newline) delimiters for Excel compatibility
4. Implement `sendToClipboard` callback for custom handling
5. Test on Safari, Firefox, Chrome, and in iframes
6. Graceful degradation: if Clipboard API fails, show manual paste textarea

**Phase mapping:** Phase 3 (Grid) - Test clipboard on all target browsers before launch

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or user frustration.

---

### P8: React 19 Concurrent Rendering + Grid State Tearing

**What goes wrong:** Grid shows inconsistent state during rapid edits. Cell A shows old value while Cell B shows new value. useSyncExternalStore warnings in console.

**Why it happens:**
- React 19 concurrent rendering can pause/resume renders
- External state (grid data) read at different times during render
- Virtualized cells render asynchronously
- MUI Data Grid bug with `ref` prop causes excessive re-renders

**Prevention:**
1. Use `useSyncExternalStore` for external grid state
2. Avoid passing `ref` to Data Grid unless necessary (React 19 bug)
3. Keep all non-primitive props referentially stable (`useMemo`)
4. Test with React Strict Mode and Concurrent Features enabled
5. Use `useTransition` for bulk updates, `useDeferredValue` for search/filter

**Phase mapping:** Phase 3 (Grid) - Include React 19 concurrent behavior in performance testing

---

### P9: Service Worker Update Nightmare

**What goes wrong:** Coach sees outdated program. Athlete sees different data than coach. Users don't know they're running old code. "Have you tried clearing your cache?" becomes support mantra.

**Why it happens:**
- Service workers cache aggressively
- Update detection is complex
- Users don't close tabs (no activation trigger)
- iOS PWAs especially sticky with old versions

**Prevention:**
1. Implement clear versioning in service worker
2. Show "Update available" toast with refresh action
3. Use `skipWaiting()` + `clients.claim()` for critical updates
4. Clean old caches in `activate` event
5. Version API responses separately from static assets
6. Implement "force refresh" button in settings

**Phase mapping:** Phase 4 (Athlete PWA) - Plan service worker update strategy explicitly

---

### P10: Two-Sided Platform Chicken-and-Egg

**What goes wrong:** No coaches sign up because no athletes use it. No athletes sign up because no coaches are on it. Growth stalls at zero.

**Why it happens:**
- Building both sides simultaneously
- No clear value proposition for first users
- Assuming "if we build it, they will come"

**Prevention:**
1. Focus on coach-side FIRST (they bring athletes)
2. Provide standalone value: coach can use grid even without athlete app
3. Easy athlete onboarding: coach sends link, athlete downloads PWA
4. Avoid marketplace dynamics initially (coach owns athlete relationship)
5. Single coach with 20 athletes = 21 users. Scale by coach acquisition.

**Phase mapping:** Phase 1-3 focus on coach value. Phase 4-5 add athlete experience.

---

### P11: Training Data Model Rigidity

**What goes wrong:** Built for strength training (sets x reps x weight). Endurance coach wants duration + distance. Gymnastics coach wants skills progression. Data model can't accommodate without rewrite.

**Why it happens:**
- Modeling training programs is surprisingly complex
- Different sports have different metrics
- Periodization structures vary (linear, undulating, block)
- Rushed schema design based on one use case

**Prevention:**
1. Research training periodization models before schema design
2. Use flexible schema: `metrics: JSONB` for sport-specific data
3. Define extensible exercise type system
4. Talk to coaches from 3+ different sports during design
5. Plan for: sets/reps, time/distance, RPE, percentage-based, skill progressions

**Phase mapping:** Phase 1 (Foundation) - Database schema is hardest to change. Research first.

---

### P12: oRPC/tRPC Type Safety False Confidence

**What goes wrong:** TypeScript says API is type-safe. Runtime explodes because:
- Database returned `null` where type said `string`
- Edge function parsed body differently than type definition
- Schema validation skipped for "performance"

**Why it happens:**
- Type safety is compile-time, not runtime
- Zod schemas defined but not enforced everywhere
- Database queries return `any` under the hood
- Optimistic assumptions about external data

**Prevention:**
1. Validate at EVERY boundary: API input, database output, external services
2. Use Drizzle's `$inferSelect` types to stay in sync with schema
3. oRPC includes runtime validation - don't bypass it
4. Test with malformed data, not just happy path
5. Implement error boundaries that show useful messages

**Phase mapping:** All phases - Validation discipline from day 1

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable without major rework.

---

### P13: Mobile Grid Finger-Fat Problem

**What goes wrong:** Cells are perfect on desktop, impossible to tap on phone. Coach tries to edit on iPad, keeps selecting wrong cell.

**Prevention:**
1. Minimum 44x44px touch targets (Apple HIG)
2. Test grid on actual tablets, not just responsive mode
3. Consider different interaction model for mobile (card view vs. grid)
4. Implement "edit mode" with larger input areas

**Phase mapping:** Phase 3 (Grid) - Include tablet testing in acceptance criteria

---

### P14: Bulk Operation Progress Blindness

**What goes wrong:** Coach copies program to 30 athletes. No progress indicator. They click again. Now 60 copies queued. System overloaded.

**Prevention:**
1. Show progress for operations > 1 second
2. Disable action button during operation
3. Use optimistic UI with "syncing..." indicator
4. Implement idempotency keys to prevent duplicates

**Phase mapping:** Phase 3 (Grid) - UX consideration for bulk actions

---

### P15: Timezone Training Terror

**What goes wrong:** Coach in New York schedules workout for Monday. Athlete in LA sees it on Sunday. Logged workout appears on wrong day for coach.

**Prevention:**
1. Store all dates in UTC
2. Store user timezone preferences
3. Display in local time, store in UTC
4. Date picker should be timezone-aware
5. Test with users in different timezones

**Phase mapping:** Phase 2 (Foundation) - Establish timezone handling pattern early

---

## Phase-Specific Warning Matrix

| Phase | Critical Pitfalls | Watch For |
|-------|-------------------|-----------|
| Phase 1: Foundation | P5 (Neon cold start), P11 (Data model) | Connection strategy, schema flexibility |
| Phase 2: Auth/Multi-tenancy | P2 (Data leakage) | RLS policies, tenant context propagation |
| Phase 3: Coach Grid | P1 (Performance), P6 (Accessibility), P7 (Clipboard), P8 (React 19) | Virtualization, keyboard nav, cross-browser |
| Phase 4: Athlete PWA | P3 (Offline sync), P9 (Service worker updates) | Conflict resolution, iOS storage limits |
| Phase 5: Scale | P4 (Workers CPU), P10 (Chicken-egg) | Queue architecture, growth strategy |

---

## Sources

### Grid Performance & Accessibility
- [MUI X Data Grid Performance](https://mui.com/x/react-data-grid/performance/)
- [AG Grid Accessibility](https://www.ag-grid.com/react-data-grid/accessibility/)
- [Handsontable Accessibility](https://handsontable.com/docs/react-data-grid/accessibility/)
- [MUI X React 19 Issue #15770](https://github.com/mui/mui-x/issues/15770)

### Multi-Tenant Security
- [Multi-Tenant Leakage: When Row-Level Security Fails](https://instatunnel.my/blog/multi-tenant-leakage-when-row-level-security-fails-in-saas)
- [Architecting Secure Multi-Tenant Data Isolation](https://medium.com/@justhamade/architecting-secure-multi-tenant-data-isolation-d8f36cb0d25e)
- [Drizzle ORM with Nile Database](https://orm.drizzle.team/docs/tutorials/drizzle-with-nile)

### PWA & Offline
- [Downsides of Offline First - RxDB](https://rxdb.info/downsides-of-offline-first.html)
- [Safari/iOS PWA Limitations](https://vinova.sg/navigating-safari-ios-pwa-limitations/)
- [Offline-First with IndexedDB and Sync](https://medium.com/@sohail_saifii/implementing-offline-first-with-indexeddb-and-sync-a-real-world-guide-0638c8d01056)

### Cloudflare Workers
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [How Workers Works](https://developers.cloudflare.com/workers/reference/how-workers-works/)
- [Neon with Cloudflare Workers](https://neon.com/docs/guides/cloudflare-workers)

### oRPC/Type Safety
- [tRPC vs oRPC Comparison](https://blog.logrocket.com/trpc-vs-orpc-type-safe-rpc/)
- [oRPC v1 Announcement](https://orpc.unnoq.com/blog/v1-announcement)

### Training/Fitness Domain
- [Why Spreadsheets Can't Scale Training](https://www.getadministrate.com/resources/guides/why-spreadsheets-cant-scale-to-manage-training/)
- [6 Reasons to Use S&C Software Over Excel](http://blog.trainheroic.com/6-reasons-strength-and-conditioning-software)
- [Fitness App UX Mistakes](https://www.sportfitnessapps.com/blog/5-uiux-mistakes-in-fitness-apps-to-avoid)

### Clipboard API
- [MUI X Data Grid Clipboard](https://mui.com/x/react-data-grid/clipboard/)
- [AG Grid Clipboard](https://www.ag-grid.com/react-data-grid/clipboard/)
