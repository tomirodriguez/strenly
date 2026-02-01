import { z } from 'zod'

/**
 * Date-only schema (YYYY-MM-DD format).
 * Use for birth dates, log dates, etc.
 */
export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)')

/**
 * Datetime schema that coerces strings to Date objects.
 * Use for timestamps that need Date object manipulation.
 */
export const datetimeSchema = z.coerce.date()

/**
 * Timestamps schema for created/updated fields.
 * Use with .extend() for output schemas.
 */
export const timestampsSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type DateOnly = z.infer<typeof dateOnlySchema>
export type Timestamps = z.infer<typeof timestampsSchema>
