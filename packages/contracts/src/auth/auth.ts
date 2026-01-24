import { z } from 'zod'

/**
 * Signup form validation schema
 */
export const signupInputSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede superar los 100 caracteres' }),
  email: z.string().email({ message: 'Por favor ingresa un correo electronico valido' }),
  password: z.string().min(8, { message: 'La contrasena debe tener al menos 8 caracteres' }),
})

export type SignupInput = z.infer<typeof signupInputSchema>

/**
 * Login form validation schema
 */
export const loginInputSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa un correo electronico valido' }),
  password: z.string().min(1, { message: 'La contrasena es obligatoria' }),
  rememberMe: z.boolean(),
})

export type LoginInput = z.infer<typeof loginInputSchema>
