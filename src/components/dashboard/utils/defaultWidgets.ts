/**
 * 기본 위젯 설정
 * 신규 사용자의 초기 대시보드 레이아웃을 정의합니다.
 */

import type { ImprovedWidget } from '@/types/improved-dashboard';
import type { GridPosition } from '@/lib/dashboard/grid-utils';

/**
 * 기본 위젯 위치 정의 (9x9 그리드 기준)
 */
const DEFAULT_WIDGET_POSITIONS = {
  // 상단 배치: calendar(좌) + todoList(우)
  calendar: { x: 0, y: 0, w: 6, h: 5 },    // 좌상단 6x5 그리드
  todoList: { x: 6, y: 0, w: 3, h: 5 },    // 우상단 3x5 그리드
} as const;

/**
 * 기본 위젯 배열 생성 함수
 * @returns 2개의 기본 위젯 (calendar + todoList)
 */
export function createDefaultWidgets(): ImprovedWidget[] {
  return [
    {
      id: 'widget_calendar_1',
      type: 'calendar',
      title: '캘린더',
      position: DEFAULT_WIDGET_POSITIONS.calendar,
      data: undefined,
      minW: 2,
      minH: 2,
      maxW: 6,
      maxH: 6,  // 최대 세로 사이즈 6으로 증가
    },
    {
      id: 'widget_todo_1',
      type: 'todoList',
      title: '할 일 목록',
      position: DEFAULT_WIDGET_POSITIONS.todoList,
      data: undefined, // TodoListWidget이 자체적으로 데이터 로드
      minW: 2,
      minH: 2,
      maxW: 5,
    },
  ];
}
