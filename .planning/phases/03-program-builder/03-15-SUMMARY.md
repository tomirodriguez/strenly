---
phase: 03-program-builder
plan: 15
subsystem: templates
tags: [templates, programs, use-cases, procedures, frontend]
dependency-graph:
  requires: [03-05, 03-08, 03-10]
  provides: [template-use-cases, template-procedures, template-frontend]
  affects: [future-program-creation-ux]
tech-stack:
  added: []
  patterns: [reuse-existing-use-case, specialized-mutation-hooks, modal-forms]
key-files:
  created:
    - packages/backend/src/use-cases/programs/save-as-template.ts
    - packages/backend/src/use-cases/programs/create-from-template.ts
    - packages/contracts/src/programs/template.ts
    - packages/backend/src/procedures/programs/templates.ts
    - apps/coach-web/src/features/programs/hooks/queries/use-templates.ts
    - apps/coach-web/src/features/programs/hooks/mutations/use-save-as-template.ts
    - apps/coach-web/src/features/programs/hooks/mutations/use-create-from-template.ts
    - apps/coach-web/src/features/programs/components/save-as-template-dialog.tsx
  modified:
    - packages/contracts/src/programs/index.ts
    - packages/backend/src/procedures/programs/index.ts
    - apps/coach-web/src/features/programs/views/new-program-view.tsx
    - apps/coach-web/src/components/programs/program-grid.tsx
decisions:
  - id: reuse-duplicate-program
    choice: "Template operations reuse duplicateProgram use case"
    rationale: "Deep copy logic already exists, templates just need isTemplate:true and athleteId:null"
  - id: template-verification
    choice: "createFromTemplate verifies source is a template"
    rationale: "Prevents creating programs from non-template programs via template endpoint"
  - id: dedicated-template-hooks
    choice: "Separate useTemplates and useCreateFromTemplate hooks"
    rationale: "Clearer API, proper cache invalidation, semantic clarity"
metrics:
  duration: "5 min"
  completed: "2026-01-25"
---

# Phase 03 Plan 15: Template System Summary

Backend use cases and frontend components for template operations with deep copy functionality

## One-liner

Template system leveraging existing duplicateProgram for save-as-template and create-from-template operations

## What Changed

### Task 1: Create Template Use Cases and Contracts

Created use cases and contracts for template operations:

**makeSaveAsTemplate:**
- Authorization check for programs:write
- Reuses makeDuplicateProgram with isTemplate:true, athleteId:null
- Returns full ProgramWithDetails

**makeCreateFromTemplate:**
- Authorization check for programs:write
- Verifies source program is actually a template
- Reuses makeDuplicateProgram with isTemplate:false
- Returns full ProgramWithDetails

**Template contracts:**
- `saveAsTemplateInputSchema` - programId, name, description
- `createFromTemplateInputSchema` - templateId, name, athleteId
- `listTemplatesInputSchema` - search, limit, offset
- `templateOutputSchema` - program with weekCount, sessionCount
- `templateWithDetailsOutputSchema` - full details with counts

### Task 2: Create Template Procedures and Update Router

Created thin oRPC procedures:

**saveAsTemplateProcedure:**
- Creates template from any program
- Returns template with weekCount, sessionCount

**createFromTemplateProcedure:**
- Creates program from template with validation
- Error NOT_A_TEMPLATE if source isn't a template
- Returns full ProgramWithDetails

**listTemplatesProcedure:**
- Uses existing listPrograms with isTemplate:true filter
- Returns templates with metadata

**Router updates:**
- Added `templates` sub-router: list, saveAs, createFrom

### Task 3: Create Frontend Template Components

**Query hooks:**
- `useTemplates(input?)` - Fetches templates list

**Mutation hooks:**
- `useSaveAsTemplate()` - Save program as template
- `useCreateFromTemplate()` - Create from template

**Components:**
- `SaveAsTemplateDialog` - Modal form for template name/description
- Updated `new-program-view.tsx` to use dedicated template hooks

## Key Files

| File | Purpose |
|------|---------|
| `save-as-template.ts` | Convert program to template |
| `create-from-template.ts` | Create program from template |
| `template.ts` (contracts) | Template Zod schemas |
| `templates.ts` (procedures) | Template API endpoints |
| `use-templates.ts` | List templates query hook |
| `use-save-as-template.ts` | Save as template mutation |
| `use-create-from-template.ts` | Create from template mutation |
| `save-as-template-dialog.tsx` | Template creation modal |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed unused variables in program-grid.tsx**

- **Found during:** Task 3 typecheck
- **Issue:** Unused `sessionRowIdsMap` and `selectedRowData` variables, unused `ExerciseRowActions` import
- **Fix:** Removed unused code
- **Files modified:** apps/coach-web/src/components/programs/program-grid.tsx
- **Impact:** Cleaner codebase, no runtime effect

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Reuse duplicateProgram | Template ops delegate to existing use case | Avoids code duplication for deep copy logic |
| Template verification | createFromTemplate validates isTemplate | Prevents misuse of template endpoint |
| Dedicated hooks | Separate useTemplates and useCreateFromTemplate | Clearer API boundaries and cache invalidation |
| weekCount/sessionCount | Schema includes counts | Templates show structure info in lists |

## Testing Notes

All packages typecheck successfully. Template system is ready for integration:
- Save any program as a template via SaveAsTemplateDialog
- Create programs from templates via new-program-view
- Templates are private to organization (multi-tenancy preserved)

## Next Phase Readiness

Template system complete for Phase 3 requirements:
- TPL-01: Coach can save any program as template
- TPL-02: Coach can create programs from templates
- TPL-03: Template metadata (name, description, week/session counts)
- TPL-04: Templates private to organization

**Dependencies satisfied:**
- Use cases from 03-05 (duplicateProgram)
- Contracts pattern from 03-08
- Frontend patterns from 03-10

**Integration points:**
- SaveAsTemplateDialog can be added to program editor actions
- Template selection already works in new-program-view

---
*Phase: 03-program-builder*
*Completed: 2026-01-25*
