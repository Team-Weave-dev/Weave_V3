import { CalendarEvent } from '@/types/dashboard';
import { addDays, format } from 'date-fns';

// 로컬스토리지 키
const CALENDAR_EVENTS_KEY = 'weave_calendar_events';

// 초기 목데이터
const generateMockEvents = (): CalendarEvent[] => {
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
    {
      id: 'event-2',
      title: '클라이언트 프레젠테이션',
      description: '월간 진행 상황 보고 및 피드백 수렴',
      location: '클라이언트 사무실 (강남)',
      date: addDays(today, 1),
      type: 'meeting',
      allDay: false,
      startTime: '14:00',
      endTime: '15:30',
    },
    {
      id: 'event-3',
      title: '디자인 리뷰',
      description: 'UI/UX 디자인 검토 및 개선사항 논의',
      location: '온라인 (Zoom)',
      date: addDays(today, 2),
      type: 'task',
      allDay: false,
      startTime: '15:00',
      endTime: '16:00',
    },
    {
      id: 'event-4',
      title: '분기 보고서 마감',
      description: '3분기 실적 보고서 제출 마감일',
      location: '',
      date: addDays(today, 3),
      type: 'deadline',
      allDay: true,
    },
    {
      id: 'event-5',
      title: '팀 빌딩 워크샵',
      description: '팀 협업 강화를 위한 워크샵',
      location: '서울숲 컨퍼런스룸',
      date: addDays(today, 5),
      type: 'meeting',
      allDay: true,
    },
    {
      id: 'event-6',
      title: '코드 리뷰',
      description: '주간 코드 리뷰 세션',
      location: '회의실 B (2층)',
      date: addDays(today, 7),
      type: 'task',
      allDay: false,
      startTime: '16:00',
      endTime: '17:00',
    },
    {
      id: 'event-7',
      title: '월간 회의',
      description: '전체 직원 월간 업무 보고',
      location: '대회의실',
      date: addDays(today, 10),
      type: 'meeting',
      allDay: false,
      startTime: '09:00',
      endTime: '10:30',
    },
    {
      id: 'event-8',
      title: '배포 준비',
      description: '버전 2.0 배포를 위한 최종 점검',
      location: '개발팀 사무실',
      date: addDays(today, 12),
      type: 'task',
      allDay: false,
      startTime: '13:00',
      endTime: '18:00',
    },
    {
      id: 'event-9',
      title: '세미나 참석',
      description: 'React 최신 기술 동향 세미나',
      location: '코엑스 컨벤션센터',
      date: addDays(today, 14),
      type: 'other',
      allDay: true,
    },
    {
      id: 'event-10',
      title: '마케팅 전략 회의',
      description: '다음 분기 마케팅 전략 수립',
      location: '회의실 C (4층)',
      date: addDays(today, -3),
      type: 'meeting',
      allDay: false,
      startTime: '14:00',
      endTime: '16:00',
    },
    {
      id: 'event-11',
      title: '보안 점검',
      description: '분기별 보안 시스템 점검',
      location: '서버실',
      date: addDays(today, -1),
      type: 'task',
      allDay: false,
      startTime: '10:00',
      endTime: '12:00',
    },
    {
      id: 'event-12',
      title: '휴가',
      description: '여름 휴가',
      location: '제주도',
      date: addDays(today, 20),
      type: 'holiday',
      allDay: true,
    },
    {
      id: 'event-13',
      title: '성과 평가 면담',
      description: '상반기 성과 평가 1:1 면담',
      location: '인사팀 회의실',
      date: addDays(today, 8),
      type: 'meeting',
      allDay: false,
      startTime: '11:00',
      endTime: '12:00',
    },
    {
      id: 'event-14',
      title: '예산 검토',
      description: '하반기 예산 집행 계획 검토',
      location: '재무팀 사무실',
      date: addDays(today, 4),
      type: 'reminder',
      allDay: false,
      startTime: '15:00',
      endTime: '16:30',
    },
    {
      id: 'event-15',
      title: '신입사원 환영회',
      description: '7월 입사자 환영 점심',
      location: '회사 근처 레스토랑',
      date: addDays(today, 6),
      type: 'other',
      allDay: false,
      startTime: '12:00',
      endTime: '14:00',
    },
  ];
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
  
  // 로컬스토리지에 데이터가 없으면 목데이터 생성 및 저장
  const mockEvents = generateMockEvents();
  saveCalendarEvents(mockEvents);
  return mockEvents;
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