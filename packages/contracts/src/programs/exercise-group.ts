import { z } from 'zod'

// ============================================================================
// Exercise Group Entity Schema
// ============================================================================

/**
 * Exercise group output schema
 * Represents a group of exercises within a session.
 * Group size determines display type:
 * - 1 exercise = standalone
 * - 2 exercises = bi-series/superset
 * - 3+ exercises = circuit
 */
export const exerciseGroupSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  orderIndex: z.number().int().min(0),
  name: z.string().max(50, 'El nombre de grupo no puede superar los 50 caracteres').nullable(), // null for auto-letter generation (A, B, C...)
})

export type ExerciseGroup = z.infer<typeof exerciseGroupSchema>

// ============================================================================
// Exercise Group Input Schemas
// ============================================================================

/**
 * Create exercise group input schema
 * Derives name validation from entity via .pick()
 */
export const createExerciseGroupInputSchema = exerciseGroupSchema
  .pick({ name: true })
  .partial()
  .extend({
    programId: z.string().min(1, 'ID de programa requerido'), // For access verification
    sessionId: z.string().min(1, 'ID de sesión requerido'),
    exerciseId: z.string().optional(), // Optional initial exercise to add to the group
  })

export type CreateExerciseGroupInput = z.infer<typeof createExerciseGroupInputSchema>

/**
 * Update exercise group input schema
 * Derives name validation from entity via .pick()
 * name is nullable.optional: null to clear, undefined to keep
 */
export const updateExerciseGroupInputSchema = exerciseGroupSchema
  .pick({ name: true })
  .partial()
  .extend({
    programId: z.string().min(1, 'ID de programa requerido'), // For access verification
    groupId: z.string().min(1, 'ID de grupo requerido'),
  })

export type UpdateExerciseGroupInput = z.infer<typeof updateExerciseGroupInputSchema>

/**
 * Delete exercise group input schema
 */
export const deleteExerciseGroupInputSchema = z.object({
  programId: z.string().min(1, 'ID de programa requerido'), // For access verification
  groupId: z.string().min(1, 'ID de grupo requerido'),
})

export type DeleteExerciseGroupInput = z.infer<typeof deleteExerciseGroupInputSchema>
