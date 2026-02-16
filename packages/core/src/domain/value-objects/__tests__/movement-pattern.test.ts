import { describe, expect, it } from 'vitest'
import { isValidMovementPattern, MOVEMENT_PATTERNS } from '../movement-pattern'

describe('MovementPattern Value Object', () => {
  describe('MOVEMENT_PATTERNS', () => {
    it('should contain exactly 6 patterns', () => {
      expect(MOVEMENT_PATTERNS).toHaveLength(6)
    })

    it('should contain all expected patterns', () => {
      expect(MOVEMENT_PATTERNS).toContain('push')
      expect(MOVEMENT_PATTERNS).toContain('pull')
      expect(MOVEMENT_PATTERNS).toContain('hinge')
      expect(MOVEMENT_PATTERNS).toContain('squat')
      expect(MOVEMENT_PATTERNS).toContain('carry')
      expect(MOVEMENT_PATTERNS).toContain('core')
    })
  })

  describe('isValidMovementPattern', () => {
    it.each(MOVEMENT_PATTERNS)('should return true for valid pattern "%s"', (pattern) => {
      expect(isValidMovementPattern(pattern)).toBe(true)
    })

    it('should return false for invalid string', () => {
      expect(isValidMovementPattern('invalid')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidMovementPattern('')).toBe(false)
    })

    it('should return false for null', () => {
      expect(isValidMovementPattern(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidMovementPattern(undefined)).toBe(false)
    })

    it('should return false for number', () => {
      expect(isValidMovementPattern(123)).toBe(false)
    })

    it('should return false for boolean', () => {
      expect(isValidMovementPattern(true)).toBe(false)
    })

    it('should return false for object', () => {
      expect(isValidMovementPattern({})).toBe(false)
    })

    it('should be case-sensitive', () => {
      expect(isValidMovementPattern('Push')).toBe(false)
      expect(isValidMovementPattern('PULL')).toBe(false)
    })
  })
})
