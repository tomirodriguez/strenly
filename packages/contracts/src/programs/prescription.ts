import { z } from 'zod'

/**
 * Intensity types for prescriptions
 * - absolute: Weight in kg/lb (e.g., @120kg)
 * - percentage: Percentage of 1RM (e.g., @75%)
 * - rpe: Rate of Perceived Exertion (e.g., @RPE8)
 * - rir: Reps in Reserve (e.g., @RIR2)
 */
export const intensityTypeSchema = z.enum(['absolute', 'percentage', 'rpe', 'rir'])

export type IntensityType = z.infer<typeof intensityTypeSchema>

/**
 * Units for intensity values
 */
export const intensityUnitSchema = z.enum(['kg', 'lb', '%', 'rpe', 'rir'])

export type IntensityUnit = z.infer<typeof intensityUnitSchema>

/**
 * Units for unilateral exercises
 */
export const unilateralUnitSchema = z.enum(['leg', 'arm', 'side'])

export type UnilateralUnit = z.infer<typeof unilateralUnitSchema>

/**
 * Parsed prescription structure
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

export type ParsedPrescription = z.infer<typeof parsedPrescriptionSchema>

/**
 * Special value for skip/rest notation (em dash)
 */
export const SKIP_PRESCRIPTION = '—'

/**
 * Parse prescription notation string into structured data
 *
 * Supported patterns:
 * - `—` or `-` → null (skip)
 * - `3x8` → basic sets x reps
 * - `3x8-12` → rep range
 * - `3xAMRAP` → as many reps as possible
 * - `3x12/leg` → unilateral (per leg/arm/side)
 * - `3x8@120kg` → with absolute weight
 * - `3x8@75%` → with percentage of 1RM
 * - `3x8@RIR2` → with reps in reserve
 * - `3x8@RPE8` → with rate of perceived exertion
 * - `3x8@120kg (3110)` → with tempo
 *
 * @param input - The notation string to parse
 * @returns Parsed prescription or null if unparseable/skip
 */
