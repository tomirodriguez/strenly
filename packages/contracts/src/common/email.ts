import { z } from 'zod'

/**
 * Email schema with Spanish error message.
 * Use for all email validation.
 */
export const emailSchema = z.string().email('Email inválido')

export type Email = z.infer<typeof emailSchema>
