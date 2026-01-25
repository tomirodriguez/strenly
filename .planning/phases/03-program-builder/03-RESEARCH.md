# Phase 3: Program Builder - Research

**Researched:** 2026-01-25 (Updated with UI/UX specifications)
**Domain:** Excel-like grid editing, keyboard navigation, inline editing, prescription notation parsing
**Confidence:** HIGH

## Summary

This phase requires building an Excel-like program builder where coaches can create and edit training programs with keyboard navigation and inline editing. The core technical challenges are:

1. **Grid Component Selection**: Choosing between building custom on TanStack Table or using a dedicated spreadsheet library
2. **Keyboard Navigation**: Implementing arrow key navigation, Tab, Enter, and Escape for cell editing
3. **Natural Notation Parsing**: Parsing training prescriptions like `3x8@120kg`, `4x6-8@RIR2`, `3x10@75%`, `3x8@120kg (3110)`
4. **Performance**: Handling 1-10+ weeks of program data (potentially hundreds of cells) efficiently
5. **Split Rows**: Same exercise with multiple set configurations (Heavy Singles + Back-off Volume)
6. **Superset Visual Grouping**: B1/B2/B3 exercises connected with vertical line

The research reveals two viable approaches: (1) react-datasheet-grid for maximum Excel-like behavior out of the box, or (2) custom implementation on TanStack Table for tighter integration with existing codebase. Given the project already uses TanStack Table and the React 19 compatibility concerns with react-datasheet-grid, **the recommended approach is to use react-datasheet-grid via a React 19 compatible fork (@wasback/react-datasheet-grid) for the program grid**, while keeping TanStack Table for simpler list views like athletes and exercises.

**Primary recommendation:** Use @wasback/react-datasheet-grid (MIT, React 19 compatible fork) for the program builder grid, implement custom prescription notation parser using regex patterns, and leverage existing TanStack Table for auxiliary lists.

## UI/UX Specifications Reference

**Source:** `.planning/phases/03-program-builder/ui-ux-specifications/` (screen.png, code.html)

### Grid Layout Structure
- **Columns:** Exercise/Pairing (sticky) + N week columns (1 to 10+, coach decides)
- **Rows:** Exercises grouped by session (day), with day headers as separators
- **Week names:** Simple string field, default "Semana X" (coach can rename to anything)

### Key UI Patterns from Mockup

#### 1. Split Rows (Sub-rows for same exercise)
Same exercise can have multiple rows with different set configurations:
```
| A1 | Safety Bar Squat | HEAVY SINGLES    | 1x1 @ 140kg | 1x1 @ 145kg | ...
| A1 | Safety Bar Squat | BACK-OFF VOLUME  | 3x5 @ 120kg | 3x5 @ 125kg | ...
```
- Second row shows exercise name dimmed
- Set type label badge: "HEAVY SINGLES", "BACK-OFF VOLUME", "BACK-OFF", "VOLUME"
- Keyboard shortcut: `Shift + Enter` to add sub-row

#### 2. Superset Visual Connector
Exercises in superset (B1, B2, B3) connected with vertical blue line:
```css
.superset-line { /* starts from mid, goes down */ }
.superset-line-mid { /* connects through middle */ }
.superset-line-end { /* ends at last exercise */ }
```
- Superset prefix (B1, B2) displayed in primary color (blue)
- Keyboard shortcut: `S` to toggle superset grouping

#### 3. Day/Session Headers
Full-width row separating sessions:
```
DÍA 1 • SQUAT DOMINANT
DÍA 2 • PUSH / UPPER BODY
DÍA 3 • DEADLIFT / HINGE
```

