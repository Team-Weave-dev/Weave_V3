/**
 * Task Entity Type Definitions
 *
 * This file defines the Task entity schema and related types.
 * Supports hierarchical tasks, dependencies, and recurring tasks.
 */

import type { JsonObject } from '../base';

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Task priority
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Recurring pattern
 */
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Task attachment information
 */
export interface TaskAttachment extends JsonObject {
  /** Attachment filename */
  name: string;

  /** File URL (optional) */
  url?: string;

  /** File size in bytes (optional) */
  size?: number;

  /** MIME type (optional) */
  type?: string;
}

/**
 * Recurring task configuration
 */
export interface TaskRecurring {
  /** Recurring pattern */
  pattern: RecurringPattern;

  /** Repeat interval (optional) */
  interval?: number;

  /** End date for recurrence (ISO 8601, optional) */
  endDate?: string;

  /** Days of week for weekly pattern (0-6, Sun-Sat) */
  daysOfWeek?: number[];
}

/**
 * Task entity
 */
export interface Task extends JsonObject {
  // ========================================
  // Identity
  // ========================================

  /** Unique identifier (UUID) */
  id: string;

  /** User ID (foreign key) */
  userId: string;

  /** Project ID (foreign key, optional) */
  projectId?: string;

  // ========================================
  // Basic Information
  // ========================================

  /** Task title */
  title: string;

  /** Task description (optional) */
  description?: string;

  // ========================================
  // Status
  // ========================================

  /** Task status */
  status: TaskStatus;

  /** Task priority */
  priority: TaskPriority;

  // ========================================
  // Schedule
  // ========================================

  /** Due date (ISO 8601, optional) */
  dueDate?: string;

  /** Start date (ISO 8601, optional) */
  startDate?: string;

  /** Completion timestamp (ISO 8601, optional) */
  completedAt?: string;

  // ========================================
  // Assignment
  // ========================================

  /** Assignee user ID (optional) */
  assigneeId?: string;

  // ========================================
  // Relationships
  // ========================================

  /** Parent task ID for subtasks (optional) */
  parentTaskId?: string;

  /** Subtask IDs (optional) */
  subtasks?: string[];

  /** Dependency task IDs (optional) */
  dependencies?: string[];

  // ========================================
  // Time Tracking
  // ========================================

  /** Estimated hours (optional) */
  estimatedHours?: number;

  /** Actual hours spent (optional) */
  actualHours?: number;

  // ========================================
  // Metadata
  // ========================================

  /** Task tags (optional) */
  tags?: string[];

  /** File attachments (optional) */
  attachments?: TaskAttachment[];

  // ========================================
  // Recurring Configuration
  // ========================================

  /** Recurring task settings (optional) */
  recurring?: TaskRecurring;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for TaskAttachment
 */
export function isTaskAttachment(data: unknown): data is TaskAttachment {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof (data as TaskAttachment).name === 'string'
  );
}

/**
 * Type guard for TaskRecurring
 */
export function isTaskRecurring(data: unknown): data is TaskRecurring {
  return (
    typeof data === 'object' &&
    data !== null &&
    'pattern' in data &&
    ['daily', 'weekly', 'monthly', 'yearly'].includes((data as TaskRecurring).pattern)
  );
}

/**
 * Type guard for Task
 */
export function isTask(data: unknown): data is Task {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as Task).id === 'string' &&
    'userId' in data &&
    typeof (data as Task).userId === 'string' &&
    'title' in data &&
    typeof (data as Task).title === 'string' &&
    'status' in data &&
    ['pending', 'in_progress', 'completed', 'cancelled'].includes(
      (data as Task).status
    ) &&
    'priority' in data &&
    ['low', 'medium', 'high', 'urgent'].includes((data as Task).priority) &&
    'createdAt' in data &&
    typeof (data as Task).createdAt === 'string' &&
    'updatedAt' in data &&
    typeof (data as Task).updatedAt === 'string'
  );
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial task type for updates
 */
export type TaskUpdate = Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>;

/**
 * Task creation payload (without auto-generated fields)
 */
export type TaskCreate = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
