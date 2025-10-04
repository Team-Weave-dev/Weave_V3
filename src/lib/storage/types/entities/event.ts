/**
 * CalendarEvent Entity Type Definitions
 *
 * This file defines the CalendarEvent entity schema and related types.
 * Supports meetings, deadlines, recurring events, and attendees.
 */

import type { JsonObject } from '../base';

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
  recurring?: EventRecurring;

  // ========================================
  // Metadata
  // ========================================

  /** Event color (hex or color name, optional) */
  color?: string;

  /** Event tags (optional) */
  tags?: string[];

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
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
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof (data as CalendarEvent).id === 'string' &&
    'userId' in data &&
    typeof (data as CalendarEvent).userId === 'string' &&
    'title' in data &&
    typeof (data as CalendarEvent).title === 'string' &&
    'startDate' in data &&
    typeof (data as CalendarEvent).startDate === 'string' &&
    'endDate' in data &&
    typeof (data as CalendarEvent).endDate === 'string' &&
    'type' in data &&
    ['meeting', 'deadline', 'milestone', 'reminder', 'other'].includes(
      (data as CalendarEvent).type
    ) &&
    'createdAt' in data &&
    typeof (data as CalendarEvent).createdAt === 'string' &&
    'updatedAt' in data &&
    typeof (data as CalendarEvent).updatedAt === 'string'
  );
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