#### 4. Exercise Column Structure
```
| Prefix | Exercise Name        | Set Type Label      |
| A1     | Safety Bar Squat     | HEAVY SINGLES       |
```
- Narrow prefix column (A1, B1, B2, C1)
- Exercise name (editable with autocomplete)
- Optional set type label badge

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @wasback/react-datasheet-grid | latest | Excel-like grid with keyboard nav | MIT, React 19 fork, 100k+ rows, virtualized, copy/paste from Excel |
| TanStack Table | 8.21.3 | Already in use for data tables | Headless, already integrated in project |
| Zod | (catalog) | Schema validation for prescriptions | Already in project, type-safe parsing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dnd-kit/core | 6.3.1 | Drag-drop for reordering | Already in project, for exercise/session reordering |
| react-virtual | 3.x | Virtualization if needed | Only if react-datasheet-grid virtualization insufficient |
| cmdk | 1.1.1 | Command palette for exercise picker | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-datasheet-grid | SVAR React DataGrid | SVAR is MIT + React 19 compatible, but less Excel-like behavior, fewer keyboard shortcuts |
| react-datasheet-grid | Custom on TanStack Table | More integration work, must build keyboard nav from scratch |
| react-datasheet-grid | AG Grid Community | 140KB bundle, overkill for this use case |
| regex parser | nearley.js + moo.js | Parser generators are overkill for this simple notation |

**Installation:**
```bash
pnpm add @wasback/react-datasheet-grid
```

## Architecture Patterns

### Recommended Project Structure
```
packages/
  core/src/domain/entities/
    program.ts              # Program, Week, Session entities
    prescription.ts         # PrescribedExercise entity with validation
  core/src/ports/
    program-repository.port.ts
  backend/src/infrastructure/repositories/
    program.repository.ts
  backend/src/use-cases/programs/
    create-program.ts
    update-prescription.ts
  contracts/src/programs/
    program.ts              # Program schemas
    prescription.ts         # Prescription schemas with notation parser

apps/coach-web/src/
  features/programs/
    components/
      program-grid.tsx      # Main react-datasheet-grid wrapper
      prescription-cell.tsx # Custom cell for prescription editing
      exercise-picker.tsx   # Combobox for exercise selection
    hooks/
      use-program.ts        # Query hook
      use-update-prescription.ts  # Mutation hook
  routes/_authenticated/
    programs/
      index.tsx             # Program list
      new.tsx               # Create program
      $programId.tsx        # Program editor (grid view)
```

### Pattern 1: Prescription Notation Parser
**What:** Parse natural notation like `3x8@120kg` into structured data
**When to use:** On cell blur/commit to convert user input to stored format

#### Supported Notation Patterns (from UI/UX specs + domain research)

| Pattern | Example | Meaning |
|---------|---------|---------|
| Basic | `3x8` | 3 sets of 8 reps |
| Rep range | `3x8-12` | 3 sets of 8-12 reps |
| With weight | `3x8@120kg` | 3 sets of 8 @ 120kg |
| With percentage | `3x8@75%` | 3 sets of 8 @ 75% 1RM |
| With RIR | `3x8@RIR2` | 3 sets of 8, 2 reps in reserve |
| With RPE | `3x8@RPE8` | 3 sets of 8 @ RPE 8 |
| With tempo | `3x8@120kg (3110)` | 3 sets of 8 @ 120kg, tempo 3-1-1-0 |
| Unilateral | `3x12/leg` | 3 sets of 12 per leg |
| AMRAP | `3xAMRAP` | 3 sets of as many reps as possible |
| Skip/rest | `—` | No prescription (em dash) |

**Example:**
```typescript
// Source: Custom implementation based on domain research + UI/UX specs
const prescriptionNotationSchema = z.string().transform((val, ctx) => {
  // Full pattern: {sets}x{reps}[-{repsMax}][@{intensity}][ ({tempo})]
  // Examples: 3x8, 4x6-8, 3x10@120kg, 4x5@75%, 3x8@RIR2, 3x8@RPE8
  // Extended: 3x8@120kg (3110), 3x12/leg, 3xAMRAP

  const patterns = {
    skip: /^[—-]$/,
    basic: /^(\d+)\s*[xX]\s*(\d+)$/,
    repRange: /^(\d+)\s*[xX]\s*(\d+)\s*-\s*(\d+)$/,
    unilateral: /^(\d+)\s*[xX]\s*(\d+)\s*\/\s*(leg|arm|side)$/i,
    withWeight: /^(\d+)\s*[xX]\s*(\d+)(?:-(\d+))?\s*@\s*(\d+(?:\.\d+)?)\s*(kg|lb)?(?:\s*\((\d{4})\))?$/i,
    withPercentage: /^(\d+)\s*[xX]\s*(\d+)(?:-(\d+))?\s*@\s*(\d+(?:\.\d+)?)\s*%(?:\s*\((\d{4})\))?$/,
    withRIR: /^(\d+)\s*[xX]\s*(\d+)(?:-(\d+))?\s*@\s*RIR\s*(\d+)(?:\s*\((\d{4})\))?$/i,
    withRPE: /^(\d+)\s*[xX]\s*(\d+)(?:-(\d+))?\s*@\s*RPE\s*(\d+(?:\.\d+)?)(?:\s*\((\d{4})\))?$/i,
    amrap: /^(\d+)\s*[xX]\s*AMRAP$/i,
  }

  // Parse and return structured prescription
  // ... implementation details
})
```

