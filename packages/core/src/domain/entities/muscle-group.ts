// Muscle Group Value Object
// 10 major muscle groups for exercise categorization

export const MUSCLE_GROUPS = [
	"chest",
	"back",
	"shoulders",
	"biceps",
	"triceps",
	"quads",
	"hamstrings",
	"glutes",
	"core",
	"calves",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export type BodyRegion = "upper" | "lower" | "core";

const BODY_REGIONS: Record<MuscleGroup, BodyRegion> = {
	chest: "upper",
	back: "upper",
	shoulders: "upper",
	biceps: "upper",
	triceps: "upper",
	quads: "lower",
	hamstrings: "lower",
	glutes: "lower",
	core: "core",
	calves: "lower",
};

export function isValidMuscleGroup(value: unknown): value is MuscleGroup {
	return typeof value === "string" && MUSCLE_GROUPS.includes(value as MuscleGroup);
}

export function getBodyRegion(muscleGroup: MuscleGroup): BodyRegion {
	return BODY_REGIONS[muscleGroup];
}
