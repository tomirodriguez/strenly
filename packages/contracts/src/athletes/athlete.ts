import { z } from 'zod'

/**
 * Athlete status schema
 * active - currently training
 * inactive - archived/paused
 */
export const athleteStatusSchema = z.enum(['active', 'inactive'])

export type AthleteStatus = z.infer<typeof athleteStatusSchema>

/**
 * Athlete gender schema
 */
export const genderSchema = z.enum(['male', 'female', 'other'])

export type AthleteGender = z.infer<typeof genderSchema>

/**
 * Athlete output schema
 * Full athlete representation for API responses
 */
export const athleteSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  birthdate: z.string().nullable(), // ISO date string
  gender: genderSchema.nullable(),
  notes: z.string().nullable(),
  status: athleteStatusSchema,
  linkedUserId: z.string().nullable(),
  isLinked: z.boolean(), // Computed from linkedUserId
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Athlete = z.infer<typeof athleteSchema>

/**
 * Create athlete input schema
 * Used when creating a new athlete
 */
export const createAthleteInputSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'El nombre es obligatorio' })
    .max(100, { message: 'El nombre no puede superar los 100 caracteres' }),
  email: z.string().email({ message: 'Por favor ingresa un correo electronico valido' }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  birthdate: z.string().optional().or(z.literal('')),
  gender: genderSchema.optional(),
  notes: z
    .string()
    .max(1000, { message: 'Las notas no pueden superar los 1000 caracteres' })
    .optional()
    .or(z.literal('')),
})

export type CreateAthleteInput = z.infer<typeof createAthleteInputSchema>

/**
 * Update athlete input schema
 * Partial updates with required athleteId
 */
export const updateAthleteInputSchema = createAthleteInputSchema.partial().extend({
  athleteId: z.string(),
  status: athleteStatusSchema.optional(),
})

export type UpdateAthleteInput = z.infer<typeof updateAthleteInputSchema>

/**
 * List athletes input schema
 * Supports filtering, search, and pagination
 */
export const listAthletesInputSchema = z.object({
  status: athleteStatusSchema.optional(),
  search: z.string().optional(),
  limit: z
    .number()
    .min(1, { message: 'El limite debe ser al menos 1' })
    .max(100, { message: 'El limite no puede superar 100' })
    .optional(),
  offset: z.number().min(0, { message: 'El offset no puede ser negativo' }).optional(),
})

export type ListAthletesInput = z.infer<typeof listAthletesInputSchema>

/**
 * List athletes output schema
 * Paginated response with total count
 */
export const listAthletesOutputSchema = z.object({
  items: z.array(athleteSchema),
  totalCount: z.number(),
})

export type ListAthletesOutput = z.infer<typeof listAthletesOutputSchema>
