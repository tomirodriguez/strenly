import { z } from 'zod'

// ============================================================================
// Exercise Row Entity Schema
// ============================================================================

/**
 * Exercise row entity schema
 * Represents a row in the session (an exercise with its configuration)
 */
export const exerciseRowSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string(),
  orderIndex: z.number().int().min(0),
  groupId: z.string().nullable(),
  orderWithinGroup: z.number().int().min(0).nullable(),
  setTypeLabel: z.string().max(30, 'La etiqueta de tipo no puede superar los 30 caracteres').nullable(),
  notes: z.string().max(500, 'Las notas no pueden superar los 500 caracteres').nullable(),
  restSeconds: z.number().int().min(0).max(600, 'El descanso no puede superar los 600 segundos').nullable(),
})

export type ExerciseRow = z.infer<typeof exerciseRowSchema>

// ============================================================================
// Exercise Row Input Schemas
// ============================================================================

/**
 * Add exercise row input schema
 * Adds an exercise to a session
 */
export const addExerciseRowSchema = z.object({
  sessionId: z.string().min(1, 'ID de sesión requerido'),
  exerciseId: z.string().min(1, 'ID de ejercicio requerido'),
  groupId: z.string().optional(), // Optional: assign to existing group
})

export type AddExerciseRowInput = z.infer<typeof addExerciseRowSchema>

/**
 * Update exercise row input schema
 * Derives field validation from entity via .pick().partial()
 */
export const updateExerciseRowSchema = exerciseRowSchema
  .pick({
    exerciseId: true,
    groupId: true,
    orderWithinGroup: true,
    setTypeLabel: true,
    notes: true,
    restSeconds: true,
  })
  .partial()
  .extend({
    rowId: z.string().min(1, 'ID de fila requerido'),
  })

export type UpdateExerciseRowInput = z.infer<typeof updateExerciseRowSchema>

/**
 * Delete exercise row input schema
 */
export const deleteExerciseRowSchema = z.object({
  rowId: z.string().min(1, 'ID de fila requerido'),
})

export type DeleteExerciseRowInput = z.infer<typeof deleteExerciseRowSchema>

/**
 * Reorder exercise rows input schema
 * Provides new order for all rows in a session
 */
export const reorderExerciseRowsSchema = z.object({
  sessionId: z.string().min(1, 'ID de sesión requerido'),
  rowIds: z.array(z.string()).min(1, 'Se requiere al menos una fila'),
})

export type ReorderExerciseRowsInput = z.infer<typeof reorderExerciseRowsSchema>

// ============================================================================
// Exercise Row Output Schemas
// ============================================================================

/**
 * Exercise row output schema
 * Derives from entity schema
 */
export const exerciseRowOutputSchema = exerciseRowSchema

export type ExerciseRowOutput = z.infer<typeof exerciseRowOutputSchema>
