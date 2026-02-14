/**
 * Program contracts - API schemas for program CRUD operations
 */

// Exercise group operations
export {
  type CreateExerciseGroupInput,
  createExerciseGroupInputSchema,
  type DeleteExerciseGroupInput,
  deleteExerciseGroupInputSchema,
  type ExerciseGroup,
  exerciseGroupSchema,
  type UpdateExerciseGroupInput,
  updateExerciseGroupInputSchema,
} from './exercise-group'
// Exercise row operations
export {
  type AddExerciseRowInput,
  addExerciseRowInputSchema,
  type DeleteExerciseRowInput,
  deleteExerciseRowInputSchema,
  type ExerciseRowOutput,
  exerciseRowOutputSchema,
  type ReorderExerciseRowsInput,
  reorderExerciseRowsInputSchema,
  type UpdateExerciseRowInput,
  updateExerciseRowInputSchema,
} from './exercise-row'
// Re-export prescription notation utilities
export {
  formatDomainSeriesToNotation,
  formatPrescription,
  formatSeriesToNotation,
  type IntensityType,
  type IntensityUnit,
  intensityTypeSchema,
  intensityUnitSchema,
  mapIntensityTypeToUnit,
  type ParsedPrescription,
  type ParsedSeriesData,
  type PrescriptionSeriesInput,
  parsedPrescriptionSchema,
  parsePrescriptionNotation,
  parsePrescriptionToSeries,
  prescriptionSeriesInputSchema,
  SKIP_PRESCRIPTION,
  type UnilateralUnit,
  type UpdatePrescriptionInput,
  type UpdatePrescriptionOutput,
  unilateralUnitSchema,
  updatePrescriptionInputSchema,
  updatePrescriptionOutputSchema,
} from './prescription'
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
  // Shared input helpers
  nullableOptionalDescriptionSchema,
  optionalDescriptionSchema,
  type Prescription,
  // Output schemas
  type Program,
  type ProgramAggregate,
  type ProgramSession,
  type ProgramStatus,
  type ProgramWeek,
  type ProgramWithDetails,
  prescriptionSchema,
  programAggregateSchema,
  programSchema,
  programSessionSchema,
  programStatusSchema,
  programWeekSchema,
  programWithDetailsSchema,
  type SessionWithRows,
  sessionWithRowsSchema,
  type UpdateProgramInput,
  updateProgramInputSchema,
} from './program'
// Bulk save draft operation
export {
  type SaveDraftInput,
  type SaveDraftOutput,
  saveDraftInputSchema,
  saveDraftOutputSchema,
} from './save-draft'
// Session operations
export {
  type AddSessionInput,
  addSessionInputSchema,
  type DeleteSessionInput,
  deleteSessionInputSchema,
  type SessionOutput,
  sessionOutputSchema,
  type UpdateSessionInput,
  updateSessionInputSchema,
} from './session'
// Template operations
export {
  type CreateFromTemplateInput,
  createFromTemplateInputSchema,
  type ListTemplatesInput,
  type ListTemplatesOutput,
  listTemplatesInputSchema,
  listTemplatesOutputSchema,
  type SaveAsTemplateInput,
  saveAsTemplateInputSchema,
  type TemplateOutput,
  type TemplateWithDetailsOutput,
  templateOutputSchema,
  templateWithDetailsOutputSchema,
} from './template'
// Week operations
export {
  type AddWeekInput,
  addWeekInputSchema,
  type DeleteWeekInput,
  type DuplicateWeekInput,
  deleteWeekInputSchema,
  duplicateWeekInputSchema,
  type UpdateWeekInput,
  updateWeekInputSchema,
  type WeekOutput,
  weekOutputSchema,
} from './week'
