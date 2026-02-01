import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'
import { programSchema, programWithDetailsSchema } from './program'

// ============================================================================
// Template Input Schemas
// ============================================================================

/**
 * Save program as template input schema
 */
export const saveAsTemplateInputSchema = z.object({
  programId: z.string().min(1, 'ID de programa requerido'),
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  description: z.string().max(500, 'La descripción no puede superar los 500 caracteres').optional().or(z.literal('')),
})

export type SaveAsTemplateInput = z.infer<typeof saveAsTemplateInputSchema>

/**
 * Create program from template input schema
 */
export const createFromTemplateInputSchema = z.object({
  templateId: z.string().min(1, 'ID de plantilla requerido'),
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  athleteId: z.string().optional(),
})

export type CreateFromTemplateInput = z.infer<typeof createFromTemplateInputSchema>

/**
 * List templates input schema - filters for templates only
 * Uses common pagination schema
 */
export const listTemplatesInputSchema = paginationQuerySchema
  .extend({
    search: z.string().optional(),
  })
  .partial()

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