export function parsePrescriptionNotation(input: string): ParsedPrescription | null {
  const trimmed = input.trim()

  // Empty input
  if (trimmed === '') {
    return null
  }

  // Skip/rest notation (em dash or regular dash alone)
  if (trimmed === '—' || trimmed === '-') {
    return null
  }

  // Extract tempo if present: "3x8@120kg (3110)" -> tempo = "3110"
  let tempo: string | null = null
  let withoutTempo = trimmed
  const tempoMatch = trimmed.match(/\s*\(([\dXx]{4})\)\s*$/)
  const tempoValue = tempoMatch?.[1]
  if (tempoValue) {
    tempo = tempoValue.toUpperCase() // Normalize x to X
    withoutTempo = trimmed.replace(/\s*\([\dXx]{4}\)\s*$/, '')
  }

  // Base result object
  const baseResult = {
    isAmrap: false,
    isUnilateral: false,
    unilateralUnit: null,
    intensityType: null,
    intensityValue: null,
    intensityUnit: null,
    tempo,
  } as const

  // Pattern: 3xAMRAP
  const amrapMatch = withoutTempo.match(/^(\d+)\s*[xX]\s*amrap$/i)
  if (amrapMatch) {
    const setsStr = amrapMatch[1]
    if (!setsStr) return null
    return {
      sets: Number.parseInt(setsStr, 10),
      repsMin: 0,
      repsMax: null,
      isAmrap: true,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: null,
      intensityValue: null,
      intensityUnit: null,
      tempo,
    }
  }

  // Pattern: 3x12/leg, 3x12/arm, 3x12/side (unilateral)
  const unilateralMatch = withoutTempo.match(/^(\d+)\s*[xX]\s*(\d+)\s*\/\s*(leg|arm|side)$/i)
  if (unilateralMatch) {
    const setsStr = unilateralMatch[1]
    const repsStr = unilateralMatch[2]
    const unitStr = unilateralMatch[3]
    if (!setsStr || !repsStr || !unitStr) return null
    const unit = unitStr.toLowerCase()
    if (unit !== 'leg' && unit !== 'arm' && unit !== 'side') {
      return null
    }
    return {
      sets: Number.parseInt(setsStr, 10),
      repsMin: Number.parseInt(repsStr, 10),
      repsMax: null,
      isAmrap: false,
      isUnilateral: true,
      unilateralUnit: unit,
      intensityType: null,
      intensityValue: null,
      intensityUnit: null,
      tempo,
    }
  }

  // Pattern: 3x8@RPE8 or 3x8@RPE 8 (with optional space)
  const rpeMatch = withoutTempo.match(/^(\d+)\s*[xX]\s*(\d+)(?:\s*-\s*(\d+))?\s*@\s*rpe\s*(\d+(?:\.\d+)?)$/i)
  if (rpeMatch) {
    const setsStr = rpeMatch[1]
    const repsMinStr = rpeMatch[2]
    const repsMaxStr = rpeMatch[3]
    const intensityStr = rpeMatch[4]
    if (!setsStr || !repsMinStr || !intensityStr) return null
    return {
      sets: Number.parseInt(setsStr, 10),
      repsMin: Number.parseInt(repsMinStr, 10),
      repsMax: repsMaxStr ? Number.parseInt(repsMaxStr, 10) : null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'rpe',
      intensityValue: Number.parseFloat(intensityStr),
      intensityUnit: 'rpe',
      tempo,
    }
  }

  // Pattern: 3x8@RIR2 or 3x8@RIR 2 (with optional space)
  const rirMatch = withoutTempo.match(/^(\d+)\s*[xX]\s*(\d+)(?:\s*-\s*(\d+))?\s*@\s*rir\s*(\d+)$/i)
  if (rirMatch) {
    const setsStr = rirMatch[1]
    const repsMinStr = rirMatch[2]
    const repsMaxStr = rirMatch[3]
    const intensityStr = rirMatch[4]
    if (!setsStr || !repsMinStr || !intensityStr) return null
    return {
      sets: Number.parseInt(setsStr, 10),
      repsMin: Number.parseInt(repsMinStr, 10),
      repsMax: repsMaxStr ? Number.parseInt(repsMaxStr, 10) : null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'rir',
      intensityValue: Number.parseInt(intensityStr, 10),
      intensityUnit: 'rir',
      tempo,
    }
  }

  // Pattern: 3x8@75% (percentage)
  const percentMatch = withoutTempo.match(/^(\d+)\s*[xX]\s*(\d+)(?:\s*-\s*(\d+))?\s*@\s*(\d+(?:\.\d+)?)\s*%$/)
  if (percentMatch) {
    const setsStr = percentMatch[1]
    const repsMinStr = percentMatch[2]
    const repsMaxStr = percentMatch[3]
    const intensityStr = percentMatch[4]
    if (!setsStr || !repsMinStr || !intensityStr) return null
    return {
      sets: Number.parseInt(setsStr, 10),
      repsMin: Number.parseInt(repsMinStr, 10),
      repsMax: repsMaxStr ? Number.parseInt(repsMaxStr, 10) : null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'percentage',
      intensityValue: Number.parseFloat(intensityStr),
      intensityUnit: '%',
      tempo,
    }
  }

  // Pattern: 3x8@120kg or 3x8@120lb or 3x8@120 (absolute weight, defaults to kg)
  const weightMatch = withoutTempo.match(/^(\d+)\s*[xX]\s*(\d+)(?:\s*-\s*(\d+))?\s*@\s*(\d+(?:\.\d+)?)\s*(kg|lb)?$/i)
  if (weightMatch) {
    const setsStr = weightMatch[1]
    const repsMinStr = weightMatch[2]
    const repsMaxStr = weightMatch[3]
    const intensityStr = weightMatch[4]
    const unitStr = weightMatch[5]
    if (!setsStr || !repsMinStr || !intensityStr) return null
    const unit = unitStr?.toLowerCase()
    const intensityUnit: 'kg' | 'lb' = unit === 'lb' ? 'lb' : 'kg'
    return {
      sets: Number.parseInt(setsStr, 10),
      repsMin: Number.parseInt(repsMinStr, 10),
      repsMax: repsMaxStr ? Number.parseInt(repsMaxStr, 10) : null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'absolute',
      intensityValue: Number.parseFloat(intensityStr),
      intensityUnit,
      tempo,
    }
  }

  // Pattern: 3x8 or 3x8-12 (basic, no intensity)
  const basicMatch = withoutTempo.match(/^(\d+)\s*[xX]\s*(\d+)(?:\s*-\s*(\d+))?$/)
  if (basicMatch) {
    const setsStr = basicMatch[1]
    const repsMinStr = basicMatch[2]
    const repsMaxStr = basicMatch[3]
    if (!setsStr || !repsMinStr) return null
    return {
      sets: Number.parseInt(setsStr, 10),
      repsMin: Number.parseInt(repsMinStr, 10),
      repsMax: repsMaxStr ? Number.parseInt(repsMaxStr, 10) : null,
      ...baseResult,
    }
  }

  // Could not parse
  return null
}

