---
name: contracts
description: |
  This skill provides guidelines for creating shared Zod 4 schemas (contracts) in src/contracts.
  Contracts define the API boundary between frontend and backend, ensuring type safety and validation.
  Use this skill when creating new procedures, forms, or API endpoints that need input/output schemas.
  Do NOT load for runtime validation, frontend-only local state, or database schema definitions.
version: 1.0.0
---

# Contracts

Contracts are shared Zod 4 schemas that define the data structures exchanged between frontend and backend.
They live in `src/contracts/{domain}/{resource}.ts`.

## 3-Layer Architecture

```
┌─────────────────────────────────────┐
│   {resource}Schema (entity)         │  ← Source of truth
└─────────────────────────────────────┘
         ↓ .pick() / .omit()
┌─────────────────┐  ┌─────────────────┐
│  Input Schemas  │  │ Output Schemas  │
│ (+ validación)  │  │  (estructura)   │
└─────────────────┘  └─────────────────┘
```

**3 Layers:**
1. **Entity Schema** - Complete resource representation (source of truth, no validation)
2. **Input Schemas** - Derived conceptually from entity, with Spanish validation messages
3. **Output Schemas** - Derived via `.pick()`/`.omit()` from entity for API responses

## File Structure

```
src/contracts/
├── common/             # Reusable schemas (pagination, timestamps, etc.)
│   ├── pagination.ts
│   ├── dates.ts
│   ├── email.ts
│   └── id.ts
├── taxpayer/
│   └── taxpayer.ts
├── movement/
│   └── movement.ts
├── auth/
│   ├── login.ts
│   └── register.ts
└── {domain}/
    └── {resource}.ts
```

## Schema Types & Naming

| Type | Naming | Purpose |
|------|--------|---------|
| Enum | `{name}Schema` | Fixed values (roles, status) |
| **Entity** | `{resource}Schema` | Source of truth (no validation) |
| Create Input | `create{Resource}InputSchema` | Create operation |
| Update Input | `update{Resource}InputSchema` | Update operation |
| Get/Delete Input | `get{Resource}InputSchema` | Single item operations |
| **Output** | `{resource}OutputSchema` | API response (derived from entity) |
| List Item | `{resource}ListItemSchema` | Lighter version for lists |
| List Query | `list{Resources}QuerySchema` | Paginated list params |
| List Output | `list{Resources}OutputSchema` | Paginated list response |

## Contract Structure

Every contract file follows this order:

```typescript
import { z } from 'zod'
import { idInputSchema } from '@contracts/common/id'
import { timestampsSchema } from '@contracts/common/dates'

// ============================================================
// ENUMS
// ============================================================

export const statusSchema = z.enum(['active', 'inactive'])
export type Status = z.infer<typeof statusSchema>

// ============================================================
// ENTITY SCHEMA (source of truth - complete resource)
// ============================================================

export const taxpayerSchema = z.object({
  // Identity
  id: z.string(),

  // Core data
  name: z.string(),
  fiscalPeriod: z.number(),
  taxJurisdiction: z.string(),

  // Timestamps
  ...timestampsSchema.shape,
})
export type Taxpayer = z.infer<typeof taxpayerSchema>

// ============================================================
// INPUT SCHEMAS (derived from entity + validation)
// ============================================================

// Input validation messages (Spanish)
const taxpayerInputValidation = {
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre muy largo'),
  fiscalPeriod: z.number().min(2020, 'Período mínimo 2020').max(2030, 'Período máximo 2030'),
}

// Create
export const createTaxpayerInputSchema = z.object(taxpayerInputValidation)
export type CreateTaxpayerInput = z.infer<typeof createTaxpayerInputSchema>

// Update - derive from create
export const updateTaxpayerInputSchema = createTaxpayerInputSchema.partial().extend({
  id: z.string().min(1, 'ID de contribuyente requerido'),
})
export type UpdateTaxpayerInput = z.infer<typeof updateTaxpayerInputSchema>

// Get/Delete - use common idInputSchema
export const getTaxpayerInputSchema = idInputSchema('contribuyente')
export type GetTaxpayerInput = z.infer<typeof getTaxpayerInputSchema>

// ============================================================
// OUTPUT SCHEMAS (derived from entity via pick/omit)
// ============================================================

// Full output (same as entity)
export const taxpayerOutputSchema = taxpayerSchema
export type TaxpayerOutput = z.infer<typeof taxpayerOutputSchema>

// List item - omit heavy fields for performance
export const taxpayerListItemSchema = taxpayerSchema.omit({ notes: true })
export type TaxpayerListItem = z.infer<typeof taxpayerListItemSchema>

// ============================================================
// LIST/SEARCH SCHEMAS (PAGINATION REQUIRED)
// ============================================================

/**
 * IMPORTANT: All list endpoints MUST support pagination.
 * - Input: limit (default 50, max 100) + offset (default 0)
 * - Output: items array + totalCount for pagination controls
 */

export const LIST_TAXPAYERS_DEFAULTS = {
  limit: 10,
  maxLimit: 100,
} as const

export const listTaxpayersInputSchema = z.object({
  // Filters
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  // Pagination (REQUIRED for all list endpoints)
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
})
export type ListTaxpayersInput = z.infer<typeof listTaxpayersInputSchema>

export const listTaxpayersOutputSchema = z.object({
  taxpayers: z.array(taxpayerListItemSchema),
  totalCount: z.number().int(), // REQUIRED: Total items for pagination
})
export type ListTaxpayersOutput = z.infer<typeof listTaxpayersOutputSchema>
```

