import { randomBytes } from 'node:crypto'

/**
 * Generates a cryptographically secure invitation token.
 * Uses 32 bytes (256 bits) of random data encoded as base64url.
 * Result is a 43-character string.
 */
export function generateInvitationToken(): string {
  return randomBytes(32).toString('base64url')
}