/**
 * Format a parsed prescription back to notation string
 *
 * @param prescription - The parsed prescription or null
 * @returns Notation string (em dash for null)
 */
/**
 * Update prescription input schema
 * Used to update a single cell in the program grid
 */
export const updatePrescriptionSchema = z.object({
  exerciseRowId: z.string(),
  weekId: z.string(),
  notation: z.string().max(50), // e.g., "3x8@120kg (31X0)"
})

export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>

export function formatPrescription(prescription: ParsedPrescription | null): string {
  if (prescription === null) {
    return '—' // Skip notation
  }

  const {
    sets,
    repsMin,
    repsMax,
    isAmrap,
    isUnilateral,
    unilateralUnit,
    intensityType,
    intensityValue,
    intensityUnit,
    tempo,
  } = prescription

  // AMRAP format
  if (isAmrap) {
    return tempo ? `${sets}xAMRAP (${tempo})` : `${sets}xAMRAP`
  }

  // Build result string
  let result = `${sets}x${repsMin}`

  // Add rep range if different from min
  if (repsMax !== null && repsMax !== repsMin) {
    result += `-${repsMax}`
  }

  // Add unilateral unit
  if (isUnilateral && unilateralUnit) {
    result += `/${unilateralUnit}`
  }

  // Add intensity
  if (intensityType && intensityValue !== null) {
    switch (intensityType) {
      case 'absolute':
        result += `@${intensityValue}${intensityUnit}`
        break
      case 'percentage':
        result += `@${intensityValue}%`
        break
      case 'rir':
        result += `@RIR${intensityValue}`
        break
      case 'rpe':
        result += `@RPE${intensityValue}`
        break
    }
  }

  // Add tempo
  if (tempo) {
    result += ` (${tempo})`
  }

  return result
}

// ============================================================================
// Series-based parsing (new multi-part notation support)
// ============================================================================

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

/**
 * Parse prescription notation string into an array of series (one per set).
 * Supports multi-part notation like "3x8@120kg + 1x1@130kg".
 *
 * @param input - The notation string to parse
 * @returns Array of series (empty for skip/empty), or null if unparseable
 */