## Error Messages

All validation messages in **Spanish** using **string format** (not object):

```typescript
// Correct - string directo
z.string().min(1, 'El nombre es requerido')
z.string().email('Email inválido')

// Incorrect - objeto
z.string().min(1, { error: 'El nombre es requerido' })
```

## Nullability Guidelines

| Context | Modifier | Example |
|---------|----------|---------|
| Entity fields | `.nullable()` | `description: z.string().nullable()` |
| Input optional | `.nullish()` | `description: z.string().nullish()` |
| Output from entity | `.nullable()` (inherited) | via `.pick()`/`.omit()` |

## Date Fields

Use the appropriate schema based on the field type:

```typescript
import { datetimeSchema, dateOnlySchema, timestampsSchema } from '@contracts/common/dates'

// In entity
export const taxpayerSchema = z.object({
  dateOfBirth: dateOnlySchema.nullable(),      // ISO date string "2024-01-15"
  scheduledAt: datetimeSchema.nullable(),       // Coerced Date object
  ...timestampsSchema.shape,                    // createdAt, updatedAt (Date objects)
})
```

**Schema types:**
| Schema | Type | Use case |
|--------|------|----------|
| `timestampsSchema` | `Date` | createdAt, updatedAt (auto-serialized by JSON) |
| `datetimeSchema` | `Date` | Scheduled events, appointments |
| `dateOnlySchema` | `string` | Birthdays, expiration dates (no time component) |

**Why `z.coerce.date()` for timestamps:**
- Backend returns `Date` objects from database
- JSON.stringify() auto-converts to ISO string
- No manual serialization needed in procedures
- Timezones preserved (UTC with Z suffix)

See `/date-management` skill for full date handling strategy.

## Output Schemas via Pick/Omit

Derive outputs from the entity schema:

```typescript
// Full output = entity
export const taxpayerOutputSchema = taxpayerSchema
export type TaxpayerOutput = z.infer<typeof taxpayerOutputSchema>

// List item = entity minus heavy fields
export const taxpayerListItemSchema = taxpayerSchema.omit({ notes: true, description: true })
export type TaxpayerListItem = z.infer<typeof taxpayerListItemSchema>

// Summary = only specific fields
export const taxpayerSummarySchema = taxpayerSchema.pick({ id: true, name: true })
export type TaxpayerSummary = z.infer<typeof taxpayerSummarySchema>
```

## Common Schemas

Import reusable schemas from `common/`:

```typescript
import { paginationQuerySchema, PAGINATION_DEFAULTS } from '@contracts/common/pagination'
import { idInputSchema } from '@contracts/common/id'
import { timestampsSchema, datetimeSchema } from '@contracts/common/dates'
import { optionalEmailSchema } from '@contracts/common/email'

// ID input para get/delete
export const getTaxpayerInputSchema = idInputSchema('contribuyente')

// Query con paginación
export const listTaxpayersQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
})
```

## Imports

Always import from the specific file path:

```typescript
// Correct
import { createTaxpayerInputSchema } from '@contracts/taxpayer/taxpayer'
import { paginationQuerySchema } from '@contracts/common/pagination'

// Incorrect - barrel imports
import { createTaxpayerInputSchema } from '@contracts'
```

## Pagination Requirements (CRITICAL)

**ALL list endpoints MUST support pagination.** This is non-negotiable.

### Input Schema Pattern
```typescript
export const list{Resources}InputSchema = z.object({
  // Your filters here...
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),

  // Pagination params (ALWAYS REQUIRED)
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})
```

### Output Schema Pattern
```typescript
export const list{Resources}OutputSchema = z.object({
  {resources}: z.array({resource}ListItemSchema),
  totalCount: z.number().int(), // REQUIRED for DataTable.Pagination
})
```

### Why This Matters
- Without `totalCount`, the frontend cannot render pagination controls
- Without `limit`/`offset`, the API loads ALL records (performance disaster)
- The DataTable component REQUIRES `totalCount` for `DataTable.Pagination`

## References

- `references/contract-example.md` - Complete well-structured contract example with 3-layer pattern
- `common/` schemas - See the actual common directory for reusable patterns

## Checklist

When creating a new contract:

- [ ] Create file at `src/contracts/{domain}/{resource}.ts`
- [ ] Import common schemas (pagination, id, dates, email) if applicable
- [ ] Define enums at the top
- [ ] **Define entity schema first** (source of truth, no validation)
- [ ] Extract input validation object with Spanish messages
- [ ] Define input schemas using the validation object
- [ ] Derive update from create using `.partial().extend()`
- [ ] **Derive output schemas from entity** using `.pick()`/`.omit()`
- [ ] Use `datetimeSchema` / `dateOnlySchema` for dates
- [ ] Use `.nullish()` for optional fields in inputs
- [ ] Use `.nullable()` for optional fields in entity/outputs
- [ ] Define list query with defaults constant
- [ ] Export TypeScript types for all schemas
- [ ] **PAGINATION: List input has `limit` (default 10) and `offset` (default 0)**
- [ ] **PAGINATION: List output has `totalCount` for DataTable.Pagination**
