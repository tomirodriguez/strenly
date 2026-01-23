import { publicProcedure } from '../../lib/orpc'
import { signUpInputSchema, signUpOutputSchema } from '@strenly/contracts/auth/sign-up'

/**
 * Sign up with email and password
 * Creates a new user account and starts a session
 */
export const signUp = publicProcedure
  .errors({
    EMAIL_EXISTS: { message: 'Ya existe una cuenta con este email' },
    WEAK_PASSWORD: { message: 'La contrasena es muy debil' },
  })
  .input(signUpInputSchema)
  .output(signUpOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const result = await context.auth.api.signUpEmail({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
      },
    })

    if (!result.user) {
      // Better-Auth returns error in result when signup fails
      throw errors.EMAIL_EXISTS()
    }

    return {
      user: {
        id: result.user.id,
        name: result.user.name ?? input.name,
        email: result.user.email,
      },
    }
  })
