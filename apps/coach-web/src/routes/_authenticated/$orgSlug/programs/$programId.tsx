import { createFileRoute, type ErrorComponentProps, Link, useParams } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ProgramEditorView } from '@/features/programs/views/program-editor-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/programs/$programId')({
  component: ProgramEditorPage,
  errorComponent: ProgramErrorComponent,
})

function ProgramEditorPage() {
  const { orgSlug, programId } = Route.useParams()
  return <ProgramEditorView orgSlug={orgSlug} programId={programId} />
}

function ProgramErrorComponent({ error, reset }: ErrorComponentProps) {
  const { orgSlug } = useParams({ from: '/_authenticated/$orgSlug' })

  return (
    <div role="alert" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4">
      <h2 className="font-bold text-xl">Error al cargar el programa</h2>
      <p className="max-w-md text-center text-muted-foreground">
        {error instanceof Error ? error.message : 'Ocurrio un error inesperado al cargar el programa.'}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Reintentar
        </Button>
        <Button render={<Link to="/$orgSlug/programs" params={{ orgSlug }} />}>Volver a programas</Button>
      </div>
    </div>
  )
}
