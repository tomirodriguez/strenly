import type { Program } from '@strenly/contracts/programs/program'
import { ArchiveIcon, CopyIcon, EditIcon, MoreVerticalIcon, UserIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type ProgramCardProps = {
  program: Program
  athleteName?: string
  weekCount?: number
  onEdit: (program: Program) => void
  onDuplicate: (program: Program) => void
  onArchive: (program: Program) => void
}

const STATUS_LABELS: Record<Program['status'], string> = {
  draft: 'Borrador',
  active: 'Activo',
  archived: 'Archivado',
}

const STATUS_VARIANTS: Record<Program['status'], 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  archived: 'outline',
}

/**
 * Program card component for displaying programs in a grid.
 * Shows program info with status badge, athlete name, and action menu.
 */
export function ProgramCard({ program, athleteName, weekCount = 0, onEdit, onDuplicate, onArchive }: ProgramCardProps) {
  const formattedDate = new Date(program.updatedAt).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Card
      className={cn(
        'group relative cursor-pointer transition-shadow hover:shadow-md',
        program.status === 'archived' && 'opacity-60',
      )}
      onClick={() => onEdit(program)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1 space-y-1">
          <CardTitle className="line-clamp-1 text-base">{program.name}</CardTitle>
          {program.description && <p className="line-clamp-2 text-muted-foreground text-sm">{program.description}</p>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="flex h-8 w-8 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          >
            <MoreVerticalIcon className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(program)
                }}
              >
                <EditIcon className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate(program)
                }}
              >
                <CopyIcon className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {program.status !== 'archived' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive(program)
                  }}
                >
                  <ArchiveIcon className="mr-2 h-4 w-4" />
                  Archivar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANTS[program.status]}>{STATUS_LABELS[program.status]}</Badge>
            {weekCount > 0 && (
              <Badge variant="outline">
                {weekCount} {weekCount === 1 ? 'semana' : 'semanas'}
              </Badge>
            )}
          </div>
          {athleteName && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <UserIcon className="h-3.5 w-3.5" />
              <span className="max-w-[100px] truncate">{athleteName}</span>
            </div>
          )}
        </div>
        <p className="mt-2 text-muted-foreground text-xs">Actualizado: {formattedDate}</p>
      </CardContent>
    </Card>
  )
}
