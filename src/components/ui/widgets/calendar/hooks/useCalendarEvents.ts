import { useState, useEffect, useCallback, useId } from 'react';
import type { CalendarEvent } from '@/types/dashboard';
import { loadCalendarEvents } from '@/lib/mock/calendar-events';
import { notifyCalendarDataChanged, addCalendarDataChangedListener } from '@/lib/calendar-integration/events';
import { calendarService } from '@/lib/storage';
import type { CalendarEvent as StorageCalendarEvent } from '@/lib/storage/types/entities/event';

/**
 * Validate ISO date string
 * @param dateStr - ISO date string to validate
 * @returns true if valid, false otherwise
 */
function isValidISODate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;

  try {
    const date = new Date(dateStr);
    // Check if date is valid and matches ISO format
    return !isNaN(date.getTime()) && dateStr === date.toISOString();
  } catch {
    return false;
  }
}

/**
 * Dashboard CalendarEvent → Storage CalendarEvent 변환
 *
 * IMPORTANT: handleDragEnd에서 이미 UTC 기반으로 계산된 startDate/endDate가 있을 경우,
 * 해당 값을 우선적으로 사용합니다. 이는 timezone 변환 버그를 방지합니다.
 */
function toStorageEvent(dashboardEvent: CalendarEvent): Omit<StorageCalendarEvent, 'id' | 'createdAt' | 'updatedAt'> {
  // Check if pre-calculated startDate/endDate exist (from handleDragEnd)
  const preCalculatedStartDate = (dashboardEvent as any).startDate;
  const preCalculatedEndDate = (dashboardEvent as any).endDate;

  let startDate: string;
  let endDate: string;

  if (preCalculatedStartDate && preCalculatedEndDate) {
    // Use pre-calculated UTC dates (from handleDragEnd)
    // This prevents timezone conversion issues
    startDate = preCalculatedStartDate;
    endDate = preCalculatedEndDate;

    console.log('[toStorageEvent] Using pre-calculated dates:', {
      startDate,
      endDate,
      source: 'handleDragEnd'
    });
  } else {
    // Calculate from date/endDate + startTime/endTime
    const startEventDate = dashboardEvent.date instanceof Date ? dashboardEvent.date : new Date(dashboardEvent.date);
    const endEventDate = dashboardEvent.endDate
      ? (dashboardEvent.endDate instanceof Date ? dashboardEvent.endDate : new Date(dashboardEvent.endDate))
      : startEventDate;

    // startDate 생성: date + startTime
    if (dashboardEvent.allDay) {
      // 종일 일정: 사용자가 선택한 날짜를 UTC 자정으로 저장 (타임존 독립적)
      const year = startEventDate.getFullYear();
      const month = startEventDate.getMonth();
      const day = startEventDate.getDate();
      const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      startDate = utcDate.toISOString();
    } else {
      // 시간 일정: 로컬 타임존 유지 후 UTC로 변환
      let startDateTime = new Date(startEventDate);
      if (dashboardEvent.startTime) {
        const [hours, minutes] = dashboardEvent.startTime.split(':').map(Number);
        startDateTime.setHours(hours, minutes, 0, 0);
      }
      startDate = startDateTime.toISOString();
    }

    // endDate 생성: endDate + endTime
    if (dashboardEvent.allDay) {
      // 종일 일정: 종료일은 해당 날짜의 23:59:59 UTC로 저장 (inclusive end)
      const year = endEventDate.getFullYear();
      const month = endEventDate.getMonth();
      const day = endEventDate.getDate();
      const utcDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      endDate = utcDate.toISOString();
    } else {
      // 시간 일정: 로컬 타임존 유지 후 UTC로 변환
      let endDateTime = new Date(endEventDate);
      if (dashboardEvent.endTime) {
        const [hours, minutes] = dashboardEvent.endTime.split(':').map(Number);
        endDateTime.setHours(hours, minutes, 0, 0);
      }

      // endDate가 startDate보다 이르거나 같으면 자동으로 1시간 추가
      const startDateTime = new Date(startDate);
      if (endDateTime.getTime() <= startDateTime.getTime()) {
        // 일반 이벤트: 시작 시간 + 1시간
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
      }
      endDate = endDateTime.toISOString();
    }

    console.log('[toStorageEvent] Calculated dates from date/endDate+time:', {
      startDate,
      endDate,
      allDay: dashboardEvent.allDay,
      hasEndDate: !!dashboardEvent.endDate,
      source: 'date+time calculation'
    });
  }

  // Validate dates before returning
  if (!isValidISODate(startDate)) {
    console.error('[toStorageEvent] Invalid startDate:', {
      startDate,
      title: dashboardEvent.title,
      allDay: dashboardEvent.allDay,
      originalDate: dashboardEvent.date
    });
    throw new Error(`Invalid startDate format: ${startDate}`);
  }

  if (!isValidISODate(endDate)) {
    console.error('[toStorageEvent] Invalid endDate:', {
      endDate,
      title: dashboardEvent.title,
      allDay: dashboardEvent.allDay,
      originalEndDate: dashboardEvent.endDate
    });
    throw new Error(`Invalid endDate format: ${endDate}`);
  }

  // Validate that endDate is after startDate
  if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
    console.error('[toStorageEvent] endDate must be after startDate:', {
      startDate,
      endDate,
      title: dashboardEvent.title
    });
    throw new Error('Event endDate must be after startDate');
  }

  return {
    userId: 'current-user', // TODO: 실제 사용자 ID로 교체
    title: dashboardEvent.title,
    description: dashboardEvent.description,
    location: dashboardEvent.location,
    startDate,
    endDate,
    allDay: dashboardEvent.allDay || false,
    type: dashboardEvent.type || 'event',
    category: 'work', // 기본값
    status: 'confirmed', // 기본값
    color: dashboardEvent.color,
    recurring: dashboardEvent.recurring,
    timezone: 'Asia/Seoul', // 기본값
  };
}

