import { z } from 'zod'
import { programSchema, programWithDetailsSchema } from './program'

// ============================================================================
// Template Input Schemas
// ============================================================================

/**
 * Save program as template input schema
 */
export const saveAsTemplateInputSchema = z.object({
  programId: z.string(),
  name: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre no puede superar los 100 caracteres' }),
  description: z
    .string()
    .max(500, { message: 'La descripcion no puede superar los 500 caracteres' })
    .optional()
    .or(z.literal('')),
})

export type SaveAsTemplateInput = z.infer<typeof saveAsTemplateInputSchema>

/**
 * Create program from template input schema
 */
export const createFromTemplateInputSchema = z.object({
  templateId: z.string(),
  name: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre no puede superar los 100 caracteres' }),
  athleteId: z.string().optional(),
})

export type CreateFromTemplateInput = z.infer<typeof createFromTemplateInputSchema>

/**
 * List templates input schema - filters for templates only
 */
export const listTemplatesInputSchema = z.object({
  search: z.string().optional(),
  limit: z
    .number()
    .min(1, { message: 'El limite debe ser al menos 1' })
    .max(100, { message: 'El limite no puede superar 100' })
    .optional(),
  offset: z.number().min(0, { message: 'El offset no puede ser negativo' }).optional(),
})

export type ListTemplatesInput = z.infer<typeof listTemplatesInputSchema>

// ============================================================================
// Template Output Schemas
// ============================================================================

/**
 * Template output schema - extends program with template-specific metadata
 */
export const templateOutputSchema = programSchema.extend({
  weekCount: z.number(),
  sessionCount: z.number(),
})

export type TemplateOutput = z.infer<typeof templateOutputSchema>

/**
 * List templates output schema
 */
export const listTemplatesOutputSchema = z.object({
  items: z.array(templateOutputSchema),
  totalCount: z.number(),
})

export type ListTemplatesOutput = z.infer<typeof listTemplatesOutputSchema>

/**
 * Template with details output schema - for creation result
 */
export const templateWithDetailsOutputSchema = programWithDetailsSchema.extend({
  weekCount: z.number(),
  sessionCount: z.number(),
})

export type TemplateWithDetailsOutput = z.infer<typeof templateWithDetailsOutputSchema>
