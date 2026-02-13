import type { Athlete } from '@strenly/contracts/athletes/athlete'
import { Link, useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { Edit, Eye, History, Mail, Trash } from 'lucide-react'
import { useMemo } from 'react'
import { InvitationStatus } from './invitation-status'
import { createDataTableColumns } from '@/components/data-table/create-data-table-columns'
import { Badge } from '@/components/ui/badge'
import { useOrgSlug } from '@/hooks/use-org-slug'

type UseAthletesColumnsOptions = {
  onEdit: (athlete: Athlete) => void
  onArchive: (athlete: Athlete) => void
  onInvitation: (athlete: Athlete) => void
}

/**
 * Hook that creates athletes table column definitions using createDataTableColumns.
 * Returns memoized columns that include navigation, edit, archive, and invitation actions.
 */
export function useAthletesColumns({
  onEdit,
  onArchive,
  onInvitation,
}: UseAthletesColumnsOptions): ColumnDef<Athlete, unknown>[] {
  const orgSlug = useOrgSlug()
  const navigate = useNavigate()

  return useMemo(
    () =>
      createDataTableColumns<Athlete>((helper) => [
        helper.accessor('name', {
          header: 'Nombre',
          cell: ({ row }) => (
            <Link
              to="/$orgSlug/athletes/$athleteId"
              params={{ orgSlug, athleteId: row.original.id }}
              className="font-medium text-primary hover:underline"
            >
              {row.original.name}
            </Link>
          ),
        }),
        helper.accessor('email', {
          header: 'Correo',
          cell: ({ row }) => <span className="text-muted-foreground">{row.original.email ?? '-'}</span>,
        }),
        helper.accessor('status', {
          header: 'Estado',
          cell: ({ row }) => {
            const status = row.original.status
            return (
              <Badge variant={status === 'active' ? 'secondary' : 'outline'}>
                {status === 'active' ? 'Activo' : 'Inactivo'}
              </Badge>
            )
          },
        }),
        helper.display({
          id: 'invitation',
          header: 'Invitacion',
          cell: ({ row }) => <InvitationStatus athlete={row.original} />,
        }),
        helper.accessor('createdAt', {
          header: 'Creado',
          cell: ({ row }) => {
            const createdAt = new Date(row.original.createdAt)
            return (
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </span>
            )
          },
        }),
        helper.actions({
          actions: () => [
            {
              label: 'Ver Atleta',
              icon: Eye,
              onClick: (athlete) =>
                navigate({
                  to: '/$orgSlug/athletes/$athleteId',
                  params: { orgSlug, athleteId: athlete.id },
                }),
            },
            {
              label: 'Ver Historial',
              icon: History,
              onClick: (athlete) =>
                navigate({
                  to: '/$orgSlug/athletes/$athleteId/logs',
                  params: { orgSlug, athleteId: athlete.id },
                }),
            },
            { label: 'Editar', icon: Edit, onClick: onEdit },
            { label: 'Invitacion', icon: Mail, onClick: onInvitation },
            { label: 'Archivar', icon: Trash, onClick: onArchive, variant: 'destructive' },
          ],
        }),
      ]),
    [orgSlug, navigate, onEdit, onArchive, onInvitation],
  )
}
