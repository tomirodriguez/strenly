import { z } from 'zod'

// Re-export domain logic from core (functions moved for proper layer boundaries)
export {
  formatDomainSeriesToNotation,
  formatPrescription,
  formatSeriesToNotation,
  mapIntensityTypeToUnit,
  type ParsedPrescription,
  type ParsedSeriesData,
  parsePrescriptionNotation,
  parsePrescriptionToSeries,
  SKIP_PRESCRIPTION,
} from '@strenly/core'

/**
 * Intensity types for prescriptions
 * - absolute: Weight in kg/lb (e.g., @120kg)
 * - percentage: Percentage of 1RM (e.g., @75%)
 * - rpe: Rate of Perceived Exertion (e.g., @RPE8)
 * - rir: Reps in Reserve (e.g., @RIR2)
 */
export const intensityTypeSchema = z.enum(['absolute', 'percentage', 'rpe', 'rir'], {
  errorMap: () => ({ message: 'Tipo de intensidad inválido' }),
})

export type IntensityType = z.infer<typeof intensityTypeSchema>

/**
 * Units for intensity values
 */
export const intensityUnitSchema = z.enum(['kg', 'lb', '%', 'rpe', 'rir'], {
  errorMap: () => ({ message: 'Unidad de intensidad inválida' }),
})

export type IntensityUnit = z.infer<typeof intensityUnitSchema>

/**
 * Units for unilateral exercises
 */
export const unilateralUnitSchema = z.enum(['leg', 'arm', 'side'], {
  errorMap: () => ({ message: 'Unidad unilateral invalida' }),
})

export type UnilateralUnit = z.infer<typeof unilateralUnitSchema>

/**
 * Parsed prescription structure (Zod validation schema)
 * Represents a fully parsed training prescription
 */
export const parsedPrescriptionSchema = z.object({
  sets: z.number().min(1).max(20),
  repsMin: z.number().min(0).max(100), // 0 for AMRAP
  repsMax: z.number().min(1).max(100).nullable(),
  isAmrap: z.boolean(),
  isUnilateral: z.boolean(),
  unilateralUnit: unilateralUnitSchema.nullable(),
  intensityType: intensityTypeSchema.nullable(),
  intensityValue: z.number().nullable(),
  intensityUnit: z.enum(['kg', 'lb', '%', 'rpe', 'rir']).nullable(),
  tempo: z
    .string()
    .regex(/^[\dX]{4}$/i)
    .nullable(), // "3110" or "31X0" format (X = explosive)
})

/**
 * Update prescription input schema
 * Used to update a single cell in the program grid
 */
export const updatePrescriptionSchema = z.object({
  exerciseRowId: z.string(),
  weekId: z.string(),
  notation: z.string().max(50, 'La notación no puede superar los 50 caracteres'), // e.g., "3x8@120kg (31X0)"
})

export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>

/**
 * Update prescription output schema
 * Returns the formatted notation for display
 */
export const updatePrescriptionOutputSchema = z.object({
  notation: z.string(),
})

export type UpdatePrescriptionOutput = z.infer<typeof updatePrescriptionOutputSchema>

/**
 * Schema for a single series (one set) in a prescription.
 * Used as input for creating prescription series arrays.
 */
export const prescriptionSeriesInputSchema = z.object({
  orderIndex: z.number().min(0),
  reps: z.number().min(0).nullable(), // null or 0 for AMRAP
  repsMax: z.number().min(0).nullable(),
  isAmrap: z.boolean(),
  intensityType: intensityTypeSchema.nullable(),
  intensityValue: z.number().nullable(),
  intensityUnit: intensityUnitSchema.nullable(),
  tempo: z
    .string()
    .regex(/^[\dX]{4}$/i)
    .nullable(),
})

export type PrescriptionSeriesInput = z.infer<typeof prescriptionSeriesInputSchema>
