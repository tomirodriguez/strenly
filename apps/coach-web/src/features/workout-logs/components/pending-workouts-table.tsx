import { Link, useParams } from '@tanstack/react-router'
import type { PendingWorkout } from '@strenly/contracts/workout-logs/list-logs'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Play } from 'lucide-react'

interface PendingWorkoutsTableProps {
  items: PendingWorkout[]
}

export function PendingWorkoutsTable({ items }: PendingWorkoutsTableProps) {
  const { orgSlug } = useParams({ from: '/_authenticated/$orgSlug' })

  // Group by athlete for better UX
  const groupedByAthlete = items.reduce(
    (acc, item) => {
      if (!acc[item.athleteId]) {
        acc[item.athleteId] = {
          athleteId: item.athleteId,
          athleteName: item.athleteName,
          workouts: [],
        }
      }
      acc[item.athleteId].workouts.push(item)
      return acc
    },
    {} as Record<string, { athleteId: string; athleteName: string; workouts: PendingWorkout[] }>
  )

  const athletes = Object.values(groupedByAthlete)

  return (
    <div className="space-y-6">
      {athletes.map((athlete) => (
        <div key={athlete.athleteId}>
          {/* Athlete header */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{athlete.athleteName}</h3>
            <span className="text-sm text-muted-foreground">
              ({athlete.workouts.length} pendientes)
            </span>
          </div>

          {/* Workouts table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programa</TableHead>
                <TableHead>Semana</TableHead>
                <TableHead>Sesion</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {athlete.workouts.map((workout) => (
                <TableRow key={`${workout.sessionId}-${workout.weekId}`}>
                  <TableCell>{workout.programName}</TableCell>
                  <TableCell>{workout.weekName}</TableCell>
                  <TableCell>{workout.sessionName}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      render={
                        <Link
                          to="/$orgSlug/athletes/$athleteId/log/$sessionId"
                          params={{
                            orgSlug,
                            athleteId: workout.athleteId,
                            sessionId: workout.sessionId,
                          }}
                          search={{
                            programId: workout.programId,
                            weekId: workout.weekId,
                          }}
                        />
                      }
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Registrar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}
