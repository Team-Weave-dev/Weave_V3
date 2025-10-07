/**
 * TaskService Unit Tests
 *
 * Tests for the Task domain service
 */

import { TaskService } from '../TaskService'
import { StorageManager } from '../../core/StorageManager'
import { LocalStorageAdapter } from '../../adapters/LocalStorageAdapter'
import type { Task } from '../../types/entities/task'

describe('TaskService', () => {
  let adapter: LocalStorageAdapter
  let storage: StorageManager
  let service: TaskService
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
    service = new TaskService(storage)
  })

  describe('constructor', () => {
    it('should create TaskService instance', () => {
      expect(service).toBeInstanceOf(TaskService)
    })
  })

  describe('basic CRUD operations', () => {
    it('should create a new task', async () => {
      const taskData = {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Test Task',
        description: 'Task description',
        status: 'pending' as const,
        priority: 'medium' as const,
      }

      const task = await service.create(taskData)

      expect(task).toMatchObject(taskData)
      expect(task.id).toBeDefined()
      expect(task.createdAt).toBeDefined()
      expect(task.updatedAt).toBeDefined()
    })

    it('should get task by ID', async () => {
      const taskData = {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Test Task',
        status: 'pending' as const,
        priority: 'medium' as const,
      }

      const created = await service.create(taskData)
      const retrieved = await service.getById(created.id)

      expect(retrieved).toEqual(created)
    })

    it('should update a task', async () => {
      const taskData = {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Test Task',
        status: 'pending' as const,
        priority: 'medium' as const,
      }

      const created = await service.create(taskData)
      const updated = await service.update(created.id, { title: 'Updated Task' })

      expect(updated).not.toBeNull()
      expect(updated?.title).toBe('Updated Task')
    })

    it('should delete a task', async () => {
      const taskData = {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Test Task',
        status: 'pending' as const,
        priority: 'medium' as const,
      }

      const created = await service.create(taskData)
      const deleted = await service.delete(created.id)

      expect(deleted).toBe(true)
      expect(await service.getById(created.id)).toBeNull()
    })
  })

  describe('query methods', () => {
    beforeEach(async () => {
      await service.create({
        userId: 'user-1',
        projectId: 'project-a',
        title: 'Task 1',
        status: 'pending',
        priority: 'high',
      })

      await service.create({
        userId: 'user-2',
        projectId: 'project-b',
        title: 'Task 2',
        status: 'in_progress',
        priority: 'medium',
      })

      await service.create({
        userId: 'user-1',
        projectId: 'project-a',
        title: 'Task 3',
        status: 'completed',
        priority: 'low',
      })
    })

    it('should get tasks by project ID', async () => {
      const tasks = await service.getTasksByProject('project-a')

      expect(tasks).toHaveLength(2)
      expect(tasks.every(t => t.projectId === 'project-a')).toBe(true)
    })

    it('should get tasks by user ID', async () => {
      const tasks = await service.getTasksByUser('user-1')

      expect(tasks).toHaveLength(2)
      expect(tasks.every(t => t.userId === 'user-1')).toBe(true)
    })

    it('should get tasks by status', async () => {
      const pending = await service.getTasksByStatus('pending')
      const inProgress = await service.getTasksByStatus('in_progress')
      const completed = await service.getTasksByStatus('completed')

      expect(pending).toHaveLength(1)
      expect(inProgress).toHaveLength(1)
      expect(completed).toHaveLength(1)
    })

    it('should get tasks by priority', async () => {
      const high = await service.getTasksByPriority('high')
      const medium = await service.getTasksByPriority('medium')

      expect(high).toHaveLength(1)
      expect(medium).toHaveLength(1)
    })

    it('should get active tasks', async () => {
      const active = await service.getActiveTasks()

      expect(active).toHaveLength(2)
      expect(active.every(t => t.status === 'pending' || t.status === 'in_progress')).toBe(true)
    })

    it('should get urgent tasks', async () => {
      const urgent = await service.getUrgentTasks()

      expect(urgent).toHaveLength(1)
      expect(urgent[0].priority).toBe('high')
    })
  })

  describe('status management', () => {
    it('should update task status', async () => {
      const task = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
      })

      const updated = await service.updateStatus(task.id, 'in_progress')

      expect(updated).not.toBeNull()
      expect(updated?.status).toBe('in_progress')
    })

    it('should complete a task and set completedAt', async () => {
      const task = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
      })

      const completed = await service.completeTask(task.id)

      expect(completed).not.toBeNull()
      expect(completed?.status).toBe('completed')
      expect(completed?.completedAt).toBeDefined()
    })

    it('should start a task and set startDate', async () => {
      const task = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Test Task',
        status: 'pending',
        priority: 'medium',
      })

      const started = await service.startTask(task.id)

      expect(started).not.toBeNull()
      expect(started?.status).toBe('in_progress')
      expect(started?.startDate).toBeDefined()
    })

    it('should cancel a task', async () => {
      const task = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Test Task',
        status: 'in_progress',
        priority: 'medium',
      })

      const cancelled = await service.cancelTask(task.id)

      expect(cancelled).not.toBeNull()
      expect(cancelled?.status).toBe('cancelled')
    })
  })

  describe('subtask management', () => {
    it('should add a subtask to a parent task', async () => {
      const parent = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Parent Task',
        status: 'pending',
        priority: 'high',
      })

      const subtask = await service.addSubtask(parent.id, {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Subtask 1',
        status: 'pending',
        priority: 'medium',
      })

      expect(subtask).toBeDefined()
      expect(subtask.parentTaskId).toBe(parent.id)

      const updated = await service.getById(parent.id)
      expect(updated?.subtasks).toContain(subtask.id)
    })

    it('should remove a subtask', async () => {
      const parent = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Parent Task',
        status: 'pending',
        priority: 'high',
      })

      const subtask = await service.addSubtask(parent.id, {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Subtask 1',
        status: 'pending',
        priority: 'medium',
      })

      const removed = await service.removeSubtask(parent.id, subtask.id)

      expect(removed).toBe(true)
      expect(await service.getById(subtask.id)).toBeNull()

      const updated = await service.getById(parent.id)
      expect(updated?.subtasks).not.toContain(subtask.id)
    })

    it('should get subtasks with data', async () => {
      const parent = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Parent Task',
        status: 'pending',
        priority: 'high',
      })

      await service.addSubtask(parent.id, {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Subtask 1',
        status: 'pending',
        priority: 'medium',
      })

      await service.addSubtask(parent.id, {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Subtask 2',
        status: 'pending',
        priority: 'low',
      })

      const subtasks = await service.getSubtasksWithData(parent.id)

      expect(subtasks).toHaveLength(2)
      expect(subtasks[0].title).toBe('Subtask 1')
      expect(subtasks[1].title).toBe('Subtask 2')
    })

    it('should throw error when adding subtask to non-existent parent', async () => {
      await expect(
        service.addSubtask('non-existent', {
          userId: 'user-1',
          projectId: 'project-1',
          title: 'Subtask',
          status: 'pending',
          priority: 'medium',
        })
      ).rejects.toThrow('Parent task non-existent not found')
    })
  })

  describe('dependency management', () => {
    it('should add a dependency', async () => {
      const task1 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 1',
        status: 'pending',
        priority: 'high',
      })

      const task2 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 2',
        status: 'pending',
        priority: 'medium',
      })

      const updated = await service.addDependency(task2.id, task1.id)

      expect(updated).not.toBeNull()
      expect(updated?.dependencies).toContain(task1.id)
    })

    it('should remove a dependency', async () => {
      const task1 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 1',
        status: 'pending',
        priority: 'high',
      })

      const task2 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 2',
        status: 'pending',
        priority: 'medium',
      })

      await service.addDependency(task2.id, task1.id)
      const updated = await service.removeDependency(task2.id, task1.id)

      expect(updated).not.toBeNull()
      expect(updated?.dependencies).not.toContain(task1.id)
    })

    it('should prevent self-dependency', async () => {
      const task = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 1',
        status: 'pending',
        priority: 'high',
      })

      await expect(service.addDependency(task.id, task.id)).rejects.toThrow(
        'Task cannot depend on itself'
      )
    })

    it('should detect circular dependencies', async () => {
      const task1 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 1',
        status: 'pending',
        priority: 'high',
      })

      const task2 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 2',
        status: 'pending',
        priority: 'medium',
      })

      const task3 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 3',
        status: 'pending',
        priority: 'low',
      })

      // Create dependency chain: task3 -> task2 -> task1
      await service.addDependency(task3.id, task2.id)
      await service.addDependency(task2.id, task1.id)

      // Try to create circular dependency: task1 -> task3
      await expect(service.addDependency(task1.id, task3.id)).rejects.toThrow(
        'Circular dependency detected'
      )
    })

    it('should check if task can be started based on dependencies', async () => {
      const task1 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 1',
        status: 'pending',
        priority: 'high',
      })

      const task2 = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Task 2',
        status: 'pending',
        priority: 'medium',
      })

      await service.addDependency(task2.id, task1.id)

      // Task 2 cannot start yet (task 1 not completed)
      expect(await service.canStartTask(task2.id)).toBe(false)

      // Complete task 1
      await service.completeTask(task1.id)

      // Now task 2 can start
      expect(await service.canStartTask(task2.id)).toBe(true)
    })
  })

  describe('date-based queries', () => {
    beforeEach(async () => {
      const now = new Date()
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)

      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)

      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Overdue Task',
        status: 'pending',
        priority: 'high',
        dueDate: yesterday.toISOString(),
      })

      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Today Task',
        status: 'pending',
        priority: 'medium',
        dueDate: now.toISOString(),
      })

      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Tomorrow Task',
        status: 'pending',
        priority: 'low',
        dueDate: tomorrow.toISOString(),
      })

      await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Next Week Task',
        status: 'pending',
        priority: 'low',
        dueDate: nextWeek.toISOString(),
      })
    })

    it('should get overdue tasks', async () => {
      const overdue = await service.getOverdueTasks()

      expect(overdue).toHaveLength(1)
      expect(overdue[0].title).toBe('Overdue Task')
    })

    it('should get tasks due today', async () => {
      const today = await service.getTasksDueToday()

      expect(today.length).toBeGreaterThanOrEqual(1)
      expect(today.some(t => t.title === 'Today Task')).toBe(true)
    })

    it('should get tasks due this week', async () => {
      const thisWeek = await service.getTasksDueThisWeek()

      expect(thisWeek.length).toBeGreaterThanOrEqual(2)
    })

    it('should not include completed tasks in overdue', async () => {
      const task = await service.create({
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Completed Overdue',
        status: 'completed',
        priority: 'high',
        dueDate: '2020-01-01T00:00:00.000Z',
      })

      const overdue = await service.getOverdueTasks()

      expect(overdue.some(t => t.id === task.id)).toBe(false)
    })
  })

  describe('recurring tasks', () => {
    it('should create a recurring task', async () => {
      const taskData = {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Daily Standup',
        status: 'pending' as const,
        priority: 'medium' as const,
        dueDate: new Date().toISOString(),
        recurring: {
          pattern: 'daily' as const,
          interval: 1,
        },
      }

      const task = await service.createRecurringTask(taskData)

      expect(task).toBeDefined()
      expect(task.recurring).toEqual(taskData.recurring)
    })

    it('should generate next instance of a daily recurring task', async () => {
      const today = new Date()
      const taskData = {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Daily Task',
        status: 'pending' as const,
        priority: 'medium' as const,
        dueDate: today.toISOString(),
        recurring: {
          pattern: 'daily' as const,
          interval: 1,
        },
      }

      const originalTask = await service.createRecurringTask(taskData)
      const nextTask = await service.generateNextRecurringTask(originalTask.id)

      expect(nextTask).toBeDefined()
      expect(nextTask?.title).toBe(originalTask.title)
      expect(nextTask?.status).toBe('pending')

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(new Date(nextTask!.dueDate!).getDate()).toBe(tomorrow.getDate())
    })

    it('should not generate next instance after end date', async () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const taskData = {
        userId: 'user-1',
        projectId: 'project-1',
        title: 'Ended Recurring Task',
        status: 'pending' as const,
        priority: 'medium' as const,
        dueDate: yesterday.toISOString(),
        recurring: {
          pattern: 'daily' as const,
          interval: 1,
          endDate: yesterday.toISOString(),
        },
      }

      const task = await service.createRecurringTask(taskData)
      const nextTask = await service.generateNextRecurringTask(task.id)

      expect(nextTask).toBeNull()
    })
  })
})
