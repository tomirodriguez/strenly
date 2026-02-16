import { z } from 'zod'
import { timestampsSchema } from '../common/dates'
import { paginationQuerySchema } from '../common/pagination'
import { exerciseGroupSchema } from './exercise-group'
import { intensityTypeSchema, prescriptionSeriesInputSchema } from './prescription'

/**
 * Program status schema
 * draft - being edited
 * active - in use by athlete
 * archived - no longer active
 */
export const programStatusSchema = z.enum(['draft', 'active', 'archived'], {
  errorMap: () => ({ message: 'Estado de programa inválido' }),
})

export type ProgramStatus = z.infer<typeof programStatusSchema>

// ============================================================================
// Aggregate Schemas (for full program hierarchy)
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
  intensityType: intensityTypeSchema.nullable(),
  intensityValue: z.number().nullable(),
  tempo: z
    .string()
    .regex(/^[\dX]{4}$/i, 'Formato de tempo inválido (ej: 3110)')
    .nullable(),
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
 * Series input schema (for creating/updating)
 * Derives from seriesSchema, omitting orderIndex (auto-calculated)
 * and making most fields optional
 */
export const seriesInputSchema = seriesSchema.omit({ orderIndex: true }).partial({
  repsMax: true,
  intensityType: true,
  intensityValue: true,
  tempo: true,
  restSeconds: true,
})

export type SeriesInput = z.infer<typeof seriesInputSchema>

/**
 * Group item input schema
 * Derives from groupItemSchema, replacing series with input version
 */
export const groupItemInputSchema = groupItemSchema.pick({ id: true, exerciseId: true, orderIndex: true }).extend({
  series: z.array(seriesInputSchema).optional(),
})

export type GroupItemInput = z.infer<typeof groupItemInputSchema>

/**
 * Exercise group input schema
 * Derives from exerciseGroupAggregateSchema, replacing items with input version
 */
export const exerciseGroupInputSchema = exerciseGroupAggregateSchema.pick({ id: true, orderIndex: true }).extend({
  items: z.array(groupItemInputSchema),
})

export type ExerciseGroupInput = z.infer<typeof exerciseGroupInputSchema>

/**
 * Session input schema
 * Derives from sessionAggregateSchema, replacing exerciseGroups with input version
 */
export const sessionInputSchema = sessionAggregateSchema.pick({ id: true, name: true, orderIndex: true }).extend({
  exerciseGroups: z.array(exerciseGroupInputSchema).optional(),
})

export type SessionInput = z.infer<typeof sessionInputSchema>

/**
 * Week input schema
 * Derives from weekAggregateSchema, making name optional and replacing sessions with input version
 */
export const weekInputSchema = weekAggregateSchema
  .pick({ id: true, name: true, orderIndex: true })
  .partial({ name: true })
  .extend({
    sessions: z.array(sessionInputSchema).optional(),
  })

export type WeekInput = z.infer<typeof weekInputSchema>

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Program entity schema (TRUE source of truth)
 * All validation rules and Spanish messages defined here.
 */
export const programSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  description: z.string().max(500, 'La descripción no puede superar los 500 caracteres').nullable(),
  athleteId: z.string().nullable(),
  isTemplate: z.boolean(),
  status: programStatusSchema,
  ...timestampsSchema.shape,
})

export type Program = z.infer<typeof programSchema>

/**
 * Full program aggregate schema for output
 * Contains the complete hierarchy: weeks > sessions > groups > items > series
 * Derives from programSchema (entity) and extends with nested hierarchy
 */
export const programAggregateSchema = programSchema.extend({
  weeks: z.array(weekAggregateSchema),
})

export type ProgramAggregate = z.infer<typeof programAggregateSchema>

/**
 * Program week output schema
 */
export const programWeekSchema = z.object({
  id: z.string(),
  programId: z.string(),
  name: z.string(),
  orderIndex: z.number(),
  ...timestampsSchema.shape,
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
  ...timestampsSchema.shape,
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
  intensityType: intensityTypeSchema.nullable(),
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
  ...timestampsSchema.shape,
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
// Shared Input Helpers
// ============================================================================

/**
 * Optional description schema for form handling.
 * Derives validation from programSchema entity (source of truth).
 * Allows empty strings and optional values (forms send '' for cleared fields).
 */
export const optionalDescriptionSchema = programSchema.shape.description
  .unwrap() // strip nullable for form handling (forms don't send null)
  .or(z.literal(''))
  .optional()

/**
 * Nullable optional description schema for partial saves.
 * Derives validation from programSchema entity (source of truth).
 */
export const nullableOptionalDescriptionSchema = programSchema.shape.description.optional()

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Create program input schema
 * Derives from entity via .pick() - validation inherited automatically
 * Only uses .extend() for fields not in entity (weeksCount, sessionsCount)
 * @property weeksCount - Number of initial weeks to create (1-12). Defaults to 4 if not provided.
 * @property sessionsCount - Number of initial sessions to create (1-7). Defaults to 3 if not provided.
 */
export const createProgramInputSchema = programSchema
  .pick({
    name: true,
    description: true,
  })
  .extend({
    description: optionalDescriptionSchema,
    athleteId: z.string().optional(),
    isTemplate: z.boolean().optional(),
    weeksCount: z
      .number()
      .int('El número de semanas debe ser entero')
      .min(1, 'El programa debe tener al menos 1 semana')
      .max(12, 'El programa no puede tener más de 12 semanas')
      .optional(),
    sessionsCount: z
      .number()
      .int('El número de sesiones debe ser entero')
      .min(1, 'El programa debe tener al menos 1 sesión')
      .max(7, 'El programa no puede tener más de 7 sesiones por semana')
      .optional(),
  })

export type CreateProgramInput = z.infer<typeof createProgramInputSchema>

/**
 * Update program input schema
 * Derives from entity via .pick().partial() - validation inherited automatically
 */
export const updateProgramInputSchema = programSchema
  .pick({
    name: true,
    description: true,
  })
  .partial()
  .extend({
    programId: z.string().min(1, 'ID de programa requerido'),
    description: optionalDescriptionSchema,
  })

export type UpdateProgramInput = z.infer<typeof updateProgramInputSchema>

/**
 * Get program input schema
 */
export const getProgramInputSchema = z.object({
  programId: z.string().min(1, 'ID de programa requerido'),
})

export type GetProgramInput = z.infer<typeof getProgramInputSchema>

/**
 * List programs input schema
 * Uses common pagination with domain-specific filters
 */
export const listProgramsQuerySchema = paginationQuerySchema
  .extend({
    athleteId: z.string().optional(),
    isTemplate: z.boolean().optional(),
    status: programStatusSchema.optional(),
    search: z.string().optional(),
  })
  .partial()

export type ListProgramsQuery = z.infer<typeof listProgramsQuerySchema>

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
  programId: z.string().min(1, 'ID de programa requerido'),
})

export type ArchiveProgramInput = z.infer<typeof archiveProgramInputSchema>

/**
 * Duplicate program input schema
 * Derives name validation from entity via .pick()
 */
export const duplicateProgramInputSchema = programSchema.pick({ name: true }).extend({
  sourceProgramId: z.string().min(1, 'ID de programa origen requerido'),
  athleteId: z.string().optional(),
  isTemplate: z.boolean().optional(),
})

export type DuplicateProgramInput = z.infer<typeof duplicateProgramInputSchema>