/**
 * useCalendarEvents Hook
 * 캘린더 이벤트 관리를 위한 커스텀 훅
 */
export function useCalendarEvents(initialEvents?: CalendarEvent[]) {
  // 컴포넌트 고유 ID 생성 (자기 자신이 보낸 이벤트 필터링용)
  const componentId = useId();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 이벤트 새로고침 함수 (다른 곳에서도 사용하므로 먼저 정의)
  const refreshEvents = useCallback(async () => {
    try {
      const loadedEvents = await loadCalendarEvents();
      setEvents(loadedEvents);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  // 이벤트 로드
  useEffect(() => {
    const loadEvents = async () => {
      try {
        if (initialEvents && initialEvents.length > 0) {
          setEvents(initialEvents);
        } else {
          const loadedEvents = await loadCalendarEvents();
          setEvents(loadedEvents);
        }
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [initialEvents]);

  // calendarDataChanged 이벤트 리스닝 - 다른 곳에서 변경된 캘린더 이벤트를 실시간 반영
  useEffect(() => {
    const handleCalendarDataChanged = (event: CustomEvent) => {
      const { source, originId } = event.detail;

      // 자기 자신이 보낸 이벤트는 무시 (중복 새로고침 방지)
      if (originId === componentId) {
        console.log('[useCalendarEvents] Ignoring own event:', event.detail);
        return;
      }

      // calendar 소스의 변경사항만 처리
      if (source === 'calendar') {
        console.log('[useCalendarEvents] Calendar data changed from other component, refreshing:', event.detail);
        refreshEvents();
      }
    };

    const unsubscribe = addCalendarDataChangedListener(handleCalendarDataChanged);
    return () => unsubscribe();
  }, [refreshEvents, componentId]);

  // 이벤트 추가
  const addEvent = useCallback(async (event: CalendarEvent) => {
    try {
      // Dashboard CalendarEvent → Storage CalendarEvent 변환
      const storageEventData = toStorageEvent(event);

      console.log('[useCalendarEvents] Converting event:', {
        dashboard: event,
        storage: storageEventData
      });

      // CalendarService를 사용하여 이벤트 생성 (ActivityLog 자동 기록)
      // BaseService가 자동으로 ID를 생성하므로 id를 전달하지 않음
      const createdEvent = await calendarService.create(storageEventData);

      console.log('[useCalendarEvents] Event created with activity log:', createdEvent.id);

      // 이벤트 목록 새로고침
      await refreshEvents();

      // 다른 컴포넌트에 알림 (자기 자신은 originId로 필터링)
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'add',
        itemId: createdEvent.id,
        timestamp: Date.now(),
        originId: componentId,
      });

      return true;
    } catch (err) {
      console.error('[useCalendarEvents] Failed to add event:', err);
      setError(err as Error);
      return false;
    }
  }, [refreshEvents, componentId]);

  // 이벤트 수정
  const updateEvent = useCallback(async (event: CalendarEvent) => {
    try {
      // Dashboard CalendarEvent → Storage CalendarEvent 변환
      const storageEventData = toStorageEvent(event);

      // CalendarService를 사용하여 이벤트 수정 (ActivityLog 자동 기록)
      const updatedEvent = await calendarService.update(event.id, storageEventData);

      if (!updatedEvent) {
        throw new Error(`Event not found: ${event.id}`);
      }

      console.log('[useCalendarEvents] Event updated with activity log:', updatedEvent.id);

      // 이벤트 목록 새로고침
      await refreshEvents();

      // 다른 컴포넌트에 알림 (자기 자신은 originId로 필터링)
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'update',
        itemId: updatedEvent.id,
        timestamp: Date.now(),
        originId: componentId,
      });

      return true;
    } catch (err) {
      console.error('[useCalendarEvents] Failed to update event:', err);
      setError(err as Error);
      return false;
    }
  }, [refreshEvents, componentId]);

  // 이벤트 삭제
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      // CalendarService를 사용하여 이벤트 삭제 (ActivityLog 자동 기록)
      const success = await calendarService.delete(eventId);

      if (!success) {
        throw new Error(`Event not found or failed to delete: ${eventId}`);
      }

      console.log('[useCalendarEvents] Event deleted with activity log:', eventId);

      // 이벤트 목록 새로고침
      await refreshEvents();

      // 다른 컴포넌트에 알림 (자기 자신은 originId로 필터링)
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'delete',
        itemId: eventId,
        timestamp: Date.now(),
        originId: componentId,
      });

      return true;
    } catch (err) {
      console.error('[useCalendarEvents] Failed to delete event:', err);
      setError(err as Error);
      return false;
    }
  }, [refreshEvents, componentId]);

  // 날짜별 이벤트 필터링
  const getEventsByDate = useCallback(
    (date: Date) => {
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      });
    },
    [events]
  );

  // 기간별 이벤트 필터링
  const getEventsByRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    },
    [events]
  );

  return {
    events,
    isLoading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
    getEventsByRange,
    refreshEvents,
  };
}