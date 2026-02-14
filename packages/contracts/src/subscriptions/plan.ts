import { z } from 'zod'

/**
 * Organization type schema
 * Distinguishes between solo coaches and gym organizations
 * Defined here since organizations module was removed in favor of Better-Auth
 */
export const organizationTypeSchema = z.enum(['coach_solo', 'gym'], {
  errorMap: () => ({ message: 'Tipo de organización inválido' }),
})
export type OrganizationType = z.infer<typeof organizationTypeSchema>

/**
 * Plan features schema
 * Boolean flags for feature availability per plan
 */
export const planFeaturesSchema = z.object({
  templates: z.boolean(),
  analytics: z.boolean(),
  exportData: z.boolean(),
  customExercises: z.boolean(),
  multipleCoaches: z.boolean(),
})

export type PlanFeatures = z.infer<typeof planFeaturesSchema>

/**
 * Plan entity schema (TRUE source of truth)
 * Defines subscription plan with limits and pricing
 */
export const planSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre del plan es obligatorio'),
  slug: z.string().min(1, 'El slug del plan es obligatorio'),
  organizationType: organizationTypeSchema,
  athleteLimit: z.number().int().min(0, 'El límite de atletas no puede ser negativo'),
  coachLimit: z.number().int().min(0, 'El límite de coaches no puede ser negativo').nullable(), // null = unlimited
  features: planFeaturesSchema,
  priceMonthly: z.number().int().min(0, 'El precio mensual no puede ser negativo'), // cents
  priceYearly: z.number().int().min(0, 'El precio anual no puede ser negativo'), // cents
  isActive: z.boolean(),
})

export type Plan = z.infer<typeof planSchema>

/**
 * List plans input schema
 * Public endpoint - optional organization type filter
 */
export const listPlansInputSchema = z
  .object({
    organizationType: organizationTypeSchema.optional(),
  })
  .optional()

export type ListPlansInput = z.infer<typeof listPlansInputSchema>

/**
 * List plans output schema
 */
export const listPlansOutputSchema = z.object({
  items: z.array(planSchema),
  totalCount: z.number(),
})

export type ListPlansOutput = z.infer<typeof listPlansOutputSchema>
