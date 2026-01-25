import { archiveProgram } from './archive'
import { createProgram } from './create'
import { duplicateProgram } from './duplicate'
import { getProgram } from './get'
import { listPrograms } from './list'
import { updateProgram } from './update'

/**
 * Programs router
 * Handles program CRUD and duplication operations
 *
 * Procedures:
 * - create: Create a new program (with default week and session)
 * - list: List programs with optional filters
 * - get: Get program with full details for grid view
 * - update: Update program name/description
 * - archive: Archive a program (soft delete via status transition)
 * - duplicate: Deep copy a program with all nested data
 */
export const programs = {
  create: createProgram,
  list: listPrograms,
  get: getProgram,
  update: updateProgram,
  archive: archiveProgram,
  duplicate: duplicateProgram,
}
