import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'
import { optionalDescriptionSchema, programSchema } from './program'

// ============================================================================
// Template Input Schemas
// ============================================================================

/**
 * Save program as template input schema
 * Derives name/description validation from programSchema via .pick()
 */
export const saveAsTemplateInputSchema = programSchema
  .pick({
    name: true,
    description: true,
  })
  .extend({
    programId: z.string().min(1, 'ID de programa requerido'),
    description: optionalDescriptionSchema,
  })

export type SaveAsTemplateInput = z.infer<typeof saveAsTemplateInputSchema>

/**
 * Create program from template input schema
 * Derives name validation from programSchema via .pick()
 */
export const createFromTemplateInputSchema = programSchema.pick({ name: true }).extend({
  templateId: z.string().min(1, 'ID de plantilla requerido'),
  athleteId: z.string().optional(),
})

export type CreateFromTemplateInput = z.infer<typeof createFromTemplateInputSchema>

/**
 * List templates input schema - filters for templates only
 * Uses common pagination schema
 */
export const listTemplatesQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().optional(),
  })
  .partial()

export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>

// ============================================================================
// Template Output Schemas
// ============================================================================

/**
 * List templates output schema
 * Uses programSchema directly - templates are programs with isTemplate=true
 */
export const listTemplatesOutputSchema = z.object({
  items: z.array(programSchema),
  totalCount: z.number(),
})

export type ListTemplatesOutput = z.infer<typeof listTemplatesOutputSchema>
