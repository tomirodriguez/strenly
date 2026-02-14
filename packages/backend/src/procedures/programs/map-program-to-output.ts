import type { Program } from '@strenly/core/domain/entities/program/types'

/**
 * Shared helper: Map Program domain entity to contract output
 */
export function mapProgramToOutput(program: Program) {
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
  }
}
