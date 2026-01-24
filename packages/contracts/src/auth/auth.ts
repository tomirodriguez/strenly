import { z } from 'zod'

/**
 * Signup form validation schema
 */
export const signupInputSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be 100 characters or less' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
})

export type SignupInput = z.infer<typeof signupInputSchema>

/**
 * Login form validation schema
 */
export const loginInputSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean(),
})

export type LoginInput = z.infer<typeof loginInputSchema>
