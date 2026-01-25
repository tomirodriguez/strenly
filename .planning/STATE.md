# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-24)

**Core value:** Coaches can create and edit training programs as fast as they can in Excel
**Current focus:** Phase 3.2 - Prescription Data Structure Refactor (IN PROGRESS)

## Current Position

Phase: 3.2 of 5 (Prescription Data Structure Refactor)
Plan: 5/8 - Use Cases complete
Status: In progress
Last activity: 2026-01-25 - Completed 03.2-05-PLAN.md (use cases)

Progress: [████████████████████████████████░] Phases 1, 2, 2.5, 2.6, 3.1 COMPLETE, Phase 3.2 Plans 01-05 complete

**Note:** Phase 3.1 replaced react-datasheet-grid with custom HTML table. All gap closure plans (08-17) complete. Superset adjacency maintained on all operations.

## Performance Metrics

**Velocity:**
- Total plans completed: 45
- Average duration: 4 min
- Total execution time: ~170 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 7/7 | 66 min | 9 min |
| 2 | 11/11 | 30 min | 2.7 min |
| 2.5 | 11/11 | ~20 min | ~2 min |
| 3.1 | 17/17 | ~72 min | ~4.2 min |

**Recent Trend:**
- Last 5 plans: 03.1-17 (5 min), 03.2-02 (~5 min), 03.2-03 (3 min), 03.2-04 (~3 min), 03.2-05 (2 min)
- Trend: Phase 3.2 use case layer complete

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **Architecture-first planning (MANDATORY)** - All plans must include domain entities, ports, repositories for new concepts.
- **90%+ test coverage on core** - Domain entities and authorization must have comprehensive tests.
- **neverthrow for use cases** - Use cases return ResultAsync<Success, Error> with discriminated unions
- **Factory functions return Result<Entity, Error>** - Domain entities use createEntity() pattern with neverthrow
- **Domain entities are immutable** - All properties are readonly
- **Repository factory functions** - createPlanRepository, createSubscriptionRepository, createAthleteRepository for DI
- **Value objects as const arrays** - MuscleGroup and MovementPattern use const arrays with type guards
- **Curated vs Custom via nullable organizationId** - organizationId: null for curated, string for custom
- **Public invitation token lookup** - findByToken/markAccepted have no OrganizationContext for acceptance flow
- **Cryptographic invitation tokens** - 256-bit random via crypto.randomBytes, base64url encoded (43 chars)
- **Type guards for enum parsing** - isAthleteStatus/isAthleteGender instead of 'as' casting
- **Soft delete via status** - archive() sets status to inactive, preserves data
- **Junction table batch fetching** - Fetch muscle mappings in separate query after main exercise query
- **Lookup repositories without ports** - Simple read-only repositories (MuscleGroup) don't need core ports
- **Authorization-first in use cases** - Always check hasPermission() before any business logic
- **Update merges with existing** - Update use cases merge input with existing entity before validation
- **OrganizationLookup interface** - Simplified interface for name resolution in public endpoints
- **Token-based public endpoints** - Accept/get-info use token as credential, no OrganizationContext
- **Clone provenance tracking** - Clone stores clonedFromId to track source exercise
- **Access control returns not_found** - Unauthorized access returns not_found to prevent information leakage
- **contracts/package.json exports** - Add explicit exports for module path resolution
- **crypto.randomUUID()** - Use built-in Web Crypto API instead of nanoid for ID generation
- **Session auth for acceptInvitation** - Athlete accepting has auth but no org context, use sessionProcedure
- **Public endpoint for invitationInfo** - Invitation display accessible without login via publicProcedure
- **Direct DB queries for org lookup** - Better-Auth API requires headers, public endpoints query DB directly
- **Static exercise IDs** - Descriptive IDs like ex-barbell-bench-press for referential stability
- **Seed orchestrator pattern** - index.ts orchestrates individual seed modules in dependency order
- **Organization sync in AuthenticatedLayout** - useActiveOrganization + setCurrentOrgSlug in layout for API header sync
- **DropdownMenuLabel requires DropdownMenuGroup** - Base UI MenuGroupRootContext is only provided by MenuPrimitive.Group wrapper
- **DataTable compound component children** - DataTable.Content and DataTablePagination must be descendants of DataTable.Root for context access
- **Custom Zod error messages** - Use { message: '...' } in validation rules for user-friendly error text
- **Optional string fields in Zod** - Use .or(z.literal('')) for optional strings that receive empty form values
- **Modal for forms, drawer for context** - Use Dialog for focused forms, Sheet for contextual panels where page awareness matters
- **Single Toaster in __root.tsx** - Toaster component placed in __root.tsx (inside providers), not main.tsx
- **sessionProcedure for createSubscription** - User is authenticated during onboarding but has no org context yet
- **URL-based org routing** - All authenticated routes use `/:orgSlug/*` pattern, org slug synced to X-Organization-Slug header
- **No setActive() needed - URL slug is source of truth** - Organization context from URL, X-Organization-Slug header via setCurrentOrgSlug(), no database calls for active org
- **Better-Auth metadata is already parsed** - org.metadata in hooks is an object, not a JSON string
- **Onboarding uses standalone full-width layout** - Not inside AuthLayout, uses header + centered content pattern
- **Slug auto-generation via onChange** - Use onChange callbacks instead of useEffect for derived input values
- **Context providers for route data caching** - AuthProvider at _authenticated, OrganizationProvider at $orgSlug, use hooks instead of Better-Auth hooks in components
- **zodResolver for forms** - Use zodResolver as primary resolver, standardSchemaResolver as fallback, Controller for controlled components (Checkbox, Select)
- **Select items prop for label display** - Pass items array to Select.Root for Base UI SelectValue to display labels instead of raw values
- **Empty string coercion uses || not ??** - Nullish coalescing doesn't catch empty strings from forms, use || for optional field coercion
- **Database ID prefix handling in repository layer** - Strip/add prefixes like mg- in repository mapToDomain/query, not in domain
- **Node types for crypto module** - Added @types/node to core and backend packages for node:crypto import in athlete-invitation.ts
- **oRPC key() for cache invalidation** - Use orpc.{procedure}.key() instead of custom query key factories for type-safe invalidation
- **OKLCH color space for CSS variables** - Use OKLCH for perceptual uniformity in color tokens
- **Dark mode via .dark class** - Use classList.toggle('dark') on document.documentElement (shadcn/ui standard)
- **Slate palette for dark theme** - slate-950 background, slate-900 cards, slate-800 borders, blue-600 primary
- **User menu in sidebar footer** - User profile dropdown moved from header to sidebar footer
- **Sidebar three-section layout** - Header (logo), content (nav groups), footer (user profile)
- **AppHeader with primaryAction slot** - Optional CTA button passed through AppShell
- **Active nav via isActive prop + data-active** - SidebarMenuButton uses isActive prop, styles via data-active:bg-sidebar-primary
- **text-muted-foreground for inactive nav** - Nav items use muted gray for inactive state
- **Brand name is STRENLY (uppercase)** - Sidebar header shows "STRENLY" with text-xl
- **Nav items use size=lg** - SidebarMenuButton with size="lg", gap-3, px-4 for larger click targets
- **Design system documentation** - Comprehensive docs at docs/design-system.md with OKLCH palette reference
- **JSONB for prescription data** - prescriptions table uses JSONB with $type<ParsedPrescription>() for typed structured data
- **Self-referencing parentRowId for split rows** - program_exercises uses parentRowId for same-exercise multiple-config rows
- **Unique (exerciseId, weekId) for cell identity** - prescriptions table unique constraint identifies grid cells
- **Program status one-way transitions** - draft -> active -> archived; programs cannot be unarchived
- **Program name 3-100 chars** - Minimum 3 to prevent short names like "AB"
- **Tempo 4-char ECCC format** - Digits or X for explosive (31X0), normalized to uppercase
- **Intensity bounds by type** - percentage 0-100, RPE/RIR 0-10, absolute >= 0
- **AMRAP requires repsMin 0** - Cannot specify reps when AMRAP is true
- **Access verification helpers** - Internal functions to verify organization ownership for nested entities (weeks, sessions, rows)
- **Result discriminant pattern** - Return { ok: true, data } | { ok: false, error } from async operations for TypeScript narrowing
- **Intensity unit mapping in repository** - Database uses both intensityType and intensityUnit; repository handles translation
- **programId in delete/duplicate inputs** - Require programId for efficient week/session count checks
- **Last entity protection** - Prevent deletion of last week/session at use case level (programs must have at least 1 of each)
- **Nested router structure for grid ops** - programs.weeks.add, programs.exerciseRows.update, etc. for logical API organization
- **Prescription endpoint returns nullable** - parsedPrescriptionSchema.nullable() - null for cleared cells, structured data otherwise
- **Select over Combobox for small lists** - Use Select component instead of Combobox when search isn't needed (athlete/template selectors)
- **Modal for required input, direct mutation for optional** - Grid toolbar uses modal for session name (required) but direct mutation for week name (optional with auto-generate)
- **onActiveCellChange for row tracking** - react-datasheet-grid provides cell via onActiveCellChange({ cell }), use cell.row to track selected row for keyboard shortcuts
- **Template ops reuse duplicateProgram** - Save-as-template and create-from-template delegate to existing deep copy logic
- **Template verification in createFromTemplate** - Verify source is actually a template before creating program
- **weeksCount optional with backend default** - Schema uses .optional(), backend applies default of 4. Avoids Zod z.infer output type conflicts with React Hook Form.
- **Combobox for searchable dropdowns with server-side search** - Use @base-ui/react Combobox instead of custom Popover for built-in ARIA and keyboard navigation
- **Roving tabindex for grid navigation** - W3C ARIA Grid pattern with only active cell having tabIndex=0
- **Direction-aware navigation skips non-navigable rows** - Arrow key navigation skips session-header rows in direction of movement
- **Separate navigation and editing hooks** - useGridNavigation for cell focus, useCellEditing for edit mode state
- **Arrow navigation at cursor boundaries** - In prescription cells, left/right arrows only navigate when cursor is at start/end of text
- **Table without role="grid" for lint compliance** - Semantic table element with keyboard handlers, role attribute removed for Biome lint
- **Fetch existing before partial update** - Use findById before updateX to preserve non-input fields (e.g., orderIndex)
- **DOM focus via requestAnimationFrame** - Use requestAnimationFrame for focus after state changes to ensure DOM updates complete
- **Ref-based last edited cell tracking** - Store last edited cell in ref for focus restoration without triggering re-renders
- **Single click selects, double-click edits** - Excel convention: onClick triggers selection, onDoubleClick triggers edit mode
- **Navigation keys bubble from cells to grid** - Cells only handle edit triggers (Enter, F2, printable chars); arrow/tab bubble to grid
- **Dynamic supersetOrder from physical position** - Calculate display order (A1, A2) from row position rather than stored values to avoid stale numbers after reordering
- **Row repositioning on superset join** - When adding to an existing superset, physically move the row adjacent to other group members
- **Everything is a group labeling** - Standalone exercise = group of 1 (A1), superset = group of N (B1, B2, B3); eliminates two-system complexity
- **Superset removal repositions to end** - When removing row from superset, move it to end of session to prevent staying between group members
- **Reorder auto-repairs superset adjacency** - ensureSupersetAdjacency helper consolidates split superset groups before persisting order
- **PrescriptionSeries orderIndex as parameter** - createPrescriptionSeries(input, orderIndex) takes index as second parameter for array iteration
- **ExerciseGroup name normalization** - Empty/whitespace names normalized to null for consistent auto-letter generation
- **Reconstitute for DB loads** - Domain entities use reconstitute(props) function for database loads without validation
- **Empty/skip returns empty array** - parsePrescriptionToSeries("") and parsePrescriptionToSeries("—") return [] for easier downstream handling
- **Partial invalid fails all** - Multi-part notation with any invalid part returns null entirely
- **Consecutive grouping only** - formatSeriesToNotation only groups consecutive identical series, not non-adjacent
- **saveDraft in prescriptions sub-router** - Placed at programs.prescriptions.saveDraft alongside existing update
- **Conflict warning vs blocking** - saveDraft returns conflictWarning string rather than blocking, client decides handling
- **mapRepoError helper** - Use typed helper function to map discriminated union errors from repository

