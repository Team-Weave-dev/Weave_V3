/**
 * ProjectService Unit Tests
 *
 * Tests for the Project domain service
 */

import { ProjectService } from '../ProjectService'
import { StorageManager } from '../../core/StorageManager'
import { LocalStorageAdapter } from '../../adapters/LocalStorageAdapter'
import type { Project, WBSTask, DocumentInfo } from '../../types/entities/project'

describe('ProjectService', () => {
  let adapter: LocalStorageAdapter
  let storage: StorageManager
  let service: ProjectService
  let mockLocalStorage: Record<string, string>

  beforeEach(() => {
    // Reset mock localStorage
    mockLocalStorage = {}

    ;(global.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      return mockLocalStorage[key] ?? null
    })

    ;(global.localStorage.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => {
        mockLocalStorage[key] = value
      }
    )

    ;(global.localStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
      delete mockLocalStorage[key]
    })

    ;(global.localStorage.clear as jest.Mock).mockImplementation(() => {
      mockLocalStorage = {}
    })

    Object.defineProperty(global.localStorage, 'length', {
      get: () => Object.keys(mockLocalStorage).length,
      configurable: true,
    })

    ;(global.localStorage.key as jest.Mock).mockImplementation((index: number) => {
      const keys = Object.keys(mockLocalStorage)
      return keys[index] ?? null
    })

    // Create adapter, storage, and service
    adapter = new LocalStorageAdapter({ prefix: 'test_' })
    storage = new StorageManager(adapter)
    service = new ProjectService(storage)
  })

  describe('constructor', () => {
    it('should create ProjectService instance', () => {
      expect(service).toBeInstanceOf(ProjectService)
    })
  })

  describe('basic CRUD operations', () => {
    it('should create a new project', async () => {
      const projectData = {
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning' as const,
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      }

      const project = await service.create(projectData)

      expect(project).toMatchObject(projectData)
      expect(project.id).toBeDefined()
      expect(project.createdAt).toBeDefined()
      expect(project.updatedAt).toBeDefined()
    })

    it('should get project by ID', async () => {
      const projectData = {
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning' as const,
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      }

      const created = await service.create(projectData)
      const retrieved = await service.getById(created.id)

      expect(retrieved).toEqual(created)
    })

    it('should return null for non-existent project', async () => {
      const retrieved = await service.getById('non-existent-id')
      expect(retrieved).toBeNull()
    })

    it('should get all projects', async () => {
      const projectData1 = {
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Project 1',
        status: 'planning' as const,
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      }

      const projectData2 = {
        userId: 'user-1',
        no: 'PRJ-002',
        name: 'Project 2',
        status: 'in_progress' as const,
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      }

      await service.create(projectData1)
      await service.create(projectData2)

      const projects = await service.getAll()

      expect(projects).toHaveLength(2)
    })

    it('should update a project', async () => {
      const projectData = {
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning' as const,
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      }

      const created = await service.create(projectData)
      const updated = await service.update(created.id, { name: 'Updated Project' })

      expect(updated).not.toBeNull()
      expect(updated?.name).toBe('Updated Project')
      expect(updated?.id).toBe(created.id)
    })

    it('should delete a project', async () => {
      const projectData = {
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning' as const,
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      }

      const created = await service.create(projectData)
      const deleted = await service.delete(created.id)

      expect(deleted).toBe(true)
      expect(await service.getById(created.id)).toBeNull()
    })
  })

  describe('query methods', () => {
    it('should get projects by status', async () => {
      await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Planning Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      await service.create({
        userId: 'user-1',
        no: 'PRJ-002',
        name: 'Active Project',
        status: 'in_progress',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const planningProjects = await service.getProjectsByStatus('planning')
      const activeProjects = await service.getProjectsByStatus('in_progress')

      expect(planningProjects).toHaveLength(1)
      expect(activeProjects).toHaveLength(1)
      expect(planningProjects[0].name).toBe('Planning Project')
    })

    it('should get projects by client ID', async () => {
      await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Client A Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        clientId: 'client-a',
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      await service.create({
        userId: 'user-1',
        no: 'PRJ-002',
        name: 'Client B Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        clientId: 'client-b',
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const clientAProjects = await service.getProjectsByClient('client-a')

      expect(clientAProjects).toHaveLength(1)
      expect(clientAProjects[0].name).toBe('Client A Project')
    })

    it('should search projects by query', async () => {
      await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'React Development',
        description: 'Building a React app',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      await service.create({
        userId: 'user-1',
        no: 'PRJ-002',
        name: 'Vue Project',
        description: 'Building a Vue app',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const reactProjects = await service.searchProjects('React')
      const buildingProjects = await service.searchProjects('Building')

      expect(reactProjects).toHaveLength(1)
      expect(buildingProjects).toHaveLength(2)
    })
  })

  describe('WBS management', () => {
    it('should add a WBS task to a project', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const taskData = {
        name: 'Design Phase',
        status: 'pending' as const,
      }

      const updated = await service.addWBSTask(project.id, taskData)

      expect(updated).not.toBeNull()
      expect(updated?.wbsTasks).toHaveLength(1)
      expect(updated?.wbsTasks[0].name).toBe('Design Phase')
      expect(updated?.wbsTasks[0].id).toBeDefined()
      expect(updated?.wbsTasks[0].order).toBe(0)
    })

    it('should update a WBS task', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const withTask = await service.addWBSTask(project.id, {
        name: 'Design Phase',
        status: 'pending',
      })

      const taskId = withTask?.wbsTasks[0].id!
      const updated = await service.updateWBSTask(project.id, taskId, {
        status: 'in_progress',
      })

      expect(updated).not.toBeNull()
      expect(updated?.wbsTasks[0].status).toBe('in_progress')
      expect(updated?.wbsTasks[0].startedAt).toBeDefined()
    })

    it('should remove a WBS task', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const withTask = await service.addWBSTask(project.id, {
        name: 'Design Phase',
        status: 'pending',
      })

      const taskId = withTask?.wbsTasks[0].id!
      const updated = await service.removeWBSTask(project.id, taskId)

      expect(updated).not.toBeNull()
      expect(updated?.wbsTasks).toHaveLength(0)
    })

    it('should calculate project progress from WBS tasks', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      // Add 4 tasks
      let updated = await service.addWBSTask(project.id, { name: 'Task 1', status: 'pending' })
      updated = await service.addWBSTask(project.id, { name: 'Task 2', status: 'pending' })
      updated = await service.addWBSTask(project.id, { name: 'Task 3', status: 'pending' })
      updated = await service.addWBSTask(project.id, { name: 'Task 4', status: 'pending' })

      // Complete 2 tasks, 1 in progress
      const task1Id = updated?.wbsTasks[0].id!
      const task2Id = updated?.wbsTasks[1].id!
      const task3Id = updated?.wbsTasks[2].id!

      await service.updateWBSTask(project.id, task1Id, { status: 'completed' })
      await service.updateWBSTask(project.id, task2Id, { status: 'completed' })
      await service.updateWBSTask(project.id, task3Id, { status: 'in_progress' })

      const progress = await service.calculateProgress(project.id)

      // 2 completed (100%) + 1 in_progress (50%) = 250 / 400 = 62.5% => 63% (rounded)
      expect(progress).toBe(63)
    })
  })

  describe('payment management', () => {
    it('should update payment status', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const updated = await service.updatePaymentStatus(project.id, 'advance_completed')

      expect(updated).not.toBeNull()
      expect(updated?.paymentStatus).toBe('advance_completed')
    })

    it('should update settlement method', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const updated = await service.updateSettlementMethod(project.id, 'advance_final')

      expect(updated).not.toBeNull()
      expect(updated?.settlementMethod).toBe('advance_final')
    })

    it('should update payment progress', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const updated = await service.updatePaymentProgress(project.id, 75)

      expect(updated).not.toBeNull()
      expect(updated?.paymentProgress).toBe(75)
    })

    it('should clamp payment progress to 0-100', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const updated1 = await service.updatePaymentProgress(project.id, 150)
      const updated2 = await service.updatePaymentProgress(project.id, -10)

      expect(updated1?.paymentProgress).toBe(100)
      expect(updated2?.paymentProgress).toBe(0)
    })
  })

  describe('document management', () => {
    it('should add a document to a project', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const document: DocumentInfo = {
        id: 'doc-1',
        name: 'Contract',
        type: 'contract',
        status: 'draft',
        savedAt: new Date().toISOString(),
      }

      const updated = await service.addDocument(project.id, document)

      expect(updated).not.toBeNull()
      expect(updated?.documents).toHaveLength(1)
      expect(updated?.hasDocuments).toBe(true)
      expect(updated?.hasContract).toBe(true)
    })

    it('should remove a document from a project', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const document: DocumentInfo = {
        id: 'doc-1',
        name: 'Contract',
        type: 'contract',
        status: 'draft',
        savedAt: new Date().toISOString(),
      }

      const withDoc = await service.addDocument(project.id, document)
      const updated = await service.removeDocument(project.id, 'doc-1')

      expect(updated).not.toBeNull()
      expect(updated?.documents).toHaveLength(0)
      expect(updated?.hasDocuments).toBe(false)
      expect(updated?.hasContract).toBe(false)
    })
  })

  describe('status management', () => {
    it('should update project status', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const updated = await service.updateStatus(project.id, 'in_progress')

      expect(updated).not.toBeNull()
      expect(updated?.status).toBe('in_progress')
    })

    it('should complete a project', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'in_progress',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const updated = await service.completeProject(project.id)

      expect(updated).not.toBeNull()
      expect(updated?.status).toBe('completed')
      expect(updated?.progress).toBe(100)
    })

    it('should cancel a project', async () => {
      const project = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Test Project',
        status: 'in_progress',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const updated = await service.cancelProject(project.id)

      expect(updated).not.toBeNull()
      expect(updated?.status).toBe('cancelled')
    })
  })

  describe('advanced queries', () => {
    beforeEach(async () => {
      // Create test data
      await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Active Project 1',
        status: 'in_progress',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-12-31T23:59:59.999Z',
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      await service.create({
        userId: 'user-1',
        no: 'PRJ-002',
        name: 'Completed Project',
        status: 'completed',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      await service.create({
        userId: 'user-1',
        no: 'PRJ-003',
        name: 'Overdue Project',
        status: 'in_progress',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-06-30T23:59:59.999Z',
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })
    })

    it('should get active projects', async () => {
      const active = await service.getActiveProjects()

      expect(active).toHaveLength(2)
      expect(active.every(p => p.status === 'in_progress' || p.status === 'review')).toBe(true)
    })

    it('should get completed projects', async () => {
      const completed = await service.getCompletedProjects()

      expect(completed).toHaveLength(1)
      expect(completed[0].status).toBe('completed')
    })

    it('should get projects by date range', async () => {
      const projects = await service.getProjectsByDateRange(
        '2024-01-01T00:00:00.000Z',
        '2024-12-31T23:59:59.999Z'
      )

      expect(projects).toHaveLength(2)
    })

    it('should get overdue projects', async () => {
      const overdue = await service.getOverdueProjects()

      expect(overdue).toHaveLength(1)
      expect(overdue[0].name).toBe('Overdue Project')
    })
  })

  describe('batch operations', () => {
    it('should get multiple projects by IDs', async () => {
      const p1 = await service.create({
        userId: 'user-1',
        no: 'PRJ-001',
        name: 'Project 1',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const p2 = await service.create({
        userId: 'user-1',
        no: 'PRJ-002',
        name: 'Project 2',
        status: 'planning',
        progress: 0,
        hasContract: false,
        hasBilling: false,
        hasDocuments: false,
        registrationDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        wbsTasks: [],
      })

      const projects = await service.getByIds([p1.id, p2.id])

      expect(projects).toHaveLength(2)
    })

    it('should create multiple projects at once', async () => {
      const projectsData = [
        {
          userId: 'user-1',
          no: 'PRJ-001',
          name: 'Project 1',
          status: 'planning' as const,
          progress: 0,
          hasContract: false,
          hasBilling: false,
          hasDocuments: false,
          registrationDate: new Date().toISOString(),
          modifiedDate: new Date().toISOString(),
          wbsTasks: [],
        },
        {
          userId: 'user-1',
          no: 'PRJ-002',
          name: 'Project 2',
          status: 'planning' as const,
          progress: 0,
          hasContract: false,
          hasBilling: false,
          hasDocuments: false,
          registrationDate: new Date().toISOString(),
          modifiedDate: new Date().toISOString(),
          wbsTasks: [],
        },
      ]

      const created = await service.createMany(projectsData)

      expect(created).toHaveLength(2)
      expect(created.every(p => p.id && p.createdAt && p.updatedAt)).toBe(true)
    })
  })
})
