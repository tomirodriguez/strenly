import { z } from 'zod'
import { organizationSchema } from './organization'

/**
 * Update organization input schema
 * Only owner can update organization details
 */
export const updateOrganizationInputSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es muy largo').optional(),
  logo: z.string().url('URL de logo invalida').nullable().optional(),
})

export const updateOrganizationOutputSchema = z.object({
  organization: organizationSchema,
})

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInputSchema>
