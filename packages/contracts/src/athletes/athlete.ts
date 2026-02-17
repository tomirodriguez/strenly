import { z } from 'zod'
import { timestampsSchema } from '../common/dates'
import { emailSchema } from '../common/email'
import { paginationQuerySchema } from '../common/pagination'

/**
 * Athlete status schema
 * active - currently training
 * inactive - archived/paused
 */
export const athleteStatusSchema = z.enum(['active', 'inactive'], {
  error: 'Estado de atleta inválido',
})

export type AthleteStatus = z.infer<typeof athleteStatusSchema>

/**
 * Athlete gender schema
 */
export const genderSchema = z.enum(['male', 'female', 'other'], {
  error: 'Género inválido',
})

export type AthleteGender = z.infer<typeof genderSchema>

/**
 * Athlete entity schema (TRUE source of truth)
 * All validation rules and Spanish messages defined here.
 * Input schemas derive from this via .pick()
 */
export const athleteSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre no puede superar los 100 caracteres'),
  email: emailSchema.nullable(),
  phone: z.string().max(20, 'El teléfono no puede superar los 20 caracteres').nullable(),
  birthdate: z.string().nullable(), // ISO date string
  gender: genderSchema.nullable(),
  notes: z.string().max(1000, 'Las notas no pueden superar los 1000 caracteres').nullable(),
  status: athleteStatusSchema,
  linkedUserId: z.string().nullable(),
  isLinked: z.boolean(), // Computed from linkedUserId
  ...timestampsSchema.shape,
})

export type Athlete = z.infer<typeof athleteSchema>

/**
 * Create athlete input schema
 * Derives from entity via .pick() - validation inherited automatically
 * Uses .extend() only to handle form empty-string values, deriving from entity shape
 */
export const createAthleteInputSchema = athleteSchema
  .pick({
    name: true,
    email: true,
    phone: true,
    birthdate: true,
    gender: true,
    notes: true,
  })
  .partial({ gender: true })
  .extend({
    // Override for form handling: unwrap nullable (forms don't send null),
    // accept empty strings + optional (validation derived from entity)
    email: athleteSchema.shape.email.unwrap().or(z.literal('')).optional(),
    phone: athleteSchema.shape.phone.unwrap().or(z.literal('')).optional(),
    birthdate: athleteSchema.shape.birthdate.unwrap().or(z.literal('')).optional(),
    notes: athleteSchema.shape.notes.unwrap().or(z.literal('')).optional(),
  })

export type CreateAthleteInput = z.infer<typeof createAthleteInputSchema>

/**
 * Update athlete input schema
 * Partial updates with required athleteId
 */
export const updateAthleteInputSchema = createAthleteInputSchema.partial().extend({
  athleteId: z.string().min(1, 'ID de atleta requerido'),
  status: athleteStatusSchema.optional(),
})

export type UpdateAthleteInput = z.infer<typeof updateAthleteInputSchema>

/**
 * Get athlete input schema
 */
export const getAthleteInputSchema = z.object({
  athleteId: z.string().min(1, 'ID de atleta requerido'),
})

export type GetAthleteInput = z.infer<typeof getAthleteInputSchema>

/**
 * Archive athlete input schema
 */
export const archiveAthleteInputSchema = z.object({
  athleteId: z.string().min(1, 'ID de atleta requerido'),
})

export type ArchiveAthleteInput = z.infer<typeof archiveAthleteInputSchema>

export type { SuccessOutput as ArchiveAthleteOutput } from '../common/success'
/**
 * Archive athlete output schema
 * Reuses common successOutputSchema
 */
export { successOutputSchema as archiveAthleteOutputSchema } from '../common/success'

/**
 * List athletes input schema
 * Uses common pagination schema with domain-specific filters
 */
export const listAthletesQuerySchema = paginationQuerySchema
  .extend({
    status: athleteStatusSchema.optional(),
    search: z.string().optional(),
  })
  .partial() // Make limit/offset optional (use defaults)

export type ListAthletesQuery = z.infer<typeof listAthletesQuerySchema>

/**
 * List athletes output schema
 * Paginated response with total count
 */
export const listAthletesOutputSchema = z.object({
  items: z.array(athleteSchema),
  totalCount: z.number(),
})

export type ListAthletesOutput = z.infer<typeof listAthletesOutputSchema>
