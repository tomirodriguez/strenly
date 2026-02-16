import { describe, expect, it } from 'vitest'
import { createExercise, isArchived, isCurated, isCustom } from '../exercise'

const validInput = {
  id: 'exercise-123',
  name: 'Bench Press',
}

describe('createExercise', () => {
  it('[EXERCISE.1-UNIT-001] @p0 creates exercise with valid name', () => {
    const result = createExercise(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('Bench Press')
      expect(result.value.id).toBe('exercise-123')
    }
  })

  it('[EXERCISE.1-UNIT-002] @p0 creates curated exercise without organizationId', () => {
    const result = createExercise(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.organizationId).toBeNull()
    }
  })

  it('[EXERCISE.1-UNIT-003] @p0 creates custom exercise with organizationId', () => {
    const result = createExercise({ ...validInput, organizationId: 'org-1' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.organizationId).toBe('org-1')
    }
  })

  it('[EXERCISE.1-UNIT-004] @p1 accepts valid movement pattern', () => {
    const result = createExercise({ ...validInput, movementPattern: 'push' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.movementPattern).toBe('push')
    }
  })

  it('[EXERCISE.1-UNIT-005] @p1 accepts valid muscle groups', () => {
    const result = createExercise({
      ...validInput,
      primaryMuscles: ['chest'],
      secondaryMuscles: ['triceps', 'shoulders'],
    })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.primaryMuscles).toEqual(['chest'])
      expect(result.value.secondaryMuscles).toEqual(['triceps', 'shoulders'])
    }
  })

  it('[EXERCISE.1-UNIT-006] @p2 accepts valid video URL', () => {
    const result = createExercise({
      ...validInput,
      videoUrl: 'https://youtube.com/watch?v=abc123',
    })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.videoUrl).toBe('https://youtube.com/watch?v=abc123')
    }
  })

  it('[EXERCISE.1-UNIT-007] @p2 defaults isUnilateral to false', () => {
    const result = createExercise(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.isUnilateral).toBe(false)
    }
  })

  it('[EXERCISE.1-UNIT-008] @p2 defaults archivedAt to null', () => {
    const result = createExercise(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.archivedAt).toBeNull()
    }
  })

  it('[EXERCISE.1-UNIT-009] @p1 trims whitespace from name', () => {
    const result = createExercise({ ...validInput, name: '  Bench Press  ' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('Bench Press')
    }
  })

  it('[EXERCISE.1-UNIT-010] @p2 accepts description and instructions', () => {
    const result = createExercise({
      ...validInput,
      description: 'Classic chest exercise',
      instructions: '1. Lie on bench\n2. Lower bar\n3. Press up',
    })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.description).toBe('Classic chest exercise')
      expect(result.value.instructions).toBe('1. Lie on bench\n2. Lower bar\n3. Press up')
    }
  })

  it('[EXERCISE.1-UNIT-011] @p2 accepts clonedFromId for cloned exercises', () => {
    const result = createExercise({
      ...validInput,
      organizationId: 'org-1',
      clonedFromId: 'original-exercise-id',
    })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.clonedFromId).toBe('original-exercise-id')
    }
  })

  it('[EXERCISE.1-UNIT-012] @p2 accepts isUnilateral flag', () => {
    const result = createExercise({ ...validInput, isUnilateral: true })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.isUnilateral).toBe(true)
    }
  })

  describe('name validation', () => {
    it('[EXERCISE.2-UNIT-013] @p0 fails with empty name', () => {
      const result = createExercise({ ...validInput, name: '' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_NAME')
      }
    })

    it('[EXERCISE.2-UNIT-014] @p1 fails with whitespace-only name', () => {
      const result = createExercise({ ...validInput, name: '   ' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_NAME')
      }
    })

    it('[EXERCISE.2-UNIT-015] @p1 fails with name over 100 chars', () => {
      const result = createExercise({ ...validInput, name: 'x'.repeat(101) })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_NAME')
      }
    })

    it('[EXERCISE.2-UNIT-016] @p2 accepts name exactly 100 chars', () => {
      const result = createExercise({ ...validInput, name: 'x'.repeat(100) })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('videoUrl validation', () => {
    it('[EXERCISE.3-UNIT-017] @p1 fails with invalid video URL', () => {
      const result = createExercise({ ...validInput, videoUrl: 'not-a-url' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_VIDEO_URL')
      }
    })

    it('[EXERCISE.3-UNIT-018] @p2 accepts https URL', () => {
      const result = createExercise({ ...validInput, videoUrl: 'https://vimeo.com/12345' })
      expect(result.isOk()).toBe(true)
    })

    it('[EXERCISE.3-UNIT-019] @p2 accepts http URL', () => {
      const result = createExercise({ ...validInput, videoUrl: 'http://example.com/video' })
      expect(result.isOk()).toBe(true)
    })

    it('[EXERCISE.3-UNIT-020] @p2 accepts undefined videoUrl', () => {
      const result = createExercise({ ...validInput, videoUrl: undefined })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.videoUrl).toBeNull()
      }
    })
  })

  describe('movementPattern validation', () => {
    it('[EXERCISE.4-UNIT-021] @p1 fails with invalid movement pattern', () => {
      const result = createExercise({ ...validInput, movementPattern: 'invalid' as 'push' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_MOVEMENT_PATTERN')
      }
    })

    it('[EXERCISE.4-UNIT-022] @p1 accepts all valid movement patterns', () => {
      const patterns = ['push', 'pull', 'hinge', 'squat', 'carry', 'core'] as const
      for (const pattern of patterns) {
        const result = createExercise({ ...validInput, movementPattern: pattern })
        expect(result.isOk()).toBe(true)
      }
    })

    it('[EXERCISE.4-UNIT-023] @p2 accepts undefined movementPattern', () => {
      const result = createExercise({ ...validInput, movementPattern: undefined })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.movementPattern).toBeNull()
      }
    })
  })

  describe('muscle group validation', () => {
    it('[EXERCISE.5-UNIT-024] @p1 fails with invalid primary muscle group', () => {
      const result = createExercise({ ...validInput, primaryMuscles: ['invalid' as 'chest'] })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_MUSCLE_GROUP')
      }
    })

    it('[EXERCISE.5-UNIT-025] @p1 fails with invalid secondary muscle group', () => {
      const result = createExercise({ ...validInput, secondaryMuscles: ['invalid' as 'chest'] })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_MUSCLE_GROUP')
      }
    })

    it('[EXERCISE.5-UNIT-026] @p1 accepts all valid muscle groups', () => {
      const muscles = [
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
      ] as const
      const result = createExercise({ ...validInput, primaryMuscles: [...muscles] })
      expect(result.isOk()).toBe(true)
    })

    it('[EXERCISE.5-UNIT-027] @p2 accepts empty muscle arrays', () => {
      const result = createExercise({
        ...validInput,
        primaryMuscles: [],
        secondaryMuscles: [],
      })
      expect(result.isOk()).toBe(true)
    })
  })
})