export function parsePrescriptionToSeries(input: string): PrescriptionSeriesInput[] | null {
  const trimmed = input.trim()

  // Empty input -> empty array
  if (trimmed === '') {
    return []
  }

  // Skip notation -> empty array
  if (trimmed === '—' || trimmed === '-') {
    return []
  }

  // Split on " + " to get multiple parts (handle extra whitespace)
  const parts = trimmed.split(/\s*\+\s*/)

  const allSeries: PrescriptionSeriesInput[] = []
  let orderIndex = 0

  for (const part of parts) {
    const parsed = parsePrescriptionNotation(part.trim())
    if (parsed === null) {
      // If any part is invalid, the whole thing is invalid
      return null
    }

    // Expand this part's sets into individual series
    for (let i = 0; i < parsed.sets; i++) {
      allSeries.push({
        orderIndex: orderIndex++,
        reps: parsed.isAmrap ? 0 : parsed.repsMin,
        repsMax: parsed.repsMax,
        isAmrap: parsed.isAmrap,
        intensityType: parsed.intensityType,
        intensityValue: parsed.intensityValue,
        intensityUnit: parsed.intensityUnit,
        tempo: parsed.tempo,
      })
    }
  }

  return allSeries
}

/**
 * Format an array of series back to compact notation string.
 * Groups consecutive identical series into count notation (e.g., 3x8).
 *
 * @param series - Array of prescription series
 * @returns Compact notation string (em dash for empty array)
 */
export function formatSeriesToNotation(series: PrescriptionSeriesInput[]): string {
  if (series.length === 0) {
    return '—'
  }

  // Group consecutive identical series
  const groups = groupConsecutiveIdentical(series)

  // Format each group and join with " + "
  const parts = groups.map((group) => formatGroup(group))

  return parts.join(' + ')
}

/**
 * Represents a group of identical consecutive series
 */
type SeriesGroup = {
  count: number
  template: PrescriptionSeriesInput
}

/**
 * Group consecutive identical series together.
 * Two series are "identical" if they have the same reps, repsMax, isAmrap,
 * intensityType, intensityValue, intensityUnit, and tempo.
 */
function groupConsecutiveIdentical(series: PrescriptionSeriesInput[]): SeriesGroup[] {
  if (series.length === 0) {
    return []
  }

  const groups: SeriesGroup[] = []
  const firstSeries = series[0]
  if (!firstSeries) {
    return []
  }

  let currentGroup: SeriesGroup = {
    count: 1,
    template: firstSeries,
  }

  for (let i = 1; i < series.length; i++) {
    const current = series[i]
    if (!current) continue

    if (seriesAreIdentical(currentGroup.template, current)) {
      currentGroup.count++
    } else {
      groups.push(currentGroup)
      currentGroup = {
        count: 1,
        template: current,
      }
    }
  }

  // Push the last group
  groups.push(currentGroup)

  return groups
}

/**
 * Check if two series are identical (ignoring orderIndex)
 */
function seriesAreIdentical(a: PrescriptionSeriesInput, b: PrescriptionSeriesInput): boolean {
  return (
    a.reps === b.reps &&
    a.repsMax === b.repsMax &&
    a.isAmrap === b.isAmrap &&
    a.intensityType === b.intensityType &&
    a.intensityValue === b.intensityValue &&
    a.intensityUnit === b.intensityUnit &&
    a.tempo === b.tempo
  )
}

/**
 * Format a single series group to notation
 */
function formatGroup(group: SeriesGroup): string {
  const { count, template } = group

  // AMRAP format
  if (template.isAmrap) {
    return template.tempo ? `${count}xAMRAP (${template.tempo})` : `${count}xAMRAP`
  }

  // Build result string
  let result = `${count}x${template.reps}`

  // Add rep range if different
  if (template.repsMax !== null && template.repsMax !== template.reps) {
    result += `-${template.repsMax}`
  }

  // Add intensity
  if (template.intensityType && template.intensityValue !== null) {
    switch (template.intensityType) {
      case 'absolute':
        result += `@${template.intensityValue}${template.intensityUnit}`
        break
      case 'percentage':
        result += `@${template.intensityValue}%`
        break
      case 'rir':
        result += `@RIR${template.intensityValue}`
        break
      case 'rpe':
        result += `@RPE${template.intensityValue}`
        break
    }
  }

  // Add tempo
  if (template.tempo) {
    result += ` (${template.tempo})`
  }

  return result
}
