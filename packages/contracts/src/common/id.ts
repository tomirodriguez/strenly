import { z } from 'zod'

/**
 * Creates an ID input schema for get/delete operations.
 * Provides consistent validation with Spanish error messages.
 *
 * @param resource - Resource name in Spanish for error message (e.g., 'atleta', 'programa')
 * @returns Zod schema with id field
 *
 * @example
 * export const getAthleteInputSchema = idInputSchema('atleta')
 * // { id: z.string().min(1, 'ID de atleta requerido') }
 */
export function idInputSchema(resource: string) {
  return z.object({
    id: z.string().min(1, `ID de ${resource} requerido`),
  })
}

/**
 * UUID schema with Spanish error message.
 * Use for fields that must be valid UUIDs.
 */
export const uuidSchema = z.string().uuid('ID inválido')
