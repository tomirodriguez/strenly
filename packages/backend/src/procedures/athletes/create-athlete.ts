import { athleteSchema, createAthleteInputSchema, genderSchema } from '@strenly/contracts/athletes/athlete'
import { createAthleteRepository } from '../../infrastructure/repositories/athlete.repository'
import { authProcedure } from '../../lib/orpc'
import { makeCreateAthlete } from '../../use-cases/athletes/create-athlete'

/**
 * Create athlete procedure
 * Requires authentication and organization context
 */
export const createAthlete = authProcedure
  .input(createAthleteInputSchema)
  .output(athleteSchema)
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para crear atletas' },
    VALIDATION_ERROR: { message: 'Datos de atleta invalidos' },
  })
  .handler(async ({ input, context, errors }) => {
    const useCase = makeCreateAthlete({
      athleteRepository: createAthleteRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    // Parse gender from optional string to enum
    const gender = input.gender ? genderSchema.parse(input.gender) : null

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      birthdate: input.birthdate ? new Date(input.birthdate) : null,
      gender,
      notes: input.notes ?? null,
    })

    if (result.isErr()) {
      // Exhaustive error mapping
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'validation_error':
          throw errors.VALIDATION_ERROR()
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
