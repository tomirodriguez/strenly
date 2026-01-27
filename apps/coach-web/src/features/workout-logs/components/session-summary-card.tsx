/**
 * Session Summary Card
 *
 * Session-level inputs for overall workout data:
 * - Session RPE (1-10 scale)
 * - Session notes/comments
 *
 * Updates go directly to the log store.
 */

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLogActions, useLogData } from '@/stores/log-store'

export function SessionSummaryCard() {
  const logData = useLogData()
  const actions = useLogActions()

  // Handle session RPE change
  const handleRpeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? null : Number(e.target.value)
      // Clamp RPE to 1-10
      const clampedValue = value === null ? null : Math.min(10, Math.max(1, value))
      actions.updateSession({ sessionRpe: clampedValue })
    },
    [actions],
  )

  // Handle session notes change
  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.trim() === '' ? null : e.target.value
      actions.updateSession({ sessionNotes: value })
    },
    [actions],
  )

  if (!logData) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de la sesion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session RPE */}
        <div className="space-y-2">
          <Label htmlFor="session-rpe">RPE de la sesion (1-10)</Label>
          <Input
            id="session-rpe"
            type="number"
            min={1}
            max={10}
            value={logData.sessionRpe ?? ''}
            onChange={handleRpeChange}
            placeholder="Esfuerzo percibido general"
            className="max-w-32"
          />
          <p className="text-muted-foreground text-xs">Esfuerzo percibido general de la sesion</p>
        </div>

        {/* Session notes */}
        <div className="space-y-2">
          <Label htmlFor="session-notes">Notas de la sesion</Label>
          <Textarea
            id="session-notes"
            value={logData.sessionNotes ?? ''}
            onChange={handleNotesChange}
            placeholder="Observaciones, feedback del atleta, ajustes realizados..."
            className="min-h-[100px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}
