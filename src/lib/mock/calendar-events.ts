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

// ========================================
// 🐛 디버깅 및 캐시 문제 해결 함수들
// ========================================

/**
 * 브라우저 캐싱 vs localStorage 불일치 문제 디버깅 함수
 * 시크릿 모드에서는 작동하지만 일반 모드에서 작동하지 않는 문제 해결용
 */

// localStorage의 모든 데이터를 로그로 출력하여 상태 확인
export function debugLocalStorageState(): void {
  if (typeof window === 'undefined') {
    console.log('🔍 [DEBUG] 서버사이드에서는 localStorage에 접근할 수 없습니다.');
    return;
  }

  console.log('🔍 [DEBUG] === localStorage 상태 전체 점검 (캘린더) ===');
  console.log(`총 localStorage 키 개수: ${localStorage.length}`);

  // 모든 localStorage 키를 순회하며 출력
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);

      // Weave 캘린더 관련 데이터인지 확인
      if (key.includes('weave_calendar') || key.includes('calendar_events')) {
        console.log(`🎯 [WEAVE 캘린더] ${key}:`, value);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            console.log(`📊 [파싱됨] ${key}:`, parsed);
            if (Array.isArray(parsed)) {
              console.log(`📊 [캘린더 이벤트 개수]: ${parsed.length}개`);
            }
          } catch (error) {
            console.error(`❌ [ERROR] ${key} 데이터 파싱 실패:`, error);
          }
        }
      }
    }
  }

  // 우리 시스템의 캘린더 이벤트 키 특별히 확인
  const calendarEvents = localStorage.getItem(CALENDAR_EVENTS_KEY);
  console.log('📊 [WEAVE 캘린더] 캘린더 이벤트 데이터:', calendarEvents);
  if (calendarEvents) {
    try {
      const parsed = JSON.parse(calendarEvents);
      console.log('📊 [WEAVE 캘린더] 파싱된 데이터:', parsed);
      console.log('📊 [WEAVE 캘린더] 이벤트 개수:', Array.isArray(parsed) ? parsed.length : 0);
    } catch (error) {
      console.error('❌ [ERROR] 캘린더 이벤트 데이터 파싱 실패:', error);
    }
  }
  console.log('🔍 [DEBUG] =================================');
}

// 오래된/잘못된 데이터 구조를 감지하고 정리
export function clearStaleCalendarData(): void {
  if (typeof window === 'undefined') return;

  console.log('🧹 [CLEANUP] 오래된 캘린더 데이터 정리 시작...');

  let cleanupCount = 0;
  const keysToRemove: string[] = [];

  // localStorage를 순회하며 정리할 키들 찾기
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // 이전 버전에서 사용했을 가능성이 있는 키 패턴들
      const isOldCalendarKey = (
        key.includes('calendar') &&
        key !== CALENDAR_EVENTS_KEY &&
        (key.includes('event') || key.includes('weave'))
      );

      // 잘못된 형식의 캘린더 키
      const isInvalidCalendarKey = (
        key.startsWith('calendar-') && key.includes('events')
      );

      if (isOldCalendarKey || isInvalidCalendarKey) {
        keysToRemove.push(key);
        cleanupCount++;
        console.log(`🗑️  정리 대상: ${key}`);
      }
    }
  }

  // 찾은 키들 삭제
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ 삭제 완료: ${key}`);
  });

  // 현재 캘린더 이벤트 데이터도 검증하고 정리
  const currentEvents = localStorage.getItem(CALENDAR_EVENTS_KEY);
  if (currentEvents) {
    try {
      const parsed = JSON.parse(currentEvents);
      let needsUpdate = false;

      if (Array.isArray(parsed)) {
        // 유효한 이벤트 데이터인지 검증
        const validEvents = parsed.filter((event: any) =>
          event &&
          typeof event === 'object' &&
          event.id &&
          event.title &&
          event.date
        );

        if (validEvents.length !== parsed.length) {
          console.log(`🔧 ${parsed.length - validEvents.length}개 잘못된 이벤트 데이터 정리`);
          needsUpdate = true;
        }

        if (needsUpdate) {
          localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(validEvents));
          console.log('✅ 캘린더 이벤트 데이터 정리 및 업데이트 완료');
        }
      } else {
        console.log(`🗑️  잘못된 캘린더 데이터 형식 제거`);
        localStorage.removeItem(CALENDAR_EVENTS_KEY);
      }
    } catch (error) {
      console.error('❌ 현재 캘린더 데이터 정리 중 오류:', error);
      // 완전히 깨진 데이터라면 초기화
      localStorage.removeItem(CALENDAR_EVENTS_KEY);
      console.log('🆕 캘린더 데이터 초기화 완료');
    }
  }

  console.log(`🧹 [CLEANUP] 정리 완료! ${cleanupCount}개 항목 정리됨`);
}

// 강제로 모든 캘린더 데이터를 초기화 (핵옵션)
export function resetAllCalendarData(): void {
  if (typeof window === 'undefined') return;

  console.log('💣 [RESET] 모든 캘린더 데이터 초기화...');

  // 캘린더 관련 모든 localStorage 키 제거
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('calendar') || key.includes('weave_calendar'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️  제거: ${key}`);
  });

  console.log(`💣 [RESET] ${keysToRemove.length}개 항목 초기화 완료!`);
  console.log('🔄 페이지를 새로고침하여 깨끗한 상태로 시작하세요.');
}

