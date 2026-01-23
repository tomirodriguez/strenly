import { z } from 'zod'

// ============================================================
// OUTPUT SCHEMAS
// ============================================================

export const sessionOutputSchema = z
  .object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      image: z.string().nullable(),
    }),
    session: z.object({
      id: z.string(),
      expiresAt: z.string(), // ISO date string
    }),
  })
  .nullable()

export type SessionOutput = z.infer<typeof sessionOutputSchema>

// ============================================================
// SIGN OUT OUTPUT
// ============================================================

export const signOutOutputSchema = z.object({
  success: z.boolean(),
})

export type SignOutOutput = z.infer<typeof signOutOutputSchema>
