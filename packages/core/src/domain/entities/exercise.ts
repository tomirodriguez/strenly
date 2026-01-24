import { type Result, err, ok } from "neverthrow";
import { type MovementPattern, isValidMovementPattern } from "./movement-pattern";
import { type MuscleGroup, isValidMuscleGroup } from "./muscle-group";

export type Exercise = {
	readonly id: string;
	readonly organizationId: string | null; // null = curated (global), string = custom (org-specific)
	readonly name: string;
	readonly description: string | null;
	readonly instructions: string | null;
	readonly videoUrl: string | null;
	readonly movementPattern: MovementPattern | null;
	readonly isUnilateral: boolean;
	readonly clonedFromId: string | null;
	readonly primaryMuscles: readonly MuscleGroup[];
	readonly secondaryMuscles: readonly MuscleGroup[];
	readonly archivedAt: Date | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
};

export type ExerciseError =
	| { type: "INVALID_NAME"; message: string }
	| { type: "INVALID_VIDEO_URL"; message: string }
	| { type: "INVALID_MOVEMENT_PATTERN"; message: string }
	| { type: "INVALID_MUSCLE_GROUP"; message: string };

type CreateExerciseInput = {
	id: string;
	name: string;
	organizationId?: string | null;
	description?: string | null;
	instructions?: string | null;
	videoUrl?: string | null;
	movementPattern?: MovementPattern | null;
	isUnilateral?: boolean;
	clonedFromId?: string | null;
	primaryMuscles?: MuscleGroup[];
	secondaryMuscles?: MuscleGroup[];
	archivedAt?: Date | null;
	createdAt?: Date;
	updatedAt?: Date;
};

export function createExercise(input: CreateExerciseInput): Result<Exercise, ExerciseError> {
	// Validate name
	const trimmedName = input.name.trim();
	if (!trimmedName || trimmedName.length === 0) {
		return err({ type: "INVALID_NAME", message: "Exercise name is required" });
	}
	if (trimmedName.length > 100) {
		return err({ type: "INVALID_NAME", message: "Exercise name must not exceed 100 characters" });
	}

	// Validate videoUrl if provided
	if (input.videoUrl !== undefined && input.videoUrl !== null) {
		try {
			new URL(input.videoUrl);
		} catch {
			return err({ type: "INVALID_VIDEO_URL", message: "Video URL must be a valid URL" });
		}
	}

	// Validate movementPattern if provided
	if (input.movementPattern !== undefined && input.movementPattern !== null) {
		if (!isValidMovementPattern(input.movementPattern)) {
			return err({ type: "INVALID_MOVEMENT_PATTERN", message: "Invalid movement pattern" });
		}
	}

	// Validate primaryMuscles if provided
	const primaryMuscles = input.primaryMuscles ?? [];
	for (const muscle of primaryMuscles) {
		if (!isValidMuscleGroup(muscle)) {
			return err({ type: "INVALID_MUSCLE_GROUP", message: `Invalid primary muscle group: ${muscle}` });
		}
	}

	// Validate secondaryMuscles if provided
	const secondaryMuscles = input.secondaryMuscles ?? [];
	for (const muscle of secondaryMuscles) {
		if (!isValidMuscleGroup(muscle)) {
			return err({ type: "INVALID_MUSCLE_GROUP", message: `Invalid secondary muscle group: ${muscle}` });
		}
	}

	const now = new Date();

	return ok({
		id: input.id,
		organizationId: input.organizationId ?? null,
		name: trimmedName,
		description: input.description ?? null,
		instructions: input.instructions ?? null,
		videoUrl: input.videoUrl ?? null,
		movementPattern: input.movementPattern ?? null,
		isUnilateral: input.isUnilateral ?? false,
		clonedFromId: input.clonedFromId ?? null,
		primaryMuscles,
		secondaryMuscles,
		archivedAt: input.archivedAt ?? null,
		createdAt: input.createdAt ?? now,
		updatedAt: input.updatedAt ?? now,
	});
}

// Helper functions
export function isCurated(exercise: Exercise): boolean {
	return exercise.organizationId === null;
}

export function isCustom(exercise: Exercise): boolean {
	return exercise.organizationId !== null;
}

export function isArchived(exercise: Exercise): boolean {
	return exercise.archivedAt !== null;
}
