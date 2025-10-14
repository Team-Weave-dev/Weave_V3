/**
 * CalendarEvent Entity Type Definitions
 *
 * This file defines the CalendarEvent entity schema and related types.
 * Supports meetings, deadlines, recurring events, and attendees.
 */

import type { JsonObject } from '../base';
import { isValidISODate, isValidDateRange, isStringArray } from '../validators';

/**
 * Event type
 */
export type EventType = 'meeting' | 'deadline' | 'milestone' | 'reminder' | 'other';

/**
 * Event category
 */
export type EventCategory = 'work' | 'personal' | 'project' | 'client';

/**
 * Event status
 */
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

/**
 * Attendee response status
 */
export type AttendeeStatus = 'accepted' | 'declined' | 'maybe' | 'pending';

/**
 * Reminder type
 */
export type ReminderType = 'email' | 'popup' | 'notification';

/**
 * Recurring pattern
 */
export type EventRecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Event attendee
 */
export interface EventAttendee extends JsonObject {
  /** Attendee name */
  name: string;

  /** Email address (optional) */
  email?: string;

  /** Response status (optional) */
  status?: AttendeeStatus;
}

/**
 * Event reminder
 */
export interface EventReminder {
  /** Reminder type */
  type: ReminderType;

  /** Minutes before event */
  minutes: number;
}

/**
 * Recurring event configuration
 */
export interface EventRecurring extends JsonObject {
  /** Recurring pattern */
  pattern: EventRecurringPattern;

  /** Repeat interval (optional) */
  interval?: number;

  /** End date for recurrence (ISO 8601, optional) */
  endDate?: string;

  /** Days of week for weekly pattern (0-6, Sun-Sat) */
  daysOfWeek?: number[];

  /** Exception dates (ISO 8601 array, optional) */
  exceptions?: string[];
}

/**
 * CalendarEvent entity
 */
export interface CalendarEvent extends JsonObject {
  // ========================================
  // Identity
  // ========================================

  /** Unique identifier (UUID) */
  id: string;

  /** User ID (foreign key) */
  userId: string;

  /** Project ID (foreign key, optional) */
  projectId?: string;

  /** Client ID (foreign key, optional) */
  clientId?: string;

  // ========================================
  // Basic Information
  // ========================================

  /** Event title */
  title: string;

  /** Event description (optional) */
  description?: string;

  /** Event location (optional) */
  location?: string;

  // ========================================
  // Time
  // ========================================

  /** Start date and time (ISO 8601) */
  startDate: string;

  /** End date and time (ISO 8601) */
  endDate: string;

  /** All-day event flag (optional) */
  allDay?: boolean;

  /** Timezone (optional) */
  timezone?: string;

  // ========================================
  // Type & Category
  // ========================================

  /** Event type */
  type: EventType;

  /** Event category (optional) */
  category?: EventCategory;

  // ========================================
  // Status
  // ========================================

  /** Event status (optional) */
  status?: EventStatus;

  // ========================================
  // Visual & Presentation
  // ========================================

  /** Event icon (optional) */
  icon?: string | null;

  /** Event color (hex or color name, optional) */
  color?: string | null;

  // ========================================
  // Privacy & Settings
  // ========================================

  /** Is private event (optional) */
  isPrivate?: boolean;

  /** Is busy event (optional) */
  isBusy?: boolean;

  // ========================================
  // Attendees
  // ========================================

  /** Event attendees (optional) */
  attendees?: EventAttendee[];

  // ========================================
  // Reminders
  // ========================================

  /** Event reminders (optional) */
  reminders?: EventReminder[];

  // ========================================
  // Recurring Configuration
  // ========================================

  /** Recurring event settings (optional) */
  recurring?: EventRecurring | null;

  /** Recurrence end date (optional, ISO 8601) */
  recurrenceEnd?: string | null;

  /** Recurrence exceptions (optional) */
  recurrenceExceptions?: string[] | null;

  // ========================================
  // Metadata
  // ========================================

  /** Additional metadata (optional) */
  metadata?: Record<string, any> | null;

  /** Event tags (optional) */
  tags?: string[] | null;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;

  /** Last update user ID (for conflict resolution) */
  updated_by?: string;

  /** Device ID for audit trail (added by BaseService) */
  device_id?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for EventAttendee
 */
export function isEventAttendee(data: unknown): data is EventAttendee {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof (data as EventAttendee).name === 'string'
  );
}

