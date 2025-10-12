// Integrated Calendar System Types
// 위젯 데이터 통합 아키텍처를 위한 타입 정의

import type { CalendarEvent, TodoTask, TaxDeadline } from './dashboard';
import type { TaxSchedule } from '@/lib/storage/types/entities/tax-schedule';

/**
 * 통합 캘린더 아이템의 데이터 출처
 */
export type CalendarItemSource = 'calendar' | 'tax' | 'todo';

/**
 * 통합 캘린더 아이템의 유형
 */
export type CalendarItemType = 'event' | 'deadline' | 'task';

/**
 * 우선순위 단계
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low';

/**
 * 아이템 상태
 */
export type ItemStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

/**
 * 통합 캘린더 아이템 인터페이스
 *
 * 캘린더, 세무일정, 할일 위젯의 데이터를 하나의 표준 형식으로 통합
 */
export interface UnifiedCalendarItem {
  // 식별 정보
  id: string;                                    // 고유 식별자 (source-originalId)
  source: CalendarItemSource;                     // 데이터 출처
  type: CalendarItemType;                         // 아이템 유형

  // 공통 필드
  title: string;                                  // 제목
  date: Date;                                     // 날짜
  description?: string;                           // 설명

  // 시간 정보
  startTime?: string;                             // 시작 시간 (HH:mm)
  endTime?: string;                               // 종료 시간 (HH:mm)
  allDay: boolean;                                // 종일 여부

  // 중요도/우선순위
  priority: Priority;                             // 중요도

  // 상태
  status: ItemStatus;                             // 상태

  // 카테고리 및 태그
  category?: string;                              // 카테고리/섹션
  tags?: string[];                                // 태그 목록

  // 원본 데이터 참조 (역변환 및 상세 정보 조회용)
  originalData: CalendarEvent | TaxDeadline | TodoTask | TaxSchedule;

  // 시각화 속성
  color: string;                                  // 표시 색상
  icon?: string;                                  // 아이콘 이름
}

/**
 * 날짜 범위 필터
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * 통합 캘린더 필터 옵션
 */
export interface CalendarFilters {
  sources?: CalendarItemSource[];                 // 데이터 출처 필터
  types?: CalendarItemType[];                     // 아이템 유형 필터
  priorities?: Priority[];                        // 우선순위 필터
  statuses?: ItemStatus[];                        // 상태 필터
  categories?: string[];                          // 카테고리 필터
  tags?: string[];                                // 태그 필터
  dateRange?: DateRange;                          // 날짜 범위 필터
  searchText?: string;                            // 검색 텍스트
}

/**
 * 데이터 어댑터 인터페이스
 *
 * 각 위젯의 데이터를 UnifiedCalendarItem으로 변환
 */
export interface IDataAdapter<T> {
  /**
   * 원본 데이터를 UnifiedCalendarItem으로 변환
   * null을 반환하면 캘린더에 표시하지 않음 (예: 날짜가 없는 투두 항목)
   */
  toUnified(data: T): UnifiedCalendarItem | null;

  /**
   * UnifiedCalendarItem을 원본 데이터로 역변환
   */
  fromUnified(item: UnifiedCalendarItem): T;

  /**
   * 여러 아이템을 일괄 변환
   */
  toUnifiedBatch(data: T[]): UnifiedCalendarItem[];
}

/**
 * 소스별 색상 설정
 */
export const SOURCE_COLORS = {
  calendar: '#3b82f6',  // blue
  tax: '#ef4444',       // red
  todo: '#10b981',      // green
} as const;

/**
 * 소스별 아이콘 설정
 */
export const SOURCE_ICONS = {
  calendar: 'Calendar',
  tax: 'Receipt',
  todo: 'CheckCircle',
} as const;

/**
 * 우선순위별 색상 설정
 */
export const PRIORITY_COLORS = {
  critical: '#dc2626',  // red-600
  high: '#f59e0b',      // amber-500
  medium: '#3b82f6',    // blue-500
  low: '#6b7280',       // gray-500
} as const;

/**
 * 상태별 색상 설정
 */
export const STATUS_COLORS = {
  pending: '#9ca3af',       // gray-400
  'in-progress': '#3b82f6', // blue-500
  completed: '#10b981',     // green-500
  overdue: '#ef4444',       // red-500
} as const;