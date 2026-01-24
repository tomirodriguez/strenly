import { z } from 'zod'

/**
 * Muscle group schema - matches the 10 major muscle groups for exercise categorization
 */
export const muscleGroupSchema = z.enum([
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'core',
  'calves',
])

export type MuscleGroup = z.infer<typeof muscleGroupSchema>

/**
 * Body region schema - groups muscle groups by anatomical region
 */
export const bodyRegionSchema = z.enum(['upper', 'lower', 'core'])

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
 * Movement pattern schema - categorizes exercises by movement type
 */
export const movementPatternSchema = z.enum(['push', 'pull', 'hinge', 'squat', 'carry', 'core'])

export type MovementPattern = z.infer<typeof movementPatternSchema>
