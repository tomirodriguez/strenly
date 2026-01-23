import { z } from 'zod'

/**
 * Organization type - distinguishes between solo coaches and gyms
 * - coach_solo: Individual coach managing their own athletes
 * - gym: Multi-coach organization with team management
 */
export const organizationTypeSchema = z.enum(['coach_solo', 'gym'])
export type OrganizationType = z.infer<typeof organizationTypeSchema>

/**
 * Organization schema
 * Represents the core organization data structure
 */
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  type: organizationTypeSchema,
  createdAt: z.string(),
})

export type Organization = z.infer<typeof organizationSchema>