describe('exercise helpers', () => {
  it('[EXERCISE.6-UNIT-028] @p1 isCurated returns true when no organizationId', () => {
    const exercise = createExercise(validInput)._unsafeUnwrap()
    expect(isCurated(exercise)).toBe(true)
  })

  it('[EXERCISE.6-UNIT-029] @p1 isCurated returns false when has organizationId', () => {
    const exercise = createExercise({ ...validInput, organizationId: 'org-1' })._unsafeUnwrap()
    expect(isCurated(exercise)).toBe(false)
  })

  it('[EXERCISE.6-UNIT-030] @p1 isCustom returns true when has organizationId', () => {
    const exercise = createExercise({ ...validInput, organizationId: 'org-1' })._unsafeUnwrap()
    expect(isCustom(exercise)).toBe(true)
  })

  it('[EXERCISE.6-UNIT-031] @p1 isCustom returns false when no organizationId', () => {
    const exercise = createExercise(validInput)._unsafeUnwrap()
    expect(isCustom(exercise)).toBe(false)
  })

  it('[EXERCISE.6-UNIT-032] @p1 isArchived returns true when archivedAt is set', () => {
    const exercise = createExercise(validInput)._unsafeUnwrap()
    const archivedExercise = { ...exercise, archivedAt: new Date() }
    expect(isArchived(archivedExercise)).toBe(true)
  })

  it('[EXERCISE.6-UNIT-033] @p1 isArchived returns false when archivedAt is null', () => {
    const exercise = createExercise(validInput)._unsafeUnwrap()
    expect(isArchived(exercise)).toBe(false)
  })
})
