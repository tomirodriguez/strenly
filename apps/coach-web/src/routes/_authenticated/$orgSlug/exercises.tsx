import { createFileRoute, type ErrorComponentProps } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExercisesBrowserView } from '@/features/exercises/views/exercises-browser-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/exercises')({
  component: ExercisesBrowserView,
  pendingComponent: PendingComponent,
  errorComponent: ExercisesErrorComponent,
})

function PendingComponent() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}

function ExercisesErrorComponent({ reset }: ErrorComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-destructive">Algo salio mal</p>
      <Button onClick={reset} variant="outline">
        Reintentar
      </Button>
    </div>
  )
}