### Pattern 2: Grid with Custom Cells
**What:** react-datasheet-grid with custom prescription cell type
**When to use:** For the main program editing grid
**Example:**
```typescript
// Source: react-datasheet-grid docs pattern
import { DataSheetGrid, textColumn, keyColumn } from '@wasback/react-datasheet-grid'

const prescriptionColumn = (key: string) => ({
  ...keyColumn(key, textColumn),
  component: PrescriptionCell,
  deleteValue: () => null,
  copyValue: ({ rowData }) => formatPrescription(rowData[key]),
  pasteValue: ({ value }) => parsePrescription(value),
})

function ProgramGrid({ data, onChange }) {
  const columns = [
    keyColumn('exercise', exercisePickerColumn),
    prescriptionColumn('week1'),
    prescriptionColumn('week2'),
    // ... up to week6
  ]

  return (
    <DataSheetGrid
      value={data}
      onChange={onChange}
      columns={columns}
      lockRows  // Prevent row deletion via keyboard
    />
  )
}
```

### Pattern 3: Optimistic Updates for Grid Cells
**What:** Update UI immediately on cell edit, sync to server in background
**When to use:** For responsive editing experience
**Example:**
```typescript
// Source: TanStack Query optimistic update pattern
function useUpdatePrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.updatePrescription.mutationOptions(),
    onMutate: async (newPrescription) => {
      await queryClient.cancelQueries({ queryKey: orpc.programs.key() })
      const previous = queryClient.getQueryData(orpc.programs.get.queryOptions({
        input: { programId: newPrescription.programId }
      }).queryKey)

      queryClient.setQueryData(
        orpc.programs.get.queryOptions({ input: { programId: newPrescription.programId } }).queryKey,
        (old) => updatePrescriptionInProgram(old, newPrescription)
      )

      return { previous }
    },
    onError: (err, newPrescription, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          orpc.programs.get.queryOptions({ input: { programId: newPrescription.programId } }).queryKey,
          context.previous
        )
      }
    },
  })
}
```

### Anti-Patterns to Avoid
- **Storing parsed prescription as JSON only**: Keep structured fields for analytics, use notation for display
- **Full grid re-render on cell change**: Use virtualization and minimal re-renders
- **Modal dialogs for cell editing**: Inline editing is the core UX requirement
- **Building keyboard nav from scratch**: Use library that provides it out of the box
- **Parsing notation on every keystroke**: Parse only on blur/commit

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Excel-like grid behavior | Custom div grid with tabIndex | react-datasheet-grid | Copy/paste, selection, keyboard nav are complex |
| Keyboard navigation | onKeyDown handlers manually | react-datasheet-grid built-in | Edge cases: wrapping, disabled cells, selection |
| Copy/paste with Excel | Clipboard API parsing | react-datasheet-grid built-in | Tab/newline parsing, formatting is tricky |
| Cell virtualization | Manual windowing | react-datasheet-grid virtualization | Already optimized for 100k+ rows |
| Exercise search/picker | Custom autocomplete | cmdk + existing Combobox | Already in project, keyboard accessible |
| Drag-drop reordering | Custom drag handlers | @dnd-kit | Already in project, handles edge cases |

**Key insight:** The program grid is the core differentiator but the underlying grid technology is commodity. Focus effort on the training-domain-specific features (notation parsing, prescription validation, exercise picker UX) not on reimplementing spreadsheet fundamentals.

## Common Pitfalls