### Pending Todos

- Configure Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- Generate BETTER_AUTH_SECRET
- Set DATABASE_URL for database operations
- Consider removing old program-grid.tsx (react-datasheet-grid version)

### Roadmap Evolution

- Phase 3.1 inserted after Phase 3: Custom Program Grid (URGENT) - UAT revealed react-datasheet-grid doesn't match design system, need custom implementation
- Phase 3.1 COMPLETE - Custom grid now matches design system
- Phase 3.2 inserted after Phase 3.1: Prescription Data Structure Refactor (URGENT) - Current data model stores sets as single number, making variations complex; refactor to series-as-array model with exercise groups and client-side editing

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Translate UI and error messages to Spanish | 2026-01-24 | 0a9874a | [001-translate-ui-and-error-messages-to-spani](./quick/001-translate-ui-and-error-messages-to-spani/) |
| 002 | Fix onboarding flow: coach type, plan selection, org routing | 2026-01-24 | 59944c2 | [002-fix-onboarding-flow-coach-type-plan-org-routing](./quick/002-fix-onboarding-flow-coach-type-plan-org-routing/) |
| 003 | Fix duplicate toasts on login error | 2026-01-24 | 21b88b7 | [003-fix-duplicate-toasts-login-error](./quick/003-fix-duplicate-toasts-login-error/) |
| 004 | Fix onboarding infinite loop after sign-in | 2026-01-24 | a909deb | [004-fix-onboarding-infinite-loop](./quick/004-fix-onboarding-infinite-loop/) |
| 005 | Fix onboarding org creation, layout, slug generation | 2026-01-24 | 47c7b9a | [005-fix-onboarding-org-creation-error-form-l](./quick/005-fix-onboarding-org-creation-error-form-l/) |
| 006 | Add AuthProvider and OrganizationProvider for context caching | 2026-01-24 | 33083ce | [006-add-authprovider-and-organizationprovide](./quick/006-add-authprovider-and-organizationprovide/) |
| 007 | Polish step components visual design | 2026-01-24 | 8885ba2 | - |
| 008 | Fix session and organization API calls on navigation | 2026-01-24 | 6d28f99 | [008-fix-session-and-organization-api-calls-o](./quick/008-fix-session-and-organization-api-calls-o/) |
| 009 | Migrate create athlete drawer to modal and add modal vs drawer rules | 2026-01-24 | 5742c7d | [009-migrate-create-athlete-drawer-to-modal-a](./quick/009-migrate-create-athlete-drawer-to-modal-a/) |
| 010 | Remove planId subscription logic from auth hook | 2026-01-25 | a20679a | [010-remove-planid-from-org-metadata-onboarding](./quick/010-remove-planid-from-org-metadata-onboarding/) |
| 011 | Fix Select showing value instead of label | 2026-01-25 | 34ebdfd | [011-fix-select-showing-value-instead-of-label](./quick/011-fix-select-showing-value-instead-of-label/) |
| 012 | Audit and refactor forms to skill pattern | 2026-01-25 | 50ef1fd | [012-audit-and-refactor-forms-to-skill-patter](./quick/012-audit-and-refactor-forms-to-skill-patter/) |
| 013 | Update oRPC query skill and refactor query invalidations | 2026-01-25 | 25934b3 | [013-update-orpc-query-skill-and-refactor-que](./quick/013-update-orpc-query-skill-and-refactor-que/) |
| 014 | Fix invitation modal unified invitar action | 2026-01-25 | 6c7ecb8 | [014-fix-invitation-modal-unified-invitar-act](./quick/014-fix-invitation-modal-unified-invitar-act/) |
| 015 | Change athletes table default sort to updatedAt descending | 2026-01-25 | 2e8e339 | [015-change-athletes-table-default-sort-to-up](./quick/015-change-athletes-table-default-sort-to-up/) |
| 016 | Fix invitation modal unified action and skeleton loading | 2026-01-25 | a47b32b | [016-fix-invitation-modal-unified-action-skeleton-loading](./quick/016-fix-invitation-modal-unified-action-skeleton-loading/) |
| 016b | Fix dropdown menu min-width for action items | 2026-01-25 | 8c71475 | [016-fix-dropdown-menu-min-width-for-action-i](./quick/016-fix-dropdown-menu-min-width-for-action-i/) |
| 017 | Add dev latency middleware (random 200-500ms) | 2026-01-25 | 78c3c21 | [017-add-dev-latency-middleware](./quick/017-add-dev-latency-middleware/) |
| 018 | Redirect, breadcrumbs, sidebar collapse | 2026-01-25 | 89a1b77 | [018-redirect-slug-dashboard-breadcrumb-sidebar](./quick/018-redirect-slug-dashboard-breadcrumb-sidebar/) |
| 019 | Remove hover on active sidebar items | 2026-01-25 | 2cfb380 | [019-remove-the-hover-on-active-items-in-the-](./quick/019-remove-the-hover-on-active-items-in-the-/) |
| 020 | Fix collapsed sidebar layout and icon sizes | 2026-01-25 | 3d64977 | [020-fix-collapsed-sidebar-layout-and-icon-si](./quick/020-fix-collapsed-sidebar-layout-and-icon-si/) |

