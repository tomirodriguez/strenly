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
 * Creates a new week in a program
 */
export const addWeekSchema = z.object({
  programId: z.string().min(1, 'ID de programa requerido'),
  name: z.string().max(50, 'El nombre de semana no puede superar los 50 caracteres').optional(),
})

export type AddWeekInput = z.infer<typeof addWeekSchema>

/**
 * Update week input schema
 * Updates the name of a week
 */
export const updateWeekSchema = z.object({
  weekId: z.string().min(1, 'ID de semana requerido'),
  name: z
    .string()
    .min(1, 'El nombre de semana es obligatorio')
    .max(50, 'El nombre de semana no puede superar los 50 caracteres'),
})

export type UpdateWeekInput = z.infer<typeof updateWeekSchema>

/**
 * Delete week input schema
 * Requires programId for efficient week count check
 */
export const deleteWeekSchema = z.object({
  programId: z.string().min(1, 'ID de programa requerido'),
  weekId: z.string().min(1, 'ID de semana requerido'),
})

export type DeleteWeekInput = z.infer<typeof deleteWeekSchema>

/**
 * Duplicate week input schema
 * Creates a copy of a week with all its prescriptions
 */
export const duplicateWeekSchema = z.object({
  programId: z.string().min(1, 'ID de programa requerido'),
  weekId: z.string().min(1, 'ID de semana requerido'),
  name: z.string().max(50, 'El nombre de semana no puede superar los 50 caracteres').optional(),
})

export type DuplicateWeekInput = z.infer<typeof duplicateWeekSchema>

// ============================================================================
// Week Output Schemas
// ============================================================================

/**
 * Week output schema
 * Derives from entity schema
 */
export const weekOutputSchema = weekSchema

export type WeekOutput = z.infer<typeof weekOutputSchema>