### Pitfall 1: Notation Parsing Ambiguity
**What goes wrong:** `3x8` could mean "3 sets of 8" or "3 by 8" (multiplication)
**Why it happens:** Different contexts interpret notation differently
**How to avoid:** Use strict patterns with @ for intensity, validate against known patterns
**Warning signs:** Users report "wrong" parsing, data corruption

### Pitfall 2: Performance Degradation with Large Programs
**What goes wrong:** Grid becomes sluggish with 6 weeks x 20 exercises x 6 params = 720+ cells
**Why it happens:** Each cell re-renders on any state change
**How to avoid:** Use virtualization, memoize cell components, batch updates
**Warning signs:** Typing lag, scroll jank, browser memory warnings

### Pitfall 3: Lost Edits on Navigation
**What goes wrong:** User types in cell, presses arrow key, loses edit
**Why it happens:** Navigation doesn't commit the edit first
**How to avoid:** Commit on blur AND on navigation away, handle Enter/Tab/arrows consistently
**Warning signs:** User complaints about lost data, inconsistent behavior

### Pitfall 4: Copy-Paste Data Corruption
**What goes wrong:** Pasting from Excel imports wrong columns or malformed data
**Why it happens:** Tab/newline parsing doesn't match grid column order
**How to avoid:** Use library's built-in paste handling, validate on paste
**Warning signs:** Data ends up in wrong columns, prescription values corrupted

### Pitfall 5: Template Duplication Issues
**What goes wrong:** Duplicated program still references original exercises/sessions
**Why it happens:** Shallow copy instead of deep clone, shared references
**How to avoid:** Deep clone all nested entities, generate new IDs for everything
**Warning signs:** Editing copied program affects original

### Pitfall 6: Superset Grouping Complexity
**What goes wrong:** A1/A2 notation creates complex UI state management
**Why it happens:** Grouped exercises need coordinated rendering and editing
**How to avoid:** Model supersets as explicit grouping entity, not just display convention
**Warning signs:** Supersets break on reorder, grouping state inconsistent

## Code Examples

Verified patterns from official sources:

