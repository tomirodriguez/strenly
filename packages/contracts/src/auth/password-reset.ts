import { z } from "zod";

// ============================================================
// REQUEST PASSWORD RESET
// ============================================================

export const requestPasswordResetInputSchema = z.object({
	email: z.string().email("Email invalido"),
	redirectTo: z.string().url().optional(),
});

export type RequestPasswordResetInput = z.infer<
	typeof requestPasswordResetInputSchema
>;

// ============================================================
// RESET PASSWORD
// ============================================================

export const resetPasswordInputSchema = z.object({
	token: z.string().min(1, "Token requerido"),
	newPassword: z
		.string()
		.min(8, "La contrasena debe tener al menos 8 caracteres")
		.max(128, "La contrasena es muy larga"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

// ============================================================
// OUTPUT SCHEMA
// ============================================================

export const passwordResetOutputSchema = z.object({
	success: z.boolean(),
});

export type PasswordResetOutput = z.infer<typeof passwordResetOutputSchema>;
