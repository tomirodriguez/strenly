import { z } from 'zod'

// ============================================================================
// Session Entity Schema (TRUE source of truth)
// ============================================================================

/**
 * Session entity schema with validation
 * Represents a session (training day) in the program
 */
export const sessionSchema = z.object({
  id: z.string(),
  programId: z.string(),
  name: z
    .string()
    .min(1, 'El nombre de sesión es obligatorio')
    .max(100, 'El nombre de sesión no puede superar los 100 caracteres'),
  orderIndex: z.number().int().min(0),
})

export type Session = z.infer<typeof sessionSchema>

// ============================================================================
// Session Input Schemas
// ============================================================================

/**
 * Add session input schema
 * Derives name validation from entity via .pick()
 */
export const addSessionInputSchema = sessionSchema.pick({ name: true }).extend({
  programId: z.string().min(1, 'ID de programa requerido'),
})

export type AddSessionInput = z.infer<typeof addSessionInputSchema>

/**
 * Update session input schema
 * Derives name validation from entity via .pick()
 */
export const updateSessionInputSchema = sessionSchema.pick({ name: true }).extend({
  sessionId: z.string().min(1, 'ID de sesión requerido'),
})

export type UpdateSessionInput = z.infer<typeof updateSessionInputSchema>

/**
 * Delete session input schema
 * Requires programId for efficient session count check
 */
export const deleteSessionInputSchema = z.object({
  programId: z.string().min(1, 'ID de programa requerido'),
  sessionId: z.string().min(1, 'ID de sesión requerido'),
})

export type DeleteSessionInput = z.infer<typeof deleteSessionInputSchema>

// ============================================================================
// Session Output Schemas
// ============================================================================

/**
 * Session output schema
 * Derives from entity schema
 */
export const sessionOutputSchema = sessionSchema

export type SessionOutput = z.infer<typeof sessionOutputSchema>
