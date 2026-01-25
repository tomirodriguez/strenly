import type { ResultAsync } from 'neverthrow'
import type { Prescription } from '../domain/entities/prescription'
import type { Program, ProgramStatus } from '../domain/entities/program'
import type { OrganizationContext } from '../types/organization-context'

// ============================================================================
// Error Types
// ============================================================================

export type ProgramRepositoryError =
  | { type: 'NOT_FOUND'; entityType: 'program' | 'week' | 'session' | 'exercise_row' | 'prescription' | 'group'; id: string }
  | { type: 'DATABASE_ERROR'; message: string }

// ============================================================================
// Filter Types
// ============================================================================

export type ProgramFilters = {
  status?: ProgramStatus
  athleteId?: string | null // null = templates only, string = athlete programs, undefined = all
  isTemplate?: boolean
  search?: string
  limit?: number
  offset?: number
}

// ============================================================================
// Nested Entity Types (for grid operations)
// ============================================================================

export type ProgramWeek = {
  readonly id: string
  readonly programId: string
  readonly name: string
  readonly orderIndex: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type ProgramSession = {
  readonly id: string
  readonly programId: string
  readonly name: string
  readonly orderIndex: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type ProgramExerciseRow = {
  readonly id: string
  readonly sessionId: string
  readonly exerciseId: string
  readonly orderIndex: number
  // New group-based fields
  readonly groupId: string | null // null during migration
  readonly orderWithinGroup: number | null // null during migration
  // Legacy superset fields (deprecated)
  readonly supersetGroup: string | null
  readonly supersetOrder: number | null
  // Other existing fields
  readonly setTypeLabel: string | null
  readonly isSubRow: boolean
  readonly parentRowId: string | null
  readonly notes: string | null
  readonly restSeconds: number | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Exercise group data (for grid operations)
 */
export type ExerciseGroupData = {
  readonly id: string
  readonly sessionId: string
  readonly orderIndex: number
  readonly name: string | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Prescription series data (individual set within a prescription)
 */
export type PrescriptionSeriesData = {
  readonly orderIndex: number
  readonly reps: number | null
  readonly repsMax: number | null
  readonly isAmrap: boolean
  readonly intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  readonly intensityValue: number | null
  readonly intensityUnit: 'kg' | 'lb' | '%' | 'rpe' | 'rir' | null
  readonly tempo: string | null
  readonly restSeconds: number | null
}

/**
 * Input for saveDraft bulk save operation
 */
export type SaveDraftInput = {
  readonly programId: string
  readonly prescriptionUpdates?: ReadonlyArray<{
    readonly exerciseRowId: string
    readonly weekId: string
    readonly series: PrescriptionSeriesData[]
  }>
  readonly exerciseRowUpdates?: ReadonlyArray<{
    readonly rowId: string
    readonly exerciseId?: string
    readonly groupId?: string | null
    readonly orderWithinGroup?: number | null
  }>
  readonly groupUpdates?: ReadonlyArray<{
    readonly groupId: string
    readonly name?: string | null
    readonly orderIndex?: number
  }>
}

export type PrescriptionCell = {
  readonly id: string
  readonly programExerciseId: string
  readonly weekId: string
  readonly prescription: Prescription
  readonly createdAt: Date
  readonly updatedAt: Date
}

// ============================================================================
// Composite Types (for full grid view)
// ============================================================================

/**
 * Exercise row with prescriptions keyed by week ID
 */
export type ExerciseRowWithPrescriptions = ProgramExerciseRow & {
  readonly exerciseName: string // Joined from exercises table
  readonly prescriptionsByWeekId: Record<string, Prescription>
  readonly subRows: ExerciseRowWithPrescriptions[]
}

/**
 * Session with exercise rows and exercise groups
 */
export type SessionWithRows = ProgramSession & {
  readonly rows: ExerciseRowWithPrescriptions[]
  readonly exerciseGroups?: ExerciseGroupData[]
}

/**
 * Full program with all nested data for grid view
 */
export type ProgramWithDetails = Program & {
  readonly weeks: ProgramWeek[]
  readonly sessions: SessionWithRows[]
}

// ============================================================================
// Repository Port
// ============================================================================

export type ProgramRepositoryPort = {
  // ---------------------------------------------------------------------------
  // Program CRUD
  // ---------------------------------------------------------------------------

  /**
   * Create a new program
   */
  create(ctx: OrganizationContext, program: Program): ResultAsync<Program, ProgramRepositoryError>

  /**
   * Find a program by ID
   */
  findById(ctx: OrganizationContext, id: string): ResultAsync<Program, ProgramRepositoryError>

  /**
   * Update a program
   */
  update(ctx: OrganizationContext, program: Program): ResultAsync<Program, ProgramRepositoryError>

  /**
   * List programs with optional filters
   */
  list(
    ctx: OrganizationContext,
    filters?: ProgramFilters,
  ): ResultAsync<{ items: Program[]; totalCount: number }, ProgramRepositoryError>

  /**
   * Get full program with nested data for grid view
   */
  findWithDetails(ctx: OrganizationContext, id: string): ResultAsync<ProgramWithDetails, ProgramRepositoryError>

  /**
   * List template programs
   */
  listTemplates(ctx: OrganizationContext): ResultAsync<Program[], ProgramRepositoryError>

  // ---------------------------------------------------------------------------
  // Week Operations
  // ---------------------------------------------------------------------------

  /**
   * Create a week (column) for a program
   */
  createWeek(
    ctx: OrganizationContext,
    programId: string,
    week: Omit<ProgramWeek, 'programId'>,
  ): ResultAsync<ProgramWeek, ProgramRepositoryError>

  /**
   * Find a week by ID
   */
  findWeekById(ctx: OrganizationContext, weekId: string): ResultAsync<ProgramWeek, ProgramRepositoryError>

  /**
   * Update a week
   */
  updateWeek(ctx: OrganizationContext, week: ProgramWeek): ResultAsync<ProgramWeek, ProgramRepositoryError>

  /**
   * Delete a week (cascades to prescriptions)
   */
  deleteWeek(ctx: OrganizationContext, weekId: string): ResultAsync<void, ProgramRepositoryError>

  // ---------------------------------------------------------------------------
  // Session Operations
  // ---------------------------------------------------------------------------

  /**
   * Create a session (training day) for a program
   */
  createSession(
    ctx: OrganizationContext,
    programId: string,
    session: Omit<ProgramSession, 'programId'>,
  ): ResultAsync<ProgramSession, ProgramRepositoryError>

  /**
   * Update a session
   */
  updateSession(ctx: OrganizationContext, session: ProgramSession): ResultAsync<ProgramSession, ProgramRepositoryError>

  /**
   * Delete a session (cascades to exercise rows and prescriptions)
   */
  deleteSession(ctx: OrganizationContext, sessionId: string): ResultAsync<void, ProgramRepositoryError>

  // ---------------------------------------------------------------------------
  // Exercise Group Operations (new)
  // ---------------------------------------------------------------------------

  /**
   * Create an exercise group for a session
   */
  createGroup(
    ctx: OrganizationContext,
    sessionId: string,
    name?: string | null,
  ): ResultAsync<ExerciseGroupData, ProgramRepositoryError>

  /**
   * Update an exercise group
   */
  updateGroup(
    ctx: OrganizationContext,
    groupId: string,
    updates: { name?: string | null; orderIndex?: number },
  ): ResultAsync<void, ProgramRepositoryError>

  /**
   * Delete an exercise group (exercises will cascade)
   */
  deleteGroup(ctx: OrganizationContext, groupId: string): ResultAsync<void, ProgramRepositoryError>

  /**
   * Get the maximum order index for groups in a session
   * Returns -1 if no groups exist
   */
  getMaxGroupOrderIndex(ctx: OrganizationContext, sessionId: string): ResultAsync<number, ProgramRepositoryError>

  // ---------------------------------------------------------------------------
  // Exercise Row Operations
  // ---------------------------------------------------------------------------

  /**
   * Find an exercise row by ID
   */
  findExerciseRowById(ctx: OrganizationContext, rowId: string): ResultAsync<ProgramExerciseRow, ProgramRepositoryError>

  /**
   * Get the maximum order index for exercise rows in a session
   * Returns -1 if no rows exist
   */
  getMaxExerciseRowOrderIndex(ctx: OrganizationContext, sessionId: string): ResultAsync<number, ProgramRepositoryError>

  /**
   * Get the maximum superset order for a given group in a session
   * Returns 0 if no rows exist in that group
   */
  getMaxSupersetOrder(
    ctx: OrganizationContext,
    sessionId: string,
    supersetGroup: string,
  ): ResultAsync<number, ProgramRepositoryError>

  /**
   * Create an exercise row for a session
   */
  createExerciseRow(
    ctx: OrganizationContext,
    sessionId: string,
    row: Omit<ProgramExerciseRow, 'sessionId'>,
  ): ResultAsync<ProgramExerciseRow, ProgramRepositoryError>

  /**
   * Update an exercise row
   */
  updateExerciseRow(
    ctx: OrganizationContext,
    row: ProgramExerciseRow,
  ): ResultAsync<ProgramExerciseRow, ProgramRepositoryError>

  /**
   * Delete an exercise row (cascades to prescriptions)
   */
  deleteExerciseRow(ctx: OrganizationContext, rowId: string): ResultAsync<void, ProgramRepositoryError>

  /**
   * Find all sub-rows for a parent exercise row
   */
  findSubRows(ctx: OrganizationContext, parentRowId: string): ResultAsync<ProgramExerciseRow[], ProgramRepositoryError>

  // ---------------------------------------------------------------------------
  // Prescription Operations (Cell Values)
  // ---------------------------------------------------------------------------

  /**
   * Create or update a prescription for a specific cell (exercise row + week)
   * Pass null prescription to delete the cell value
   */
  upsertPrescription(
    ctx: OrganizationContext,
    exerciseRowId: string,
    weekId: string,
    prescription: Prescription | null,
  ): ResultAsync<void, ProgramRepositoryError>

  /**
   * Update prescription with series array (new model)
   * Replaces the series array for a specific cell
   */
  updatePrescriptionSeries(
    ctx: OrganizationContext,
    exerciseRowId: string,
    weekId: string,
    series: PrescriptionSeriesData[],
  ): ResultAsync<void, ProgramRepositoryError>

  // ---------------------------------------------------------------------------
  // Bulk Operations
  // ---------------------------------------------------------------------------

  /**
   * Save draft changes atomically (bulk save operation)
   * Updates prescriptions, exercise rows, and groups in a single transaction
   */
  saveDraft(ctx: OrganizationContext, input: SaveDraftInput): ResultAsync<{ updatedAt: Date }, ProgramRepositoryError>

  /**
   * Reorder exercise rows within a session
   */
  reorderExerciseRows(
    ctx: OrganizationContext,
    sessionId: string,
    rowIds: string[],
  ): ResultAsync<void, ProgramRepositoryError>

  /**
   * Duplicate a week with all prescriptions
   */
  duplicateWeek(
    ctx: OrganizationContext,
    weekId: string,
    newName: string,
  ): ResultAsync<ProgramWeek, ProgramRepositoryError>

  /**
   * Reposition a row to be immediately after the last member of a superset group.
   * Used when adding a row to an existing superset to ensure adjacent placement.
   */
  repositionRowToAfterSupersetGroup(
    ctx: OrganizationContext,
    sessionId: string,
    rowId: string,
    supersetGroup: string,
  ): ResultAsync<void, ProgramRepositoryError>

  /**
   * Reposition a row to the end of a session.
   * Used when removing a row from a superset to prevent it staying between group members.
   */
  repositionRowToEndOfSession(
    ctx: OrganizationContext,
    sessionId: string,
    rowId: string,
  ): ResultAsync<void, ProgramRepositoryError>

  /**
   * Find all exercise rows for a session.
   * Used for validating reorder operations.
   */
  findExerciseRowsBySessionId(
    ctx: OrganizationContext,
    sessionId: string,
  ): ResultAsync<ProgramExerciseRow[], ProgramRepositoryError>
}
