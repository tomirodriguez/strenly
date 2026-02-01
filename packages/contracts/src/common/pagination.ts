import { z } from 'zod'

/**
 * Default pagination values
 */
export const PAGINATION_DEFAULTS = { limit: 10, maxLimit: 100 } as const

/**
 * Pagination query schema for list operations.
 * Provides consistent validation with Spanish error messages.
 *
 * @example
 * export const listItemsInputSchema = paginationQuerySchema.extend({
 *   search: z.string().optional(),
 * })
 */
export const paginationQuerySchema = z.object({
  limit: z
    .number()
    .int('El límite debe ser un número entero')
    .min(1, 'El límite debe ser al menos 1')
    .max(100, 'El límite no puede superar 100')
    .default(10),
  offset: z.number().int('El offset debe ser un número entero').min(0, 'El offset no puede ser negativo').default(0),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>