// 캘린더 이벤트 데이터 상태 확인
export function debugCalendarEvents(): void {
  console.log(`🔍 [CALENDAR DEBUG] 캘린더 이벤트 상태 확인`);

  const events = loadCalendarEvents();
  console.log(`📊 현재 이벤트 개수: ${events.length}`);
  console.log('📄 이벤트 목록:', events);

  if (events.length > 0) {
    events.forEach((event, index) => {
      console.log(`📄 이벤트 ${index + 1}:`, {
        id: event.id,
        title: event.title,
        date: event.date,
        type: event.type,
        allDay: event.allDay,
        startTime: event.startTime,
        endTime: event.endTime
      });
    });
  } else {
    console.log('📭 저장된 캘린더 이벤트가 없습니다.');
  }

  // localStorage에서 직접 확인
  const rawData = localStorage.getItem(CALENDAR_EVENTS_KEY);
  if (rawData) {
    try {
      const allEvents = JSON.parse(rawData);
      console.log(`🗄️  localStorage 직접 조회 결과:`, allEvents);
    } catch (error) {
      console.error('❌ localStorage 데이터 파싱 오류:', error);
    }
  }
}

// 캐시 문제 해결을 위한 원스톱 함수
export function fixCalendarCacheIssues(): void {
  console.log('🚑 [CACHE FIX] 브라우저 캐싱 문제 해결 시작 (캘린더)...');

  // 1단계: 현재 상태 진단
  console.log('1️⃣ 현재 상태 진단');
  debugLocalStorageState();

  // 2단계: 오래된 데이터 정리
  console.log('2️⃣ 오래된 데이터 정리');
  clearStaleCalendarData();

  // 3단계: 정리 후 상태 확인
  console.log('3️⃣ 정리 후 상태 확인');
  debugLocalStorageState();

  console.log('🚑 [CACHE FIX] 캐시 문제 해결 완료!');
  console.log('🔄 이제 캘린더 위젯에서 이벤트를 추가/수정해보세요.');
}

// 개발 환경에서 디버깅 함수들을 전역으로 노출
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugWeaveCalendar = {
    debugLocalStorageState,
    clearStaleCalendarData,
    resetAllCalendarData,
    debugCalendarEvents,
    fixCalendarCacheIssues
  };
  console.log('🛠️  개발 모드: window.debugWeaveCalendar 디버깅 도구 사용 가능');
}