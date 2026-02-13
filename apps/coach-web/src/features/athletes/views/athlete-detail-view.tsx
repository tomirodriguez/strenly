/**
 * Athlete Detail View
 *
 * Displays athlete information and their assigned program.
 * Shows weeks/sessions with "Registrar" buttons for logging workouts.
 */

import { Link } from '@tanstack/react-router'
import { ArrowLeft, ChevronDown, ChevronRight, ClipboardList, History, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { useAthlete } from '../hooks/queries/use-athlete'
import { usePrograms } from '@/features/programs/hooks/queries/use-programs'
import { useProgram } from '@/features/programs/hooks/queries/use-program'
import { useOrgSlug } from '@/hooks/use-org-slug'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProgramAggregate, WeekAggregate } from '@strenly/contracts/programs/program'

interface AthleteDetailViewProps {
  athleteId: string
}

export function AthleteDetailView({ athleteId }: AthleteDetailViewProps) {
  const orgSlug = useOrgSlug()

  const { data: athlete, isLoading: athleteLoading, error: athleteError } = useAthlete(athleteId)

  // Fetch athlete's programs (non-templates, assigned to this athlete)
  const { data: programsData, isLoading: programsLoading } = usePrograms({
    athleteId,
    isTemplate: false,
    status: 'active',
    limit: 1,
  })

  // Get the athlete's active program ID (first one if multiple)
  const programId = programsData?.items?.[0]?.id

  // Fetch full program aggregate if athlete has a program
  const { data: program, isLoading: programLoading } = useProgram(programId ?? '')

  if (athleteLoading) {
    return <AthleteDetailSkeleton />
  }

  if (athleteError || !athlete) {
    return (
      <div className="space-y-4">
        <BackButton orgSlug={orgSlug} />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se pudo cargar la informacion del atleta
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <BackButton orgSlug={orgSlug} />

      {/* Athlete info header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{athlete.name}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-3 mt-1">
                  {athlete.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {athlete.email}
                    </span>
                  )}
                  {athlete.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {athlete.phone}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={athlete.status === 'active' ? 'secondary' : 'outline'}>
                {athlete.status === 'active' ? 'Activo' : 'Inactivo'}
              </Badge>
              {athlete.isLinked && <Badge variant="outline">Vinculado</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              render={
                <Link
                  to="/$orgSlug/athletes/$athleteId/logs"
                  params={{ orgSlug, athleteId }}
                />
              }
            >
              <History className="h-4 w-4 mr-2" />
              Ver Historial
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Program section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Programa Asignado
          </CardTitle>
          {program && (
            <CardDescription>{program.name}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {programsLoading || programLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !programId ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Este atleta no tiene un programa asignado</p>
              <p className="text-sm">Asigna un programa desde la seccion de Programas</p>
            </div>
          ) : program ? (
            <ProgramWeeksList
              program={program}
              athleteId={athleteId}
              orgSlug={orgSlug}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function BackButton({ orgSlug }: { orgSlug: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2"
      render={<Link to="/$orgSlug/athletes" params={{ orgSlug }} />}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver a Atletas
    </Button>
  )
}

function AthleteDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ProgramWeeksListProps {
  program: ProgramAggregate
  athleteId: string
  orgSlug: string
}

function ProgramWeeksList({ program, athleteId, orgSlug }: ProgramWeeksListProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(
    // Default: expand first week
    new Set(program.weeks.length > 0 ? [program.weeks[0]?.id ?? ''] : [])
  )

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev)
      if (next.has(weekId)) {
        next.delete(weekId)
      } else {
        next.add(weekId)
      }
      return next
    })
  }

  if (program.weeks.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        El programa no tiene semanas configuradas
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {program.weeks
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((week) => (
          <WeekCollapsible
            key={week.id}
            week={week}
            programId={program.id}
            athleteId={athleteId}
            orgSlug={orgSlug}
            isExpanded={expandedWeeks.has(week.id)}
            onToggle={() => toggleWeek(week.id)}
          />
        ))}
    </div>
  )
}

interface WeekCollapsibleProps {
  week: WeekAggregate
  programId: string
  athleteId: string
  orgSlug: string
  isExpanded: boolean
  onToggle: () => void
}

function WeekCollapsible({
  week,
  programId,
  athleteId,
  orgSlug,
  isExpanded,
  onToggle,
}: WeekCollapsibleProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted/50">
        <span className="font-medium">{week.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {week.sessions.length} {week.sessions.length === 1 ? 'sesion' : 'sesiones'}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-4 pr-2 py-2 space-y-1 border-l-2 border-muted ml-3">
          {week.sessions
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/30"
              >
                <span className="text-sm">{session.name}</span>
                <Button
                  size="sm"
                  variant="outline"
                  render={
                    <Link
                      to="/$orgSlug/athletes/$athleteId/log/$sessionId"
                      params={{
                        orgSlug,
                        athleteId,
                        sessionId: session.id,
                      }}
                      search={{
                        programId,
                        weekId: week.id,
                      }}
                    />
                  }
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Registrar
                </Button>
              </div>
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