## Phase 2 Progress

**Exercise Library & Athlete Management COMPLETE:**

| Plan | Name | Status |
|------|------|--------|
| 02-01 | Database Schema | Complete |
| 02-02 | Athlete Domain Entity | Complete |
| 02-03 | Exercise Domain Entity | Complete |
| 02-04 | Athlete Repositories | Complete |
| 02-05 | Exercise Repositories | Complete |
| 02-06 | Athlete Use Cases | Complete |
| 02-07 | Athlete Invitation Use Cases | Complete |
| 02-08 | Exercise Use Cases | Complete |
| 02-09 | Athlete Contracts & Procedures | Complete |
| 02-10 | Exercise Contracts & Procedures | Complete |
| 02-11 | Database Seed | Complete |

## Phase 3 Progress

**Program Builder COMPLETE:**

| Plan | Name | Status |
|------|------|--------|
| 03-01 | Database Schema | Complete |
| 03-02 | Prescription Notation Parser | Complete |
| 03-03 | Domain Entities | Complete |
| 03-04 | Program Repository | Complete |
| 03-05 | Program CRUD + Duplicate Use Cases | Complete |
| 03-06 | Week and Session Use Cases | Complete |
| 03-07 | Exercise Row & Prescription Use Cases | Complete |
| 03-08 | Program Contracts | Complete |
| 03-09 | Grid Manipulation Procedures | Complete |
| 03-10 | Programs List and Creation Frontend | Complete |
| 03-11 | Core Grid Components | Complete |
| 03-12 | Program Editor Page | Complete |
| 03-13 | Grid Manipulation Interactions | Complete |
| 03-14 | Week Column Actions Menu | Complete |
| 03-15 | Template System | Complete |

