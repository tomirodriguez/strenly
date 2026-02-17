import type { Athlete } from '@strenly/contracts/athletes/athlete'
import { useQueryClient } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useGenerateInvitation } from '../hooks/mutations/use-generate-invitation'
import { useAthleteInvitation } from '../hooks/queries/use-athlete-invitation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

type InvitationModalProps = {
  athlete: Athlete | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  accepted: { label: 'Aceptada', variant: 'default' },
  expired: { label: 'Expirada', variant: 'outline' },
  revoked: { label: 'Revocada', variant: 'destructive' },
}

function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url
  const start = url.slice(0, 25)
  const end = url.slice(-20)
  return `${start}...${end}`
}

/**
 * Modal to view, copy, and regenerate athlete invitations.
 * Shows invitation URL, status, and expiration date.
 */
export function InvitationModal({ athlete, open, onOpenChange }: InvitationModalProps) {
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()
  const { data: invitation, isLoading, error } = useAthleteInvitation(open ? (athlete?.id ?? null) : null)
  const generateMutation = useGenerateInvitation()

  const handleCopy = async () => {
    if (!invitation?.invitationUrl) return
    try {
      await navigator.clipboard.writeText(invitation.invitationUrl)
      setCopied(true)
      toast.success('Link copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar el link')
    }
  }

  const handleRegenerate = () => {
    if (!athlete) return
    generateMutation.mutate(
      { athleteId: athlete.id },
      {
        onSuccess: () => {
          toast.success('Invitacion generada exitosamente')
          // Invalidate the invitation query to refetch
          queryClient.invalidateQueries({
            queryKey: orpc.athletes.getInvitation.key({ input: { athleteId: athlete.id } }),
          })
        },
      },
    )
  }

  const statusInfo = invitation ? STATUS_LABELS[invitation.status] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitacion para {athlete?.name}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">No hay invitacion activa para este atleta.</p>
            <Button onClick={handleRegenerate} disabled={generateMutation.isPending}>
              <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
              Generar Invitacion
            </Button>
          </div>
        )}

        {invitation && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Estado:</span>
              {statusInfo && <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground text-sm">Expira:</span>
              <p className="text-sm">
                {format(new Date(invitation.expiresAt), "d 'de' MMMM, yyyy", { locale: es })}
                <span className="ml-1 text-muted-foreground">
                  ({formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true, locale: es })})
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground text-sm">Link de invitacion:</span>
              <div className="flex items-center gap-2 rounded-md bg-muted p-2">
                <code className="flex-1 text-xs">{truncateUrl(invitation.invitationUrl)}</code>
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {invitation.status !== 'accepted' && (
              <Button variant="outline" onClick={handleRegenerate} disabled={generateMutation.isPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                Regenerar Invitacion
              </Button>
            )}

            {invitation.status === 'accepted' && invitation.acceptedAt && (
              <p className="text-muted-foreground text-sm">
                Aceptada el {format(new Date(invitation.acceptedAt), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