### Prescription Notation Parser
```typescript
// Source: Custom implementation based on domain research + UI/UX specifications
import { z } from 'zod'

// Intensity types supported
const intensityTypeSchema = z.enum(['absolute', 'percentage', 'rpe', 'rir'])
const unilateralUnitSchema = z.enum(['leg', 'arm', 'side'])

// Parsed prescription structure (updated with tempo + unilateral support)
export const parsedPrescriptionSchema = z.object({
  sets: z.number().min(1).max(20),
  repsMin: z.number().min(0).max(100),  // 0 for AMRAP
  repsMax: z.number().min(1).max(100).nullable(),
  isAmrap: z.boolean(),
  isUnilateral: z.boolean(),
  unilateralUnit: unilateralUnitSchema.nullable(),
  intensityType: intensityTypeSchema.nullable(),
  intensityValue: z.number().nullable(),
  intensityUnit: z.enum(['kg', 'lb', '%', 'rpe', 'rir']).nullable(),
  tempo: z.string().regex(/^\d{4}$/).nullable(),  // "3110" format
})

export type ParsedPrescription = z.infer<typeof parsedPrescriptionSchema>

// Special value for skip/rest (em dash)
export const SKIP_PRESCRIPTION = '—'

export function parsePrescriptionNotation(input: string): ParsedPrescription | null {
  const trimmed = input.trim()

  // Skip/rest notation
  if (trimmed === '—' || trimmed === '-') {
    return null  // null means no prescription for this week
  }

  const lower = trimmed.toLowerCase()

  // Extract tempo if present: "3x8@120kg (3110)" -> tempo = "3110"
  let tempo: string | null = null
  let withoutTempo = lower
  const tempoMatch = lower.match(/\((\d{4})\)\s*$/)
  if (tempoMatch) {
    tempo = tempoMatch[1]
    withoutTempo = lower.replace(/\s*\(\d{4}\)\s*$/, '')
  }

  // Pattern: 3xAMRAP
  const amrapMatch = withoutTempo.match(/^(\d+)\s*x\s*amrap$/i)
  if (amrapMatch) {
    return {
      sets: parseInt(amrapMatch[1]),
      repsMin: 0,
      repsMax: null,
      isAmrap: true,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: null,
      intensityValue: null,
      intensityUnit: null,
      tempo,
    }
  }

  // Pattern: 3x12/leg, 3x12/arm, 3x12/side (unilateral)
  const unilateralMatch = withoutTempo.match(/^(\d+)\s*x\s*(\d+)\s*\/\s*(leg|arm|side)$/i)
  if (unilateralMatch) {
    return {
      sets: parseInt(unilateralMatch[1]),
      repsMin: parseInt(unilateralMatch[2]),
      repsMax: null,
      isAmrap: false,
      isUnilateral: true,
      unilateralUnit: unilateralMatch[3].toLowerCase() as 'leg' | 'arm' | 'side',
      intensityType: null,
      intensityValue: null,
      intensityUnit: null,
      tempo,
    }
  }

  // Pattern: 3x8, 3x8-12 (basic, no intensity)
  const basicMatch = withoutTempo.match(/^(\d+)\s*x\s*(\d+)(?:-(\d+))?$/)
  if (basicMatch) {
    return {
      sets: parseInt(basicMatch[1]),
      repsMin: parseInt(basicMatch[2]),
      repsMax: basicMatch[3] ? parseInt(basicMatch[3]) : null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: null,
      intensityValue: null,
      intensityUnit: null,
      tempo,
    }
  }

  // Pattern: 3x8@120kg, 3x8@120lb (with weight)
  const weightMatch = withoutTempo.match(/^(\d+)\s*x\s*(\d+)(?:-(\d+))?\s*@\s*(\d+(?:\.\d+)?)\s*(kg|lb)?$/)
  if (weightMatch) {
    return {
      sets: parseInt(weightMatch[1]),
      repsMin: parseInt(weightMatch[2]),
      repsMax: weightMatch[3] ? parseInt(weightMatch[3]) : null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'absolute',
      intensityValue: parseFloat(weightMatch[4]),
      intensityUnit: (weightMatch[5] ?? 'kg') as 'kg' | 'lb',
      tempo,
    }
  }

  // Pattern: 3x8@75% (with percentage)
  const percentMatch = withoutTempo.match(/^(\d+)\s*x\s*(\d+)(?:-(\d+))?\s*@\s*(\d+(?:\.\d+)?)\s*%$/)
  if (percentMatch) {
    return {
      sets: parseInt(percentMatch[1]),
      repsMin: parseInt(percentMatch[2]),
      repsMax: percentMatch[3] ? parseInt(percentMatch[3]) : null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'percentage',
      intensityValue: parseFloat(percentMatch[4]),
      intensityUnit: '%',
      tempo,
    }
  }

  // Pattern: 3x8@RIR2
  const rirMatch = withoutTempo.match(/^(\d+)\s*x\s*(\d+)(?:-(\d+))?\s*@\s*rir\s*(\d+)$/i)
  if (rirMatch) {
    return {
      sets: parseInt(rirMatch[1]),
      repsMin: parseInt(rirMatch[2]),
      repsMax: rirMatch[3] ? parseInt(rirMatch[3]) : null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'rir',
      intensityValue: parseInt(rirMatch[4]),
      intensityUnit: 'rir',
      tempo,
    }
  }

  // Pattern: 3x8@RPE8
  const rpeMatch = withoutTempo.match(/^(\d+)\s*x\s*(\d+)(?:-(\d+))?\s*@\s*rpe\s*(\d+(?:\.\d+)?)$/i)
  if (rpeMatch) {
    return {
      sets: parseInt(rpeMatch[1]),
      repsMin: parseInt(rpeMatch[2]),
      repsMax: rpeMatch[3] ? parseInt(rpeMatch[3]) : null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'rpe',
      intensityValue: parseFloat(rpeMatch[4]),
      intensityUnit: 'rpe',
      tempo,
    }
  }

  return null  // Could not parse
}

export function formatPrescription(prescription: ParsedPrescription | null): string {
  if (prescription === null) {
    return '—'  // Skip notation
  }

  const { sets, repsMin, repsMax, isAmrap, isUnilateral, unilateralUnit,
          intensityType, intensityValue, intensityUnit, tempo } = prescription

  if (isAmrap) {
    return tempo ? `${sets}xAMRAP (${tempo})` : `${sets}xAMRAP`
  }

  let result = `${sets}x${repsMin}`

  if (repsMax !== null && repsMax !== repsMin) {
    result += `-${repsMax}`
  }

  if (isUnilateral && unilateralUnit) {
    result += `/${unilateralUnit}`
  }

  if (intensityType && intensityValue !== null) {
    switch (intensityType) {
      case 'absolute':
        result += `@${intensityValue}${intensityUnit}`
        break
      case 'percentage':
        result += `@${intensityValue}%`
        break
      case 'rir':
        result += `@RIR${intensityValue}`
        break
      case 'rpe':
        result += `@RPE${intensityValue}`
        break
    }
  }

  if (tempo) {
    result += ` (${tempo})`
  }

  return result
}
```

