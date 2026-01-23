import { z } from "zod";

// ============================================================
// INPUT SCHEMAS
// ============================================================

export const signInInputSchema = z.object({
	email: z.string().email("Email invalido"),
	password: z.string().min(1, "La contrasena es requerida"),
	rememberMe: z.boolean().optional().default(false),
});

export type SignInInput = z.infer<typeof signInInputSchema>;

// ============================================================
// OUTPUT SCHEMAS
// ============================================================

export const signInOutputSchema = z.object({
	user: z.object({
		id: z.string(),
		name: z.string(),
		email: z.string(),
	}),
});

export type SignInOutput = z.infer<typeof signInOutputSchema>;
