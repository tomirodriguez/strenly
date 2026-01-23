import { z } from "zod";

// ============================================================
// INPUT SCHEMAS
// ============================================================

export const signUpInputSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	email: z.string().email("Email invalido"),
	password: z
		.string()
		.min(8, "La contrasena debe tener al menos 8 caracteres")
		.max(128, "La contrasena es muy larga"),
});

export type SignUpInput = z.infer<typeof signUpInputSchema>;

// ============================================================
// OUTPUT SCHEMAS
// ============================================================

export const signUpOutputSchema = z.object({
	user: z.object({
		id: z.string(),
		name: z.string(),
		email: z.string(),
	}),
});

export type SignUpOutput = z.infer<typeof signUpOutputSchema>;
