// Calendar Data Adapter
// CalendarEvent를 UnifiedCalendarItem으로 변환

import type { CalendarEvent } from '@/types/dashboard';
import type {
  UnifiedCalendarItem,
  IDataAdapter,
  Priority,
  ItemStatus,
  CalendarItemType,
} from '@/types/integrated-calendar';
// import { SOURCE_COLORS, SOURCE_ICONS } from '@/types/integrated-calendar'; // 향후 사용 예정

/**
 * CalendarEvent의 type을 UnifiedCalendarItem의 type으로 변환
 */
function mapEventType(eventType?: string): CalendarItemType {
  switch (eventType) {
    case 'task':
      return 'task';
    case 'deadline':
      return 'deadline';
    default:
      return 'event';
  }
}

/**
 * CalendarEvent의 type을 우선순위로 변환
 */
function mapEventTypeToPriority(eventType?: string): Priority {
  switch (eventType) {
    case 'deadline':
      return 'high';
    case 'task':
      return 'medium';
    case 'reminder':
      return 'medium';
    case 'meeting':
      return 'low';
    case 'holiday':
      return 'low';
    default:
      return 'low';
  }
}

/**
 * 날짜와 시간 정보를 기반으로 상태 계산
 */
function calculateStatus(date: Date): ItemStatus {
  const now = new Date();
  const eventDate = new Date(date);

  // 날짜만 비교 (시간 무시)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

  if (eventDay < today) {
    return 'completed';
  } else if (eventDay.getTime() === today.getTime()) {
    return 'in-progress';
  } else {
    return 'pending';
  }
}

/**
 * 이벤트 타입에 따른 카테고리 레이블 반환
 */
function getCategoryLabel(eventType?: string): string {
  switch (eventType) {
    case 'meeting':
      return '회의';
    case 'task':
      return '작업';
    case 'reminder':
      return '알림';
    case 'deadline':
      return '마감';
    case 'holiday':
      return '휴일';
    default:
      return '기타';
  }
}

/**
 * 이벤트 타입에 따른 기본 색상 반환
 */
function getEventColor(event: CalendarEvent): string {
  if (event.color) {
    return event.color;
  }

  // 타입별 기본 색상
  switch (event.type) {
    case 'meeting':
      return '#3b82f6'; // blue
    case 'task':
      return '#10b981'; // green
    case 'reminder':
      return '#f59e0b'; // amber
    case 'deadline':
      return '#ef4444'; // red
    case 'holiday':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280'; // gray
  }
}

/**
 * 이벤트 타입에 따른 아이콘 반환
 */
function getEventIcon(eventType?: string): string {
  switch (eventType) {
    case 'meeting':
      return 'Users';
    case 'task':
      return 'CheckCircle2';
    case 'reminder':
      return 'Bell';
    case 'deadline':
      return 'Clock';
    case 'holiday':
      return 'CalendarDays';
    default:
      return 'Calendar';
  }
}

/**
 * CalendarEvent를 UnifiedCalendarItem으로 변환하는 어댑터
 */
export class CalendarDataAdapter implements IDataAdapter<CalendarEvent> {
  /**
   * CalendarEvent를 UnifiedCalendarItem으로 변환
   */
  toUnified(event: CalendarEvent): UnifiedCalendarItem {
    return {
      id: `calendar-${event.id}`,
      source: 'calendar',
      type: mapEventType(event.type),

      // 공통 필드
      title: event.title,
      date: new Date(event.date),
      description: event.description,

      // 시간 정보
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: event.allDay ?? false,

      // 우선순위 및 상태
      priority: mapEventTypeToPriority(event.type),
      status: calculateStatus(event.date),

      // 카테고리 및 태그
      category: getCategoryLabel(event.type),
      tags: [
        ...(event.type ? [event.type] : []),
        ...(event.location ? ['location:' + event.location] : []),
        ...(event.recurring ? ['recurring:' + event.recurring] : []),
      ],

      // 원본 데이터
      originalData: event,

      // 시각화 속성
      color: getEventColor(event),
      icon: getEventIcon(event.type),
    };
  }

  /**
   * UnifiedCalendarItem을 CalendarEvent로 역변환
   */
  fromUnified(item: UnifiedCalendarItem): CalendarEvent {
    if (item.source !== 'calendar') {
      throw new Error('Invalid source for CalendarDataAdapter');
    }

    // 원본 데이터가 CalendarEvent인지 확인
    const originalData = item.originalData as CalendarEvent;

    return {
      ...originalData,
      id: originalData.id || item.id.replace('calendar-', ''),
      title: item.title,
      description: item.description,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      allDay: item.allDay,
      color: item.color,
    };
  }

  /**
   * 여러 CalendarEvent를 일괄 변환
   */
  toUnifiedBatch(events: CalendarEvent[]): UnifiedCalendarItem[] {
    return events.map(event => this.toUnified(event));
  }
}

/**
 * 싱글톤 인스턴스
 */
export const calendarAdapter = new CalendarDataAdapter();