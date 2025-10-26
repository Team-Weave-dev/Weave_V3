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
import type { CreateActivityLogInput } from '../types/entities/activity-log';

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
  // Activity Logging
  // ============================================================================

  /**
   * Format date for activity log messages
   * - All-day events: YYYY-MM-DD (date only)
   * - Timed events: YYYY-MM-DD HH:MM (date and time)
   */
  private formatDateForLog(isoDate: string | undefined, isAllDay: boolean = false): string {
    if (!isoDate) return '없음';

    try {
      const date = new Date(isoDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // For all-day events, only show date
      if (isAllDay) {
        return `${year}-${month}-${day}`;
      }

      // For timed events, show date and time
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return isoDate;
    }
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
      console.error('[CalendarService] Failed to get user info:', error);
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
      console.error('[CalendarService] Failed to create activity log:', error);
    }
  }

  /**
   * Override create to add activity logging
   * @param data - CalendarEvent data
   * @returns Created event
   */
  override async create(data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const event = await super.create(data);

    // Get actual user information
    const userInfo = await this.getUserInfo(event.userId);

    await this.createActivityLog({
      type: 'create',
      action: '일정 생성',
      entityType: 'event',
      entityId: event.id,
      entityName: event.title,
      userId: event.userId,
      userName: userInfo.name,
      userInitials: userInfo.initials,
      description: `일정 "${event.title}"을(를) 생성했습니다.`,
    });

    return event;
  }

  /**
   * Override update to add activity logging
   * @param id - Event ID
   * @param updates - Partial event data
   * @returns Updated event
   */
  override async update(id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>): Promise<CalendarEvent | null> {
    const oldEvent = await this.getById(id);
    if (!oldEvent) return null;

    const updatedEvent = await super.update(id, updates);
    if (!updatedEvent) return null;

    // Track changes
    const changes: string[] = [];

    // Determine if this is an all-day event (use updated value if provided, otherwise use old value)
    const isAllDay = updates.allDay !== undefined ? updates.allDay : (oldEvent.allDay || false);

    if (updates.title && updates.title !== oldEvent.title) {
      changes.push(`제목: "${oldEvent.title}" → "${updates.title}"`);
    }
    if (updates.status && updates.status !== oldEvent.status) {
      changes.push(`상태: ${oldEvent.status} → ${updates.status}`);
    }
    if (updates.startDate && updates.startDate !== oldEvent.startDate) {
      changes.push(`시작일: ${this.formatDateForLog(oldEvent.startDate, isAllDay)} → ${this.formatDateForLog(updates.startDate, isAllDay)}`);
    }
    if (updates.endDate && updates.endDate !== oldEvent.endDate) {
      changes.push(`종료일: ${this.formatDateForLog(oldEvent.endDate, isAllDay)} → ${this.formatDateForLog(updates.endDate, isAllDay)}`);
    }

    if (changes.length > 0) {
      // Get actual user information
      const userInfo = await this.getUserInfo(updatedEvent.userId);

      await this.createActivityLog({
        type: 'update',
        action: '일정 수정',
        entityType: 'event',
        entityId: updatedEvent.id,
        entityName: updatedEvent.title,
        userId: updatedEvent.userId,
        userName: userInfo.name,
        userInitials: userInfo.initials,
        description: `일정 "${updatedEvent.title}" 수정: ${changes.join(', ')}`,
      });
    }

    return updatedEvent;
  }

  /**
   * Override delete to add activity logging
   * NOTE: Events are stored as an array, not individual keys
   * @param id - Event ID
   * @returns Success boolean
   */
  override async delete(id: string): Promise<boolean> {
    const event = await this.getById(id);
    if (!event) return false;

    // IMPORTANT: Call remove() first to trigger Supabase soft delete
    // This will call SupabaseAdapter.remove() which uses soft_delete_event_safe()
    try {
      // remove() expects composite key format: 'events:id'
      await this.storage.remove(`${this.entityKey}:${id}`);
    } catch (error) {
      console.error('[CalendarService.delete] Supabase soft delete failed:', error);
      // Continue to update local storage even if Supabase fails
    }

    // Update local array for LocalStorage
    const events = await this.getAll();
    const filteredEvents = events.filter(e => e.id !== id);

    if (filteredEvents.length === events.length) {
      // Event not found in array
      return false;
    }

    // Save updated array (LocalStorage only, Supabase already updated via remove())
    await this.storage.set<CalendarEvent[]>(this.entityKey, filteredEvents);

    // Get actual user information
    const userInfo = await this.getUserInfo(event.userId);

    await this.createActivityLog({
      type: 'delete',
      action: '일정 삭제',
      entityType: 'event',
      entityId: event.id,
      entityName: event.title,
      userId: event.userId,
      userName: userInfo.name,
      userInitials: userInfo.initials,
      description: `일정 "${event.title}"을(를) 삭제했습니다.`,
    });

    return true;
  }

  /**
   * Override deleteMany for batch deletion
   * NOTE: Events are stored as an array, not individual keys
   * @param ids - Event IDs to delete
   * @returns Number of deleted events
   */
  override async deleteMany(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    // Get events to log before deletion
    const eventsToDelete = await Promise.all(
      ids.map(id => this.getById(id))
    );
    const validEvents = eventsToDelete.filter((e): e is CalendarEvent => e !== null);

    // Events are stored as an array
    const events = await this.getAll();
    const idSet = new Set(ids);
    const filteredEvents = events.filter(e => !idSet.has(e.id));

    const deletedCount = events.length - filteredEvents.length;

    if (deletedCount === 0) {
      return 0;
    }

    // Save updated array (will trigger Supabase sync via DualWrite)
    await this.storage.set<CalendarEvent[]>(this.entityKey, filteredEvents);

    // Log activities for each deleted event
    for (const event of validEvents) {
      const userInfo = await this.getUserInfo(event.userId);

      await this.createActivityLog({
        type: 'delete',
        action: '일정 삭제',
        entityType: 'event',
        entityId: event.id,
        entityName: event.title,
        userId: event.userId,
        userName: userInfo.name,
        userInitials: userInfo.initials,
        description: `일정 "${event.title}"을(를) 삭제했습니다.`,
      });
    }

    return deletedCount;
  }

  // ============================================================================
  // Maintenance and Cleanup
  // ============================================================================

  /**
   * Remove duplicate events from storage
   * This utility method can be called to clean up any duplicate events
   * that may have been created due to race conditions or bugs
   * @returns Number of duplicate events removed
   */
  async removeDuplicateEvents(): Promise<number> {
    const events = await this.getAll();

    // Deduplicate events by ID (keep the last occurrence to preserve latest updates)
    const deduplicatedEvents = Array.from(
      new Map(events.map(event => [event.id, event])).values()
    );

    const duplicateCount = events.length - deduplicatedEvents.length;

    if (duplicateCount > 0) {
      console.log(`[CalendarService] Removed ${duplicateCount} duplicate event(s)`);
      // Save deduplicated array
      await this.storage.set<CalendarEvent[]>(this.entityKey, deduplicatedEvents);
    }

    return duplicateCount;
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

          // Find next matching day in the same week
          let nextDay = sortedDays.find((day) => day > currentDay);

          if (nextDay !== undefined) {
            // Next occurrence is in the same week
            const daysToAdd = nextDay - currentDay;
            current.setDate(current.getDate() + daysToAdd);
          } else {
            // Wrap to next week's first occurrence
            const daysUntilNextWeek = 7 - currentDay + sortedDays[0];
            current.setDate(current.getDate() + daysUntilNextWeek);
          }
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
