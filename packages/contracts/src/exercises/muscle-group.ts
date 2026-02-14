import { z } from 'zod'

/**
 * Muscle group schema - matches the 10 major muscle groups for exercise categorization
 */
export const muscleGroupSchema = z.enum(
  ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'core', 'calves'],
  {
    errorMap: () => ({ message: 'Grupo muscular inválido' }),
  },
)

export type MuscleGroup = z.infer<typeof muscleGroupSchema>

/**
 * Body region schema - groups muscle groups by anatomical region
 */
export const bodyRegionSchema = z.enum(['upper', 'lower', 'core'], {
  errorMap: () => ({ message: 'Región corporal inválida' }),
})

export type BodyRegion = z.infer<typeof bodyRegionSchema>

/**
 * Muscle group info schema - full data for dropdowns and filtering
 */
export const muscleGroupInfoSchema = z.object({
  id: z.string(),
  name: muscleGroupSchema,
  displayName: z.string(),
  bodyRegion: bodyRegionSchema,
})

export type MuscleGroupInfo = z.infer<typeof muscleGroupInfoSchema>

/**
 * List muscle groups output schema
 */
export const listMuscleGroupsOutputSchema = z.array(muscleGroupInfoSchema)

export type ListMuscleGroupsOutput = z.infer<typeof listMuscleGroupsOutputSchema>

/**
 * Movement pattern schema - categorizes exercises by movement type
 */
export const movementPatternSchema = z.enum(['push', 'pull', 'hinge', 'squat', 'carry', 'core'], {
  errorMap: () => ({ message: 'Patrón de movimiento inválido' }),
})

export type MovementPattern = z.infer<typeof movementPatternSchema>
