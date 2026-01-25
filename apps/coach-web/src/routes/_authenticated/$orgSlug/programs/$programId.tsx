import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon, FileDownIcon, SaveIcon } from 'lucide-react'
import { ProgramGrid } from '@/components/programs/program-grid/program-grid'
import { ProgramHeader } from '@/components/programs/program-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProgram } from '@/features/programs/hooks/queries/use-program'
import '@/styles/program-grid.css'

export const Route = createFileRoute('/_authenticated/$orgSlug/programs/$programId')({
  component: ProgramEditorPage,
})

/**
 * Program editor page with Excel-like grid for program creation.
 * Full-height layout with header, grid, and footer.
 */
function ProgramEditorPage() {
  const { orgSlug, programId } = useParams({ from: '/_authenticated/$orgSlug/programs/$programId' })
  const { data: program, isLoading, error } = useProgram(programId)

  if (isLoading) {
    return <ProgramEditorSkeleton />
  }

  if (error || !program) {
    return <ProgramNotFound orgSlug={orgSlug} />
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header with program name, status, actions */}
      <ProgramHeader program={program} />

      {/* Main grid - takes remaining height */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ProgramGrid program={program} />
      </div>

      {/* Footer with keyboard shortcuts help */}
      <ProgramFooter />
    </div>
  )
}

/**
 * Loading skeleton for the program editor
 */
function ProgramEditorSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header skeleton */}
      <div className="flex h-16 shrink-0 items-center justify-between border-border border-b px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="min-h-0 flex-1 p-4">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Footer skeleton */}
      <div className="flex h-16 shrink-0 items-center justify-between border-border border-t px-6">
        <Skeleton className="h-4 w-64" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </div>
  )
}

/**
 * Error state when program is not found
 */
function ProgramNotFound({ orgSlug }: { orgSlug: string }) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">No se encontro el programa</p>
      <Button variant="outline" render={<Link to="/$orgSlug/programs" params={{ orgSlug }} />}>
        <ArrowLeftIcon className="h-4 w-4" />
        Volver a programas
      </Button>
    </div>
  )
}

/**
 * Footer with keyboard shortcuts help and action buttons
 */
function ProgramFooter() {
  return (
    <footer className="flex h-16 shrink-0 items-center justify-between border-border border-t bg-background px-6">
      {/* Keyboard shortcuts */}
      <div className="flex items-center gap-6 text-muted-foreground text-xs">
        <div className="flex items-center gap-2">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Shift + Enter</kbd>
          <span>Agregar sub-fila (Split)</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">S</kbd>
          <span>Toggle Superserie</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button variant="outline" disabled>
          <FileDownIcon className="size-4" />
          Exportar PDF
        </Button>
        <Button>
          <SaveIcon className="size-4" />
          Guardar Programa
        </Button>
      </div>
    </footer>
  )
}
