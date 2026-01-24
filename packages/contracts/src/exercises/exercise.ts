import { z } from "zod";
import { movementPatternSchema, muscleGroupSchema } from "./muscle-group";

/**
 * Exercise schema - output representation of an exercise
 */
export const exerciseSchema = z.object({
	id: z.string(),
	organizationId: z.string().nullable(),
	name: z.string(),
	description: z.string().nullable(),
	instructions: z.string().nullable(),
	videoUrl: z.string().nullable(),
	movementPattern: movementPatternSchema.nullable(),
	isUnilateral: z.boolean(),
	isCurated: z.boolean(),
	clonedFromId: z.string().nullable(),
	primaryMuscles: z.array(muscleGroupSchema),
	secondaryMuscles: z.array(muscleGroupSchema),
	archivedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

/**
 * Create exercise input schema
 */
export const createExerciseInputSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().optional(),
	instructions: z.string().optional(),
	videoUrl: z.string().url().optional(),
	movementPattern: movementPatternSchema.optional(),
	isUnilateral: z.boolean().optional(),
	primaryMuscles: z.array(muscleGroupSchema).optional(),
	secondaryMuscles: z.array(muscleGroupSchema).optional(),
});

export type CreateExerciseInput = z.infer<typeof createExerciseInputSchema>;

/**
 * Update exercise input schema
 */
export const updateExerciseInputSchema = createExerciseInputSchema.partial().extend({
	exerciseId: z.string(),
});

export type UpdateExerciseInput = z.infer<typeof updateExerciseInputSchema>;

/**
 * List exercises input schema - filtering and pagination
 */
export const listExercisesInputSchema = z.object({
	movementPattern: movementPatternSchema.optional(),
	muscleGroup: muscleGroupSchema.optional(),
	search: z.string().optional(),
	includeArchived: z.boolean().optional(),
	limit: z.number().min(1).max(100).optional(),
	offset: z.number().min(0).optional(),
});

export type ListExercisesInput = z.infer<typeof listExercisesInputSchema>;

/**
 * List exercises output schema - paginated response
 */
export const listExercisesOutputSchema = z.object({
	items: z.array(exerciseSchema),
	totalCount: z.number(),
});

export type ListExercisesOutput = z.infer<typeof listExercisesOutputSchema>;

/**
 * Clone exercise input schema
 */
export const cloneExerciseInputSchema = z.object({
	sourceExerciseId: z.string(),
	name: z.string().min(1).max(100).optional(),
});

export type CloneExerciseInput = z.infer<typeof cloneExerciseInputSchema>;

/**
 * Get exercise input schema
 */
export const getExerciseInputSchema = z.object({
	exerciseId: z.string(),
});

export type GetExerciseInput = z.infer<typeof getExerciseInputSchema>;

/**
 * Archive exercise input schema
 */
export const archiveExerciseInputSchema = z.object({
	exerciseId: z.string(),
});

export type ArchiveExerciseInput = z.infer<typeof archiveExerciseInputSchema>;

/**
 * Archive exercise output schema
 */
export const archiveExerciseOutputSchema = z.object({
	success: z.boolean(),
});

export type ArchiveExerciseOutput = z.infer<typeof archiveExerciseOutputSchema>;
