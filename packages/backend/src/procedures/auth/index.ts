/**
 * Auth Router
 * Aggregates all authentication procedures
 *
 * EXCEPTION: This is a barrel file for router aggregation only.
 * Using direct imports elsewhere.
 */

import { requestPasswordReset, resetPassword } from "./password-reset";
import { session, signOut } from "./session";
import { signIn } from "./sign-in";
import { signUp } from "./sign-up";

/**
 * Auth procedures router
 * Plain object following oRPC pattern
 */
export const authRouter = {
	signUp,
	signIn,
	session,
	signOut,
	requestPasswordReset,
	resetPassword,
};
