import { z } from 'zod'

/**
 * Add session input schema
 * Creates a new session (training day) in a program
 */
export const addSessionSchema = z.object({
  programId: z.string(),
  name: z.string().min(1).max(100),
})

export type AddSessionInput = z.infer<typeof addSessionSchema>

/**
 * Update session input schema
 * Updates the name of a session
 */
export const updateSessionSchema = z.object({
  sessionId: z.string(),
  name: z.string().min(1).max(100),
})

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>

/**
 * Delete session input schema
 * Requires programId for efficient session count check
 */
export const deleteSessionSchema = z.object({
  programId: z.string(),
  sessionId: z.string(),
})

export type DeleteSessionInput = z.infer<typeof deleteSessionSchema>

/**
 * Session output schema
 * Represents a session (training day) in the program
 */
export const sessionOutputSchema = z.object({
  id: z.string(),
  programId: z.string(),
  name: z.string(),
  orderIndex: z.number(),
})

export type SessionOutput = z.infer<typeof sessionOutputSchema>
