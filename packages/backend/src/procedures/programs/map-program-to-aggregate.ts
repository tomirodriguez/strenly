import type { Program } from '@strenly/core/domain/entities/program/types'

/**
 * Shared helper: Map Program domain entity to contract ProgramAggregate output
 */
export function mapProgramToAggregate(program: Program) {
  return {
    id: program.id,
    organizationId: program.organizationId,
    name: program.name,
    description: program.description,
    athleteId: program.athleteId,
    isTemplate: program.isTemplate,
    status: program.status,
    createdAt: program.createdAt.toISOString(),
    updatedAt: program.updatedAt.toISOString(),
    weeks: program.weeks.map((week) => ({
      id: week.id,
      name: week.name,
      orderIndex: week.orderIndex,
      sessions: week.sessions.map((session) => ({
        id: session.id,
        name: session.name,
        orderIndex: session.orderIndex,
        exerciseGroups: session.exerciseGroups.map((group) => ({
          id: group.id,
          orderIndex: group.orderIndex,
          items: group.items.map((item) => ({
            id: item.id,
            exerciseId: item.exerciseId,
            orderIndex: item.orderIndex,
            series: item.series.map((s) => ({
              orderIndex: s.orderIndex,
              reps: s.reps,
              repsMax: s.repsMax,
              isAmrap: s.isAmrap,
              intensityType: s.intensityType,
              intensityValue: s.intensityValue,
              tempo: s.tempo,
              restSeconds: s.restSeconds,
            })),
          })),
        })),
      })),
    })),
  }
}
