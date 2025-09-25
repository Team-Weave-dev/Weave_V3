/**
 * 위젯 기본 크기 설정
 * 대시보드 위젯들의 기본 크기를 정의합니다.
 */

export type WidgetType = 'calendar' | 'projectSummary' | 'kpiMetrics' | 'taxDeadline' | 'todoList' | 'custom';

export interface WidgetDefaultSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * 위젯 타입별 기본 크기 설정
 * 9x9 그리드 기준으로 정의
 */
export const WIDGET_DEFAULT_SIZES: Record<WidgetType, WidgetDefaultSize> = {
  calendar: {
    width: 2,
    height: 2,
    minWidth: 2,
    minHeight: 2,
    maxWidth: 5,
    maxHeight: 5
  },
  projectSummary: {
    width: 2,
    height: 2,
    minWidth: 2,
    minHeight: 2,
    maxWidth: 5,
    maxHeight: 5
  },
  kpiMetrics: {
    width: 2,
    height: 2,
    minWidth: 1,
    minHeight: 2,
    maxWidth: 5,
    maxHeight: 5
  },
  taxDeadline: {
    width: 2,
    height: 2,
    minWidth: 1,
    minHeight: 2,
    maxWidth: 5,
    maxHeight: 5
  },
  todoList: {
    width: 2,
    height: 2,
    minWidth: 2,
    minHeight: 2,
    maxWidth: 5,
    maxHeight: 5
  },
  custom: {
    width: 2,
    height: 2,
    minWidth: 1,
    minHeight: 1,
    maxWidth: 5,
    maxHeight: 5
  }
};

/**
 * 위젯 타입에 따른 기본 크기 반환
 */
export function getDefaultWidgetSize(type: WidgetType): WidgetDefaultSize {
  return WIDGET_DEFAULT_SIZES[type] || WIDGET_DEFAULT_SIZES.custom;
}

/**
 * 위젯 타입에 따른 추천 위치 반환
 * 최적의 레이아웃을 위한 기본 위치 제안
 */
export function getRecommendedPosition(type: WidgetType, _existingWidgets?: any[]): { x: number; y: number } {
  // 위젯 타입별 추천 위치
  const recommendedPositions: Record<WidgetType, { x: number; y: number }> = {
    calendar: { x: 0, y: 0 },      // 좌상단 (메인 포커스)
    projectSummary: { x: 3, y: 0 }, // 캘린더 우측
    kpiMetrics: { x: 5, y: 0 },      // 프로젝트 우측
    taxDeadline: { x: 6, y: 0 },    // KPI 우측
    todoList: { x: 7, y: 0 },       // 맨 우측
    custom: { x: 0, y: 0 }          // 기본 위치
  };

  const basePosition = recommendedPositions[type] || { x: 0, y: 0 };

  // 기존 위젯과 충돌 검사 후 빈 위치 찾기
  // (실제 구현은 grid-utils의 findEmptySpace 활용)
  return basePosition;
}

/**
 * 반응형 크기 조정
 * 화면 크기에 따라 위젯 크기를 자동 조정
 */
export function getResponsiveWidgetSize(
  type: WidgetType, 
  cols: number
): WidgetDefaultSize {
  const defaultSize = getDefaultWidgetSize(type);
  
  // 컬럼 수에 따른 크기 조정
  if (cols <= 4) {
    // 모바일: 더 큰 크기로 조정
    return {
      ...defaultSize,
      width: Math.min(defaultSize.width * 1.5, cols),
      height: defaultSize.height
    };
  } else if (cols <= 6) {
    // 태블릿: 약간 크게 조정
    return {
      ...defaultSize,
      width: Math.min(defaultSize.width * 1.2, cols),
      height: defaultSize.height
    };
  }
  
  // 데스크톱: 기본 크기 유지
  return defaultSize;
}

/**
 * 위젯 크기 유효성 검증
 */
export function isValidWidgetSize(
  type: WidgetType,
  width: number,
  height: number
): boolean {
  const defaults = getDefaultWidgetSize(type);
  
  const isWidthValid = 
    width >= (defaults.minWidth || 1) && 
    width <= (defaults.maxWidth || 9);
    
  const isHeightValid = 
    height >= (defaults.minHeight || 1) && 
    height <= (defaults.maxHeight || 9);
  
  return isWidthValid && isHeightValid;
}

/**
 * 위젯 크기 제약 적용
 * 최소/최대 크기 범위 내로 제한
 */
export function constrainWidgetSize(
  type: WidgetType,
  width: number,
  height: number
): { width: number; height: number } {
  const defaults = getDefaultWidgetSize(type);
  
  return {
    width: Math.min(
      Math.max(width, defaults.minWidth || 1), 
      defaults.maxWidth || 9
    ),
    height: Math.min(
      Math.max(height, defaults.minHeight || 1), 
      defaults.maxHeight || 9
    )
  };
}