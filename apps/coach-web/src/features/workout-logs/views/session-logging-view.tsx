/**
 * Session Logging View
 *
 * Placeholder component - will be implemented in Plan 04-09.
 * Core logging interface where coaches enter actual workout data.
 */

interface SessionLoggingViewProps {
  orgSlug: string
  athleteId: string
  sessionId: string
  programId: string
  weekId: string
  logId?: string
}

export function SessionLoggingView({
  orgSlug,
  athleteId,
  sessionId,
  programId,
  weekId,
  logId,
}: SessionLoggingViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">Registrar Entrenamiento</h1>
        <p className="text-muted-foreground">Esta vista se implementara en el Plan 04-09</p>
      </div>
      <div className="text-muted-foreground text-sm">
        <p>Organizacion: {orgSlug}</p>
        <p>Atleta: {athleteId}</p>
        <p>Sesion: {sessionId}</p>
        <p>Programa: {programId}</p>
        <p>Semana: {weekId}</p>
        {logId && <p>Log ID: {logId}</p>}
      </div>
    </div>
  )
}
