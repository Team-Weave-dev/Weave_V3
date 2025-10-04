/**
 * Calendar Mock Data and Type Converters
 *
 * This file provides utilities for managing calendar events and converting between
 * Dashboard CalendarEvent (UI type) and Storage CalendarEvent (Storage API entity type).
 */

import type { CalendarEvent as DashboardCalendarEvent } from '@/types/dashboard';
import type {
  CalendarEvent as StorageCalendarEvent,
  EventType,
  EventRecurring,
  EventRecurringPattern,
} from '@/lib/storage/types/entities/event';
import { calendarService } from '@/lib/storage';

// ============================================================================
// Type Conversion Functions
// ============================================================================

/**
 * Event type 매핑: Dashboard → Storage
 */
const DASHBOARD_TO_STORAGE_TYPE: Record<string, EventType> = {
  'meeting': 'meeting',
  'task': 'other',
  'reminder': 'reminder',
  'deadline': 'deadline',
  'holiday': 'other',
  'other': 'other',
};

/**
 * Event type 매핑: Storage → Dashboard
 */
const STORAGE_TO_DASHBOARD_TYPE: Record<EventType, DashboardCalendarEvent['type']> = {
  'meeting': 'meeting',
  'deadline': 'deadline',
  'milestone': 'deadline',
  'reminder': 'reminder',
  'other': 'other',
};

/**
 * Recurring 패턴 매핑: Dashboard → Storage
 */
const DASHBOARD_TO_STORAGE_RECURRING: Record<string, EventRecurringPattern> = {
  'daily': 'daily',
  'weekly': 'weekly',
  'monthly': 'monthly',
  'yearly': 'yearly',
};

/**
 * Recurring 패턴 매핑: Storage → Dashboard
 */
const STORAGE_TO_DASHBOARD_RECURRING: Record<EventRecurringPattern, DashboardCalendarEvent['recurring']> = {
  'daily': 'daily',
  'weekly': 'weekly',
  'monthly': 'monthly',
  'yearly': 'yearly',
};

/**
 * Convert Dashboard CalendarEvent (UI type) to Storage CalendarEvent (Storage API entity)
 *
 * @param dashboardEvent - UI type CalendarEvent
 * @param userId - Current user ID (default: '1')
 * @returns Storage CalendarEvent entity
 */
