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

  /** Device ID for audit trail (added by BaseService) */
  device_id?: string;

  /** Section ID for TodoListWidget filtering */
  sectionId?: string;
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
  if (typeof data !== 'object' || data === null) {
    console.error('[isTask] Data is not an object or is null');
    return false;
  }

  const t = data as Task;

  // Required fields
  if (!t.id || typeof t.id !== 'string') {
    console.error('[isTask] Invalid id:', t.id, 'type:', typeof t.id);
    return false;
  }
  if (!t.userId || typeof t.userId !== 'string') {
    console.error('[isTask] Invalid userId:', t.userId, 'type:', typeof t.userId);
    return false;
  }
  if (!t.title || typeof t.title !== 'string') {
    console.error('[isTask] Invalid title:', t.title, 'type:', typeof t.title);
    return false;
  }
  if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(t.status)) {
    console.error('[isTask] Invalid status:', t.status);
    return false;
  }
  // Priority 검증: Storage 레벨 (low/medium/high/urgent) 또는 UI 레벨 (p1/p2/p3/p4) 허용
  const validPriorities = ['low', 'medium', 'high', 'urgent', 'p1', 'p2', 'p3', 'p4'];
  if (!validPriorities.includes(t.priority)) {
    console.error('[isTask] Invalid priority:', t.priority);
    return false;
  }

  // UI 레벨 priority를 Storage 레벨로 자동 변환 (마이그레이션)
  if (['p1', 'p2', 'p3', 'p4'].includes(t.priority)) {
    const priorityMap: Record<string, TaskPriority> = {
      'p1': 'urgent',
      'p2': 'high',
      'p3': 'medium',
      'p4': 'low'
    };
    t.priority = priorityMap[t.priority];
    console.log('[isTask] Auto-migrated priority from UI level to Storage level:', t.priority);
  }
  if (!isValidISODate(t.createdAt)) {
    console.error('[isTask] Invalid createdAt:', t.createdAt);
    return false;
  }
  if (!isValidISODate(t.updatedAt)) {
    console.error('[isTask] Invalid updatedAt:', t.updatedAt);
    return false;
  }

  // Optional fields - null과 undefined는 허용
  if (t.projectId !== undefined && t.projectId !== null && typeof t.projectId !== 'string') {
    console.error('[isTask] Invalid projectId:', t.projectId, 'type:', typeof t.projectId);
    return false;
  }
  if (t.description !== undefined && t.description !== null && typeof t.description !== 'string') {
    console.error('[isTask] Invalid description:', t.description, 'type:', typeof t.description);
    return false;
  }
  if (t.assigneeId !== undefined && t.assigneeId !== null && typeof t.assigneeId !== 'string') {
    console.error('[isTask] Invalid assigneeId:', t.assigneeId, 'type:', typeof t.assigneeId);
    return false;
  }
  if (t.parentTaskId !== undefined && t.parentTaskId !== null && typeof t.parentTaskId !== 'string') {
    console.error('[isTask] Invalid parentTaskId:', t.parentTaskId, 'type:', typeof t.parentTaskId);
    return false;
  }

  // Optional date validation - null은 허용
  if (t.dueDate !== undefined && t.dueDate !== null && !isValidISODate(t.dueDate)) {
    console.error('[isTask] Invalid dueDate:', t.dueDate);
    return false;
  }
  if (t.startDate !== undefined && t.startDate !== null && !isValidISODate(t.startDate)) {
    console.error('[isTask] Invalid startDate:', t.startDate);
    return false;
  }
  if (t.completedAt !== undefined && t.completedAt !== null && !isValidISODate(t.completedAt)) {
    console.error('[isTask] Invalid completedAt:', t.completedAt);
    return false;
  }

  // Date range validation
  if (t.startDate && t.dueDate && !isValidDateRange(t.startDate, t.dueDate)) {
    console.error('[isTask] Invalid date range: startDate > dueDate', t.startDate, '>', t.dueDate);
    return false;
  }

  // Optional number validation (must be non-negative) - null과 undefined는 허용
  if (t.estimatedHours !== undefined && t.estimatedHours !== null && !isNonNegativeNumber(t.estimatedHours)) {
    console.error('[isTask] Invalid estimatedHours:', t.estimatedHours);
    return false;
  }
  if (t.actualHours !== undefined && t.actualHours !== null && !isNonNegativeNumber(t.actualHours)) {
    console.error('[isTask] Invalid actualHours:', t.actualHours);
    return false;
  }

  // Optional array validation - null과 undefined는 허용
  if (t.subtasks !== undefined && t.subtasks !== null && !isStringArray(t.subtasks)) {
    console.error('[isTask] Invalid subtasks:', t.subtasks);
    return false;
  }
  if (t.dependencies !== undefined && t.dependencies !== null && !isStringArray(t.dependencies)) {
    console.error('[isTask] Invalid dependencies:', t.dependencies);
    return false;
  }
  if (t.tags !== undefined && t.tags !== null && !isStringArray(t.tags)) {
    console.error('[isTask] Invalid tags:', t.tags);
    return false;
  }

  // Optional attachments validation - null과 undefined는 허용
  if (t.attachments !== undefined && t.attachments !== null) {
    if (!Array.isArray(t.attachments)) {
      console.error('[isTask] Invalid attachments - not an array:', t.attachments);
      return false;
    }
    if (!t.attachments.every(isTaskAttachment)) {
      console.error('[isTask] Invalid attachments - validation failed:', t.attachments);
      return false;
    }
  }

  // Optional recurring validation - null과 undefined는 허용
  if (t.recurring !== undefined && t.recurring !== null && !isTaskRecurring(t.recurring)) {
    console.error('[isTask] Invalid recurring:', t.recurring);
    return false;
  }

  // Optional updated_by validation - null과 undefined는 허용
  if (t.updated_by !== undefined && t.updated_by !== null && typeof t.updated_by !== 'string') {
    console.error('[isTask] Invalid updated_by:', t.updated_by, 'type:', typeof t.updated_by);
    return false;
  }

  // Optional device_id validation (added by BaseService) - null과 undefined는 허용
  if (t.device_id !== undefined && t.device_id !== null && typeof t.device_id !== 'string') {
    console.error('[isTask] Invalid device_id:', t.device_id, 'type:', typeof t.device_id);
    return false;
  }

  // Optional sectionId validation (for TodoListWidget) - null과 undefined는 허용
  if (t.sectionId !== undefined && t.sectionId !== null && typeof t.sectionId !== 'string') {
    console.error('[isTask] Invalid sectionId:', t.sectionId, 'type:', typeof t.sectionId);
    return false;
  }

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
