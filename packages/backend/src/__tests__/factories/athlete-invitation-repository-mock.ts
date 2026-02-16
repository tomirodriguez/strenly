import type { AthleteInvitationRepositoryPort } from '@strenly/core/ports/athlete-invitation-repository.port'
import { okAsync } from 'neverthrow'
import { vi } from 'vitest'

export function createAthleteInvitationRepositoryMock(
  overrides: Partial<AthleteInvitationRepositoryPort> = {},
): AthleteInvitationRepositoryPort {
  return {
    findByToken: vi.fn().mockReturnValue(okAsync(null)),
    findByAthleteId: vi.fn().mockReturnValue(okAsync(null)),
    create: vi.fn().mockReturnValue(okAsync(undefined)),
    markAccepted: vi.fn().mockReturnValue(okAsync(undefined)),
    revoke: vi.fn().mockReturnValue(okAsync(undefined)),
    ...overrides,
  }
}
