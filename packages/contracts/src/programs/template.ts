import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'
import { optionalDescriptionSchema, programSchema, programWithDetailsSchema } from './program'

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
