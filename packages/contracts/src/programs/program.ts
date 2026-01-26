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

/**
 * Intensity type schema for aggregate
 * - absolute: Weight in kg/lb
 * - percentage: Percentage of 1RM
 * - rpe: Rate of Perceived Exertion
 * - rir: Reps in Reserve
 */
export const aggregateIntensityTypeSchema = z.enum(['absolute', 'percentage', 'rpe', 'rir'])

export type AggregateIntensityType = z.infer<typeof aggregateIntensityTypeSchema>

// ============================================================================
// Aggregate Schemas (NEW - for full program hierarchy)
// ============================================================================

/**
 * Series schema - individual set within a group item
 * Used in the aggregate hierarchy: Program > Week > Session > Group > Item > Series
 */
export const seriesSchema = z.object({
  orderIndex: z.number().int().min(0),
  reps: z.number().int().min(0).nullable(),
  repsMax: z.number().int().min(0).nullable(),
  isAmrap: z.boolean(),
  intensityType: aggregateIntensityTypeSchema.nullable(),
  intensityValue: z.number().nullable(),
  tempo: z.string().regex(/^[\dX]{4}$/i).nullable(),
  restSeconds: z.number().int().min(0).nullable(),
})

export type Series = z.infer<typeof seriesSchema>

/**
 * Group item schema - an exercise within a group
 * Contains series (individual sets)
 */
export const groupItemSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  orderIndex: z.number().int().min(0),
  series: z.array(seriesSchema),
})

export type GroupItem = z.infer<typeof groupItemSchema>

/**
 * Exercise group schema for aggregate
 * Contains items (exercises with their series)
 */
export const exerciseGroupAggregateSchema = z.object({
  id: z.string(),
  orderIndex: z.number().int().min(0),
  items: z.array(groupItemSchema),
})

export type ExerciseGroupAggregate = z.infer<typeof exerciseGroupAggregateSchema>

/**
 * Session schema for aggregate
 * Contains exercise groups
 */
export const sessionAggregateSchema = z.object({
  id: z.string(),
  name: z.string(),
  orderIndex: z.number().int().min(0),
  exerciseGroups: z.array(exerciseGroupAggregateSchema),
})

export type SessionAggregate = z.infer<typeof sessionAggregateSchema>

/**
 * Week schema for aggregate
 * Contains sessions with their exercise groups
 */
export const weekAggregateSchema = z.object({
  id: z.string(),
  name: z.string(),
  orderIndex: z.number().int().min(0),
  sessions: z.array(sessionAggregateSchema),
})

export type WeekAggregate = z.infer<typeof weekAggregateSchema>

/**
 * Full program aggregate schema for output
 * Contains the complete hierarchy: weeks > sessions > groups > items > series
 */
export const programAggregateSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  athleteId: z.string().nullable(),
  isTemplate: z.boolean(),
  status: programStatusSchema,
  weeks: z.array(weekAggregateSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProgramAggregate = z.infer<typeof programAggregateSchema>

/**
 * Series input schema (for creating/updating)
 * Same as output but no orderIndex (auto-calculated)
 */
export const seriesInputSchema = z.object({
  reps: z.number().int().min(0).nullable(),
  repsMax: z.number().int().min(0).nullable().optional(),
  isAmrap: z.boolean(),
  intensityType: aggregateIntensityTypeSchema.nullable().optional(),
  intensityValue: z.number().nullable().optional(),
  tempo: z.string().regex(/^[\dX]{4}$/i).nullable().optional(),
  restSeconds: z.number().int().min(0).nullable().optional(),
})

export type SeriesInput = z.infer<typeof seriesInputSchema>

/**
 * Group item input schema
 */
export const groupItemInputSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  orderIndex: z.number().int().min(0),
  series: z.array(seriesInputSchema).optional(),
})

export type GroupItemInput = z.infer<typeof groupItemInputSchema>

/**
 * Exercise group input schema
 */
export const exerciseGroupInputSchema = z.object({
  id: z.string(),
  orderIndex: z.number().int().min(0),
  items: z.array(groupItemInputSchema),
})

export type ExerciseGroupInput = z.infer<typeof exerciseGroupInputSchema>

/**
 * Session input schema
 */
export const sessionInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  orderIndex: z.number().int().min(0),
  exerciseGroups: z.array(exerciseGroupInputSchema).optional(),
})

export type SessionInput = z.infer<typeof sessionInputSchema>

/**
 * Week input schema
 */
export const weekInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  orderIndex: z.number().int().min(0),
  sessions: z.array(sessionInputSchema).optional(),
})

export type WeekInput = z.infer<typeof weekInputSchema>

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
