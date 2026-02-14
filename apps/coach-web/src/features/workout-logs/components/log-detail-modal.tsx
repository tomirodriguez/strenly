/**
 * Log Detail Modal
 *
 * Displays full workout log details including exercises and series.
 * Shows deviations from prescription with amber highlighting.
 */

import type { WorkoutLogAggregate } from '@strenly/contracts/workout-logs'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface LogDetailModalProps {
  log: WorkoutLogAggregate | null
  onClose: () => void
}

export function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  if (!log) return null

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle del Registro</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Fecha:</span>{' '}
              {format(new Date(log.logDate), 'PPP', { locale: es })}
            </div>
            <div>
              <span className="text-muted-foreground">Estado:</span>{' '}
              <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>{log.status}</Badge>
            </div>
            {log.sessionRpe && (
              <div>
                <span className="text-muted-foreground">RPE Sesion:</span> {log.sessionRpe}/10
              </div>
            )}
            {log.sessionNotes && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Notas:</span> {log.sessionNotes}
              </div>
            )}
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <h3 className="font-medium">Ejercicios</h3>
            {log.exercises.map((exercise) => (
              <div key={exercise.id} className={exercise.skipped ? 'opacity-50' : ''}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-medium">Ejercicio</span>
                  {exercise.skipped && <Badge variant="outline">Saltado</Badge>}
                </div>
                {!exercise.skipped && (
                  <div className="space-y-1 pl-4">
                    {exercise.series.map((series, idx) => (
                      <div key={series.orderIndex} className="grid grid-cols-4 gap-2 text-sm">
                        <span>Serie {idx + 1}</span>
                        <span>
                          {series.repsPerformed ?? '-'} reps
                          {series.repsPerformed !== series.prescribedReps && (
                            <span className="ml-1 text-amber-500">(plan: {series.prescribedReps})</span>
                          )}
                        </span>
                        <span>
                          {series.weightUsed ?? '-'}kg
                          {series.weightUsed !== series.prescribedWeight && (
                            <span className="ml-1 text-amber-500">(plan: {series.prescribedWeight}kg)</span>
                          )}
                        </span>
                        <span>RPE: {series.rpe ?? '-'}</span>
                      </div>
                    ))}
                  </div>
                )}
                {exercise.notes && <p className="mt-1 pl-4 text-muted-foreground text-sm">{exercise.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
