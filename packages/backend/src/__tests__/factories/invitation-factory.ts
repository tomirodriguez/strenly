import { faker } from '@faker-js/faker'

/**
 * Factory for athlete invitation test data
 */
export function createInvitationData(
  overrides: {
    athleteId?: string
    organizationId?: string
    createdByUserId?: string | null
    token?: string
    expiresAt?: Date
    acceptedAt?: Date | null
    revokedAt?: Date | null
  } = {},
) {
  return {
    id: faker.string.uuid(),
    athleteId: overrides.athleteId ?? faker.string.uuid(),
    organizationId: overrides.organizationId ?? faker.string.uuid(),
    createdByUserId: overrides.createdByUserId !== undefined ? overrides.createdByUserId : faker.string.uuid(),
    token: overrides.token ?? faker.string.alphanumeric(32),
    expiresAt: overrides.expiresAt ?? faker.date.future(),
    acceptedAt: overrides.acceptedAt !== undefined ? overrides.acceptedAt : null,
    revokedAt: overrides.revokedAt !== undefined ? overrides.revokedAt : null,
    createdAt: new Date(),
  }
}

/**
 * Create expired invitation
 */
export function createExpiredInvitation(overrides = {}) {
  return createInvitationData({
    expiresAt: faker.date.past(),
    ...overrides,
  })
}

/**
 * Create accepted invitation
 */
export function createAcceptedInvitation(overrides = {}) {
  return createInvitationData({
    acceptedAt: faker.date.past(),
    ...overrides,
  })
}

/**
 * Create revoked invitation
 */
export function createRevokedInvitation(overrides = {}) {
  return createInvitationData({
    revokedAt: faker.date.past(),
    ...overrides,
  })
}
