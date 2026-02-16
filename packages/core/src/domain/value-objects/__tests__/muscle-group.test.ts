import { describe, expect, it } from 'vitest'
import { getBodyRegion, isValidMuscleGroup, MUSCLE_GROUPS, type MuscleGroup } from '../muscle-group'

describe('MuscleGroup Value Object', () => {
  describe('MUSCLE_GROUPS', () => {
    it('should contain exactly 10 muscle groups', () => {
      expect(MUSCLE_GROUPS).toHaveLength(10)
    })

    it('should contain all expected muscle groups', () => {
      const expected = [
        'chest',
        'back',
        'shoulders',
        'biceps',
        'triceps',
        'quads',
        'hamstrings',
        'glutes',
        'core',
        'calves',
      ]
      for (const group of expected) {
        expect(MUSCLE_GROUPS).toContain(group)
      }
    })
  })

  describe('isValidMuscleGroup', () => {
    it.each(MUSCLE_GROUPS)('should return true for valid muscle group "%s"', (group) => {
      expect(isValidMuscleGroup(group)).toBe(true)
    })

    it('should return false for invalid string', () => {
      expect(isValidMuscleGroup('invalid')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidMuscleGroup('')).toBe(false)
    })

    it('should return false for null', () => {
      expect(isValidMuscleGroup(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidMuscleGroup(undefined)).toBe(false)
    })

    it('should return false for number', () => {
      expect(isValidMuscleGroup(123)).toBe(false)
    })

    it('should return false for boolean', () => {
      expect(isValidMuscleGroup(true)).toBe(false)
    })

    it('should return false for object', () => {
      expect(isValidMuscleGroup({})).toBe(false)
    })

    it('should be case-sensitive', () => {
      expect(isValidMuscleGroup('Chest')).toBe(false)
      expect(isValidMuscleGroup('BACK')).toBe(false)
    })
  })

  describe('getBodyRegion', () => {
    const upperBodyGroups: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps']
    const lowerBodyGroups: MuscleGroup[] = ['quads', 'hamstrings', 'glutes', 'calves']

    it.each(upperBodyGroups)('should return "upper" for "%s"', (group) => {
      expect(getBodyRegion(group)).toBe('upper')
    })

    it.each(lowerBodyGroups)('should return "lower" for "%s"', (group) => {
      expect(getBodyRegion(group)).toBe('lower')
    })

    it('should return "core" for core', () => {
      expect(getBodyRegion('core')).toBe('core')
    })

    it('should have a mapping for every muscle group', () => {
      for (const group of MUSCLE_GROUPS) {
        const region = getBodyRegion(group)
        expect(['upper', 'lower', 'core']).toContain(region)
      }
    })
  })
})
