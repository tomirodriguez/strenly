import type { ProgramAggregate } from '@strenly/contracts/programs/program'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGridStore } from '../grid-store'

// Known test IDs matching the aggregate structure
const WEEK_ID = 'week-1'
const ITEM_ID = 'item-1'

/**
 * Create a minimal ProgramAggregate for testing undo/redo.
 * 1 week, 1 session, 1 group, 1 item with series.
 */
function createTestAggregate(): ProgramAggregate {
  return {
    id: 'prg-test-001',
    organizationId: 'org-test-001',
    name: 'Test Program',
    description: null,
    athleteId: null,
    isTemplate: false,
    status: 'draft',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    weeks: [
      {
        id: WEEK_ID,
        name: 'Week 1',
        orderIndex: 0,
        sessions: [
          {
            id: 'sess-1',
            name: 'Session 1',
            orderIndex: 0,
            exerciseGroups: [
              {
                id: 'group-1',
                orderIndex: 0,
                items: [
                  {
                    id: ITEM_ID,
                    exerciseId: 'ex-1',
                    orderIndex: 0,
                    series: [
                      {
                        orderIndex: 0,
                        reps: 5,
                        repsMax: null,
                        isAmrap: false,
                        intensityType: 'percentage',
                        intensityValue: 80,
                        tempo: null,
                        restSeconds: null,
                      },
                      {
                        orderIndex: 1,
                        reps: 5,
                        repsMax: null,
                        isAmrap: false,
                        intensityType: 'percentage',
                        intensityValue: 85,
                        tempo: null,
                        restSeconds: null,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}

function createTestExercisesMap(): Map<string, string> {
  return new Map([['ex-1', 'Test Exercise']])
}

/** Helper to get serialized grid rows for comparison */
function getRowsJson(): string {
  return JSON.stringify(useGridStore.getState().data?.rows)
}

describe('Grid Store - Undo/Redo', () => {
  beforeEach(() => {
    const store = useGridStore.getState()
    store.initialize('test-program', createTestAggregate(), createTestExercisesMap())
  })

  it('undo reverts the last mutation', () => {
    // Save original state
    const originalRows = getRowsJson()

    // Make a change
    useGridStore.getState().clearPrescription(ITEM_ID, WEEK_ID)
    expect(getRowsJson()).not.toBe(originalRows)

    // Undo
    useGridStore.getState().undo()
    expect(getRowsJson()).toBe(originalRows)
  })

  it('redo restores after undo', () => {
    // Make a change
    useGridStore.getState().clearPrescription(ITEM_ID, WEEK_ID)
    const clearedRows = getRowsJson()

    // Undo
    useGridStore.getState().undo()
    expect(getRowsJson()).not.toBe(clearedRows)

    // Redo
    useGridStore.getState().redo()
    expect(getRowsJson()).toBe(clearedRows)
  })

  it('undo on empty history is no-op', () => {
    const dataBefore = getRowsJson()

    // Undo with no history
    useGridStore.getState().undo()

    expect(getRowsJson()).toBe(dataBefore)
  })

  it('redo on empty redo stack is no-op', () => {
    const dataBefore = getRowsJson()

    // Redo with no redo stack
    useGridStore.getState().redo()

    expect(getRowsJson()).toBe(dataBefore)
  })

  it('new mutation after undo clears redo stack', () => {
    // Make a change and undo
    useGridStore.getState().clearPrescription(ITEM_ID, WEEK_ID)
    useGridStore.getState().undo()

    // Redo stack should have 1 entry
    expect(useGridStore.getState().redoStack.length).toBe(1)

    // Make a new mutation
    useGridStore.getState().clearPrescription(ITEM_ID, WEEK_ID)

    // Redo stack should be cleared
    expect(useGridStore.getState().redoStack.length).toBe(0)
  })

  it('history stack is limited to 50 entries', () => {
    // Make 60 mutations (alternating clear and update to actually change state)
    for (let i = 0; i < 60; i++) {
      if (i % 2 === 0) {
        useGridStore.getState().clearPrescription(ITEM_ID, WEEK_ID)
      } else {
        useGridStore.getState().updatePrescription(ITEM_ID, WEEK_ID, '3x5@80%')
      }
    }

    // History should be capped at 50
    expect(useGridStore.getState().undoStack.length).toBe(50)
  })

  it('initialize clears history', () => {
    // Make a change
    useGridStore.getState().clearPrescription(ITEM_ID, WEEK_ID)
    expect(useGridStore.getState().undoStack.length).toBe(1)

    // Re-initialize
    useGridStore.getState().initialize('test-program', createTestAggregate(), createTestExercisesMap())

    // History should be cleared
    expect(useGridStore.getState().undoStack.length).toBe(0)
    expect(useGridStore.getState().redoStack.length).toBe(0)
  })
})
