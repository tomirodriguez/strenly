import { z } from 'zod'
import { parsedPrescriptionSchema } from './prescription'

/**
 * Program status schema
 * draft - being edited
 * active - in use by athlete
 * archived - no longer active
 */
export const programStatusSchema = z.enum(['draft', 'active', 'archived'])

export type ProgramStatus = z.infer<typeof programStatusSchema>

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Program output schema - basic program representation
 */
export const programSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  athleteId: z.string().nullable(),
  isTemplate: z.boolean(),
  status: programStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Program = z.infer<typeof programSchema>

/**
 * Program week output schema
 */
export const programWeekSchema = z.object({
  id: z.string(),
  programId: z.string(),
  name: z.string(),
  orderIndex: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProgramWeek = z.infer<typeof programWeekSchema>

/**
 * Program session output schema
 */
export const programSessionSchema = z.object({
  id: z.string(),
  programId: z.string(),
  name: z.string(),
  orderIndex: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProgramSession = z.infer<typeof programSessionSchema>

/**
 * Prescription output schema
 */
export const prescriptionSchema = z.object({
  id: z.string(),
  sets: z.number(),
  repsMin: z.number(),
  repsMax: z.number().nullable(),
  isAmrap: z.boolean(),
  isUnilateral: z.boolean(),
  unilateralUnit: z.enum(['leg', 'arm', 'side']).nullable(),
  intensityType: z.enum(['absolute', 'percentage', 'rpe', 'rir']).nullable(),
  intensityValue: z.number().nullable(),
  tempo: z.string().nullable(),
})

export type Prescription = z.infer<typeof prescriptionSchema>

/**
 * Base exercise row schema (without subRows for recursion)
 */
const baseExerciseRowSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string(),
  orderIndex: z.number(),
  supersetGroup: z.string().nullable(),
  supersetOrder: z.number().nullable(),
  setTypeLabel: z.string().nullable(),
  isSubRow: z.boolean(),
  parentRowId: z.string().nullable(),
  notes: z.string().nullable(),
  restSeconds: z.number().nullable(),
  prescriptionsByWeekId: z.record(z.string(), prescriptionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

/**
 * Exercise row with prescriptions output schema
 * SubRows use the same structure (single level nesting)
 */
export const exerciseRowWithPrescriptionsSchema: z.ZodType<ExerciseRowWithPrescriptions> = baseExerciseRowSchema.extend(
  {
    subRows: z.array(z.lazy(() => baseExerciseRowSchema.extend({ subRows: z.array(z.never()) }))),
  },
)

export type ExerciseRowWithPrescriptions = z.infer<typeof baseExerciseRowSchema> & {
  subRows: ExerciseRowWithPrescriptions[]
}

/**
 * Session with rows output schema
 */
export const sessionWithRowsSchema = programSessionSchema.extend({
  rows: z.array(exerciseRowWithPrescriptionsSchema),
})

export type SessionWithRows = z.infer<typeof sessionWithRowsSchema>

/**
 * Full program with nested data for grid view
 */
export const programWithDetailsSchema = programSchema.extend({
  weeks: z.array(programWeekSchema),
  sessions: z.array(sessionWithRowsSchema),
})

export type ProgramWithDetails = z.infer<typeof programWithDetailsSchema>

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Create program input schema
 */
export const createProgramInputSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre no puede superar los 100 caracteres' }),
  description: z
    .string()
    .max(500, { message: 'La descripcion no puede superar los 500 caracteres' })
    .optional()
    .or(z.literal('')),
  athleteId: z.string().optional(),
  isTemplate: z.boolean().optional(),
})

export type CreateProgramInput = z.infer<typeof createProgramInputSchema>

/**
 * Update program input schema
 */
export const updateProgramInputSchema = z.object({
  programId: z.string(),
  name: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre no puede superar los 100 caracteres' })
    .optional(),
  description: z
    .string()
    .max(500, { message: 'La descripcion no puede superar los 500 caracteres' })
    .optional()
    .or(z.literal('')),
})

export type UpdateProgramInput = z.infer<typeof updateProgramInputSchema>

/**
 * Get program input schema
 */
export const getProgramInputSchema = z.object({
  programId: z.string(),
})

export type GetProgramInput = z.infer<typeof getProgramInputSchema>

/**
 * List programs input schema
 */
export const listProgramsInputSchema = z.object({
  athleteId: z.string().optional(),
  isTemplate: z.boolean().optional(),
  status: programStatusSchema.optional(),
  search: z.string().optional(),
  limit: z
    .number()
    .min(1, { message: 'El limite debe ser al menos 1' })
    .max(100, { message: 'El limite no puede superar 100' })
    .optional(),
  offset: z.number().min(0, { message: 'El offset no puede ser negativo' }).optional(),
})

export type ListProgramsInput = z.infer<typeof listProgramsInputSchema>

/**
 * List programs output schema
 */
export const listProgramsOutputSchema = z.object({
  items: z.array(programSchema),
  totalCount: z.number(),
})

export type ListProgramsOutput = z.infer<typeof listProgramsOutputSchema>

/**
 * Archive program input schema
 */
export const archiveProgramInputSchema = z.object({
  programId: z.string(),
})

export type ArchiveProgramInput = z.infer<typeof archiveProgramInputSchema>

/**
 * Duplicate program input schema
 */
export const duplicateProgramInputSchema = z.object({
  sourceProgramId: z.string(),
  name: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre no puede superar los 100 caracteres' }),
  athleteId: z.string().optional(),
  isTemplate: z.boolean().optional(),
})

export type DuplicateProgramInput = z.infer<typeof duplicateProgramInputSchema>