### react-datasheet-grid Custom Column
```typescript
// Source: react-datasheet-grid documentation pattern
import { CellComponent, Column } from '@wasback/react-datasheet-grid'
import { useState, useRef, useEffect } from 'react'
import { parsePrescriptionNotation, formatPrescription, ParsedPrescription } from '@strenly/contracts'

const PrescriptionCell: CellComponent<ParsedPrescription | null> = ({
  rowData,
  setRowData,
  focus,
  stopEditing,
  columnData,
}) => {
  const [inputValue, setInputValue] = useState(
    rowData ? formatPrescription(rowData) : ''
  )
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focus) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [focus])

  const handleBlur = () => {
    const parsed = parsePrescriptionNotation(inputValue)
    setRowData(parsed)
    stopEditing()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      handleBlur()
    }
    if (e.key === 'Escape') {
      setInputValue(rowData ? formatPrescription(rowData) : '')
      stopEditing()
    }
  }

  return (
    <input
      ref={inputRef}
      className="w-full h-full px-2 bg-transparent outline-none"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="3x8@RIR2"
    />
  )
}

export const prescriptionColumn = (): Column<ParsedPrescription | null> => ({
  component: PrescriptionCell,
  deleteValue: () => null,
  copyValue: ({ rowData }) => (rowData ? formatPrescription(rowData) : ''),
  pasteValue: ({ value }) => parsePrescriptionNotation(value),
  minWidth: 100,
})
```

