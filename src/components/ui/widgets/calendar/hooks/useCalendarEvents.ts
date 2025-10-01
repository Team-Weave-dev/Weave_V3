import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '@/types/dashboard';
import {
  loadCalendarEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/mock/calendar-events';
import { notifyCalendarDataChanged } from '@/lib/calendar-integration/events';

/**
 * useCalendarEvents Hook
 * 캘린더 이벤트 관리를 위한 커스텀 훅
 */
export function useCalendarEvents(initialEvents?: CalendarEvent[]) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 이벤트 로드
  useEffect(() => {
    try {
      if (initialEvents && initialEvents.length > 0) {
        setEvents(initialEvents);
      } else {
        const loadedEvents = loadCalendarEvents();
        setEvents(loadedEvents);
      }
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [initialEvents]);

  // 이벤트 추가
  const addEvent = useCallback((event: CalendarEvent) => {
    try {
      const updatedEvents = addCalendarEvent(event);
      setEvents(updatedEvents);

      // 실시간 동기화: 다른 위젯들에게 변경사항 알림
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'add',
        itemId: event.id,
        timestamp: Date.now(),
      });

      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }, []);

  // 이벤트 수정
  const updateEvent = useCallback((event: CalendarEvent) => {
    try {
      const updatedEvents = updateCalendarEvent(event);
      setEvents(updatedEvents);

      // 실시간 동기화: 다른 위젯들에게 변경사항 알림
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'update',
        itemId: event.id,
        timestamp: Date.now(),
      });

      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }, []);

  // 이벤트 삭제
  const deleteEvent = useCallback((eventId: string) => {
    try {
      const updatedEvents = deleteCalendarEvent(eventId);
      setEvents(updatedEvents);

      // 실시간 동기화: 다른 위젯들에게 변경사항 알림
      notifyCalendarDataChanged({
        source: 'calendar',
        changeType: 'delete',
        itemId: eventId,
        timestamp: Date.now(),
      });

      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }, []);

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
  };
}