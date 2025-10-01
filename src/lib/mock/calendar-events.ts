import { CalendarEvent } from '@/types/dashboard';
import { addDays, format } from 'date-fns';

// 로컬스토리지 키
const CALENDAR_EVENTS_KEY = 'weave_calendar_events';

// 초기 목데이터 (Phase 5 테스트를 위해 임시로 비활성화)
const generateMockEvents = (): CalendarEvent[] => {
  // Phase 5 E2E 테스트: 빈 상태 테스트를 위해 빈 배열 반환
  return [];

  // 원본 목데이터 (테스트 후 복원 필요)
  /*
  const today = new Date();

  return [
    {
      id: 'event-1',
      title: '프로젝트 킥오프 미팅',
      description: '새 프로젝트 시작을 위한 전체 팀 미팅',
      location: '회의실 A (3층)',
      date: today,
      type: 'meeting',
      allDay: false,
      startTime: '10:00',
      endTime: '11:30',
    },
    ... (15개 이벤트)
  ];
  */
};

// 로컬스토리지에서 이벤트 로드
export const loadCalendarEvents = (): CalendarEvent[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CALENDAR_EVENTS_KEY);
    if (stored) {
      const events = JSON.parse(stored);
      // Date 객체로 변환
      return events.map((event: any) => ({
        ...event,
        date: new Date(event.date),
      }));
    }
  } catch (error) {
    console.error('Failed to load calendar events:', error);
  }
  
  // Phase 5 E2E 테스트: 로컬스토리지에 데이터가 없으면 빈 배열 반환
  // 목데이터 자동 생성 비활성화
  return [];
};

// 로컬스토리지에 이벤트 저장
export const saveCalendarEvents = (events: CalendarEvent[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save calendar events:', error);
  }
};

// 이벤트 추가
export const addCalendarEvent = (event: CalendarEvent): CalendarEvent[] => {
  const events = loadCalendarEvents();
  const newEvents = [...events, event];
  saveCalendarEvents(newEvents);
  return newEvents;
};

// 이벤트 수정
export const updateCalendarEvent = (updatedEvent: CalendarEvent): CalendarEvent[] => {
  const events = loadCalendarEvents();
  const newEvents = events.map(event => 
    event.id === updatedEvent.id ? updatedEvent : event
  );
  saveCalendarEvents(newEvents);
  return newEvents;
};

// 이벤트 삭제
export const deleteCalendarEvent = (eventId: string): CalendarEvent[] => {
  const events = loadCalendarEvents();
  const newEvents = events.filter(event => event.id !== eventId);
  saveCalendarEvents(newEvents);
  return newEvents;
};

// 목데이터 리셋 (개발용)
export const resetCalendarEvents = (): CalendarEvent[] => {
  const mockEvents = generateMockEvents();
  saveCalendarEvents(mockEvents);
  return mockEvents;
};