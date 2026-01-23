import {
	signInInputSchema,
	signInOutputSchema,
} from "@strenly/contracts/auth/sign-in";
import { publicProcedure } from "../../lib/orpc";

/**
 * Sign in with email and password
 * Validates credentials and creates a session
 */
export const signIn = publicProcedure
	.errors({
		INVALID_CREDENTIALS: { message: "Email o contrasena incorrectos" },
	})
	.input(signInInputSchema)
	.output(signInOutputSchema)
	.handler(async ({ input, context, errors }) => {
		const result = await context.auth.api.signInEmail({
			body: {
				email: input.email,
				password: input.password,
				rememberMe: input.rememberMe,
			},
		});

		if (!result.user) {
			throw errors.INVALID_CREDENTIALS();
		}

		return {
			user: {
				id: result.user.id,
				name: result.user.name ?? "",
				email: result.user.email,
			},
		};
	});
