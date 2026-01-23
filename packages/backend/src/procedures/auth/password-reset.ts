import {
	passwordResetOutputSchema,
	requestPasswordResetInputSchema,
	resetPasswordInputSchema,
} from "@strenly/contracts/auth/password-reset";
import { publicProcedure } from "../../lib/orpc";

/**
 * Request password reset
 * Sends reset email if account exists. Always returns success to prevent email enumeration.
 */
export const requestPasswordReset = publicProcedure
	.input(requestPasswordResetInputSchema)
	.output(passwordResetOutputSchema)
	.handler(async ({ input, context }) => {
		// Note: Better-Auth handles email sending via sendResetPassword config
		// This endpoint always returns success to prevent email enumeration
		try {
			await context.auth.api.requestPasswordReset({
				body: {
					email: input.email,
					redirectTo: input.redirectTo,
				},
			});
		} catch {
			// Silently ignore errors to prevent email enumeration
		}

		return { success: true };
	});

/**
 * Reset password with token
 * Validates token and updates password
 */
export const resetPassword = publicProcedure
	.errors({
		INVALID_TOKEN: { message: "El enlace ha expirado o es invalido" },
		WEAK_PASSWORD: { message: "La contrasena es muy debil" },
	})
	.input(resetPasswordInputSchema)
	.output(passwordResetOutputSchema)
	.handler(async ({ input, context, errors }) => {
		try {
			await context.auth.api.resetPassword({
				body: {
					token: input.token,
					newPassword: input.newPassword,
				},
			});
			return { success: true };
		} catch {
			throw errors.INVALID_TOKEN();
		}
	});
