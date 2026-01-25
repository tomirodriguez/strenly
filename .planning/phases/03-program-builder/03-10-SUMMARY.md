---
phase: 03-program-builder
plan: 10
subsystem: frontend
tags: [react, tanstack-router, tanstack-query, programs, ui]
dependency-graph:
  requires: [03-08, 03-09]
  provides: [programs-list-page, new-program-page, program-api-hooks]
  affects: [03-11-grid-editor]
tech-stack:
  added: []
  patterns: [feature-folders, view-components, mutation-invalidation]
key-files:
  created:
    - apps/coach-web/src/features/programs/hooks/queries/use-programs.ts
    - apps/coach-web/src/features/programs/hooks/queries/use-program.ts
    - apps/coach-web/src/features/programs/hooks/mutations/use-create-program.ts
    - apps/coach-web/src/features/programs/hooks/mutations/use-duplicate-program.ts
    - apps/coach-web/src/features/programs/hooks/mutations/use-archive-program.ts
    - apps/coach-web/src/features/programs/components/program-card.tsx
    - apps/coach-web/src/features/programs/components/program-form.tsx
    - apps/coach-web/src/features/programs/views/programs-list-view.tsx
    - apps/coach-web/src/features/programs/views/new-program-view.tsx
    - apps/coach-web/src/routes/_authenticated/$orgSlug/programs/index.tsx
    - apps/coach-web/src/routes/_authenticated/$orgSlug/programs/new.tsx
    - apps/coach-web/src/routes/_authenticated/$orgSlug/programs/$programId.tsx
  modified: []
decisions:
  - id: select-over-combobox
    choice: "Use Select component instead of Combobox for athlete/template selection"
    rationale: "Simpler implementation, no need for search functionality with small lists"
  - id: feature-folder-hooks
    choice: "Organize hooks under features/programs/hooks/queries and mutations"
    rationale: "Consistent with existing athletes/exercises patterns"
  - id: program-cards-grid
    choice: "Display programs as card grid instead of table"
    rationale: "Programs are visual objects with status/metadata, cards better represent them"
metrics:
  duration: "6 min"
  completed: "2026-01-25"
---

# Phase 03 Plan 10: Programs List and Creation Frontend Summary

Programs list page, creation page, and API hooks for program management

## One-liner

Complete programs frontend with list view, creation form, API hooks, and placeholder editor page

## What Changed

### Task 1: Create Program API Hooks

Created TanStack Query hooks for program operations in `apps/coach-web/src/features/programs/hooks/`:

**Query hooks:**
- `usePrograms(filters?)` - Fetches paginated programs list with optional filters (athleteId, isTemplate, status, search, limit, offset)
- `useProgram(programId)` - Fetches single program with full details (weeks, sessions, rows) for grid view

**Mutation hooks:**
- `useCreateProgram()` - Creates new program, invalidates cache, shows toast
- `useDuplicateProgram()` - Duplicates program (for template instantiation), invalidates cache
- `useArchiveProgram()` - Archives program (soft delete), invalidates cache

All hooks follow established patterns from athletes feature.

### Task 2: Create Programs List and Creation Pages

**Programs List View (`programs-list-view.tsx`):**
- Card grid display for visual program browsing
- Search by program name
- Status filter (all/draft/active/archived)
- Templates toggle to filter only templates
- Empty state with CTA when no programs exist
- Loading state with skeleton cards

**Program Card Component (`program-card.tsx`):**
- Displays program name, description preview
- Status badge (Borrador/Activo/Archivado)
- Week count badge
- Athlete name display if assigned
- Last updated date
- Dropdown menu with Edit, Duplicate, Archive actions

**Program Form Component (`program-form.tsx`):**
- Name field (required, 3-100 chars)
- Description textarea (optional, max 500 chars)
- Athlete select dropdown (optional)
- React Hook Form with Zod validation

**New Program View (`new-program-view.tsx`):**
- Template selector to create from existing template
- Program form for details
- Cancel/Create buttons
- Navigates to editor on success

**Program Editor Placeholder (`$programId.tsx`):**
- Displays program info after creation
- Shows week/session counts
- Placeholder message for upcoming grid editor

**Route Files:**
- `programs/index.tsx` - Programs list at `/$orgSlug/programs`
- `programs/new.tsx` - Create program at `/$orgSlug/programs/new`
- `programs/$programId.tsx` - Editor at `/$orgSlug/programs/:programId`

## Key Files

| File | Purpose |
|------|---------|
| `hooks/queries/use-programs.ts` | List programs query |
| `hooks/queries/use-program.ts` | Single program query |
| `hooks/mutations/use-create-program.ts` | Create mutation |
| `hooks/mutations/use-duplicate-program.ts` | Duplicate mutation |
| `hooks/mutations/use-archive-program.ts` | Archive mutation |
| `components/program-card.tsx` | Card for grid display |
| `components/program-form.tsx` | Create/edit form |
| `views/programs-list-view.tsx` | List page component |
| `views/new-program-view.tsx` | Creation page |
| `routes/programs/index.tsx` | List route |
| `routes/programs/new.tsx` | Create route |
| `routes/programs/$programId.tsx` | Editor route |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Changed Combobox to Select for athlete/template selection**

- **Found during:** Task 2 typecheck
- **Issue:** Base UI Combobox `getOptionLabel` prop doesn't exist in our wrapper
- **Fix:** Switched to Select component which has built-in label display via `items` prop
- **Files modified:** program-form.tsx, new-program-view.tsx
- **Impact:** Simpler implementation, works correctly

None - minor implementation adjustment, not architectural.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Select over Combobox | Use Select for athlete/template dropdowns | Simpler API, no search needed for small lists |
| Card grid display | Show programs as visual cards not table | Programs are complex objects with status, better represented as cards |
| Feature folder hooks | Organize under features/programs/hooks/{queries,mutations} | Consistent with athletes/exercises patterns |
| Placeholder editor | Create basic program detail view | Allows navigation flow to work before grid is built |

## Testing Notes

All frontend code typechecks successfully. Routes integrate with existing navigation:
- Programs link in sidebar already exists (added in design system phase)
- Routes use TanStack Router file-based routing
- API hooks use oRPC `key()` method for cache invalidation

## Next Phase Readiness

Ready for grid editor development:
- API hooks provide program data with full details
- Program detail page exists as shell for grid component
- Create flow works end-to-end (list -> new -> editor)

**Prerequisites satisfied:**
- Backend API complete (03-08, 03-09)
- Frontend routes and hooks in place
- Navigation structure ready

**Next steps:**
- Implement Excel-like grid component
- Add keyboard navigation
- Implement cell editing for prescriptions
- Add drag-and-drop row reordering

---
*Phase: 03-program-builder*
*Completed: 2026-01-25*
