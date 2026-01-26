import type { ProgramAggregate } from '@strenly/contracts/programs/program'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon, CheckCircle2Icon, CopyIcon, MoreVerticalIcon, PencilIcon } from 'lucide-react'
import { useState } from 'react'
import { GridToolbar } from './grid-toolbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useUpdateProgram } from '@/features/programs/hooks/mutations/use-update-program'
import { cn } from '@/lib/utils'

interface ProgramHeaderProps {
  program: ProgramAggregate
}

/**
 * Program header component with editable name, status badge, and actions.
 * Shows program metadata and provides quick actions like duplicate/archive.
 * Includes the grid toolbar for adding weeks/sessions.
 */
export function ProgramHeader({ program }: ProgramHeaderProps) {
  const { orgSlug } = useParams({ from: '/_authenticated/$orgSlug/programs/$programId' })
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(program.name)
  const updateProgram = useUpdateProgram()

  const handleSaveName = () => {
    if (name.trim() && name !== program.name) {
      updateProgram.mutate(
        { programId: program.id, name: name.trim() },
        {
          onSuccess: () => setIsEditing(false),
          onError: () => setName(program.name),
        },
      )
    } else {
      setName(program.name)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setName(program.name)
      setIsEditing(false)
    }
  }

  return (
    <header className="shrink-0 border-border border-b bg-background">
      {/* Top row: Back button, name, status, actions */}
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left side: Back button, name, status */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            render={<Link to="/$orgSlug/programs" params={{ orgSlug }} />}
          >
            <ArrowLeftIcon className="size-4" />
            <span className="sr-only">Volver a programas</span>
          </Button>

          {/* Editable program name */}
          {isEditing ? (
            <Input
              className="h-8 w-64 font-semibold text-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
            >
              <h1 className="font-semibold text-lg">{program.name}</h1>
              <PencilIcon className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}

          {/* Status badge */}
          <StatusBadge status={program.status} />
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          {/* Live sync indicator (visual only) */}
          <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Guardado</span>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-md hover:bg-muted">
              <MoreVerticalIcon className="size-4" />
              <span className="sr-only">Mas opciones</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <CopyIcon className="size-4" />
                  Duplicar programa
                </DropdownMenuItem>
                {program.status === 'draft' && (
                  <DropdownMenuItem>
                    <CheckCircle2Icon className="size-4" />
                    Activar programa
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid toolbar row */}
      <GridToolbar weekCount={program.weeks.length} sessionCount={program.weeks[0]?.sessions.length ?? 0} />
    </header>
  )
}

/**
 * Status badge component with appropriate colors
 */
function StatusBadge({ status }: { status: 'draft' | 'active' | 'archived' }) {
  const labels = {
    draft: 'Borrador',
    active: 'Activo',
    archived: 'Archivado',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs',
        status === 'draft' && 'border-amber-500/50 bg-amber-500/10 text-amber-500',
        status === 'active' && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500',
        status === 'archived' && 'border-muted-foreground/50 bg-muted text-muted-foreground',
      )}
    >
      {labels[status]}
    </Badge>
  )
}