## Phase 3.1 Progress

**Custom Program Grid COMPLETE:**

| Plan | Name | Status |
|------|------|--------|
| 03.1-01 | Programs Table Component | Complete |
| 03.1-02 | Create Program Form Improvements | Complete |
| 03.1-03 | Grid Foundation | Complete |
| 03.1-04 | Grid Structural Components | Complete |
| 03.1-05 | Exercise Cell Components | Complete |
| 03.1-06 | Row Components | Complete |
| 03.1-07 | Final Integration | Complete |
| 03.1-08 | Athlete Selector Server-Side Search | Complete |
| 03.1-09 | Week Ordering Bug Fix | Complete |
| 03.1-10 | Dynamic Superset Groups | Complete |
| 03.1-11 | Keyboard Navigation & Edit Mode Fix | Complete |
| 03.1-12 | Athlete Selector Accessibility | Complete |
| 03.1-13 | Superset Grouping Fix | Complete |
| 03.1-14 | Remove Redundant Athlete Selector Option | Complete |
| 03.1-15 | Unified Row Labeling | Complete |
| 03.1-16 | Athlete Selector Empty State Fix | Complete |
| 03.1-17 | Superset Row Positioning Fixes | Complete |

**Key artifacts:**
- `apps/coach-web/src/components/programs/program-grid/types.ts` - Grid type definitions
- `apps/coach-web/src/components/programs/program-grid/use-grid-navigation.ts` - Keyboard navigation hook
- `apps/coach-web/src/components/programs/program-grid/use-cell-editing.ts` - Cell editing state management
- `apps/coach-web/src/components/programs/program-grid/transform-program.ts` - API-to-grid data transformer
- `apps/coach-web/src/components/programs/program-grid/superset-indicator.tsx` - Vertical blue line for superset grouping
- `apps/coach-web/src/components/programs/program-grid/exercise-row-prefix.tsx` - Row prefix (A1, B2) with styling
- `apps/coach-web/src/components/programs/program-grid/exercise-cell.tsx` - First column cell with combobox editing
- `apps/coach-web/src/components/programs/program-grid/grid-header.tsx` - Sticky header with week columns
- `apps/coach-web/src/components/programs/program-grid/session-header-row.tsx` - Full-width session dividers
- `apps/coach-web/src/components/programs/program-grid/add-exercise-row.tsx` - End-of-session exercise addition
- `apps/coach-web/src/components/programs/program-grid/prescription-cell.tsx` - Editable prescription cell with keyboard support
- `apps/coach-web/src/components/programs/program-grid/exercise-row.tsx` - Complete exercise row composition
- `apps/coach-web/src/components/programs/program-grid/grid-body.tsx` - Grid body with all row types
- `apps/coach-web/src/components/programs/program-grid/program-grid.tsx` - Main grid container component
- `apps/coach-web/src/components/programs/program-grid/index.ts` - Public exports
- `apps/coach-web/src/styles/program-grid.css` - Grid-specific CSS styles (updated for custom table)

