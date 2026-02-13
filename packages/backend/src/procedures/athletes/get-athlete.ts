import { athleteSchema, getAthleteInputSchema } from '@strenly/contracts/athletes/athlete'
import { createAthleteRepository } from '../../infrastructure/repositories/athlete.repository'
import { authProcedure } from '../../lib/orpc'
import { makeGetAthlete } from '../../use-cases/athletes/get-athlete'

/**
 * Get athlete procedure
 * Requires authentication and organization context
 */
export const getAthlete = authProcedure
  .input(getAthleteInputSchema)
  .output(athleteSchema)
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para ver atletas' },
    NOT_FOUND: { message: 'Atleta no encontrado' },
  })
  .handler(async ({ input, context, errors }) => {
    const useCase = makeGetAthlete({
      athleteRepository: createAthleteRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      athleteId: input.athleteId,
    })

    if (result.isErr()) {
      // Exhaustive error mapping
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.NOT_FOUND()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const athlete = result.value

    return {
      id: athlete.id,
      organizationId: athlete.organizationId,
      name: athlete.name,
      email: athlete.email,
      phone: athlete.phone,
      birthdate: athlete.birthdate?.toISOString().split('T')[0] ?? null,
      gender: athlete.gender,
      notes: athlete.notes,
      status: athlete.status,
      linkedUserId: athlete.linkedUserId,
      isLinked: athlete.linkedUserId !== null,
      createdAt: athlete.createdAt.toISOString(),
      updatedAt: athlete.updatedAt.toISOString(),
    }
  })
