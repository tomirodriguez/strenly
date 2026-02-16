# Programs Use Case Tests - Testing Guide

This directory contains tests for all Programs domain use cases following Clean Architecture + neverthrow patterns.

## Test Structure Pattern

All program use case tests follow this structure:

```typescript
describe('{useCase} use case', () => {
  let mockProgramRepository: ProgramRepositoryPort
  let mockAthleteRepository: AthleteRepositoryPort // if needed
  let mockGenerateId: () => string // if needed

  beforeEach(() => {
    // Setup mocks
  })

  describe('Happy Path', () => {
    it('should {action} successfully', async () => {
      // Test main success scenario
    })

    it('should handle {variation}', async () => {
      // Test variations of success path
    })
  })

  describe('Authorization', () => {
    it('should return forbidden error when user lacks programs:write permission', async () => {
      // Test with viewer context (no write permission)
    })
  })

  describe('Not Found Errors', () => {
    it('should return not_found when program does not exist', async () => {
      // Test with non-existent program ID
    })

    it('should return not_found when {entity} does not exist', async () => {
      // Test with non-existent related entities
    })
  })

  describe('Validation Errors', () => {
    it('should return validation error when {field} is invalid', async () => {
      // Test domain validation failures
    })
  })

  describe('Repository Errors', () => {
    it('should return repository error when {operation} fails', async () => {
      // Test database failure scenarios
    })
  })

  describe('Edge Cases', () => {
    it('should handle {edge case}', async () => {
      // Test boundary conditions
    })
  })
})
```

## P0 Use Cases - Programs Domain

### 1. create-program ✅
**Pattern**: Create with aggregate (weeks + sessions)
- Happy: create with default weeks/sessions, create as template
- Auth: forbidden for viewer
- Validation: empty name, invalid athlete reference
- Repository: athlete not found, save failure
- Edge: zero weeks, large week count

**File**: `create-program.test.ts` (generated as sample earlier)

### 2. update-program
**Pattern**: Fetch → Merge → Validate → Save aggregate
- Happy: update name/description, update athlete assignment, unassign athlete
- Auth: forbidden for viewer
- Not Found: program doesn't exist
- Validation: empty name
- Repository: fetch failure, save failure
- Edge: partial updates, null assignments

**Test Count**: ~8-10 tests

### 3. add-session
**Pattern**: Fetch program → Add session to week → Save aggregate
- Happy: add to existing week, auto-generate session name
- Auth: forbidden for viewer
- Not Found: program not found, week not found
- Validation: invalid week ID, duplicate session
- Edge: add to last week, order index handling

**Test Count**: ~7-9 tests

### 4. add-week
**Pattern**: Fetch program → Add week → Save aggregate
- Happy: add week with sessions, auto-generate week name
- Auth: forbidden for viewer
- Not Found: program not found
- Validation: invalid week config
- Edge: add to empty program, order index

**Test Count**: ~6-8 tests

### 5. add-exercise-row
**Pattern**: Fetch program → Add exercise to session → Save aggregate
- Happy: add to existing session, create new group
- Auth: forbidden for viewer
- Not Found: program/session/exercise not found
- Validation: invalid exercise reference
- Edge: add to empty session, group management

**Test Count**: ~8-10 tests

### 6. delete-session
**Pattern**: Fetch program → Remove session → Save aggregate
- Happy: delete from middle, delete last session
- Auth: forbidden for viewer
- Not Found: program/session not found
- Edge: delete only session, order reindexing

**Test Count**: ~6-7 tests

### 7. delete-week
**Pattern**: Fetch program → Remove week → Save aggregate
- Happy: delete from middle, delete last week
- Auth: forbidden for viewer
- Not Found: program/week not found
- Edge: delete only week, cascade sessions

**Test Count**: ~6-7 tests

### 8. delete-exercise-row
**Pattern**: Fetch program → Remove exercise → Save aggregate
- Happy: delete from group, auto-remove empty groups
- Auth: forbidden for viewer
- Not Found: program/session/exercise not found
- Edge: delete only exercise in group

**Test Count**: ~6-7 tests

## Common Mocking Patterns

### Mock Program Repository

```typescript
mockProgramRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
  archive: vi.fn(),
  saveProgramAggregate: vi.fn(),
}
```

### Mock Successful Program Fetch

```typescript
const mockProgram: Program = {
  id: 'program-123',
  organizationId: ctx.organizationId,
  name: 'Test Program',
  description: null,
  athleteId: null,
  isTemplate: false,
  weeks: [/* ... */],
}

vi.mocked(mockProgramRepository.findById).mockReturnValue(
  okAsync(mockProgram)
)
```

### Mock Aggregate Save

```typescript
vi.mocked(mockProgramRepository.saveProgramAggregate).mockImplementation(
  (_, program) => okAsync(program)
)
```

## Factory Patterns

### Program with Weeks and Sessions

```typescript
export function createProgramWithStructure(overrides = {}) {
  return {
    id: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    name: faker.lorem.words(2),
    description: null,
    athleteId: null,
    isTemplate: false,
    weeks: [
      {
        id: faker.string.uuid(),
        name: 'Week 1',
        orderIndex: 0,
        sessions: [
          {
            id: faker.string.uuid(),
            name: 'Day 1',
            orderIndex: 0,
            exerciseGroups: [],
          },
        ],
      },
    ],
    ...overrides,
  }
}
```

## Testing Checklist

For each use case test file:

- [ ] Happy path (main success scenario)
- [ ] Authorization (viewer role → forbidden)
- [ ] Not found (program/entity missing)
- [ ] Validation errors (domain validation)
- [ ] Repository errors (DB failures)
- [ ] Edge cases (boundaries, special states)
- [ ] Mock verification (correct calls made)
- [ ] ResultAsync assertions (`isOk()`, `isErr()`)
- [ ] Type-safe error handling

## Coverage Goals

- **Per use case**: 6-10 tests
- **Per test file**: ~150-250 lines
- **Total coverage**: 80%+ statement coverage (CLAUDE.md requirement)

## Next Steps

Generate remaining test files following these patterns:
1. Copy structure from existing tests
2. Adapt mocks for specific use case
3. Cover all 6 scenario types
4. Verify repository interactions
5. Run tests: `pnpm test`
