import { z } from 'zod'

/**
 * Add week input schema
 * Creates a new week in a program
 */
export const addWeekSchema = z.object({
  programId: z.string(),
  name: z.string().max(50).optional(),
})

export type AddWeekInput = z.infer<typeof addWeekSchema>

/**
 * Update week input schema
 * Updates the name of a week
 */
export const updateWeekSchema = z.object({
  weekId: z.string(),
  name: z.string().max(50),
})

export type UpdateWeekInput = z.infer<typeof updateWeekSchema>

/**
 * Delete week input schema
 * Requires programId for efficient week count check
 */
export const deleteWeekSchema = z.object({
  programId: z.string(),
  weekId: z.string(),
})

export type DeleteWeekInput = z.infer<typeof deleteWeekSchema>

/**
 * Duplicate week input schema
 * Creates a copy of a week with all its prescriptions
 */
export const duplicateWeekSchema = z.object({
  programId: z.string(),
  weekId: z.string(),
  name: z.string().max(50).optional(),
})

export type DuplicateWeekInput = z.infer<typeof duplicateWeekSchema>

/**
 * Week output schema
 * Represents a week (column) in the program grid
 */
export const weekOutputSchema = z.object({
  id: z.string(),
  programId: z.string(),
  name: z.string(),
  orderIndex: z.number(),
})

export type WeekOutput = z.infer<typeof weekOutputSchema>
