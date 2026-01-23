import { authProcedure } from '../../lib/orpc'
import { organizationSchema, organizationTypeSchema } from '@strenly/contracts/organizations/organization'
import { z } from 'zod'

/**
 * Get organization procedure
 * Returns the current organization details from context
 * Any member can view organization info
 */
export const getOrganization = authProcedure
  .output(z.object({ organization: organizationSchema }))
  .handler(async ({ context }) => {
    const fullOrg = await context.auth.api.getFullOrganization({
      headers: context.headers,
      query: { organizationId: context.organization.id },
    })

    // Safely parse the type from metadata - default to coach_solo if invalid
    const typeResult = organizationTypeSchema.safeParse(fullOrg?.metadata?.type)
    const orgType = typeResult.success ? typeResult.data : 'coach_solo'

    return {
      organization: {
        id: context.organization.id,
        name: context.organization.name,
        slug: context.organization.slug,
        logo: fullOrg?.logo ?? null,
        type: orgType,
        createdAt: fullOrg?.createdAt?.toISOString() ?? new Date().toISOString(),
      },
    }
  })
