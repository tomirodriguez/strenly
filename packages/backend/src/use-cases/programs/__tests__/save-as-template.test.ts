import { createProgram } from '@strenly/core/domain/entities/program/program'
import type { ProgramRepositoryPort } from '@strenly/core/ports/program-repository.port'
import { errAsync, okAsync } from 'neverthrow'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProgramRepositoryMock } from '../../../__tests__/factories/program-repository-mock'
import { createAdminContext, createMemberContext } from '../../../__tests__/helpers/test-context'
import { makeSaveAsTemplate } from '../save-as-template'

describe('saveAsTemplate use case', () => {
	let mockProgramRepository: ProgramRepositoryPort
	let mockGenerateId: () => string

	beforeEach(() => {
		mockProgramRepository = createProgramRepositoryMock()

		// Mock ID generator
		let idCounter = 0
		mockGenerateId = vi.fn(() => `template-id-${++idCounter}`)
	})

	describe('Happy Path', () => {
		it('should save program as template with correct flags', async () => {
			const ctx = createAdminContext()
			const sourceProgramId = 'program-1'

			// Create a source program (regular program with athlete)
			const sourceProgram = createProgram({
				id: sourceProgramId,
				organizationId: ctx.organizationId,
				name: 'Athlete Program',
				description: 'Program for specific athlete',
				athleteId: 'athlete-1', // Has athlete
				isTemplate: false, // Not a template
				status: 'published',
				weeks: [
					{
						id: 'week-1',
						name: 'Week 1',
						orderIndex: 0,
						sessions: [
							{
								id: 'session-1',
								name: 'Session 1',
								orderIndex: 0,
								exerciseGroups: [],
							},
						],
					},
				],
			}).value!

			// Mock successful load and save
			vi.mocked(mockProgramRepository.loadProgramAggregate).mockReturnValue(okAsync(sourceProgram))
			vi.mocked(mockProgramRepository.saveProgramAggregate).mockReturnValue(
				okAsync({ updatedAt: new Date() }),
			)

			const saveAsTemplate = makeSaveAsTemplate({
				programRepository: mockProgramRepository,
				generateId: mockGenerateId,
			})

			const result = await saveAsTemplate({
				...ctx,
				programId: sourceProgramId,
				name: 'Strength Template',
				description: 'Reusable template for strength training',
			})

			// Assert success
			expect(result.isOk()).toBe(true)

			if (result.isOk()) {
				const template = result.value

				// Verify template flags are set correctly
				expect(template.isTemplate).toBe(true) // Marked as template
				expect(template.athleteId).toBe(null) // No athlete assigned
				expect(template.name).toBe('Strength Template')
				expect(template.status).toBe('draft') // Reset to draft

				// Verify nested structure was cloned
				expect(template.weeks).toHaveLength(1)
				expect(template.weeks[0].sessions).toHaveLength(1)

				// Verify new IDs were generated (not same as source)
				expect(template.id).not.toBe(sourceProgramId)
				expect(template.weeks[0].id).not.toBe('week-1')
			}

			// Verify repository interactions
			expect(mockProgramRepository.loadProgramAggregate).toHaveBeenCalledWith(
				expect.objectContaining({ organizationId: ctx.organizationId }),
				sourceProgramId,
			)

			expect(mockProgramRepository.saveProgramAggregate).toHaveBeenCalledWith(
				expect.objectContaining({ organizationId: ctx.organizationId }),
				expect.objectContaining({
					name: 'Strength Template',
					isTemplate: true,
					athleteId: null,
				}),
			)
		})
	})

	describe('Authorization', () => {
		it('should return forbidden when user lacks programs:write permission', async () => {
			const ctx = createMemberContext() // Member has no write permission

			const saveAsTemplate = makeSaveAsTemplate({
				programRepository: mockProgramRepository,
				generateId: mockGenerateId,
			})

			const result = await saveAsTemplate({
				...ctx,
				programId: 'any-program',
				name: 'Template Name',
			})

			expect(result.isErr()).toBe(true)

			if (result.isErr()) {
				expect(result.error.type).toBe('forbidden')
				expect(result.error.message).toBe('No permission to create templates')
			}

			// Should not call repository
			expect(mockProgramRepository.loadProgramAggregate).not.toHaveBeenCalled()
		})
	})

	describe('Error Delegation from duplicate-program', () => {
		it('should return not_found when source program does not exist', async () => {
			const ctx = createAdminContext()
			const nonExistentId = 'non-existent-program'

			// Mock repository returns null (not found)
			vi.mocked(mockProgramRepository.loadProgramAggregate).mockReturnValue(okAsync(null))

			const saveAsTemplate = makeSaveAsTemplate({
				programRepository: mockProgramRepository,
				generateId: mockGenerateId,
			})

			const result = await saveAsTemplate({
				...ctx,
				programId: nonExistentId,
				name: 'Template Name',
			})

			expect(result.isErr()).toBe(true)

			if (result.isErr()) {
				expect(result.error.type).toBe('not_found')
				expect(result.error.programId).toBe(nonExistentId)
			}
		})

		it('should return validation_error when duplicate-program validation fails', async () => {
			const ctx = createAdminContext()
			const sourceProgramId = 'program-2'

			// Create source program
			const sourceProgram = createProgram({
				id: sourceProgramId,
				organizationId: ctx.organizationId,
				name: 'Source Program',
				description: null,
				athleteId: null,
				isTemplate: false,
				status: 'draft',
				weeks: [],
			}).value!

			vi.mocked(mockProgramRepository.loadProgramAggregate).mockReturnValue(okAsync(sourceProgram))

			const saveAsTemplate = makeSaveAsTemplate({
				programRepository: mockProgramRepository,
				generateId: mockGenerateId,
			})

			// Try to save with invalid name (empty)
			const result = await saveAsTemplate({
				...ctx,
				programId: sourceProgramId,
				name: '', // Invalid: empty name
			})

			expect(result.isErr()).toBe(true)

			if (result.isErr()) {
				expect(result.error.type).toBe('validation_error')
				expect(result.error.message).toContain('name')
			}
		})

		it('should return repository_error when duplicate-program repository fails', async () => {
			const ctx = createAdminContext()
			const sourceProgramId = 'program-3'

			// Create source program
			const sourceProgram = createProgram({
				id: sourceProgramId,
				organizationId: ctx.organizationId,
				name: 'Source Program',
				description: null,
				athleteId: null,
				isTemplate: false,
				status: 'draft',
				weeks: [],
			}).value!

			vi.mocked(mockProgramRepository.loadProgramAggregate).mockReturnValue(okAsync(sourceProgram))

			// Mock save failure
			vi.mocked(mockProgramRepository.saveProgramAggregate).mockReturnValue(
				errAsync({ type: 'DATABASE_ERROR', message: 'Connection lost' }),
			)

			const saveAsTemplate = makeSaveAsTemplate({
				programRepository: mockProgramRepository,
				generateId: mockGenerateId,
			})

			const result = await saveAsTemplate({
				...ctx,
				programId: sourceProgramId,
				name: 'Template Name',
			})

			expect(result.isErr()).toBe(true)

			if (result.isErr()) {
				expect(result.error.type).toBe('repository_error')
				expect(result.error.message).toBe('Connection lost')
			}
		})
	})
})
