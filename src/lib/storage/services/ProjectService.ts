/**
 * Project Service
 *
 * This file provides Project domain service with WBS, payment, and document management.
 */

import { BaseService } from './BaseService';
import type { StorageManager } from '../core/StorageManager';
import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  WBSTask,
  SettlementMethod,
  PaymentStatus,
  ProjectDocumentStatus,
  DocumentInfo,
  ProjectStatus,
} from '../types/entities/project';
import { isProject } from '../types/entities/project';
import type { CalendarEvent } from '../types/entities/event';
import type { DeleteRelationsOptions, DeleteRelationsResult, DeleteError } from '../types/base';
import { STORAGE_KEYS } from '../config';
import type { CreateActivityLogInput } from '../types/entities/activity-log';

/**
 * Project service class
 * Manages projects with WBS, payment tracking, and document management
 */
export class ProjectService extends BaseService<Project> {
  protected entityKey = STORAGE_KEYS.PROJECTS;

  constructor(storage: StorageManager) {
    super(storage);
  }

  /**
   * Type guard implementation
   */
  protected isValidEntity(data: unknown): data is Project {
    return isProject(data);
  }

  // ============================================================================
  // Basic Query Methods
  // ============================================================================

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
    return this.find((project) => project.status === status);
  }

  /**
   * Get projects by client ID
   */
  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return this.find((project) => project.clientId === clientId);
  }

  /**
   * Get projects by user ID
   */
  async getProjectsByUser(userId: string): Promise<Project[]> {
    return this.find((project) => project.userId === userId);
  }

  /**
   * Get project with all related data
   * (Future implementation: include tasks, events, documents from other services)
   */
  async getProjectWithRelations(id: string): Promise<Project | null> {
    // For now, just return the project
    // In Phase 7, this will include related tasks, events, and documents
    return this.getById(id);
  }

  /**
   * Search projects by name or description
   */
  async searchProjects(query: string): Promise<Project[]> {
    const lowerQuery = query.toLowerCase();
    return this.find(
      (project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description?.toLowerCase().includes(lowerQuery) ||
        project.no.toLowerCase().includes(lowerQuery)
    );
  }

  // ============================================================================
  // WBS Management
  // ============================================================================

  /**
   * Add a new WBS task to a project
   */
  async addWBSTask(projectId: string, task: Omit<WBSTask, 'id' | 'createdAt' | 'order'>): Promise<Project | null> {
    const project = await this.getById(projectId);
    if (!project) return null;

    const now = this.getCurrentTimestamp();
    const newTask: WBSTask = {
      ...task,
      id: this.generateId(),
      createdAt: now,
      order: project.wbsTasks.length, // Add to end
    } as WBSTask;

    const updatedWBSTasks = [...project.wbsTasks, newTask];

    return this.update(projectId, {
      wbsTasks: updatedWBSTasks,
      progress: this.calculateProgressFromTasks(updatedWBSTasks),
    });
  }

  /**
   * Update a WBS task
   */
  async updateWBSTask(
    projectId: string,
    taskId: string,
    updates: Partial<Omit<WBSTask, 'id' | 'createdAt' | 'order'>>
  ): Promise<Project | null> {
    const project = await this.getById(projectId);
    if (!project) return null;

    const taskIndex = project.wbsTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return null;

    const now = this.getCurrentTimestamp();
    const updatedTask: WBSTask = {
      ...project.wbsTasks[taskIndex],
      ...updates,
    };

    // Update status-specific timestamps
    if (updates.status === 'in_progress' && !project.wbsTasks[taskIndex].startedAt) {
      updatedTask.startedAt = now;
    }
    if (updates.status === 'completed' && !project.wbsTasks[taskIndex].completedAt) {
      updatedTask.completedAt = now;
    }

    const updatedWBSTasks = [...project.wbsTasks];
    updatedWBSTasks[taskIndex] = updatedTask;

    return this.update(projectId, {
      wbsTasks: updatedWBSTasks,
      progress: this.calculateProgressFromTasks(updatedWBSTasks),
    });
  }

  /**
   * Remove a WBS task
   */
  async removeWBSTask(projectId: string, taskId: string): Promise<Project | null> {
    const project = await this.getById(projectId);
    if (!project) return null;

    const updatedWBSTasks = project.wbsTasks
      .filter((t) => t.id !== taskId)
      .map((task, index) => ({ ...task, order: index })); // Reorder

    return this.update(projectId, {
      wbsTasks: updatedWBSTasks,
      progress: this.calculateProgressFromTasks(updatedWBSTasks),
    });
  }

  /**
   * Reorder WBS tasks
   */
  async reorderWBSTasks(projectId: string, taskIds: string[]): Promise<Project | null> {
    const project = await this.getById(projectId);
    if (!project) return null;

    // Create a map for quick lookup
    const taskMap = new Map(project.wbsTasks.map((t) => [t.id, t]));

    // Reorder tasks based on provided IDs
    const reorderedTasks = taskIds
      .map((id) => taskMap.get(id))
      .filter((task): task is WBSTask => task !== undefined)
      .map((task, index) => ({ ...task, order: index }));

    // Add any tasks not in the provided IDs at the end
    const providedIdSet = new Set(taskIds);
    const remainingTasks = project.wbsTasks
      .filter((t) => !providedIdSet.has(t.id))
      .map((task, index) => ({ ...task, order: reorderedTasks.length + index }));

    const updatedWBSTasks = [...reorderedTasks, ...remainingTasks];

    return this.update(projectId, {
      wbsTasks: updatedWBSTasks,
    });
  }

  /**
   * Calculate project progress based on WBS tasks
   * Returns percentage (0-100)
   */
  async calculateProgress(projectId: string): Promise<number> {
    const project = await this.getById(projectId);
    if (!project) return 0;

    return this.calculateProgressFromTasks(project.wbsTasks);
  }

  /**
   * Helper: Calculate progress from task array
   */
  private calculateProgressFromTasks(tasks: WBSTask[]): number {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;

    // Completed tasks count as 100%, in-progress tasks count as 50%
    const totalProgress = completedTasks * 100 + inProgressTasks * 50;
    const maxProgress = tasks.length * 100;

    return Math.round((totalProgress / maxProgress) * 100);
  }

  // ============================================================================
  // Payment Management
  // ============================================================================

  /**
   * Update payment status
   */
  async updatePaymentStatus(projectId: string, status: PaymentStatus): Promise<Project | null> {
    return this.update(projectId, { paymentStatus: status });
  }

  /**
   * Update settlement method
   */
  async updateSettlementMethod(projectId: string, method: SettlementMethod): Promise<Project | null> {
    return this.update(projectId, { settlementMethod: method });
  }

  /**
   * Update payment progress
   */
  async updatePaymentProgress(projectId: string, progress: number): Promise<Project | null> {
    return this.update(projectId, { paymentProgress: Math.max(0, Math.min(100, progress)) });
  }

  /**
   * Update total amount
   */
  async updateTotalAmount(projectId: string, amount: number): Promise<Project | null> {
    return this.update(projectId, { totalAmount: amount });
  }

  // ============================================================================
  // Document Management
  // ============================================================================

  /**
   * Update document status
   */
  async updateDocumentStatus(projectId: string, status: ProjectDocumentStatus): Promise<Project | null> {
    return this.update(projectId, { documentStatus: status });
  }

  /**
   * Add a document reference to project
   */
  async addDocument(projectId: string, document: DocumentInfo): Promise<Project | null> {
    const project = await this.getById(projectId);
    if (!project) return null;

    const documents = project.documents || [];
    const updatedDocuments = [...documents, document];

    // Update document flags
    const updates: Partial<Project> = {
      documents: updatedDocuments,
      hasDocuments: true,
    };

    // Update specific document flags based on type
    if (document.type === 'contract') {
      updates.hasContract = true;
    } else if (document.type === 'invoice') {
      updates.hasBilling = true;
    }

    return this.update(projectId, updates);
  }

  /**
   * Remove a document reference from project
   */
  async removeDocument(projectId: string, documentId: string): Promise<Project | null> {
    const project = await this.getById(projectId);
    if (!project) return null;

    const documents = project.documents || [];
    const updatedDocuments = documents.filter((d) => d.id !== documentId);

    // Update document flags
    const updates: Partial<Project> = {
      documents: updatedDocuments,
      hasDocuments: updatedDocuments.length > 0,
      hasContract: updatedDocuments.some((d) => d.type === 'contract'),
      hasBilling: updatedDocuments.some((d) => d.type === 'invoice'),
    };

    return this.update(projectId, updates);
  }

  /**
   * Get document by ID from project
   */
  async getDocument(projectId: string, documentId: string): Promise<DocumentInfo | null> {
    const project = await this.getById(projectId);
    if (!project || !project.documents) return null;

    return project.documents.find((d) => d.id === documentId) || null;
  }

  // ============================================================================
  // Status Management
  // ============================================================================

  /**
   * Update project status
   */
  async updateStatus(projectId: string, status: ProjectStatus): Promise<Project | null> {
    return this.update(projectId, { status });
  }

  /**
   * Cancel a project
   */
  async cancelProject(projectId: string): Promise<Project | null> {
    return this.update(projectId, {
      status: 'cancelled',
    });
  }

  // ============================================================================
  // Advanced Queries
  // ============================================================================

  /**
   * Get active projects (in_progress or review status)
   */
  async getActiveProjects(): Promise<Project[]> {
    return this.find((project) => project.status === 'in_progress' || project.status === 'review');
  }

  /**
   * Get completed projects
   */
  async getCompletedProjects(): Promise<Project[]> {
    return this.getProjectsByStatus('completed');
  }

  /**
   * Get projects by date range
   */
  async getProjectsByDateRange(startDate: string, endDate: string): Promise<Project[]> {
    return this.find((project) => {
      const projectDate = project.startDate || project.registrationDate;
      return projectDate >= startDate && projectDate <= endDate;
    });
  }

  /**
   * Get projects with overdue deadlines
   */
  async getOverdueProjects(): Promise<Project[]> {
    const now = this.getCurrentTimestamp();
    return this.find((project) => {
      if (!project.endDate) return false;
      return project.endDate < now && project.status !== 'completed' && project.status !== 'cancelled';
    });
  }

  // ============================================================================
  // Relationship Management (Phase 7)
  // ============================================================================

  /**
   * Delete project with all related data
   *
   * This method deletes a project along with its related entities (tasks, events, documents)
   * using parallel deletion for improved performance. It provides detailed error reporting
   * and allows partial failures without rolling back successful deletions.
   *
   * @param projectId - Project ID to delete
   * @param options - Options for handling related data
   * @returns Detailed result including success status, deletion counts, and errors
   *
   * @example
   * ```typescript
   * const result = await projectService.deleteProjectWithRelations('project-123', {
   *   deleteTasks: true,
   *   deleteEvents: true,
   *   deleteDocuments: false  // Keep documents for archival
   * });
   *
   * if (result.success) {
   *   console.log(`Deleted ${result.deleted.tasks} tasks, ${result.deleted.events} events`);
   * } else {
   *   console.error(`Errors:`, result.errors);
   * }
   * ```
   */
  async deleteProjectWithRelations(
    projectId: string,
    options?: DeleteRelationsOptions
  ): Promise<DeleteRelationsResult> {
    const startTime = performance.now();
    const { deleteTasks = true, deleteEvents = true, deleteDocuments = false } = options || {};

    // Initialize result
    const result: DeleteRelationsResult = {
      success: true,
      deleted: {
        project: false,
        tasks: 0,
        events: 0,
        documents: 0,
      },
      errors: [],
    };

    try {
      // Import services dynamically to avoid circular dependencies at module level
      const { taskService, calendarService, documentService } = await import('../index');

      // Delete related tasks (parallel)
      if (deleteTasks) {
        const tasks = await taskService.getTasksByProject(projectId);
        const taskDeletePromises = tasks.map((task) =>
          taskService
            .delete(task.id)
            .then(() => ({ success: true as const, id: task.id }))
            .catch((error) => ({
              success: false as const,
              id: task.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            }))
        );

        const taskResults = await Promise.all(taskDeletePromises);

        taskResults.forEach((taskResult) => {
          if (taskResult.success) {
            result.deleted.tasks++;
          } else {
            result.success = false;
            result.errors.push({
              type: 'task',
              id: taskResult.id,
              error: taskResult.error,
              timestamp: this.getCurrentTimestamp(),
            });
          }
        });
      }

      // Delete related events (parallel)
      if (deleteEvents) {
        const events = await calendarService.getEventsByProject(projectId);
        const eventDeletePromises = events.map((event) =>
          calendarService
            .delete(event.id)
            .then(() => ({ success: true as const, id: event.id }))
            .catch((error) => ({
              success: false as const,
              id: event.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            }))
        );

        const eventResults = await Promise.all(eventDeletePromises);

        eventResults.forEach((eventResult) => {
          if (eventResult.success) {
            result.deleted.events++;
          } else {
            result.success = false;
            result.errors.push({
              type: 'event',
              id: eventResult.id,
              error: eventResult.error,
              timestamp: this.getCurrentTimestamp(),
            });
          }
        });
      }

      // Delete related documents (parallel)
      if (deleteDocuments) {
        const documents = await documentService.getDocumentsByProject(projectId);
        const documentDeletePromises = documents.map((document) =>
          documentService
            .delete(document.id)
            .then(() => ({ success: true as const, id: document.id }))
            .catch((error) => ({
              success: false as const,
              id: document.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            }))
        );

        const documentResults = await Promise.all(documentDeletePromises);

        documentResults.forEach((documentResult) => {
          if (documentResult.success) {
            result.deleted.documents++;
          } else {
            result.success = false;
            result.errors.push({
              type: 'document',
              id: documentResult.id,
              error: documentResult.error,
              timestamp: this.getCurrentTimestamp(),
            });
          }
        });
      }

      // Finally, delete the project itself
      try {
        result.deleted.project = await this.delete(projectId);
        if (!result.deleted.project) {
          result.success = false;
          result.errors.push({
            type: 'project',
            id: projectId,
            error: 'Project deletion returned false',
            timestamp: this.getCurrentTimestamp(),
          });
        }
      } catch (error) {
        result.success = false;
        result.deleted.project = false;
        result.errors.push({
          type: 'project',
          id: projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: this.getCurrentTimestamp(),
        });
      }

      // Calculate execution time
      result.executionTime = Math.round(performance.now() - startTime);

      return result;
    } catch (error) {
      // Critical error - could not even start deletion process
      result.success = false;
      result.errors.push({
        type: 'project',
        id: projectId,
        error: error instanceof Error ? error.message : 'Critical error during deletion',
        timestamp: this.getCurrentTimestamp(),
      });
      result.executionTime = Math.round(performance.now() - startTime);
      return result;
    }
  }

  /**
   * Get task count for a project
   */
  async getProjectTasksCount(projectId: string): Promise<number> {
    const { taskService } = await import('../index');
    const tasks = await taskService.getTasksByProject(projectId);
    return tasks.length;
  }

  /**
   * Get task statistics for a project
   */
  async getProjectTasksStats(projectId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  }> {
    const { taskService } = await import('../index');
    const tasks = await taskService.getTasksByProject(projectId);
    const now = this.getCurrentTimestamp();

    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      cancelled: tasks.filter((t) => t.status === 'cancelled').length,
      overdue: tasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== 'completed' && t.status !== 'cancelled')
        .length,
    };
  }

  /**
   * Get calendar events count for a project
   */
  async getProjectEventsCount(projectId: string): Promise<number> {
    const { calendarService } = await import('../index');
    const events = await calendarService.getEventsByProject(projectId);
    return events.length;
  }

  /**
   * Get calendar events statistics for a project
   */
  async getProjectEventsStats(projectId: string): Promise<{
    total: number;
    upcoming: number;
    past: number;
    meetings: number;
    deadlines: number;
    confirmed: number;
    tentative: number;
    cancelled: number;
  }> {
    const { calendarService } = await import('../index');
    const events = await calendarService.getEventsByProject(projectId);
    const now = this.getCurrentTimestamp();

    return {
      total: events.length,
      upcoming: events.filter((e) => e.startDate > now).length,
      past: events.filter((e) => e.endDate < now).length,
      meetings: events.filter((e) => e.type === 'meeting').length,
      deadlines: events.filter((e) => e.type === 'deadline').length,
      confirmed: events.filter((e) => e.status === 'confirmed').length,
      tentative: events.filter((e) => e.status === 'tentative').length,
      cancelled: events.filter((e) => e.status === 'cancelled').length,
    };
  }

  /**
   * Get upcoming events for a project
   */
  async getProjectUpcomingEvents(projectId: string, limit?: number): Promise<CalendarEvent[]> {
    const { calendarService } = await import('../index');
    const events = await calendarService.getEventsByProject(projectId);
    const now = this.getCurrentTimestamp();

    const upcomingEvents = events
      .filter((event) => event.startDate > now)
      .sort((a, b) => (a.startDate > b.startDate ? 1 : -1));

    return limit ? upcomingEvents.slice(0, limit) : upcomingEvents;
  }

  /**
   * Get project documents count
   */
  async getProjectDocumentsCount(projectId: string): Promise<number> {
    const { documentService } = await import('../index');
    const documents = await documentService.getDocumentsByProject(projectId);
    return documents.length;
  }

  /**
   * Get project documents statistics
   */
  async getProjectDocumentsStats(projectId: string): Promise<{
    total: number;
    contract: number;
    invoice: number;
    estimate: number;
    report: number;
    etc: number;
    draft: number;
    sent: number;
    approved: number;
  }> {
    const { documentService } = await import('../index');
    const documents = await documentService.getDocumentsByProject(projectId);

    return {
      total: documents.length,
      contract: documents.filter((d) => d.type === 'contract').length,
      invoice: documents.filter((d) => d.type === 'invoice').length,
      estimate: documents.filter((d) => d.type === 'estimate').length,
      report: documents.filter((d) => d.type === 'report').length,
      etc: documents.filter((d) => d.type === 'etc').length,
      draft: documents.filter((d) => d.status === 'draft').length,
      sent: documents.filter((d) => d.status === 'sent').length,
      approved: documents.filter((d) => d.status === 'approved').length,
    };
  }

  // ============================================================================
  // Activity Logging (Private Helper)
  // ============================================================================

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
      console.error('[ProjectService] Failed to get user info:', error);
    }

    // Final fallback to default values
    return { name: '사용자', initials: 'U' };
  }

  /**
   * Create activity log entry
   * Private helper to avoid circular dependency issues
   */
  private async createActivityLog(input: CreateActivityLogInput): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { activityLogService } = await import('../index');
      await activityLogService.createLog(input);
    } catch (error) {
      // Log error but don't throw - activity logging should not break main operations
      console.error('[ProjectService] Failed to create activity log:', error);
    }
  }

  // ============================================================================
  // Override CRUD Methods with Activity Logging
  // ============================================================================

  /**
   * Create project with activity logging
   */
  override async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const project = await super.create(data);

    const userInfo = await this.getUserInfo(project.userId);

    // Log activity
    await this.createActivityLog({
      type: 'create',
      action: '프로젝트 생성',
      entityType: 'project',
      entityId: project.id,
      entityName: project.name,
      userId: project.userId,
      userName: userInfo.name,
      userInitials: userInfo.initials,
      description: `프로젝트 "${project.name}"을(를) 생성했습니다.`,
    });

    return project;
  }

  /**
   * Update project with activity logging
   */
  override async update(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
    const oldProject = await this.getById(id);
    if (!oldProject) return null;

    const updatedProject = await super.update(id, updates);
    if (!updatedProject) return null;

    // Determine what changed for description
    const changes: string[] = [];
    if (updates.name && updates.name !== oldProject.name) {
      changes.push(`이름: "${oldProject.name}" → "${updates.name}"`);
    }
    if (updates.status && updates.status !== oldProject.status) {
      changes.push(`상태: ${oldProject.status} → ${updates.status}`);
    }
    if (updates.progress !== undefined && updates.progress !== oldProject.progress) {
      changes.push(`진행률: ${oldProject.progress}% → ${updates.progress}%`);
    }

    // Log activity only if there are meaningful changes
    if (changes.length > 0) {
      const userInfo = await this.getUserInfo(updatedProject.userId);

      await this.createActivityLog({
        type: 'update',
        action: '프로젝트 수정',
        entityType: 'project',
        entityId: updatedProject.id,
        entityName: updatedProject.name,
        userId: updatedProject.userId,
        userName: userInfo.name,
        userInitials: userInfo.initials,
        description: `프로젝트 "${updatedProject.name}" 수정: ${changes.join(', ')}`,
      });
    }

    return updatedProject;
  }

  /**
   * Delete project with activity logging
   */
  override async delete(id: string): Promise<boolean> {
    const project = await this.getById(id);
    if (!project) return false;

    const success = await super.delete(id);
    if (!success) return false;

    const userInfo = await this.getUserInfo(project.userId);

    // Log activity
    await this.createActivityLog({
      type: 'delete',
      action: '프로젝트 삭제',
      entityType: 'project',
      entityId: project.id,
      entityName: project.name,
      userId: project.userId,
      userName: userInfo.name,
      userInitials: userInfo.initials,
      description: `프로젝트 "${project.name}"을(를) 삭제했습니다.`,
    });

    return true;
  }

  /**
   * Complete project with activity logging
   */
  async completeProject(projectId: string): Promise<Project | null> {
    const project = await this.update(projectId, {
      status: 'completed',
      progress: 100,
    });
    if (!project) return null;

    const userInfo = await this.getUserInfo(project.userId);

    // Log activity
    await this.createActivityLog({
      type: 'complete',
      action: '프로젝트 완료',
      entityType: 'project',
      entityId: project.id,
      entityName: project.name,
      userId: project.userId,
      userName: userInfo.name,
      userInitials: userInfo.initials,
      description: `프로젝트 "${project.name}"을(를) 완료했습니다.`,
    });

    return project;
  }
}
