/**
 * Shared helper: Map WorkoutLog domain entity to output schema
 */
export function mapLogToOutput(log: {
  id: string
  organizationId: string
  athleteId: string
  programId: string
  sessionId: string
  weekId: string
  logDate: Date
  status: 'completed' | 'partial' | 'skipped'
  sessionRpe: number | null
  sessionNotes: string | null
  exercises: ReadonlyArray<{
    id: string
    exerciseId: string
    groupItemId: string
    orderIndex: number
    notes: string | null
    skipped: boolean
    groupLabel: string | null
    groupOrder: number
    series: ReadonlyArray<{
      orderIndex: number
      repsPerformed: number | null
      weightUsed: number | null
      rpe: number | null
      skipped: boolean
      prescribedReps: number | null
      prescribedWeight: number | null
      prescribedRepsMax: number | null
      prescribedIsAmrap: boolean
      prescribedIntensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
      prescribedIntensityValue: number | null
      prescribedTempo: string | null
      prescribedRestSeconds: number | null
    }>
  }>
  createdAt: Date
  updatedAt: Date
  // Display context
  programName: string | null
  weekName: string | null
  sessionName: string | null
  athleteName: string | null
}) {
  return {
    id: log.id,
    organizationId: log.organizationId,
    athleteId: log.athleteId,
    programId: log.programId,
    sessionId: log.sessionId,
    weekId: log.weekId,
    logDate: log.logDate.toISOString(),
    status: log.status,
    sessionRpe: log.sessionRpe,
    sessionNotes: log.sessionNotes,
    exercises: log.exercises.map((ex) => ({
      id: ex.id,
      exerciseId: ex.exerciseId,
      groupItemId: ex.groupItemId,
      orderIndex: ex.orderIndex,
      notes: ex.notes,
      skipped: ex.skipped,
      groupLabel: ex.groupLabel,
      groupOrder: ex.groupOrder,
      series: ex.series.map((s) => ({
        orderIndex: s.orderIndex,
        repsPerformed: s.repsPerformed,
        weightUsed: s.weightUsed,
        rpe: s.rpe,
        skipped: s.skipped,
        prescribedReps: s.prescribedReps,
        prescribedWeight: s.prescribedWeight,
        prescribedRepsMax: s.prescribedRepsMax,
        prescribedIsAmrap: s.prescribedIsAmrap,
        prescribedIntensityType: s.prescribedIntensityType,
        prescribedIntensityValue: s.prescribedIntensityValue,
        prescribedTempo: s.prescribedTempo,
        prescribedRestSeconds: s.prescribedRestSeconds,
      })),
    })),
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
    // Display context
    programName: log.programName,
    weekName: log.weekName,
    sessionName: log.sessionName,
    athleteName: log.athleteName,
  }
}
