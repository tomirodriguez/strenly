import { z } from 'zod'
import { exerciseGroupSchema } from './exercise-group'
import { prescriptionSeriesInputSchema } from './prescription'

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
 * Prescription with series array schema
 * Contains series as individual set definitions
 */
export const prescriptionWithSeriesSchema = z.object({
  id: z.string(),
  weekId: z.string(),
  series: z.array(prescriptionSeriesInputSchema),
  notes: z.string().nullable(),
})

export type PrescriptionWithSeries = z.infer<typeof prescriptionWithSeriesSchema>

/**
 * Exercise row schema
 * Represents an exercise row in the program grid
 */
export const exerciseRowWithPrescriptionsSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string(),
  orderIndex: z.number(),
  // Group-based fields
  groupId: z.string().nullable(),
  orderWithinGroup: z.number().int().min(0).nullable(),
  // Other fields
  setTypeLabel: z.string().nullable(),
  notes: z.string().nullable(),
  restSeconds: z.number().nullable(),
  prescriptionsByWeekId: z.record(z.string(), prescriptionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ExerciseRowWithPrescriptions = z.infer<typeof exerciseRowWithPrescriptionsSchema>

/**
 * Session with rows output schema
 */
export const sessionWithRowsSchema = programSessionSchema.extend({
  rows: z.array(exerciseRowWithPrescriptionsSchema),
  exerciseGroups: z.array(exerciseGroupSchema).optional(),
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
 * @property weeksCount - Number of initial weeks to create (1-12). Defaults to 4 if not provided.
 * @property sessionsCount - Number of initial sessions to create (1-7). Defaults to 3 if not provided.
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
  weeksCount: z
    .number()
    .int({ message: 'El numero de semanas debe ser entero' })
    .min(1, { message: 'El programa debe tener al menos 1 semana' })
    .max(12, { message: 'El programa no puede tener mas de 12 semanas' })
    .optional(),
  sessionsCount: z
    .number()
    .int({ message: 'El numero de sesiones debe ser entero' })
    .min(1, { message: 'El programa debe tener al menos 1 sesion' })
    .max(7, { message: 'El programa no puede tener mas de 7 sesiones por semana' })
    .optional(),
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