## Phase 3.2 Progress

**Prescription Data Structure Refactor IN PROGRESS:**

| Plan | Name | Status |
|------|------|--------|
| 03.2-01 | Database Schema | Complete |
| 03.2-02 | Domain Entities | Complete |
| 03.2-03 | Multi-Part Parser | Complete |
| 03.2-04 | Contracts and Repository Layer | Complete |
| 03.2-05 | Use Cases | Complete |
| 03.2-06 | Contracts & Procedures | Pending |
| 03.2-07 | Client-Side State | Pending |
| 03.2-08 | Data Migration | Pending |

**Key artifacts:**
- `packages/core/src/domain/entities/prescription-series.ts` - Single set entity
- `packages/core/src/domain/entities/exercise-group.ts` - Group container entity
- `packages/contracts/src/programs/prescription.ts` - Multi-part notation parser with series support
- `packages/contracts/src/programs/exercise-group.ts` - Exercise group contracts
- `packages/contracts/src/programs/save-draft.ts` - Bulk save input/output schemas
- `packages/core/src/ports/program-repository.port.ts` - Updated with group methods and saveDraft
- `packages/backend/src/infrastructure/repositories/program.repository.ts` - Group and saveDraft implementation
- `packages/backend/src/use-cases/programs/save-draft.ts` - Bulk save use case with auth and conflict detection
- `packages/backend/src/procedures/programs/save-draft.ts` - saveDraft procedure

## Session Continuity

Last session: 2026-01-25
Stopped at: Completed 03.2-05-PLAN.md (use cases)
Resume file: None

**Next:** Phase 3.2 Plan 06 (Contracts & Procedures).
