/**
 * Calendar Service
 *
 * This file provides CalendarEvent domain service with recurring event support.
 */

import { BaseService } from './BaseService';
import type { StorageManager } from '../core/StorageManager';
import type {
  CalendarEvent,
  CalendarEventCreate,
  CalendarEventUpdate,
  EventType,
  EventCategory,
  EventStatus,
  EventRecurring,
} from '../types/entities/event';
import { isCalendarEvent } from '../types/entities/event';
import { STORAGE_KEYS } from '../config';

/**
 * Calendar service class
 * Manages calendar events with recurring support
 */
export class CalendarService extends BaseService<CalendarEvent> {
  protected entityKey = STORAGE_KEYS.EVENTS;

  constructor(storage: StorageManager) {
    super(storage);
  }

  /**
   * Type guard implementation
   */
  protected isValidEntity(data: unknown): data is CalendarEvent {
    return isCalendarEvent(data);
  }

  // ============================================================================
  // Basic Query Methods
  // ============================================================================

  /**
   * Get events by date range
   */
  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    return this.find((event) => {
      // Event overlaps with date range if:
      // - event starts before range ends AND event ends after range starts
      return event.startDate < endDate && event.endDate > startDate;
    });
  }

  /**
   * Get events by project ID
   */
  async getEventsByProject(projectId: string): Promise<CalendarEvent[]> {
    return this.find((event) => event.projectId === projectId);
  }

  /**
   * Get events by client ID
   */
  async getEventsByClient(clientId: string): Promise<CalendarEvent[]> {
    return this.find((event) => event.clientId === clientId);
  }

  /**
   * Get events by user ID
   */
  async getEventsByUser(userId: string): Promise<CalendarEvent[]> {
    return this.find((event) => event.userId === userId);
  }

  /**
   * Get events by type
   */
  async getEventsByType(type: EventType): Promise<CalendarEvent[]> {
    return this.find((event) => event.type === type);
  }

  /**
   * Get events by category
   */
  async getEventsByCategory(category: EventCategory): Promise<CalendarEvent[]> {
    return this.find((event) => event.category === category);
  }

  /**
   * Get events by status
   */
  async getEventsByStatus(status: EventStatus): Promise<CalendarEvent[]> {
    return this.find((event) => event.status === status);
  }

  // ============================================================================
  // Advanced Query Methods
  // ============================================================================

  /**
   * Get events for today
   */
  async getEventsToday(): Promise<CalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getEventsByDateRange(today.toISOString(), tomorrow.toISOString());
  }

  /**
   * Get events for this week
   */
  async getEventsThisWeek(): Promise<CalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Get end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return this.getEventsByDateRange(startOfWeek.toISOString(), endOfWeek.toISOString());
  }

  /**
   * Get events for this month
   */
  async getEventsThisMonth(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.getEventsByDateRange(startOfMonth.toISOString(), endOfMonth.toISOString());
  }

  /**
   * Get upcoming events (future events)
   */
  async getUpcomingEvents(limit?: number): Promise<CalendarEvent[]> {
    const now = this.getCurrentTimestamp();
    const events = await this.find((event) => event.startDate > now);

    // Sort by start date
    events.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));

    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Get past events
   */
  async getPastEvents(limit?: number): Promise<CalendarEvent[]> {
    const now = this.getCurrentTimestamp();
    const events = await this.find((event) => event.endDate < now);

    // Sort by start date descending
    events.sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Get meetings
   */
  async getMeetings(): Promise<CalendarEvent[]> {
    return this.getEventsByType('meeting');
  }

  /**
   * Get deadlines
   */
  async getDeadlines(): Promise<CalendarEvent[]> {
    return this.getEventsByType('deadline');
  }

  /**
   * Get upcoming deadlines (not past due)
   */
  async getUpcomingDeadlines(): Promise<CalendarEvent[]> {
    const now = this.getCurrentTimestamp();
    return this.find((event) => event.type === 'deadline' && event.endDate > now);
  }

  /**
   * Get overdue deadlines
   */
  async getOverdueDeadlines(): Promise<CalendarEvent[]> {
    const now = this.getCurrentTimestamp();
    return this.find((event) => event.type === 'deadline' && event.endDate < now && event.status !== 'cancelled');
  }

  /**
   * Search events by title or description
   */
  async searchEvents(query: string): Promise<CalendarEvent[]> {
    const lowerQuery = query.toLowerCase();
    return this.find(
      (event) =>
        event.title.toLowerCase().includes(lowerQuery) ||
        (event.description?.toLowerCase().includes(lowerQuery) ?? false)
    );
  }

  // ============================================================================
  // Event Status Management
  // ============================================================================

  /**
   * Update event status
   */
  async updateStatus(eventId: string, status: EventStatus): Promise<CalendarEvent | null> {
    return this.update(eventId, { status });
  }

  /**
   * Confirm an event
   */
  async confirmEvent(eventId: string): Promise<CalendarEvent | null> {
    return this.updateStatus(eventId, 'confirmed');
  }

  /**
   * Mark event as tentative
   */
  async markTentative(eventId: string): Promise<CalendarEvent | null> {
    return this.updateStatus(eventId, 'tentative');
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string): Promise<CalendarEvent | null> {
    return this.updateStatus(eventId, 'cancelled');
  }

  // ============================================================================
  // Recurring Event Management
  // ============================================================================

  /**
   * Create a recurring event
   */
  async createRecurringEvent(
    data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> & { recurring: EventRecurring }
  ): Promise<CalendarEvent> {
    // Validate recurring configuration
    if (!data.recurring || !data.recurring.pattern) {
      throw new Error('Recurring event must have valid recurring configuration');
    }

    return this.create(data);
  }

  /**
   * Generate next instance of a recurring event
   */
  async generateNextRecurringEvent(eventId: string): Promise<CalendarEvent | null> {
    const event = await this.getById(eventId);
    if (!event || !event.recurring) {
      return null;
    }

    const { recurring } = event;

    // Calculate next start and end dates
    const duration = new Date(event.endDate).getTime() - new Date(event.startDate).getTime();
    const nextStartDate = this.calculateNextDate(event.startDate, recurring);

    // Check if we should create next instance
    if (recurring.endDate && nextStartDate > recurring.endDate) {
      return null; // Recurrence has ended
    }

    // Check exceptions
    if (recurring.exceptions && recurring.exceptions.includes(nextStartDate)) {
      return null; // This occurrence is excluded
    }

    const nextEndDate = new Date(new Date(nextStartDate).getTime() + duration).toISOString();

    // Create new event instance
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...eventData } = event;
    const newEventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      ...eventData,
      startDate: nextStartDate,
      endDate: nextEndDate,
      status: 'confirmed',
    };

    return this.create(newEventData);
  }

  /**
   * Calculate next date based on recurring pattern
   */
  private calculateNextDate(currentDate: string, recurring: EventRecurring): string {
    const current = new Date(currentDate);
    const interval = recurring.interval || 1;

    switch (recurring.pattern) {
      case 'daily':
        current.setDate(current.getDate() + interval);
        break;

      case 'weekly':
        // If daysOfWeek is specified, find next matching day
        if (recurring.daysOfWeek && recurring.daysOfWeek.length > 0) {
          const currentDay = current.getDay();
          const sortedDays = [...recurring.daysOfWeek].sort((a, b) => a - b);

          // Find next matching day
          let nextDay = sortedDays.find((day) => day > currentDay);
          if (nextDay === undefined) {
            // Wrap to next week
            nextDay = sortedDays[0];
            current.setDate(current.getDate() + 7);
          }

          const daysToAdd = nextDay - current.getDay();
          current.setDate(current.getDate() + daysToAdd);
        } else {
          current.setDate(current.getDate() + 7 * interval);
        }
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

  /**
   * Add exception date to recurring event
   */
  async addRecurringException(eventId: string, exceptionDate: string): Promise<CalendarEvent | null> {
    const event = await this.getById(eventId);
    if (!event || !event.recurring) return null;

    const exceptions = event.recurring.exceptions || [];
    const updatedRecurring = {
      ...event.recurring,
      exceptions: [...exceptions, exceptionDate],
    };

    return this.update(eventId, { recurring: updatedRecurring });
  }

  // ============================================================================
  // Attendee Management
  // ============================================================================

  /**
   * Get events with a specific attendee
   */
  async getEventsByAttendee(attendeeName: string): Promise<CalendarEvent[]> {
    return this.find((event) => {
      if (!event.attendees) return false;
      return event.attendees.some((attendee) => attendee.name === attendeeName);
    });
  }

  /**
   * Get events with attendee email
   */
  async getEventsByAttendeeEmail(email: string): Promise<CalendarEvent[]> {
    return this.find((event) => {
      if (!event.attendees) return false;
      return event.attendees.some((attendee) => attendee.email === email);
    });
  }

  // ============================================================================
  // Time Utilities
  // ============================================================================

  /**
   * Check if event is happening now
   */
  async isEventHappeningNow(eventId: string): Promise<boolean> {
    const event = await this.getById(eventId);
    if (!event) return false;

    const now = this.getCurrentTimestamp();
    return event.startDate <= now && event.endDate > now;
  }

  /**
   * Get event duration in minutes
   */
  async getEventDuration(eventId: string): Promise<number | null> {
    const event = await this.getById(eventId);
    if (!event) return null;

    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate).getTime();
    return Math.round((end - start) / (1000 * 60));
  }

  /**
   * Get events happening now
   */
  async getCurrentEvents(): Promise<CalendarEvent[]> {
    const now = this.getCurrentTimestamp();
    return this.find((event) => event.startDate <= now && event.endDate > now);
  }
}
