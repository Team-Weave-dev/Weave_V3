/**
 * Task Service
 *
 * This file provides Task domain service with recurring task support.
 */

import { BaseService } from './BaseService';
import type { StorageManager } from '../core/StorageManager';
import type { Task, TaskStatus, TaskPriority, TaskRecurring } from '../types/entities/task';
import { isTask } from '../types/entities/task';
import { STORAGE_KEYS } from '../config';
import type { CreateActivityLogInput } from '../types/entities/activity-log';

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
  // Activity Logging
  // ============================================================================

  /**
   * Format date for activity log messages
   * - All-day tasks (00:00 time): YYYY-MM-DD (date only)
   * - Timed tasks: YYYY-MM-DD HH:MM (date and time)
   */
  private formatDateForLog(isoDate: string | undefined): string {
    if (!isoDate) return '없음';

    try {
      const date = new Date(isoDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = date.getHours();
      const minutes = date.getMinutes();

      // If time is 00:00, treat as all-day task and show date only
      if (hours === 0 && minutes === 0) {
        return `${year}-${month}-${day}`;
      }

      // For timed tasks, show date and time
      const hoursStr = String(hours).padStart(2, '0');
      const minutesStr = String(minutes).padStart(2, '0');
      return `${year}-${month}-${day} ${hoursStr}:${minutesStr}`;
    } catch {
      return isoDate;
    }
  }

  /**
   * Add Korean particle based on whether the last character has a final consonant (받침)
   * @param word - The word to add particle to
   * @param withBatchim - Particle to use if word has 받침 (e.g., "을", "이")
   * @param withoutBatchim - Particle to use if word has no 받침 (e.g., "를", "가")
   * @returns Word with appropriate particle
   */
  private addKoreanParticle(word: string, withBatchim: string, withoutBatchim: string): string {
    if (!word) return word;

    const lastChar = word.charAt(word.length - 1);
    const code = lastChar.charCodeAt(0);

    // Check if it's a Korean character (가-힣)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      // Calculate if it has 받침
      // Korean syllables: 초성(19) × 중성(21) × 종성(28) = 11,172 combinations
      const hasBatchim = (code - 0xAC00) % 28 !== 0;
      return word + (hasBatchim ? withBatchim : withoutBatchim);
    }

    // For non-Korean characters (English, numbers, etc.), assume 받침 for conservative choice
    return word + withBatchim;
  }

  /**
   * Get user information with dynamic import to avoid circular dependency
   */
  private async getUserInfo(userId: string): Promise<{ name: string; initials: string }> {
    try {
      const { userService } = await import('../index');
      const user = await userService.getById(userId);

      if (user) {
        // Generate initials from user name (e.g., "홍길동" -> "홍길", "John Doe" -> "JD")
        const nameParts = user.name.trim().split(/\s+/);
        let initials = '';

        if (nameParts.length === 1) {
          // Single name: take first 2 characters (e.g., "홍길동" -> "홍길")
          initials = nameParts[0].slice(0, 2);
        } else {
          // Multiple parts: take first character of each part (e.g., "John Doe" -> "JD")
          initials = nameParts.map(part => part[0]).join('').slice(0, 2);
        }

        return {
          name: user.name,
          initials: initials.toUpperCase()
        };
      }

      // Try to get name from Supabase Auth as fallback
      if (typeof window !== 'undefined') {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser?.user_metadata?.name) {
          const name = authUser.user_metadata.name;
          const nameParts = name.trim().split(/\s+/);
          let initials = '';

          if (nameParts.length === 1) {
            initials = nameParts[0].slice(0, 2);
          } else {
            initials = nameParts.map((part: string) => part[0]).join('').slice(0, 2);
          }

          return {
            name,
            initials: initials.toUpperCase()
          };
        }
      }
    } catch (error) {
      console.error('[TaskService] Failed to get user info:', error);
    }

    // Final fallback to default values
    return { name: '사용자', initials: 'U' };
  }

  /**
   * Create activity log with dynamic import to avoid circular dependency
   */
  private async createActivityLog(input: CreateActivityLogInput): Promise<void> {
    try {
      const { activityLogService } = await import('../index');
      await activityLogService.createLog(input);
    } catch (error) {
      console.error('[TaskService] Failed to create activity log:', error);
    }
  }

  // ============================================================================
  // Data Normalization
  // ============================================================================

  /**
   * Normalize task data to ensure type safety
   * Fixes common data issues from localStorage
   * @param data - Task data to normalize
   * @returns Normalized task data
   */
  private normalizeTaskData<T extends Partial<Task>>(data: T): T {
    const normalized = { ...data };

    // Normalize number fields (estimatedHours, actualHours)
    if ('estimatedHours' in normalized) {
      const value = normalized.estimatedHours;
      if (value !== null && value !== undefined) {
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          normalized.estimatedHours = isNaN(parsed) ? undefined : parsed;
        } else if (typeof value !== 'number') {
          normalized.estimatedHours = undefined;
        } else if (value < 0) {
          normalized.estimatedHours = 0;
        }
      }
    }

    if ('actualHours' in normalized) {
      const value = normalized.actualHours;
      if (value !== null && value !== undefined) {
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          normalized.actualHours = isNaN(parsed) ? undefined : parsed;
        } else if (typeof value !== 'number') {
          normalized.actualHours = undefined;
        } else if (value < 0) {
          normalized.actualHours = 0;
        }
      }
    }

    // Normalize array fields (subtasks, dependencies, tags, attachments)
    if ('subtasks' in normalized) {
      const value = normalized.subtasks;
      if (value !== null && value !== undefined) {
        if (!Array.isArray(value)) {
          normalized.subtasks = [];
        } else {
          // Ensure all items are strings
          normalized.subtasks = value.filter((item): item is string => typeof item === 'string');
        }
      }
    }

    if ('dependencies' in normalized) {
      const value = normalized.dependencies;
      if (value !== null && value !== undefined) {
        if (!Array.isArray(value)) {
          normalized.dependencies = [];
        } else {
          normalized.dependencies = value.filter((item): item is string => typeof item === 'string');
        }
      }
    }

    if ('tags' in normalized) {
      const value = normalized.tags;
      if (value !== null && value !== undefined) {
        if (!Array.isArray(value)) {
          normalized.tags = [];
        } else {
          normalized.tags = value.filter((item): item is string => typeof item === 'string');
        }
      }
    }

    if ('attachments' in normalized) {
      const value = normalized.attachments;
      if (value !== null && value !== undefined) {
        if (!Array.isArray(value)) {
          normalized.attachments = [];
        }
      }
    }

    // Normalize recurring object
    if ('recurring' in normalized) {
      const value = normalized.recurring;
      if (value !== null && value !== undefined) {
        if (typeof value !== 'object' || !value.pattern) {
          normalized.recurring = undefined;
        } else {
          const validPatterns = ['daily', 'weekly', 'monthly', 'yearly'];
          if (!validPatterns.includes(value.pattern)) {
            normalized.recurring = undefined;
          }
        }
      }
    }

    return normalized;
  }

  /**
   * Override create to add activity logging
   * @param data - Task data
   * @returns Created task
   */
  override async create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task = await super.create(data);

    const userInfo = await this.getUserInfo(task.userId);

    await this.createActivityLog({
      type: 'create',
      action: '할일 생성',
      entityType: 'task',
      entityId: task.id,
      entityName: task.title,
      userId: task.userId,
      userName: userInfo.name,
      userInitials: userInfo.initials,
      description: `${this.addKoreanParticle(task.title, '을', '를')} 생성했습니다.`,
    });

    return task;
  }

  /**
   * Override update to auto-normalize data and add activity logging
   * @param id - Task ID
   * @param updates - Partial task data
   * @param skipLog - Skip activity logging (for internal updates like subtasks array)
   * @returns Updated task
   */
  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>, skipLog = false): Promise<Task | null> {
    const oldTask = await this.getById(id);
    if (!oldTask) return null;

    // Normalize the updates before passing to BaseService
    const normalizedUpdates = this.normalizeTaskData(updates);
    const updatedTask = await super.update(id, normalizedUpdates);
    if (!updatedTask) return null;

    // Skip activity logging if requested
    if (skipLog) {
      return updatedTask;
    }

    // Track changes
    const changes: string[] = [];
    if (updates.title && updates.title !== oldTask.title) {
      changes.push(`제목: "${oldTask.title}" → "${updates.title}"`);
    }
    if (updates.status && updates.status !== oldTask.status) {
      changes.push(`상태: ${oldTask.status} → ${updates.status}`);
    }
    if (updates.priority && updates.priority !== oldTask.priority) {
      changes.push(`우선순위: ${oldTask.priority} → ${updates.priority}`);
    }
    if (updates.dueDate && updates.dueDate !== oldTask.dueDate) {
      changes.push(`마감일: ${this.formatDateForLog(oldTask.dueDate)} → ${this.formatDateForLog(updates.dueDate)}`);
    }

    if (changes.length > 0) {
      const userInfo = await this.getUserInfo(updatedTask.userId);

      await this.createActivityLog({
        type: 'update',
        action: '할일 수정',
        entityType: 'task',
        entityId: updatedTask.id,
        entityName: updatedTask.title,
        userId: updatedTask.userId,
        userName: userInfo.name,
        userInitials: userInfo.initials,
        description: `${this.addKoreanParticle(updatedTask.title, '을', '를')} 수정: ${changes.join(', ')}`,
      });
    }

    return updatedTask;
  }

  /**
   * Override delete to add activity logging
   * @param id - Task ID
   * @returns Success boolean
   */
  override async delete(id: string): Promise<boolean> {
    const task = await this.getById(id);
    if (!task) return false;

    const result = await super.delete(id);

    if (result) {
      const userInfo = await this.getUserInfo(task.userId);

      await this.createActivityLog({
        type: 'delete',
        action: '할일 삭제',
        entityType: 'task',
        entityId: task.id,
        entityName: task.title,
        userId: task.userId,
        userName: userInfo.name,
        userInitials: userInfo.initials,
        description: `${this.addKoreanParticle(task.title, '을', '를')} 삭제했습니다.`,
      });
    }

    return result;
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
   * Complete a task (with activity logging)
   */
  async completeTask(taskId: string): Promise<Task | null> {
    const task = await this.getById(taskId);
    if (!task) return null;

    const updatedTask = await this.updateStatus(taskId, 'completed');

    if (updatedTask) {
      const userInfo = await this.getUserInfo(updatedTask.userId);

      await this.createActivityLog({
        type: 'complete',
        action: '할일 완료',
        entityType: 'task',
        entityId: updatedTask.id,
        entityName: updatedTask.title,
        userId: updatedTask.userId,
        userName: userInfo.name,
        userInitials: userInfo.initials,
        description: `${this.addKoreanParticle(updatedTask.title, '을', '를')} 완료했습니다.`,
      });
    }

    return updatedTask;
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

    // Check for circular subtask relationships
    if (subtaskData.subtasks && subtaskData.subtasks.length > 0) {
      if (await this.wouldCreateCircularSubtask(parentTaskId, subtaskData.subtasks)) {
        throw new Error('Circular subtask relationship detected: adding this subtask would create a cycle');
      }
    }

    const subtask = await this.create({
      ...subtaskData,
      parentTaskId,
    });

    // Update parent's subtasks array (skip activity log for internal update)
    const subtasks = parent.subtasks || [];
    await this.update(parentTaskId, {
      subtasks: [...subtasks, subtask.id],
    }, true); // skipLog = true

    return subtask;
  }

  /**
   * Remove a subtask from a parent task
   */
  async removeSubtask(parentTaskId: string, subtaskId: string): Promise<boolean> {
    const parent = await this.getById(parentTaskId);
    if (!parent) return false;

    // Remove from parent's subtasks array (skip activity log for internal update)
    const subtasks = parent.subtasks || [];
    const updatedSubtasks = subtasks.filter((id) => id !== subtaskId);

    await this.update(parentTaskId, {
      subtasks: updatedSubtasks,
    }, true); // skipLog = true

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

    // Prevent self-reference
    if (taskId === dependencyId) {
      throw new Error('Task cannot depend on itself');
    }

    // Check if dependency exists
    const dependency = await this.getById(dependencyId);
    if (!dependency) {
      throw new Error(`Dependency task ${dependencyId} not found`);
    }

    const dependencies = task.dependencies || [];
    if (dependencies.includes(dependencyId)) {
      return task; // Already exists
    }

    // Check for circular dependencies
    if (await this.hasCircularDependency(taskId, dependencyId)) {
      throw new Error('Circular dependency detected: adding this dependency would create a cycle');
    }

    return this.update(taskId, {
      dependencies: [...dependencies, dependencyId],
    }, true); // skipLog = true for internal dependency update
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
    }, true); // skipLog = true for internal dependency update
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

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Check if adding a dependency would create a circular dependency
   * Uses breadth-first search to detect cycles
   */
  private async hasCircularDependency(taskId: string, newDependencyId: string): Promise<boolean> {
    const visited = new Set<string>();
    const queue = [newDependencyId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      // If we encounter the original task, we have a cycle
      if (currentId === taskId) {
        return true;
      }

      // Skip if already visited
      if (visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      // Get the current task and its dependencies
      const currentTask = await this.getById(currentId);
      if (currentTask?.dependencies) {
        queue.push(...currentTask.dependencies);
      }
    }

    return false;
  }

  /**
   * Check if adding a subtask would create a circular subtask relationship
   * Uses breadth-first search to detect cycles
   */
  private async wouldCreateCircularSubtask(parentId: string, subtaskIds: string[]): Promise<boolean> {
    const visited = new Set<string>();
    const queue = [...subtaskIds];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      // If we encounter the parent, we have a cycle
      if (currentId === parentId) {
        return true;
      }

      // Skip if already visited
      if (visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      // Get the current task and its subtasks
      const currentTask = await this.getById(currentId);
      if (currentTask?.subtasks) {
        queue.push(...currentTask.subtasks);
      }
    }

    return false;
  }
}
