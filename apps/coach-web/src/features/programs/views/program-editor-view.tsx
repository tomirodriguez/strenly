import { Link } from '@tanstack/react-router'
import { AlertTriangleIcon, ArrowLeftIcon, FileDownIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { ProgramGrid } from '@/components/programs/program-grid/program-grid'
import { SaveButton } from '@/components/programs/program-grid/save-button'
import { ProgramHeader } from '@/components/programs/program-header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSaveDraft } from '@/features/programs/hooks/mutations/use-save-draft'
import { useExercisesMap } from '@/features/programs/hooks/queries/use-exercises-map'
import { useProgram } from '@/features/programs/hooks/queries/use-program'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { toast } from '@/lib/toast'
import { useGridActions, useGridData, useGridIsDirty, useGridLastAddedItemId } from '@/stores/grid-store'

interface ProgramEditorViewProps {
  orgSlug: string
  programId: string
}

/**
 * Program editor page with Excel-like grid for program creation.
 * Full-height layout with header, grid, and footer.
 *
 * Uses Zustand store for local state management with explicit save.
 * Fetches both program aggregate and exercises map for display.
 */
export function ProgramEditorView({ orgSlug, programId }: ProgramEditorViewProps) {
  // Fetch program aggregate
  const { data: program, isLoading: programLoading, error: programError } = useProgram(programId)

  // Fetch exercises for name lookup
  const { exercisesMap, isLoading: exercisesLoading } = useExercisesMap()

  // Zustand store - select only what you need
  const gridData = useGridData()
  const isDirty = useGridIsDirty()
  const lastAddedItemId = useGridLastAddedItemId()
  const actions = useGridActions()

  // Initialize store when program and exercises load (ref-based, no useEffect)
  const initializedRef = useRef<string | null>(null)
  if (program && exercisesMap.size > 0 && programId && initializedRef.current !== programId) {
    initializedRef.current = programId
    actions.initialize(programId, program, exercisesMap)
  }

  // Navigation guard - warn before leaving with unsaved changes
  useUnsavedChanges(isDirty)

  // Invalid cells warning dialog
  const [showInvalidWarning, setShowInvalidWarning] = useState(false)

  // Save mutation
  const saveMutation = useSaveDraft(programId, () => {
    toast.success('Programa guardado')
    actions.markSaved()
  })

  const executeSave = useCallback(() => {
    const aggregateData = actions.getAggregateForSave()
    if (!aggregateData) return

    saveMutation.mutate({
      programId,
      program: aggregateData.program,
      lastLoadedAt: aggregateData.lastLoadedAt ?? undefined,
    })
  }, [programId, actions, saveMutation])

  const handleSave = useCallback(() => {
    const invalidCount = actions.getInvalidCellsCount()
    if (invalidCount > 0) {
      setShowInvalidWarning(true)
      return
    }
    executeSave()
  }, [actions, executeSave])

  const handleConfirmSaveWithInvalid = useCallback(() => {
    setShowInvalidWarning(false)
    executeSave()
  }, [executeSave])

  // Loading state - wait for both program and exercises
  if (programLoading || exercisesLoading) {
    return <ProgramEditorSkeleton />
  }

  if (programError || !program) {
    return <ProgramNotFound orgSlug={orgSlug} />
  }

  // Don't render until store is initialized
  if (!gridData) {
    return <ProgramEditorSkeleton />
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header with program name, status, actions */}
      <ProgramHeader program={program} />

      {/* Main grid - takes remaining height */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ProgramGrid
          program={program}
          gridData={gridData}
          onPrescriptionChange={actions.updatePrescription}
          onExerciseChange={actions.updateExercise}
          onAddExercise={actions.addExercise}
          lastAddedItemId={lastAddedItemId}
          onLastAddedHandled={actions.clearLastAddedItemId}
        />
      </div>

      {/* Footer with keyboard shortcuts help and save button */}
      <ProgramFooter isDirty={isDirty} isPending={saveMutation.isPending} onSave={handleSave} />

      {/* Invalid cells warning dialog */}
      <AlertDialog open={showInvalidWarning} onOpenChange={setShowInvalidWarning}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <AlertTriangleIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Campos con formato invalido</AlertDialogTitle>
            <AlertDialogDescription>
              Hay campos con formato de prescripcion invalido. Se guardaran vacios si no se corrigen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="default" onClick={handleConfirmSaveWithInvalid}>
              Guardar de todos modos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
      <div className="flex shrink-0 items-center justify-between border-border border-t px-4 py-1.5">
        <Skeleton className="hidden h-3 w-64 lg:block" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-28" />
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

function ShortcutHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {keys.map((key) => (
        <kbd key={key} className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          {key}
        </kbd>
      ))}
      <span>{label}</span>
    </div>
  )
}

interface ProgramFooterProps {
  isDirty: boolean
  isPending: boolean
  onSave: () => void
}

/**
 * Footer with keyboard shortcuts help and save button
 */
function ProgramFooter({ isDirty, isPending, onSave }: ProgramFooterProps) {
  return (
    <footer className="flex shrink-0 items-center justify-between border-border border-t bg-background px-4 py-1.5">
      {/* Keyboard shortcuts — hidden on narrow screens */}
      <div className="hidden items-center gap-4 text-muted-foreground text-[11px] lg:flex">
        <ShortcutHint keys={['Ctrl', 'G']} label="Superserie" />
        <ShortcutHint keys={['Alt', '↑↓']} label="Reordenar" />
        <ShortcutHint keys={['Ctrl', 'C/V']} label="Copiar / Pegar" />
        <ShortcutHint keys={['Ctrl', 'Z']} label="Deshacer" />
        <ShortcutHint keys={['Ctrl', 'Del']} label="Eliminar fila" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" disabled>
          <FileDownIcon className="size-3.5" />
          Exportar PDF
        </Button>
        <SaveButton isDirty={isDirty} isPending={isPending} onSave={onSave} />
      </div>
    </footer>
  )
}
