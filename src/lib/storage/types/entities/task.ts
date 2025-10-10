/**
 * Task Entity Type Definitions
 *
 * This file defines the Task entity schema and related types.
 * Supports hierarchical tasks, dependencies, and recurring tasks.
 */

import type { JsonObject } from '../base';
import {
  isValidISODate,
  isValidDateRange,
  isStringArray,
  isNonNegativeNumber,
} from '../validators';

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

  /** Last update user ID (for conflict resolution) */
  updated_by?: string;
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
  if (typeof data !== 'object' || data === null) return false;

  const t = data as Task;

  // Required fields
  if (!t.id || typeof t.id !== 'string') return false;
  if (!t.userId || typeof t.userId !== 'string') return false;
  if (!t.title || typeof t.title !== 'string') return false;
  if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(t.status)) return false;
  if (!['low', 'medium', 'high', 'urgent'].includes(t.priority)) return false;
  if (!isValidISODate(t.createdAt)) return false;
  if (!isValidISODate(t.updatedAt)) return false;

  // Optional fields
  if (t.projectId !== undefined && typeof t.projectId !== 'string') return false;
  if (t.description !== undefined && typeof t.description !== 'string') return false;
  if (t.assigneeId !== undefined && typeof t.assigneeId !== 'string') return false;
  if (t.parentTaskId !== undefined && typeof t.parentTaskId !== 'string') return false;

  // Optional date validation
  if (t.dueDate !== undefined && !isValidISODate(t.dueDate)) return false;
  if (t.startDate !== undefined && !isValidISODate(t.startDate)) return false;
  if (t.completedAt !== undefined && !isValidISODate(t.completedAt)) return false;

  // Date range validation
  if (t.startDate && t.dueDate && !isValidDateRange(t.startDate, t.dueDate)) return false;

  // Optional number validation (must be non-negative)
  if (t.estimatedHours !== undefined && !isNonNegativeNumber(t.estimatedHours)) return false;
  if (t.actualHours !== undefined && !isNonNegativeNumber(t.actualHours)) return false;

  // Optional array validation
  if (t.subtasks !== undefined && !isStringArray(t.subtasks)) return false;
  if (t.dependencies !== undefined && !isStringArray(t.dependencies)) return false;
  if (t.tags !== undefined && !isStringArray(t.tags)) return false;

  // Optional attachments validation
  if (t.attachments !== undefined) {
    if (!Array.isArray(t.attachments)) return false;
    if (!t.attachments.every(isTaskAttachment)) return false;
  }

  // Optional recurring validation
  if (t.recurring !== undefined && !isTaskRecurring(t.recurring)) return false;

  // Optional updated_by validation
  if (t.updated_by !== undefined && typeof t.updated_by !== 'string') return false;

  return true;
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
