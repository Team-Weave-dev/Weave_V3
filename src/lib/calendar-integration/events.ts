// Calendar Integration Events
// 위젯 간 실시간 데이터 동기화를 위한 CustomEvent 시스템

import type { CalendarItemSource } from '@/types/integrated-calendar';

/**
 * 캘린더 데이터 변경 이벤트 타입
 */
export interface CalendarDataChangedDetail {
  /**
   * 변경이 발생한 소스 (calendar, tax, todo)
   */
  source: CalendarItemSource;

  /**
   * 변경 유형
   */
  changeType: 'add' | 'update' | 'delete';

  /**
   * 변경된 아이템의 ID (옵션)
   */
  itemId?: string;

  /**
   * 변경 발생 시각
   */
  timestamp: number;

  /**
   * 이벤트 발신자 ID (자기 자신이 보낸 이벤트 필터링용)
   */
  originId?: string;
}

/**
 * 캘린더 데이터 변경 이벤트 이름
 */
export const CALENDAR_DATA_CHANGED = 'calendar-data-changed' as const;

/**
 * 캘린더 데이터 변경 알림 발송
 *
 * 각 위젯에서 데이터가 변경될 때 호출하여
 * IntegratedCalendarManager에 변경사항을 알립니다.
 *
 * @param detail 변경 상세 정보
 *
 * @example
 * ```typescript
 * // CalendarWidget에서 이벤트 추가 시
 * notifyCalendarDataChanged({
 *   source: 'calendar',
 *   changeType: 'add',
 *   itemId: newEventId,
 *   timestamp: Date.now()
 * });
 *
 * // TodoListWidget에서 작업 삭제 시
 * notifyCalendarDataChanged({
 *   source: 'todo',
 *   changeType: 'delete',
 *   itemId: deletedTaskId,
 *   timestamp: Date.now()
 * });
 * ```
 */
export function notifyCalendarDataChanged(detail: CalendarDataChangedDetail): void {
  // CustomEvent 생성
  const event = new CustomEvent(CALENDAR_DATA_CHANGED, {
    detail,
    bubbles: false, // 버블링 불필요 (전역 이벤트)
    cancelable: false, // 취소 불가능
  });

  // 전역 window 객체에 이벤트 발송
  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }
}

/**
 * 캘린더 데이터 변경 이벤트 리스너 타입
 */
export type CalendarDataChangedListener = (event: CustomEvent<CalendarDataChangedDetail>) => void;

/**
 * 캘린더 데이터 변경 이벤트 리스너 등록
 *
 * @param listener 이벤트 리스너 함수
 * @returns 이벤트 리스너 해제 함수
 *
 * @example
 * ```typescript
 * // IntegratedCalendarManager에서 사용
 * const unsubscribe = addCalendarDataChangedListener((event) => {
 *   console.log('Data changed:', event.detail);
 *   this.invalidateCache();
 *   this.getAllItems();
 * });
 *
 * // 정리 시
 * unsubscribe();
 * ```
 */
export function addCalendarDataChangedListener(
  listener: CalendarDataChangedListener
): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // SSR 환경에서는 no-op
  }

  // 타입 안전한 리스너 래퍼
  const wrappedListener = (event: Event) => {
    listener(event as CustomEvent<CalendarDataChangedDetail>);
  };

  window.addEventListener(CALENDAR_DATA_CHANGED, wrappedListener);

  // 해제 함수 반환
  return () => {
    window.removeEventListener(CALENDAR_DATA_CHANGED, wrappedListener);
  };
}

/**
 * localStorage 변경 이벤트 리스너 등록
 *
 * 다른 탭에서의 데이터 변경을 감지하기 위한 리스너입니다.
 *
 * @param storageKey 감지할 localStorage 키
 * @param callback 변경 감지 시 호출할 콜백
 * @returns 이벤트 리스너 해제 함수
 *
 * @example
 * ```typescript
 * const unsubscribe = addStorageListener('weave_calendar_events', () => {
 *   console.log('Calendar events changed in another tab');
 *   this.invalidateCache();
 *   this.getAllItems();
 * });
 * ```
 */
export function addStorageListener(
  storageKey: string,
  callback: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // SSR 환경에서는 no-op
  }

  const handleStorageChange = (event: StorageEvent) => {
    // 관심있는 키의 변경만 처리
    if (event.key === storageKey) {
      callback();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // 해제 함수 반환
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}