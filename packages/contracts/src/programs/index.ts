/**
 * Program contracts - API schemas for program CRUD operations
 */
export {
  // Input schemas
  type ArchiveProgramInput,
  archiveProgramInputSchema,
  type CreateProgramInput,
  createProgramInputSchema,
  type DuplicateProgramInput,
  duplicateProgramInputSchema,
  // Output types
  type ExerciseRowWithPrescriptions,
  exerciseRowWithPrescriptionsSchema,
  type GetProgramInput,
  getProgramInputSchema,
  type ListProgramsInput,
  type ListProgramsOutput,
  listProgramsInputSchema,
  listProgramsOutputSchema,
  type Prescription,
  prescriptionSchema,
  // Output schemas
  type Program,
  programSchema,
  type ProgramSession,
  programSessionSchema,
  type ProgramStatus,
  programStatusSchema,
  type ProgramWeek,
  programWeekSchema,
  type ProgramWithDetails,
  programWithDetailsSchema,
  type SessionWithRows,
  sessionWithRowsSchema,
  type UpdateProgramInput,
  updateProgramInputSchema,
} from './program'

// Re-export prescription notation utilities
export {
  formatPrescription,
  type IntensityType,
  intensityTypeSchema,
  type ParsedPrescription,
  parsedPrescriptionSchema,
  parsePrescriptionNotation,
  SKIP_PRESCRIPTION,
  type UnilateralUnit,
  unilateralUnitSchema,
  updatePrescriptionSchema,
  type UpdatePrescriptionInput,
} from './prescription'

// Week operations
export {
  addWeekSchema,
  type AddWeekInput,
  deleteWeekSchema,
  type DeleteWeekInput,
  duplicateWeekSchema,
  type DuplicateWeekInput,
  updateWeekSchema,
  type UpdateWeekInput,
  weekOutputSchema,
  type WeekOutput,
} from './week'

// Session operations
export {
  addSessionSchema,
  type AddSessionInput,
  deleteSessionSchema,
  type DeleteSessionInput,
  sessionOutputSchema,
  type SessionOutput,
  updateSessionSchema,
  type UpdateSessionInput,
} from './session'

// Exercise row operations
export {
  addExerciseRowSchema,
  type AddExerciseRowInput,
  addSplitRowSchema,
  type AddSplitRowInput,
  deleteExerciseRowSchema,
  type DeleteExerciseRowInput,
  exerciseRowOutputSchema,
  type ExerciseRowOutput,
  reorderExerciseRowsSchema,
  type ReorderExerciseRowsInput,
  toggleSupersetSchema,
  type ToggleSupersetInput,
  updateExerciseRowSchema,
  type UpdateExerciseRowInput,
} from './exercise-row'
