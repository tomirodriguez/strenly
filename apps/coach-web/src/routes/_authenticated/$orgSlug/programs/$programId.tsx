import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProgram } from '@/features/programs/hooks/queries/use-program'

export const Route = createFileRoute('/_authenticated/$orgSlug/programs/$programId')({
  component: ProgramEditorPage,
})

/**
 * Program editor page - placeholder for the grid editor.
 * Will be replaced with the full Excel-like grid in a future plan.
 */
function ProgramEditorPage() {
  const { orgSlug, programId } = useParams({ from: '/_authenticated/$orgSlug/programs/$programId' })
  const { data: program, isLoading, error } = useProgram(programId)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !program) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link to="/$orgSlug/programs" params={{ orgSlug }} />}>
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="font-bold text-2xl">{program.name}</h1>
          {program.description && <p className="text-muted-foreground text-sm">{program.description}</p>}
        </div>
      </div>

      {/* Placeholder for grid editor */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="font-semibold text-lg">Editor de programa</p>
        <p className="mt-2 max-w-md text-muted-foreground text-sm">
          El editor de grilla con navegacion por teclado estara disponible pronto. Por ahora puedes ver los detalles del
          programa.
        </p>
        <div className="mt-6 grid gap-4 text-left text-sm">
          <div>
            <span className="font-medium">Semanas:</span> {program.weeks.length}
          </div>
          <div>
            <span className="font-medium">Sesiones:</span> {program.sessions.length}
          </div>
          <div>
            <span className="font-medium">Estado:</span>{' '}
            {program.status === 'draft' ? 'Borrador' : program.status === 'active' ? 'Activo' : 'Archivado'}
          </div>
        </div>
      </div>
    </div>
  )
}
