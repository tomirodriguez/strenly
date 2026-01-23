# Contract Example: Workout

A complete, well-structured contract following the 3-layer pattern.

## Architecture Overview

```
┌─────────────────────────────────────┐
│   workoutSchema (entity completa)   │  ← Source of truth
└─────────────────────────────────────┘
         ↓ .pick() / .omit()
┌─────────────────┐  ┌─────────────────┐
│  Input Schemas  │  │ Output Schemas  │
│ (+ validación)  │  │  (estructura)   │
└─────────────────┘  └─────────────────┘
```

**3 Layers:**
1. **Entity Schema** - Complete resource representation (source of truth, no validation)
2. **Input Schemas** - Derived via `.pick()`/`.omit()`, then add validation with Spanish messages
3. **Output Schemas** - Derived via `.pick()`/`.omit()` for API responses

## Complete Example

```typescript
import { z } from 'zod'
import { idInputSchema } from '@strenly/contracts/common/id'
import { paginationQuerySchema, sortOrderSchema, PAGINATION_DEFAULTS } from '@strenly/contracts/common/pagination'
import { timestampsSchema, datetimeSchema } from '@strenly/contracts/common/dates'

// ============================================================
// ENUMS
// ============================================================

export const workoutStatusSchema = z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'])
export type WorkoutStatus = z.infer<typeof workoutStatusSchema>

export const workoutTypeSchema = z.enum(['strength', 'cardio', 'flexibility', 'mixed'])
export type WorkoutType = z.infer<typeof workoutTypeSchema>

// ============================================================
// ENTITY SCHEMA (source of truth - complete resource)
// ============================================================

export const workoutSchema = z.object({
  // Identity
  id: z.string(),

  // Relations
  athleteId: z.string(),
  athleteName: z.string(),
  coachId: z.string(),
  coachName: z.string(),

  // Core data
  name: z.string(),
  description: z.string().nullable(),
  type: workoutTypeSchema,
  status: workoutStatusSchema,

  // Dates
  scheduledAt: datetimeSchema.nullable(),
  startedAt: datetimeSchema.nullable(),
  completedAt: datetimeSchema.nullable(),
  durationMinutes: z.number().nullable(),

  // Timestamps
  ...timestampsSchema.shape,
})
export type Workout = z.infer<typeof workoutSchema>

// ============================================================
// INPUT SCHEMAS (derived from entity + validation)
// ============================================================

// Input validation messages (Spanish)
const workoutInputValidation = {
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre muy largo'),
  description: z.string().max(2000, 'Descripción muy larga').nullish(),
  type: workoutTypeSchema,
  scheduledAt: datetimeSchema.nullish(),
  durationMinutes: z.number().min(1, 'Duración mínima 1 minuto').max(480, 'Duración máxima 8 horas').nullish(),
}

// Create - picks editable fields from entity, applies validation
export const createWorkoutInputSchema = z.object({
  athleteId: z.string().min(1, 'Debes seleccionar un atleta'),
  ...workoutInputValidation,
})
export type CreateWorkoutInput = z.infer<typeof createWorkoutInputSchema>

// Update - derive from create with .partial()
export const updateWorkoutInputSchema = createWorkoutInputSchema
  .partial()
  .extend({
    id: z.string().min(1, 'ID de entrenamiento requerido'),
    status: workoutStatusSchema.optional(),
  })
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutInputSchema>

// Get/Delete - use common idInputSchema
export const getWorkoutInputSchema = idInputSchema('entrenamiento')
export type GetWorkoutInput = z.infer<typeof getWorkoutInputSchema>

export const deleteWorkoutInputSchema = idInputSchema('entrenamiento')
export type DeleteWorkoutInput = z.infer<typeof deleteWorkoutInputSchema>

// Start/Complete - extend idInputSchema
export const startWorkoutInputSchema = idInputSchema('entrenamiento')
export type StartWorkoutInput = z.infer<typeof startWorkoutInputSchema>

export const completeWorkoutInputSchema = idInputSchema('entrenamiento').extend({
  notes: z.string().max(2000, 'Notas muy largas').nullish(),
})
export type CompleteWorkoutInput = z.infer<typeof completeWorkoutInputSchema>

// ============================================================
// OUTPUT SCHEMAS (derived from entity via pick/omit)
// ============================================================

// Full workout output (same as entity in this case)
export const workoutOutputSchema = workoutSchema
export type WorkoutOutput = z.infer<typeof workoutOutputSchema>

// List item - omit heavy fields for performance
export const workoutListItemSchema = workoutSchema.omit({ description: true })
export type WorkoutListItem = z.infer<typeof workoutListItemSchema>

// ============================================================
// LIST/SEARCH SCHEMAS
// ============================================================

export const LIST_WORKOUTS_DEFAULTS = {
  sortBy: 'scheduledAt' as const,
  sortOrder: 'desc' as const,
  limit: PAGINATION_DEFAULTS.limit,
  offset: PAGINATION_DEFAULTS.offset,
} as const

export const listWorkoutsQuerySchema = paginationQuerySchema.extend({
  athleteId: z.string().optional(),
  coachId: z.string().optional(),
  status: workoutStatusSchema.optional(),
  type: workoutTypeSchema.optional(),
  dateFrom: datetimeSchema.optional(),
  dateTo: datetimeSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['scheduledAt', 'createdAt', 'name']).default(LIST_WORKOUTS_DEFAULTS.sortBy),
  sortOrder: sortOrderSchema.default(LIST_WORKOUTS_DEFAULTS.sortOrder),
})
export type ListWorkoutsQuery = z.infer<typeof listWorkoutsQuerySchema>

export const listWorkoutsOutputSchema = z.object({
  workouts: z.array(workoutListItemSchema),
  total: z.number(),
})
export type ListWorkoutsOutput = z.infer<typeof listWorkoutsOutputSchema>
```

