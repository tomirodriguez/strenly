import { getInvitationInfoInputSchema, invitationInfoSchema } from '@strenly/contracts/athletes/invitation'
import { createAthleteInvitationRepository } from '../../infrastructure/repositories/athlete-invitation.repository'
import { createOrganizationLookup } from '../../infrastructure/services/organization-lookup'
import { logger } from '../../lib/logger'
import { publicProcedure } from '../../lib/orpc'
import { makeGetInvitationInfo } from '../../use-cases/athletes/get-invitation-info'

/**
 * Get invitation info by token
 * PUBLIC endpoint - no authentication required
 * Used to display invitation details on the acceptance page
 */
export const getInvitationInfo = publicProcedure
  .input(getInvitationInfoInputSchema)
  .output(invitationInfoSchema)
  .errors({
    INVALID_TOKEN: { message: 'Invalid invitation token' },
  })
  .handler(async ({ input, context, errors }) => {
    const useCase = makeGetInvitationInfo({
      invitationRepository: createAthleteInvitationRepository(context.db),
      organizationLookup: createOrganizationLookup(context.db),
    })

    const result = await useCase({
      token: input.token,
    })

    if (result.isErr()) {
      // Exhaustive error mapping
      switch (result.error.type) {
        case 'invalid_token':
          throw errors.INVALID_TOKEN()
        case 'repository_error':
          logger.error('Repository error', { error: result.error.message, procedure: 'getInvitationInfo' })
          throw new Error('Internal error')
      }
    }

    return {
      athleteName: result.value.athleteName,
      organizationName: result.value.organizationName,
      coachName: result.value.coachName,
      expiresAt: result.value.expiresAt.toISOString(),
      isValid: result.value.isValid,
    }
  })
