import { sessionProcedure } from '../../lib/orpc'
import {
  createOrganizationInputSchema,
  createOrganizationOutputSchema,
} from '@strenly/contracts/organizations/create-organization'
import { eq } from 'drizzle-orm'
import { plans, subscriptions } from '@strenly/database/schema'

/**
 * Create organization procedure
 * Called during onboarding to create a new organization with selected plan
 *
 * Flow:
 * 1. Validate plan exists and matches organization type
 * 2. Create organization via Better-Auth
 * 3. Create subscription linking org to plan
 */
export const createOrganization = sessionProcedure
  .errors({
    SLUG_EXISTS: { message: 'Ya existe una organizacion con ese slug' },
    PLAN_NOT_FOUND: { message: 'Plan no encontrado' },
    INVALID_PLAN_TYPE: { message: 'El plan no es compatible con el tipo de organizacion' },
  })
  .input(createOrganizationInputSchema)
  .output(createOrganizationOutputSchema)
  .handler(async ({ input, context, errors }) => {
    // 1. Validate plan exists and matches org type
    const [plan] = await context.db.select().from(plans).where(eq(plans.id, input.planId))

    if (!plan) {
      throw errors.PLAN_NOT_FOUND()
    }

    if (plan.organizationType !== input.type) {
      throw errors.INVALID_PLAN_TYPE()
    }

    // 2. Create organization via Better-Auth
    const result = await context.auth.api.createOrganization({
      body: {
        name: input.name,
        slug: input.slug,
        metadata: { type: input.type },
      },
      headers: context.headers,
    })

    if (!result) {
      throw errors.SLUG_EXISTS()
    }

    // 3. Create subscription linking org to plan
    await context.db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      organizationId: result.id,
      planId: plan.id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      athleteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      organization: {
        id: result.id,
        name: result.name,
        slug: result.slug,
        logo: result.logo ?? null,
        type: input.type,
        createdAt: result.createdAt.toISOString(),
      },
    }
  })
