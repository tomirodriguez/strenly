/**
 * Shared types for the Program aggregate hierarchy.
 * Program -> Weeks -> Sessions -> ExerciseGroups -> GroupItems -> Series
 */

// Constants
export const PROGRAM_STATUSES = ['draft', 'active', 'archived'] as const
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number]

export const INTENSITY_TYPES = ['absolute', 'percentage', 'rpe', 'rir'] as const
export type IntensityType = (typeof INTENSITY_TYPES)[number]

// Type guards
export function isProgramStatus(value: unknown): value is ProgramStatus {
  return typeof value === 'string' && PROGRAM_STATUSES.includes(value as ProgramStatus)
}

export function isIntensityType(value: unknown): value is IntensityType {
  return typeof value === 'string' && INTENSITY_TYPES.includes(value as IntensityType)
}

// Domain Types - Immutable
export type Series = {
  readonly orderIndex: number
  readonly reps: number | null
  readonly repsMax: number | null
  readonly isAmrap: boolean
  readonly intensityType: IntensityType | null
  readonly intensityValue: number | null
  readonly tempo: string | null
  readonly restSeconds: number | null
}

export type GroupItem = {
  readonly id: string
  readonly exerciseId: string
  readonly orderIndex: number
  readonly series: ReadonlyArray<Series>
}

export type ExerciseGroup = {
  readonly id: string
  readonly orderIndex: number
  readonly items: ReadonlyArray<GroupItem>
}

export type Session = {
  readonly id: string
  readonly name: string
  readonly orderIndex: number
  readonly exerciseGroups: ReadonlyArray<ExerciseGroup>
}

export type Week = {
  readonly id: string
  readonly name: string
  readonly orderIndex: number
  readonly sessions: ReadonlyArray<Session>
}

export type Program = {
  readonly id: string
  readonly organizationId: string
  readonly name: string
  readonly description: string | null
  readonly athleteId: string | null
  readonly isTemplate: boolean
  readonly status: ProgramStatus
  readonly weeks: ReadonlyArray<Week>
  readonly createdAt: Date
  readonly updatedAt: Date
}

// Input Types - Used for createProgram()
export type SeriesInput = {
  reps: number | null
  repsMax?: number | null
  isAmrap: boolean
  intensityType?: IntensityType | null
  intensityValue?: number | null
  tempo?: string | null
  restSeconds?: number | null
}

export type GroupItemInput = {
  id: string
  exerciseId: string
  orderIndex: number
  series?: SeriesInput[]
}

export type ExerciseGroupInput = {
  id: string
  orderIndex: number
  items: GroupItemInput[]
}

export type SessionInput = {
  id: string
  name: string
  orderIndex: number
  exerciseGroups?: ExerciseGroupInput[]
}

export type WeekInput = {
  id: string
  name?: string
  orderIndex: number
  sessions?: SessionInput[]
}

export type CreateProgramInput = {
  id: string
  organizationId: string
  name: string
  description?: string | null
  athleteId?: string | null
  isTemplate?: boolean
  status?: ProgramStatus
  weeks?: WeekInput[]
  createdAt?: Date
  updatedAt?: Date
}

// Error Types - Discriminated union with context
export type ProgramError =
  // Program-level errors
  | { type: 'NAME_REQUIRED'; message: string }
  | { type: 'NAME_TOO_SHORT'; message: string }
  | { type: 'NAME_TOO_LONG'; message: string }
  | { type: 'INVALID_STATUS_TRANSITION'; message: string }
  // Week-level errors
  | { type: 'WEEK_NAME_TOO_LONG'; message: string; weekIndex: number }
  | { type: 'WEEK_INVALID_ORDER_INDEX'; message: string; weekIndex: number }
  | { type: 'WEEK_DUPLICATE_ORDER_INDEX'; message: string; orderIndex: number }
  // Session-level errors
  | { type: 'SESSION_NAME_REQUIRED'; message: string; weekIndex: number; sessionIndex: number }
  | { type: 'SESSION_NAME_TOO_LONG'; message: string; weekIndex: number; sessionIndex: number }
  | { type: 'SESSION_INVALID_ORDER_INDEX'; message: string; weekIndex: number; sessionIndex: number }
  | { type: 'SESSION_DUPLICATE_ORDER_INDEX'; message: string; weekIndex: number; orderIndex: number }
  // ExerciseGroup-level errors
  | { type: 'GROUP_INVALID_ORDER_INDEX'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number }
  | { type: 'GROUP_DUPLICATE_ORDER_INDEX'; message: string; weekIndex: number; sessionIndex: number; orderIndex: number }
  | { type: 'GROUP_EMPTY'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number }
  // GroupItem-level errors
  | { type: 'ITEM_EXERCISE_ID_REQUIRED'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number }
  | { type: 'ITEM_INVALID_ORDER_INDEX'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number }
  | { type: 'ITEM_DUPLICATE_ORDER_INDEX'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; orderIndex: number }
  // Series-level errors
  | { type: 'SERIES_INVALID_ORDER_INDEX'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
  | { type: 'SERIES_REPS_INVALID'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
  | { type: 'SERIES_REPS_RANGE_INVALID'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
  | { type: 'SERIES_AMRAP_WITH_REPS'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
  | { type: 'SERIES_PERCENTAGE_INVALID'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
  | { type: 'SERIES_RPE_INVALID'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
  | { type: 'SERIES_RIR_INVALID'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
  | { type: 'SERIES_ABSOLUTE_INVALID'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
  | { type: 'SERIES_INTENSITY_VALUE_REQUIRED'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
  | { type: 'SERIES_TEMPO_INVALID'; message: string; weekIndex: number; sessionIndex: number; groupIndex: number; itemIndex: number; seriesIndex: number }
