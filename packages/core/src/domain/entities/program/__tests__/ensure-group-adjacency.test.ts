import { describe, expect, it } from 'vitest'
import { ensureGroupAdjacency } from '../ensure-group-adjacency'

describe('ensureGroupAdjacency', () => {
  it('[PROGRAM.ADJACENCY.1-UNIT-001] @p1 returns standalone rows in original order', () => {
    const rowIds = ['r1', 'r2', 'r3']
    const metadata = new Map([
      ['r1', { groupId: null }],
      ['r2', { groupId: null }],
      ['r3', { groupId: null }],
    ])

    expect(ensureGroupAdjacency(rowIds, metadata)).toEqual(['r1', 'r2', 'r3'])
  })

  it('[PROGRAM.ADJACENCY.1-UNIT-002] @p1 keeps already-adjacent group members in order', () => {
    const rowIds = ['r1', 'r2', 'r3']
    const metadata = new Map([
      ['r1', { groupId: 'g1' }],
      ['r2', { groupId: 'g1' }],
      ['r3', { groupId: null }],
    ])

    expect(ensureGroupAdjacency(rowIds, metadata)).toEqual(['r1', 'r2', 'r3'])
  })

  it('[PROGRAM.ADJACENCY.1-UNIT-003] @p0 consolidates split group members after first occurrence', () => {
    const rowIds = ['r1', 'r2', 'r3']
    const metadata = new Map([
      ['r1', { groupId: 'g1' }],
      ['r2', { groupId: null }],
      ['r3', { groupId: 'g1' }],
    ])

    expect(ensureGroupAdjacency(rowIds, metadata)).toEqual(['r1', 'r3', 'r2'])
  })

  it('[PROGRAM.ADJACENCY.1-UNIT-004] @p1 handles multiple groups', () => {
    const rowIds = ['r1', 'r2', 'r3', 'r4']
    const metadata = new Map([
      ['r1', { groupId: 'g1' }],
      ['r2', { groupId: 'g2' }],
      ['r3', { groupId: 'g1' }],
      ['r4', { groupId: 'g2' }],
    ])

    expect(ensureGroupAdjacency(rowIds, metadata)).toEqual(['r1', 'r3', 'r2', 'r4'])
  })

  it('[PROGRAM.ADJACENCY.1-UNIT-005] @p2 handles empty input', () => {
    expect(ensureGroupAdjacency([], new Map())).toEqual([])
  })

  it('[PROGRAM.ADJACENCY.1-UNIT-006] @p2 handles rows not in metadata', () => {
    const rowIds = ['r1', 'r2']
    const metadata = new Map<string, { groupId: string | null }>()

    expect(ensureGroupAdjacency(rowIds, metadata)).toEqual(['r1', 'r2'])
  })
})
