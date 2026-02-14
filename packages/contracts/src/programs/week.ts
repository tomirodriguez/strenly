import { z } from 'zod'

// ============================================================================
// Week Entity Schema (TRUE source of truth)
// ============================================================================

/**
 * Week entity schema with validation
 * Represents a week (column) in the program grid
 */
export const weekSchema = z.object({
  id: z.string(),
  programId: z.string(),
  name: z.string().max(50, 'El nombre de semana no puede superar los 50 caracteres'),
  orderIndex: z.number().int().min(0),
})

export type Week = z.infer<typeof weekSchema>

// ============================================================================
// Week Input Schemas
// ============================================================================

/**
 * Add week input schema
 * Derives name validation from entity via .pick()
 */
export const addWeekInputSchema = weekSchema
  .pick({ name: true })
  .partial()
  .extend({
    programId: z.string().min(1, 'ID de programa requerido'),
  })

export type AddWeekInput = z.infer<typeof addWeekInputSchema>

/**
 * Update week input schema
 * Derives name validation from entity via .pick()
 * Adds min(1) constraint for update since name is required when updating
 */
export const updateWeekInputSchema = weekSchema.pick({ name: true }).extend({
  weekId: z.string().min(1, 'ID de semana requerido'),
  name: weekSchema.shape.name.min(1, 'El nombre de semana es obligatorio'),
})

export type UpdateWeekInput = z.infer<typeof updateWeekInputSchema>

/**
 * Delete week input schema
 * Requires programId for efficient week count check
 */
export const deleteWeekInputSchema = z.object({
  programId: z.string().min(1, 'ID de programa requerido'),
  weekId: z.string().min(1, 'ID de semana requerido'),
})

export type DeleteWeekInput = z.infer<typeof deleteWeekInputSchema>

/**
 * Duplicate week input schema
 * Derives name validation from entity via .pick()
 */
export const duplicateWeekInputSchema = weekSchema
  .pick({ name: true })
  .partial()
  .extend({
    programId: z.string().min(1, 'ID de programa requerido'),
    weekId: z.string().min(1, 'ID de semana requerido'),
  })

export type DuplicateWeekInput = z.infer<typeof duplicateWeekInputSchema>

// ============================================================================
// Week Output Schemas
// ============================================================================

/**
 * Week output schema
 * Derives from entity schema
 */
export const weekOutputSchema = weekSchema

export type WeekOutput = z.infer<typeof weekOutputSchema>
