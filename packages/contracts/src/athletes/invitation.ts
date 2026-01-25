import { z } from 'zod'

/**
 * Invitation info schema
 * Public display info for invitation acceptance page
 */
export const invitationInfoSchema = z.object({
  athleteName: z.string(),
  organizationName: z.string(),
  coachName: z.string(),
  expiresAt: z.string(), // ISO date string
  isValid: z.boolean(),
})

export type InvitationInfo = z.infer<typeof invitationInfoSchema>

/**
 * Generate invitation output schema
 * Returns the full invitation URL
 */
export const generateInvitationOutputSchema = z.object({
  invitationUrl: z.string(),
})

export type GenerateInvitationOutput = z.infer<typeof generateInvitationOutputSchema>

/**
 * Accept invitation output schema
 * Returns the linked athlete and organization
 */
export const acceptInvitationOutputSchema = z.object({
  athleteId: z.string(),
  organizationId: z.string(),
})

export type AcceptInvitationOutput = z.infer<typeof acceptInvitationOutputSchema>

/**
 * Get athlete invitation output schema
 * Returns full invitation details for viewing
 */
export const getAthleteInvitationOutputSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  invitationUrl: z.string(),
  status: z.enum(['pending', 'accepted', 'expired', 'revoked']),
  expiresAt: z.string(), // ISO date string
  createdAt: z.string(), // ISO date string
  acceptedAt: z.string().nullable(),
})

export type GetAthleteInvitationOutput = z.infer<typeof getAthleteInvitationOutputSchema>
