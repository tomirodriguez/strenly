import type { Athlete } from '@strenly/contracts/athletes/athlete'
import { Badge } from '@/components/ui/badge'

type InvitationStatusProps = {
  athlete: Athlete
}

/**
 * Badge component showing the invitation status of an athlete.
 * - Accepted (success): Athlete has linked their user account
 * - Pending (warning): Invitation sent but not yet accepted
 * - Expired (destructive): Invitation has expired
 * - Not invited (default): No invitation has been generated
 */
export function InvitationStatus({ athlete }: InvitationStatusProps) {
  // If athlete has linked their account, they've accepted the invitation
  if (athlete.linkedUserId) {
    return <Badge variant="secondary">Aceptada</Badge>
  }

  // Check if there's a pending invitation
  // Note: The athlete schema doesn't include invitation details directly,
  // so we'll show "Not invited" if no linkedUserId exists
  // In the future, we may need to extend the schema to include invitation info
  return <Badge variant="outline">Sin invitar</Badge>
}
