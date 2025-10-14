import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '@/types/dashboard';
import { loadCalendarEvents } from '@/lib/mock/calendar-events';
import { notifyCalendarDataChanged, addCalendarDataChangedListener } from '@/lib/calendar-integration/events';
import { calendarService } from '@/lib/storage';
import type { CalendarEvent as StorageCalendarEvent } from '@/lib/storage/types/entities/event';

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
    // Calculate from date + startTime/endTime (legacy behavior)
    const eventDate = dashboardEvent.date instanceof Date ? dashboardEvent.date : new Date(dashboardEvent.date);

    // startDate 생성: date + startTime
    let startDateTime = new Date(eventDate);
    if (dashboardEvent.startTime) {
      const [hours, minutes] = dashboardEvent.startTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
    }
    startDate = startDateTime.toISOString();

    // endDate 생성: date + endTime
    let endDateTime = new Date(eventDate);
    if (dashboardEvent.endTime) {
      const [hours, minutes] = dashboardEvent.endTime.split(':').map(Number);
      endDateTime.setHours(hours, minutes, 0, 0);
    }

    // endDate가 startDate보다 이르거나 같으면 자동으로 1시간 추가
    if (endDateTime.getTime() <= startDateTime.getTime()) {
      if (dashboardEvent.allDay) {
        // 종일 이벤트: 다음 날 자정으로 설정
        endDateTime = new Date(startDateTime);
        endDateTime.setDate(endDateTime.getDate() + 1);
        endDateTime.setHours(0, 0, 0, 0);
      } else {
        // 일반 이벤트: 시작 시간 + 1시간
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
      }
    }
    endDate = endDateTime.toISOString();

    console.log('[toStorageEvent] Calculated dates from date+time:', {
      startDate,
      endDate,
      source: 'date+time calculation'
    });
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
      const { source } = event.detail;

      // calendar 소스의 변경사항만 처리 (자신이 발생시킨 이벤트도 포함)
      if (source === 'calendar') {
        console.log('[useCalendarEvents] Calendar data changed, refreshing events:', event.detail);
        refreshEvents();
      }
    };

    const unsubscribe = addCalendarDataChangedListener(handleCalendarDataChanged);
    return () => unsubscribe();
  }, [refreshEvents]);

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

      // 실시간 동기화: 다른 위젯들에게 변경사항 알림
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'add',
        itemId: createdEvent.id, // CalendarService가 생성한 ID 사용
        timestamp: Date.now(),
      });

      return true;
    } catch (err) {
      console.error('[useCalendarEvents] Failed to add event:', err);
      setError(err as Error);
      return false;
    }
  }, [refreshEvents]);

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

      // 실시간 동기화: 다른 위젯들에게 변경사항 알림
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'update',
        itemId: event.id,
        timestamp: Date.now(),
      });

      return true;
    } catch (err) {
      console.error('[useCalendarEvents] Failed to update event:', err);
      setError(err as Error);
      return false;
    }
  }, [refreshEvents]);

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

      // 실시간 동기화: 다른 위젯들에게 변경사항 알림
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'delete',
        itemId: eventId,
        timestamp: Date.now(),
      });

      return true;
    } catch (err) {
      console.error('[useCalendarEvents] Failed to delete event:', err);
      setError(err as Error);
      return false;
    }
  }, [refreshEvents]);

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