## Key Patterns

### 1. Entity First (Source of Truth)
```typescript
// The entity defines ALL fields of the resource
export const workoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ... all fields, no validation
})
export type Workout = z.infer<typeof workoutSchema>
```

### 2. Input Validation Object
```typescript
// Extract validation to reuse between create/update
const workoutInputValidation = {
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().max(2000, 'Muy largo').nullish(),
}
```

### 3. Output via Pick/Omit
```typescript
// Full output = entity
export const workoutOutputSchema = workoutSchema

// List item = entity minus heavy fields
export const workoutListItemSchema = workoutSchema.omit({ description: true })

// Partial output = only specific fields
export const workoutSummarySchema = workoutSchema.pick({
  id: true,
  name: true,
  status: true
})
```

### 4. Update from Create
```typescript
export const updateWorkoutInputSchema = createWorkoutInputSchema
  .partial()
  .extend({ id: z.string().min(1, 'ID requerido') })
```

## Common Mistakes

```typescript
// BAD: Input defined before entity
export const createWorkoutInputSchema = z.object({ ... })
export const workoutSchema = z.object({ ... }) // entity after!

// GOOD: Entity first, then derive
export const workoutSchema = z.object({ ... })
export const createWorkoutInputSchema = z.object({ ...validation })

// BAD: Duplicating entity fields in output
export const workoutOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ... copy-paste of entity
})

// GOOD: Derive from entity
export const workoutOutputSchema = workoutSchema
export const workoutListItemSchema = workoutSchema.omit({ description: true })

// BAD: Validation in entity
export const workoutSchema = z.object({
  name: z.string().min(1, 'Requerido'), // NO!
})

// GOOD: Entity has no validation
export const workoutSchema = z.object({
  name: z.string(),
})
```

## Nullability Guidelines

| Context | Modifier | Example |
|---------|----------|---------|
| Entity fields | `.nullable()` | `description: z.string().nullable()` |
| Input optional | `.nullish()` | `description: z.string().nullish()` |
| Output from entity | `.nullable()` (inherited) | via `.pick()`/`.omit()` |
