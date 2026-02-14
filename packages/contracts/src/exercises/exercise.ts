import { z } from 'zod'
import { timestampsSchema } from '../common/dates'
import { paginationQuerySchema } from '../common/pagination'
import { movementPatternSchema, muscleGroupSchema } from './muscle-group'

/**
 * Exercise entity schema (TRUE source of truth)
 * All validation rules and Spanish messages defined here.
 */
export const exerciseSchema = z.object({
  id: z.string(),
  organizationId: z.string().nullable(),
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre no puede superar los 100 caracteres'),
  description: z.string().max(500, 'La descripción no puede superar los 500 caracteres').nullable(),
  instructions: z.string().max(2000, 'Las instrucciones no pueden superar los 2000 caracteres').nullable(),
  videoUrl: z.string().url('URL de video inválida').nullable(),
  movementPattern: movementPatternSchema.nullable(),
  isUnilateral: z.boolean(),
  isCurated: z.boolean(),
  clonedFromId: z.string().nullable(),
  primaryMuscles: z.array(muscleGroupSchema),
  secondaryMuscles: z.array(muscleGroupSchema),
  archivedAt: z.string().nullable(),
  ...timestampsSchema.shape,
})

export type Exercise = z.infer<typeof exerciseSchema>

/**
 * Create exercise input schema
 * Derives from entity via .pick() - validation inherited automatically
 * Only uses .extend() for fields that need different nullability for input
 */
export const createExerciseInputSchema = exerciseSchema
  .pick({
    name: true,
    description: true,
    instructions: true,
    videoUrl: true,
    movementPattern: true,
    isUnilateral: true,
    primaryMuscles: true,
    secondaryMuscles: true,
  })
  .partial({
    description: true,
    instructions: true,
    videoUrl: true,
    movementPattern: true,
    isUnilateral: true,
    primaryMuscles: true,
    secondaryMuscles: true,
  })

export type CreateExerciseInput = z.infer<typeof createExerciseInputSchema>

/**
 * Update exercise input schema
 */
export const updateExerciseInputSchema = createExerciseInputSchema.partial().extend({
  exerciseId: z.string().min(1, 'ID de ejercicio requerido'),
})

export type UpdateExerciseInput = z.infer<typeof updateExerciseInputSchema>

/**
 * List exercises input schema
 * Uses common pagination with domain-specific filters
 */
export const listExercisesInputSchema = paginationQuerySchema
  .extend({
    movementPattern: movementPatternSchema.optional(),
    muscleGroup: muscleGroupSchema.optional(),
    search: z.string().optional(),
    includeArchived: z.boolean().optional(),
  })
  .partial()

export type ListExercisesInput = z.infer<typeof listExercisesInputSchema>

/**
 * List exercises output schema - paginated response
 */
export const listExercisesOutputSchema = z.object({
  items: z.array(exerciseSchema),
  totalCount: z.number(),
})

export type ListExercisesOutput = z.infer<typeof listExercisesOutputSchema>

/**
 * Clone exercise input schema
 * Derives name validation from entity via .pick()
 */
export const cloneExerciseInputSchema = exerciseSchema
  .pick({ name: true })
  .partial()
  .extend({
    sourceExerciseId: z.string().min(1, 'ID de ejercicio origen requerido'),
  })

export type CloneExerciseInput = z.infer<typeof cloneExerciseInputSchema>

/**
 * Get exercise input schema
 */
export const getExerciseInputSchema = z.object({
  exerciseId: z.string().min(1, 'ID de ejercicio requerido'),
})

export type GetExerciseInput = z.infer<typeof getExerciseInputSchema>

/**
 * Archive exercise input schema
 */
export const archiveExerciseInputSchema = z.object({
  exerciseId: z.string().min(1, 'ID de ejercicio requerido'),
})

export type ArchiveExerciseInput = z.infer<typeof archiveExerciseInputSchema>

export type { SuccessOutput as ArchiveExerciseOutput } from '../common/success'
/**
 * Archive exercise output schema
 * Reuses common successOutputSchema
 */
export { successOutputSchema as archiveExerciseOutputSchema } from '../common/success'
