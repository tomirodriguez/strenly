// Movement Pattern Value Object
// Basic 6 movement patterns for exercise categorization

export const MOVEMENT_PATTERNS = ["push", "pull", "hinge", "squat", "carry", "core"] as const;

export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export function isValidMovementPattern(value: unknown): value is MovementPattern {
	return typeof value === "string" && MOVEMENT_PATTERNS.includes(value as MovementPattern);
}
