import { archiveProgram } from './archive'
import { createProgram } from './create'
import { duplicateProgram } from './duplicate'
import {
  addExerciseRowProcedure,
  deleteExerciseRowProcedure,
  reorderExerciseRowsProcedure,
  updateExerciseRowProcedure,
} from './exercise-rows'
import { getProgram } from './get'
import { listPrograms } from './list'
import { updatePrescriptionProcedure } from './prescriptions'
import { saveDraftProcedure } from './save-draft'
import { addSessionProcedure, deleteSessionProcedure, updateSessionProcedure } from './sessions'
import { createFromTemplateProcedure, listTemplatesProcedure, saveAsTemplateProcedure } from './templates'
import { updateProgram } from './update'
import { addWeekProcedure, deleteWeekProcedure, duplicateWeekProcedure, updateWeekProcedure } from './weeks'

/**
 * Programs router
 * Handles program CRUD and grid manipulation operations
 *
 * Structure:
 * - Root level: program CRUD (create, get, list, update, archive, duplicate)
 * - weeks: week management (add, update, delete, duplicate)
 * - sessions: session management (add, update, delete)
 * - exerciseRows: exercise row management (add, update, delete, reorder)
 * - prescriptions: prescription cell updates
 * - templates: template operations (list, saveAs, createFrom)
 */
export const programs = {
  // Program CRUD
  create: createProgram,
  list: listPrograms,
  get: getProgram,
  update: updateProgram,
  archive: archiveProgram,
  duplicate: duplicateProgram,

  // Week operations
  weeks: {
    add: addWeekProcedure,
    update: updateWeekProcedure,
    delete: deleteWeekProcedure,
    duplicate: duplicateWeekProcedure,
  },

  // Session operations
  sessions: {
    add: addSessionProcedure,
    update: updateSessionProcedure,
    delete: deleteSessionProcedure,
  },

  // Exercise row operations
  exerciseRows: {
    add: addExerciseRowProcedure,
    update: updateExerciseRowProcedure,
    delete: deleteExerciseRowProcedure,
    reorder: reorderExerciseRowsProcedure,
  },

  // Prescription operations
  prescriptions: {
    update: updatePrescriptionProcedure,
    saveDraft: saveDraftProcedure,
  },

  // Template operations
  templates: {
    list: listTemplatesProcedure,
    saveAs: saveAsTemplateProcedure,
    createFrom: createFromTemplateProcedure,
  },
}
