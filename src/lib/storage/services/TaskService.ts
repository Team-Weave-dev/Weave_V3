/**
 * Task Service
 *
 * This file provides Task domain service with recurring task support.
 */

import { BaseService } from './BaseService';
import type { StorageManager } from '../core/StorageManager';
import type { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority, TaskRecurring } from '../types/entities/task';
import { isTask } from '../types/entities/task';
import { STORAGE_KEYS } from '../config';

/**
 * Task service class
 * Manages tasks with recurring support
 */
export class TaskService extends BaseService<Task> {
  protected entityKey = STORAGE_KEYS.TASKS;

  constructor(storage: StorageManager) {
    super(storage);
  }

  /**
   * Type guard implementation
   */
  protected isValidEntity(data: unknown): data is Task {
    return isTask(data);
  }

  // ============================================================================
  // Basic Query Methods
  // ============================================================================

  /**
   * Get tasks by project ID
   */
  async getTasksByProject(projectId: string): Promise<Task[]> {
    return this.find((task) => task.projectId === projectId);
  }

  /**
   * Get tasks by user ID
   */
  async getTasksByUser(userId: string): Promise<Task[]> {
    return this.find((task) => task.userId === userId);
  }

  /**
   * Get tasks by assignee ID
   */
  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return this.find((task) => task.assigneeId === assigneeId);
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    return this.find((task) => task.status === status);
  }

  /**
   * Get tasks by priority
   */
  async getTasksByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.find((task) => task.priority === priority);
  }

  /**
   * Get tasks by parent task ID (subtasks)
   */
  async getSubtasks(parentTaskId: string): Promise<Task[]> {
    return this.find((task) => task.parentTaskId === parentTaskId);
  }

  // ============================================================================
  // Advanced Query Methods
  // ============================================================================

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<Task[]> {
    const now = this.getCurrentTimestamp();
    return this.find((task) => {
      if (!task.dueDate) return false;
      return task.dueDate < now && task.status !== 'completed' && task.status !== 'cancelled';
    });
  }

  /**
   * Get tasks due today
   */
  async getTasksDueToday(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString();
    const tomorrowStr = tomorrow.toISOString();

    return this.find((task) => {
      if (!task.dueDate) return false;
      return task.dueDate >= todayStr && task.dueDate < tomorrowStr && task.status !== 'completed';
    });
  }

  /**
   * Get tasks due this week
   */
  async getTasksDueThisWeek(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const todayStr = today.toISOString();
    const nextWeekStr = nextWeek.toISOString();

    return this.find((task) => {
      if (!task.dueDate) return false;
      return task.dueDate >= todayStr && task.dueDate < nextWeekStr && task.status !== 'completed';
    });
  }

  /**
   * Get tasks by date range
   */
  async getTasksByDateRange(startDate: string, endDate: string): Promise<Task[]> {
    return this.find((task) => {
      if (!task.dueDate) return false;
      return task.dueDate >= startDate && task.dueDate <= endDate;
    });
  }

  /**
   * Get completed tasks
   */
  async getCompletedTasks(): Promise<Task[]> {
    return this.getTasksByStatus('completed');
  }

  /**
   * Get active tasks (pending or in_progress)
   */
  async getActiveTasks(): Promise<Task[]> {
    return this.find((task) => task.status === 'pending' || task.status === 'in_progress');
  }

  /**
   * Get urgent tasks (high or urgent priority, not completed)
   */
  async getUrgentTasks(): Promise<Task[]> {
    return this.find((task) => {
      const isUrgent = task.priority === 'high' || task.priority === 'urgent';
      const isNotCompleted = task.status !== 'completed' && task.status !== 'cancelled';
      return isUrgent && isNotCompleted;
    });
  }

  // ============================================================================
  // Task Status Management
  // ============================================================================

  /**
   * Update task status
   */
  async updateStatus(taskId: string, status: TaskStatus): Promise<Task | null> {
    const updates: Partial<Task> = { status };

    // Update completion timestamp if completing
    if (status === 'completed') {
      updates.completedAt = this.getCurrentTimestamp();
    }

    return this.update(taskId, updates);
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string): Promise<Task | null> {
    return this.updateStatus(taskId, 'completed');
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<Task | null> {
    return this.updateStatus(taskId, 'cancelled');
  }

  /**
   * Start a task
   */
  async startTask(taskId: string): Promise<Task | null> {
    const updates: Partial<Task> = {
      status: 'in_progress',
    };

    const task = await this.getById(taskId);
    if (task && !task.startDate) {
      updates.startDate = this.getCurrentTimestamp();
    }

    return this.update(taskId, updates);
  }

  // ============================================================================
  // Recurring Task Management
  // ============================================================================

  /**
   * Create a recurring task
   * Creates initial task and sets up recurrence configuration
   */
  async createRecurringTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { recurring: TaskRecurring }): Promise<Task> {
    // Validate recurring configuration
    if (!data.recurring || !data.recurring.pattern) {
      throw new Error('Recurring task must have valid recurring configuration');
    }

    return this.create(data);
  }

  /**
   * Generate next instance of a recurring task
   * Creates a new task based on recurring pattern
   */
  async generateNextRecurringTask(taskId: string): Promise<Task | null> {
    const task = await this.getById(taskId);
    if (!task || !task.recurring) {
      return null;
    }

    const { recurring } = task;

    // Calculate next due date
    const nextDueDate = this.calculateNextDueDate(task.dueDate || this.getCurrentTimestamp(), recurring);

    // Check if we should create next instance
    if (recurring.endDate && nextDueDate > recurring.endDate) {
      return null; // Recurrence has ended
    }

    // Create new task instance
    const newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      ...task,
      dueDate: nextDueDate,
      status: 'pending',
      completedAt: undefined,
      startDate: undefined,
    };

    return this.create(newTaskData);
  }

  /**
   * Calculate next due date based on recurring pattern
   */
  private calculateNextDueDate(currentDueDate: string, recurring: TaskRecurring): string {
    const current = new Date(currentDueDate);
    const interval = recurring.interval || 1;

    switch (recurring.pattern) {
      case 'daily':
        current.setDate(current.getDate() + interval);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7 * interval);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + interval);
        break;
      case 'yearly':
        current.setFullYear(current.getFullYear() + interval);
        break;
    }

    return current.toISOString();
  }

  // ============================================================================
  // Subtask Management
  // ============================================================================

  /**
   * Add a subtask to a parent task
   */
  async addSubtask(parentTaskId: string, subtaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'parentTaskId'>): Promise<Task> {
    const parent = await this.getById(parentTaskId);
    if (!parent) {
      throw new Error(`Parent task ${parentTaskId} not found`);
    }

    const subtask = await this.create({
      ...subtaskData,
      parentTaskId,
    });

    // Update parent's subtasks array
    const subtasks = parent.subtasks || [];
    await this.update(parentTaskId, {
      subtasks: [...subtasks, subtask.id],
    });

    return subtask;
  }

  /**
   * Remove a subtask from a parent task
   */
  async removeSubtask(parentTaskId: string, subtaskId: string): Promise<boolean> {
    const parent = await this.getById(parentTaskId);
    if (!parent) return false;

    // Remove from parent's subtasks array
    const subtasks = parent.subtasks || [];
    const updatedSubtasks = subtasks.filter((id) => id !== subtaskId);

    await this.update(parentTaskId, {
      subtasks: updatedSubtasks,
    });

    // Delete the subtask
    return this.delete(subtaskId);
  }

  /**
   * Get all subtasks with their data
   */
  async getSubtasksWithData(parentTaskId: string): Promise<Task[]> {
    const parent = await this.getById(parentTaskId);
    if (!parent || !parent.subtasks || parent.subtasks.length === 0) {
      return [];
    }

    return this.getByIds(parent.subtasks);
  }

  // ============================================================================
  // Dependency Management
  // ============================================================================

  /**
   * Add a dependency to a task
   */
  async addDependency(taskId: string, dependencyId: string): Promise<Task | null> {
    const task = await this.getById(taskId);
    if (!task) return null;

    // Check if dependency exists
    const dependency = await this.getById(dependencyId);
    if (!dependency) {
      throw new Error(`Dependency task ${dependencyId} not found`);
    }

    const dependencies = task.dependencies || [];
    if (dependencies.includes(dependencyId)) {
      return task; // Already exists
    }

    return this.update(taskId, {
      dependencies: [...dependencies, dependencyId],
    });
  }

  /**
   * Remove a dependency from a task
   */
  async removeDependency(taskId: string, dependencyId: string): Promise<Task | null> {
    const task = await this.getById(taskId);
    if (!task) return null;

    const dependencies = task.dependencies || [];
    const updatedDependencies = dependencies.filter((id) => id !== dependencyId);

    return this.update(taskId, {
      dependencies: updatedDependencies,
    });
  }

  /**
   * Get all dependencies with their data
   */
  async getDependenciesWithData(taskId: string): Promise<Task[]> {
    const task = await this.getById(taskId);
    if (!task || !task.dependencies || task.dependencies.length === 0) {
      return [];
    }

    return this.getByIds(task.dependencies);
  }

  /**
   * Check if task can be started (all dependencies completed)
   */
  async canStartTask(taskId: string): Promise<boolean> {
    const dependencies = await this.getDependenciesWithData(taskId);
    return dependencies.every((dep) => dep.status === 'completed');
  }
}
