/**
 * 기본 위젯 설정
 * 신규 사용자의 초기 대시보드 레이아웃을 정의합니다.
 */

import type { ImprovedWidget } from '@/types/improved-dashboard';

/**
 * 기본 위젯 위치 정의 (9컬럼 그리드 기준)
 * 레이아웃:
 * - 상단: 캘린더(좌 5칸) + 할 일 목록(우 4칸)
 * - 중간: 프로젝트 현황(좌 5칸) + 최근 활동(우 4칸)
 * - 하단: 핵심 성과 지표(좌 5칸)
 */
const DEFAULT_WIDGET_POSITIONS = {
  calendar: { x: 0, y: 0, w: 5, h: 5 },        // 좌상단 5x5 그리드
  todoList: { x: 5, y: 0, w: 4, h: 5 },        // 우상단 4x5 그리드
  projectSummary: { x: 0, y: 5, w: 5, h: 3 },  // 좌중간 5x3 그리드
  recentActivity: { x: 5, y: 5, w: 4, h: 5 },  // 우중간 4x5 그리드
  kpiMetrics: { x: 0, y: 8, w: 5, h: 2 },      // 좌하단 5x2 그리드
} as const;

/**
 * 기본 위젯 배열 생성 함수
 * @returns 5개의 기본 위젯 (캘린더, 할 일 목록, 프로젝트 현황, 최근 활동, 핵심 성과 지표)
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
      maxH: 6,
    },
    {
      id: 'widget_todo_1',
      type: 'todoList',
      title: '할 일 목록',
      position: DEFAULT_WIDGET_POSITIONS.todoList,
      data: undefined,
      minW: 2,
      minH: 2,
      maxW: 5,
      maxH: 5,
    },
    {
      id: 'widget_project_summary_1',
      type: 'projectSummary',
      title: '프로젝트 현황',
      position: DEFAULT_WIDGET_POSITIONS.projectSummary,
      data: undefined,
      minW: 2,
      minH: 2,
      maxW: 5,
      maxH: 5,
    },
    {
      id: 'widget_recent_activity_1',
      type: 'recentActivity',
      title: '최근 활동',
      position: DEFAULT_WIDGET_POSITIONS.recentActivity,
      data: undefined,
      minW: 2,
      minH: 2,
      maxW: 5,
      maxH: 5,
    },
    {
      id: 'widget_kpi_metrics_1',
      type: 'kpiMetrics',
      title: '핵심 성과 지표',
      position: DEFAULT_WIDGET_POSITIONS.kpiMetrics,
      data: undefined,
      minW: 1,
      minH: 2,
      maxW: 5,
      maxH: 5,
    },
  ];
}