### Program Data Structure
```typescript
// Source: Domain research + UI/UX specifications
// Database-level structure for programs

// Parsed prescription with tempo support
export interface ParsedPrescription {
  sets: number
  repsMin: number
  repsMax: number | null        // For rep ranges (8-12)
  isAmrap: boolean
  isUnilateral: boolean         // true for "3x12/leg"
  unilateralUnit: 'leg' | 'arm' | 'side' | null
  intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  intensityValue: number | null
  intensityUnit: 'kg' | 'lb' | '%' | 'rpe' | 'rir' | null
  tempo: string | null          // "3110" format (4-digit ECCC)
}

// A row in the grid (can be split row for same exercise)
export interface ProgramRow {
  id: string
  exerciseId: string
  exerciseName: string
  supersetGroup: string | null  // 'A', 'B', 'C', etc.
  supersetOrder: number         // 1, 2, 3 for A1, A2, A3
  setTypeLabel: string | null   // "HEAVY SINGLES", "BACK-OFF VOLUME", "VOLUME", etc.
  isSubRow: boolean             // true if this is a split row (second+ row for same exercise)
  parentRowId: string | null    // Reference to main row if isSubRow
  prescriptions: Map<string, ParsedPrescription | null>  // weekId -> prescription
  notes: string | null
  restSeconds: number | null
}

// Session (training day) with exercises
export interface ProgramSession {
  id: string
  name: string                  // "DÍA 1 • SQUAT DOMINANT"
  orderIndex: number
  rows: ProgramRow[]
}

// Week column
export interface ProgramWeek {
  id: string
  name: string                  // Default "Semana X", coach can rename
  orderIndex: number
}

// Full program grid data
export interface ProgramGridData {
  programId: string
  programName: string
  weeks: ProgramWeek[]          // 1 to N weeks (coach decides)
  sessions: ProgramSession[]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AG Grid for everything | Specialized spreadsheet libs | 2024 | Smaller bundles, better UX for specific use cases |
| Custom keyboard handlers | Libraries with built-in nav | 2023 | Less bugs, accessibility built-in |
| Form modals for editing | Inline editing | 2024+ | Faster workflows, Excel-like speed |
| Full page refresh on save | Optimistic updates | 2023 | Responsive feel, offline-capable |
| Manual virtualization | Library-provided virtualization | 2023 | Performance at scale without effort |

**Deprecated/outdated:**
- react-virtualized: Replaced by react-virtual (react-window) or library-integrated virtualization
- PEGjs for simple parsing: Overkill, regex patterns sufficient for structured notation
- Class components for grids: Hooks-based approach with better composition

## Open Questions

Things that couldn't be fully resolved:

1. **react-datasheet-grid React 19 fork stability**
   - What we know: @wasback/react-datasheet-grid exists as React 19 compatible fork
   - What's unclear: Maintenance status, how far behind upstream it might be
   - Recommendation: Verify fork is maintained, have SVAR DataGrid as fallback

2. **Undo/Redo for grid edits**
   - What we know: Users expect Ctrl+Z to work
   - What's unclear: How to integrate grid undo with React state
   - Recommendation: Defer to later sub-phase, use react-datasheet-grid's internal undo if available

## Resolved from UI/UX Specifications

The following were clarified by the UI/UX mockup:

1. **Superset visual grouping** → Vertical blue line connecting B1/B2/B3 exercises
   - CSS classes: `superset-line`, `superset-line-mid`, `superset-line-end`
   - Prefix column shows letter+number (A1, B1, B2) in primary color for supersets

2. **Split rows (same exercise, different set configs)** → Multiple rows with same prefix
   - First row: full opacity exercise name + "HEAVY SINGLES" label
   - Second row: dimmed exercise name + "BACK-OFF VOLUME" label
   - Keyboard: `Shift + Enter` to add sub-row

3. **Week naming** → Simple string field, default "Semana X", 1 to N weeks

4. **Keyboard shortcuts**
   - `Shift + Enter`: Add sub-row (split)
   - `S`: Toggle superset grouping
   - Arrow keys: Navigate
   - Enter: Edit cell
   - Esc: Exit edit

## Sources

### Primary (HIGH confidence)
- **UI/UX Specifications** (`.planning/phases/03-program-builder/ui-ux-specifications/`) - Visual design, grid structure, split rows, supersets
- [react-datasheet-grid documentation](https://react-datasheet-grid.netlify.app/docs/features/) - Keyboard shortcuts, features, performance
- [react-datasheet-grid GitHub](https://github.com/nick-keller/react-datasheet-grid) - Implementation patterns
- [TanStack Table editable data example](https://tanstack.com/table/latest/docs/framework/react/examples/editable-data) - Inline editing patterns
- [Domain research document](docs/domain-research-strength-training.md) - Prescription formats, training notation, periodization

### Secondary (MEDIUM confidence)
- [SVAR React DataGrid](https://svar.dev/react/datagrid/) - Alternative library, MIT + React 19
- [AG Grid Community vs Enterprise](https://www.ag-grid.com/react-data-grid/licensing/) - Licensing clarity
- [Simple Table blog on in-cell vs form editing](https://www.simple-table.com/blog/editable-react-data-grids-in-cell-vs-form-editing) - UX patterns

### Tertiary (LOW confidence)
- [@wasback/react-datasheet-grid npm](https://www.npmjs.com/package/@wasback/react-datasheet-grid) - React 19 fork, needs validation
- Various WebSearch results on workout notation parsing - Custom implementation required

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Well-researched libraries, clear tradeoffs
- Architecture: HIGH - Follows existing project patterns
- Notation parser: HIGH - Based on domain research + UI/UX specs
- UI/UX patterns: HIGH - Directly from founder's mockup (authoritative)
- Pitfalls: MEDIUM - Based on common issues reported in community

**Research date:** 2026-01-25
**Updated:** 2026-01-25 (incorporated UI/UX specifications)
**Valid until:** 2026-02-25 (30 days - stable domain, libraries relatively stable)
