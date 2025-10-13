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
  // 상단 좌측 → 우측 배치 (3x4 크기)
  calendar: { x: 0, y: 0, w: 3, h: 4 },
  projectSummary: { x: 3, y: 0, w: 3, h: 4 },
  todoList: { x: 6, y: 0, w: 3, h: 4 },

  // 하단 좌측 → 우측 배치 (3x3 크기)
  kpiMetrics: { x: 0, y: 4, w: 3, h: 3 },
  revenueChart: { x: 3, y: 4, w: 3, h: 3 },
  recentActivity: { x: 6, y: 4, w: 3, h: 3 },
} as const;

/**
 * 기본 위젯 배열 생성 함수
 * @returns 6개의 기본 위젯 (상단 3개 + 하단 3개)
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
      maxH: 4,
    },
    {
      id: 'widget_project_1',
      type: 'projectSummary',
      title: '프로젝트 현황',
      position: DEFAULT_WIDGET_POSITIONS.projectSummary,
      data: undefined,
      minW: 3,
      minH: 2,
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
    {
      id: 'widget_kpi_1',
      type: 'kpiMetrics',
      title: '핵심 성과 지표',
      position: DEFAULT_WIDGET_POSITIONS.kpiMetrics,
      data: undefined,
      minW: 4,
      minH: 2,
      maxW: 9,
    },
    {
      id: 'widget_revenue_1',
      type: 'revenueChart',
      title: '매출 차트',
      position: DEFAULT_WIDGET_POSITIONS.revenueChart,
      minW: 3,
      minH: 2,
    },
    {
      id: 'widget_activity_1',
      type: 'recentActivity',
      title: '최근 활동',
      position: DEFAULT_WIDGET_POSITIONS.recentActivity,
      minW: 3,
      minH: 2,
    },
  ];
}
