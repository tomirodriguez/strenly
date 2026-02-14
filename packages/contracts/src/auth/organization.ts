import { z } from 'zod'

/**
 * Organization entity schema (TRUE source of truth)
 * Validation rules for organization creation during onboarding
 */
export const organizationSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres'),
  slug: z
    .string()
    .min(2, 'La URL debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo puede contener letras minusculas, numeros y guiones'),
})

export type Organization = z.infer<typeof organizationSchema>

/**
 * Create organization input schema
 * Derives from entity via .pick() - validation inherited automatically
 */
export const createOrganizationInputSchema = organizationSchema.pick({
  name: true,
  slug: true,
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>
