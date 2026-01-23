import {
	sessionOutputSchema,
	signOutOutputSchema,
} from "@strenly/contracts/auth/session";
import { publicProcedure } from "../../lib/orpc";

/**
 * Get current session
 * Returns user and session info if authenticated, null otherwise
 */
export const session = publicProcedure
	.output(sessionOutputSchema)
	.handler(async ({ context }) => {
		const result = await context.auth.api.getSession({
			headers: context.headers,
		});

		if (!result?.user) {
			return null;
		}

		return {
			user: {
				id: result.user.id,
				name: result.user.name ?? "",
				email: result.user.email,
				image: result.user.image ?? null,
			},
			session: {
				id: result.session.id,
				expiresAt: result.session.expiresAt.toISOString(),
			},
		};
	});

/**
 * Sign out
 * Clears the current session
 */
export const signOut = publicProcedure
	.output(signOutOutputSchema)
	.handler(async ({ context }) => {
		await context.auth.api.signOut({
			headers: context.headers,
		});
		return { success: true };
	});
