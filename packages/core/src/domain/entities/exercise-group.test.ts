import { describe, expect, it } from 'vitest'
import { createExerciseGroup, type ExerciseGroupError, reconstituteExerciseGroup } from './exercise-group'

describe('ExerciseGroup', () => {
  describe('createExerciseGroup', () => {
    describe('valid cases', () => {
      it('creates group with required fields', () => {
        const result = createExerciseGroup({
          id: 'eg-1',
          sessionId: 's-1',
          orderIndex: 0,
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.id).toBe('eg-1')
          expect(result.value.sessionId).toBe('s-1')
          expect(result.value.orderIndex).toBe(0)
          expect(result.value.name).toBeNull()
        }
      })

      it('creates group with custom name', () => {
        const result = createExerciseGroup({
          id: 'eg-1',
          sessionId: 's-1',
          orderIndex: 0,
          name: 'Heavy Block',
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.name).toBe('Heavy Block')
        }
      })

      it('normalizes empty string name to null', () => {
        const result = createExerciseGroup({
          id: 'eg-1',
          sessionId: 's-1',
          orderIndex: 0,
          name: '',
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.name).toBeNull()
        }
      })

      it('normalizes whitespace-only name to null', () => {
        const result = createExerciseGroup({
          id: 'eg-1',
          sessionId: 's-1',
          orderIndex: 0,
          name: '   ',
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.name).toBeNull()
        }
      })

      it('trims name with leading/trailing whitespace', () => {
        const result = createExerciseGroup({
          id: 'eg-1',
          sessionId: 's-1',
          orderIndex: 0,
          name: '  Heavy Block  ',
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.name).toBe('Heavy Block')
        }
      })

      it('creates group with positive order index', () => {
        const result = createExerciseGroup({
          id: 'eg-5',
          sessionId: 's-1',
          orderIndex: 5,
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.orderIndex).toBe(5)
        }
      })

      it('accepts null name explicitly', () => {
        const result = createExerciseGroup({
          id: 'eg-1',
          sessionId: 's-1',
          orderIndex: 0,
          name: null,
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.name).toBeNull()
        }
      })
    })

    describe('invalid cases', () => {
      it('rejects negative order index', () => {
        const result = createExerciseGroup({
          id: 'eg-1',
          sessionId: 's-1',
          orderIndex: -1,
        })

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('ORDER_INDEX_INVALID')
        }
      })

      it('rejects empty id', () => {
        const result = createExerciseGroup({
          id: '',
          sessionId: 's-1',
          orderIndex: 0,
        })

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('ID_REQUIRED')
        }
      })

      it('rejects whitespace-only id', () => {
        const result = createExerciseGroup({
          id: '   ',
          sessionId: 's-1',
          orderIndex: 0,
        })

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('ID_REQUIRED')
        }
      })

      it('rejects empty sessionId', () => {
        const result = createExerciseGroup({
          id: 'eg-1',
          sessionId: '',
          orderIndex: 0,
        })

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SESSION_ID_REQUIRED')
        }
      })

      it('rejects whitespace-only sessionId', () => {
        const result = createExerciseGroup({
          id: 'eg-1',
          sessionId: '   ',
          orderIndex: 0,
        })

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SESSION_ID_REQUIRED')
        }
      })
    })
  })

  describe('reconstituteExerciseGroup', () => {
    it('returns group without validation for database loads', () => {
      const props = {
        id: 'eg-1',
        sessionId: 's-1',
        orderIndex: 0,
        name: 'Heavy Singles',
      }

      const group = reconstituteExerciseGroup(props)

      expect(group.id).toBe('eg-1')
      expect(group.sessionId).toBe('s-1')
      expect(group.orderIndex).toBe(0)
      expect(group.name).toBe('Heavy Singles')
    })

    it('reconstitutes group with null name', () => {
      const props = {
        id: 'eg-2',
        sessionId: 's-2',
        orderIndex: 3,
        name: null,
      }

      const group = reconstituteExerciseGroup(props)

      expect(group.id).toBe('eg-2')
      expect(group.name).toBeNull()
    })
  })
})
