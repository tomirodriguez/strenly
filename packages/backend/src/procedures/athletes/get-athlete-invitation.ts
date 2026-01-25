import { getAthleteInvitationOutputSchema } from '@strenly/contracts/athletes/invitation'
import { z } from 'zod'
import { createAthleteInvitationRepository } from '../../infrastructure/repositories/athlete-invitation.repository'
import { createAthleteRepository } from '../../infrastructure/repositories/athlete.repository'
import { authProcedure } from '../../lib/orpc'
import { makeGetAthleteInvitation } from '../../use-cases/athletes/get-athlete-invitation'

/**
 * Get an athlete's current invitation
 * Requires authentication and organization context
 * Returns full invitation details including URL, status, and expiration
 */
export const getAthleteInvitation = authProcedure
  .input(z.object({ athleteId: z.string() }))
  .output(getAthleteInvitationOutputSchema)
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para ver invitaciones' },
    ATHLETE_NOT_FOUND: { message: 'Atleta no encontrado' },
    NO_INVITATION: { message: 'No hay invitacion activa para este atleta' },
  })
  .handler(async ({ input, context, errors }) => {
    const useCase = makeGetAthleteInvitation({
      athleteRepository: createAthleteRepository(context.db),
      invitationRepository: createAthleteInvitationRepository(context.db),
      appUrl: process.env.APP_URL ?? 'http://localhost:3000',
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      athleteId: input.athleteId,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'athlete_not_found':
          throw errors.ATHLETE_NOT_FOUND()
        case 'no_invitation':
          throw errors.NO_INVITATION()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const inv = result.value
    return {
      id: inv.id,
      athleteId: inv.athleteId,
      invitationUrl: inv.invitationUrl,
      status: inv.status,
      expiresAt: inv.expiresAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
      acceptedAt: inv.acceptedAt?.toISOString() ?? null,
    }
  })
