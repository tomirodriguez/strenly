import { z } from 'zod'

/**
 * Organization member roles
 * - owner: Full control of organization
 * - admin: Manage members and settings
 * - member: Basic access to organization resources
 */
export const memberRoleSchema = z.enum(['owner', 'admin', 'member'], {
  error: 'Rol de miembro inválido',
})
export type MemberRole = z.infer<typeof memberRoleSchema>