/**
 * Type guard for EventReminder
 */
export function isEventReminder(data: unknown): data is EventReminder {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    ['email', 'popup', 'notification'].includes((data as EventReminder).type) &&
    'minutes' in data &&
    typeof (data as EventReminder).minutes === 'number'
  );
}

/**
 * Type guard for EventRecurring
 */
export function isEventRecurring(data: unknown): data is EventRecurring {
  return (
    typeof data === 'object' &&
    data !== null &&
    'pattern' in data &&
    ['daily', 'weekly', 'monthly', 'yearly'].includes(
      (data as EventRecurring).pattern
    )
  );
}

/**
 * Type guard for CalendarEvent
 */
export function isCalendarEvent(data: unknown): data is CalendarEvent {
  if (typeof data !== 'object' || data === null) return false;

  const e = data as CalendarEvent;

  // Required fields
  if (!e.id || typeof e.id !== 'string') return false;
  if (!e.userId || typeof e.userId !== 'string') return false;
  if (!e.title || typeof e.title !== 'string') return false;
  if (!isValidISODate(e.startDate)) return false;
  if (!isValidISODate(e.endDate)) return false;
  if (!['meeting', 'deadline', 'milestone', 'reminder', 'other'].includes(e.type)) return false;
  if (!isValidISODate(e.createdAt)) return false;
  if (!isValidISODate(e.updatedAt)) return false;

  // Date range validation (startDate must be before endDate)
  if (!isValidDateRange(e.startDate, e.endDate)) return false;

  // Optional fields (allow null for Supabase compatibility)
  if (e.projectId !== undefined && e.projectId !== null && typeof e.projectId !== 'string') return false;
  if (e.clientId !== undefined && e.clientId !== null && typeof e.clientId !== 'string') return false;
  if (e.description !== undefined && e.description !== null && typeof e.description !== 'string') return false;
  if (e.location !== undefined && e.location !== null && typeof e.location !== 'string') return false;
  if (e.timezone !== undefined && e.timezone !== null && typeof e.timezone !== 'string') return false;
  if (e.color !== undefined && e.color !== null && typeof e.color !== 'string') return false;
  if (e.icon !== undefined && e.icon !== null && typeof e.icon !== 'string') return false;

  // Optional boolean
  if (e.allDay !== undefined && typeof e.allDay !== 'boolean') return false;
  if (e.isPrivate !== undefined && typeof e.isPrivate !== 'boolean') return false;
  if (e.isBusy !== undefined && typeof e.isBusy !== 'boolean') return false;

  // Optional enum validation
  if (
    e.category !== undefined &&
    !['work', 'personal', 'project', 'client'].includes(e.category)
  ) {
    return false;
  }

  if (
    e.status !== undefined &&
    !['confirmed', 'tentative', 'cancelled'].includes(e.status)
  ) {
    return false;
  }

  // Optional array validation
  if (e.attendees !== undefined) {
    if (!Array.isArray(e.attendees)) return false;
    if (!e.attendees.every(isEventAttendee)) return false;
  }

  if (e.reminders !== undefined) {
    if (!Array.isArray(e.reminders)) return false;
    if (!e.reminders.every(isEventReminder)) return false;
  }

  if (e.tags !== undefined && e.tags !== null && !isStringArray(e.tags)) return false;

  // Optional recurring validation (null is allowed)
  if (e.recurring !== undefined && e.recurring !== null && !isEventRecurring(e.recurring)) return false;

  // Additional recurrence fields
  if (e.recurrenceEnd !== undefined && e.recurrenceEnd !== null && !isValidISODate(e.recurrenceEnd)) return false;
  if (e.recurrenceExceptions !== undefined && e.recurrenceExceptions !== null && !isStringArray(e.recurrenceExceptions)) return false;

  // Optional metadata validation (allow any object or null)
  if (e.metadata !== undefined && e.metadata !== null && typeof e.metadata !== 'object') return false;

  // Optional updated_by validation
  if (e.updated_by !== undefined && typeof e.updated_by !== 'string') return false;

  // Optional device_id validation (added by BaseService)
  if (e.device_id !== undefined && typeof e.device_id !== 'string') return false;

  return true;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial event type for updates
 */
export type CalendarEventUpdate = Partial<
  Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>
>;

/**
 * Event creation payload (without auto-generated fields)
 */
export type CalendarEventCreate = Omit<
  CalendarEvent,
  'id' | 'createdAt' | 'updatedAt'
>;
