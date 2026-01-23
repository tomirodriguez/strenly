import { z } from 'zod'

/**
 * Re-export member role from common for convenience
 */
export { memberRoleSchema, type MemberRole } from '../common/roles'

/**
 * Organization member schema
 * Represents a user's membership in an organization
 */
export const memberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  role: z.enum(['owner', 'admin', 'member']),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable(),
  }),
  createdAt: z.string(),
})

export type Member = z.infer<typeof memberSchema>