export function toStorageCalendarEvent(
  dashboardEvent: DashboardCalendarEvent,
  userId: string = '1'
): StorageCalendarEvent {
  // Date 변환: Date 객체 → ISO 8601 string
  const date = dashboardEvent.date instanceof Date ? dashboardEvent.date : new Date(dashboardEvent.date);

  // startTime과 endTime이 있으면 해당 시간으로 설정
  let startDate: Date;
  let endDate: Date;

  if (dashboardEvent.startTime) {
    const [hours, minutes] = dashboardEvent.startTime.split(':').map(Number);
    startDate = new Date(date);
    startDate.setHours(hours, minutes, 0, 0);
  } else {
    startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
  }

  if (dashboardEvent.endTime) {
    const [hours, minutes] = dashboardEvent.endTime.split(':').map(Number);
    endDate = new Date(date);
    endDate.setHours(hours, minutes, 0, 0);
  } else if (dashboardEvent.allDay) {
    endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // 기본값: 1시간 후
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  }

  // Type 변환
  const eventType: EventType = DASHBOARD_TO_STORAGE_TYPE[dashboardEvent.type || 'other'] || 'other';

  // Recurring 변환
  let recurring: EventRecurring | undefined;
  if (dashboardEvent.recurring) {
    const pattern = DASHBOARD_TO_STORAGE_RECURRING[dashboardEvent.recurring];
    if (pattern) {
      recurring = {
        pattern,
        interval: 1,
      };
    }
  }

  const storageEvent: StorageCalendarEvent = {
    id: dashboardEvent.id,
    userId,
    title: dashboardEvent.title,
    description: dashboardEvent.description,
    location: dashboardEvent.location,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    allDay: dashboardEvent.allDay,
    type: eventType,
    color: dashboardEvent.color,
    recurring,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return storageEvent;
}

/**
 * Convert Storage CalendarEvent (Storage API entity) to Dashboard CalendarEvent (UI type)
 *
 * @param storageEvent - Storage API CalendarEvent entity
 * @returns UI type CalendarEvent
 */
export function toDashboardCalendarEvent(
  storageEvent: StorageCalendarEvent
): DashboardCalendarEvent {
  const startDate = new Date(storageEvent.startDate);
  const endDate = new Date(storageEvent.endDate);

  // Time 추출
  let startTime: string | undefined;
  let endTime: string | undefined;

  if (!storageEvent.allDay) {
    startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  }

  // Type 변환
  const eventType = STORAGE_TO_DASHBOARD_TYPE[storageEvent.type] || 'other';

  // Recurring 변환
  let recurring: DashboardCalendarEvent['recurring'];
  if (storageEvent.recurring) {
    recurring = STORAGE_TO_DASHBOARD_RECURRING[storageEvent.recurring.pattern];
  }

  const dashboardEvent: DashboardCalendarEvent = {
    id: storageEvent.id,
    title: storageEvent.title,
    description: storageEvent.description,
    location: storageEvent.location,
    date: startDate,
    startTime,
    endTime,
    allDay: storageEvent.allDay,
    color: storageEvent.color,
    recurring,
    type: eventType,
  };

  return dashboardEvent;
}

// ============================================================================
// Legacy Migration
// ============================================================================

/**
 * Migrate legacy calendar events from old localStorage to new Storage API
 *
 * Old key: 'weave_calendar_events'
 */
export async function migrateLegacyCalendarEvents(): Promise<void> {
  const LEGACY_EVENTS_KEY = 'weave_calendar_events';

  try {
    // 이미 마이그레이션 되었는지 확인
    const existingEvents = await calendarService.getAll();
    if (existingEvents.length > 0) {
      console.log('✅ Calendar events already migrated, skipping legacy migration');
      return;
    }

    // Legacy events 읽기
    const legacyEventsStr = localStorage.getItem(LEGACY_EVENTS_KEY);
    if (!legacyEventsStr) {
      console.log('ℹ️ No legacy calendar events found');
      return;
    }

    let legacyEvents: DashboardCalendarEvent[] = [];

    const parsed = JSON.parse(legacyEventsStr);

    // CalendarWidget 데이터 구조 처리
    if (parsed.events && Array.isArray(parsed.events)) {
      legacyEvents = parsed.events;
    }
    // 직접 배열인 경우
    else if (Array.isArray(parsed)) {
      legacyEvents = parsed;
    }

    if (legacyEvents.length === 0) {
      console.log('ℹ️ No calendar events to migrate');
      return;
    }

    // Date 객체 복원
    legacyEvents.forEach((event: any) => {
      event.date = event.date ? new Date(event.date) : new Date();
    });

    console.log(`📦 Migrating ${legacyEvents.length} legacy calendar events...`);

    // Dashboard CalendarEvent → Storage CalendarEvent 변환 및 저장
    for (const dashboardEvent of legacyEvents) {
      const storageEvent = toStorageCalendarEvent(dashboardEvent);
      await calendarService.create(storageEvent);
    }

    console.log(`✅ Successfully migrated ${legacyEvents.length} calendar events`);

  } catch (error) {
    console.error('❌ Failed to migrate legacy calendar events:', error);
  }
}

// ============================================================================
// Storage API Wrapper Functions (async)
// ============================================================================

/**
 * Get all calendar events (converts Storage CalendarEvent[] to Dashboard CalendarEvent[])
 */
export async function getCalendarEvents(): Promise<DashboardCalendarEvent[]> {
  // Legacy migration (once)
  await migrateLegacyCalendarEvents();

  const storageEvents = await calendarService.getAll();

  // Storage CalendarEvent[] → Dashboard CalendarEvent[] 변환
  return storageEvents.map(toDashboardCalendarEvent);
}

/**
 * Save calendar events (converts Dashboard CalendarEvent[] to Storage CalendarEvent[] and saves)
 */
export async function saveCalendarEvents(dashboardEvents: DashboardCalendarEvent[]): Promise<void> {
  // 기존 모든 events 삭제
  const existingEvents = await calendarService.getAll();
  for (const event of existingEvents) {
    await calendarService.delete(event.id);
  }

  // 새로운 events 저장
  for (const dashboardEvent of dashboardEvents) {
    const storageEvent = toStorageCalendarEvent(dashboardEvent);
    await calendarService.create(storageEvent);
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  return await calendarService.delete(eventId);
}

/**
 * Clear all calendar events
 */
export async function clearAllCalendarEvents(): Promise<void> {
  const events = await calendarService.getAll();
  for (const event of events) {
    await calendarService.delete(event.id);
  }
}
