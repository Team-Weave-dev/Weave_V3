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
import { STORAGE_KEYS } from '../config';

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

    return Math.round(totalProgress / maxProgress);
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
   * Complete a project
   */
  async completeProject(projectId: string): Promise<Project | null> {
    return this.update(projectId, {
      status: 'completed',
      progress: 100,
    });
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
   * @param projectId - Project ID to delete
   * @param options - Options for handling related data
   */
  async deleteProjectWithRelations(
    projectId: string,
    options?: {
      deleteTasks?: boolean; // Default: true
      deleteEvents?: boolean; // Default: true
      deleteDocuments?: boolean; // Default: false (keep documents)
    }
  ): Promise<boolean> {
    const { deleteTasks = true, deleteEvents = true, deleteDocuments = false } = options || {};

    // Import services dynamically to avoid circular dependencies at module level
    const { taskService, calendarService, documentService } = await import('../index');

    try {
      // Delete related tasks
      if (deleteTasks) {
        const tasks = await taskService.getTasksByProject(projectId);
        for (const task of tasks) {
          await taskService.delete(task.id);
        }
      }

      // Delete related events
      if (deleteEvents) {
        const events = await calendarService.getEventsByProject(projectId);
        for (const event of events) {
          await calendarService.delete(event.id);
        }
      }

      // Delete related documents
      if (deleteDocuments) {
        const documents = await documentService.getDocumentsByProject(projectId);
        for (const document of documents) {
          await documentService.delete(document.id);
        }
      }

      // Finally, delete the project
      return this.delete(projectId);
    } catch (error) {
      console.error(`Failed to delete project with relations: ${projectId}`, error);
      return false;
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
}
