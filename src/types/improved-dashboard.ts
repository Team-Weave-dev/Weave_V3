/**
 * 개선된 대시보드 타입 정의
 * react-grid-layout 패턴을 적용한 단순화된 구조
 */

import { GridPosition } from '@/lib/dashboard/grid-utils';

/**
 * 개선된 위젯 인터페이스
 */
export interface ImprovedWidget {
  // 핵심 속성
  id: string;
  type: 'projectSummary' | 'todoList' | 'calendar' | 'taxDeadline' | 'kpiMetrics' | 'custom';
  position: GridPosition; // x, y, w, h로 단순화
  
  // 컨텐츠 속성
  title?: string;
  data?: any;
  
  // 제약 속성
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  
  // 동작 속성
  isDraggable?: boolean;
  isResizable?: boolean;
  static?: boolean;       // 고정 위젯
  isBounded?: boolean;   // 컨테이너 경계 제한
  
  // 리사이즈 핸들 설정
  resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
  
  // 상태
  isLocked?: boolean;
  isVisible?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  
  // 메타데이터
  createdAt?: Date;
  updatedAt?: Date;
  customSettings?: Record<string, any>;
}

/**
 * 대시보드 레이아웃
 */
export interface DashboardLayout {
  id: string;
  name: string;
  widgets: ImprovedWidget[];
  gridConfig: {
    cols: number;
    rowHeight: number;
    gap: number;
    maxRows?: number;
  };
  breakpoints?: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
}

/**
 * 대시보드 편집 상태
 */
export interface DashboardEditState {
  isEditMode: boolean;
  isDragging: boolean;
  isResizing: boolean;
  selectedWidgetId: string | null;
  draggedWidget: {
    id: string;
    originalPosition: GridPosition;
    currentPosition: GridPosition;
  } | null;
  resizingWidget: {
    id: string;
    originalPosition: GridPosition;
    currentPosition: GridPosition;
  } | null;
  hoveredPosition: GridPosition | null;
  dragOverWidgetId: string | null;
}

/**
 * 위젯 이벤트 콜백
 */
export interface WidgetCallbacks {
  onLayoutChange?: (widgets: ImprovedWidget[]) => void;
  onDragStart?: (widget: ImprovedWidget, e: MouseEvent) => void;
  onDrag?: (widget: ImprovedWidget, position: GridPosition, e: MouseEvent) => void;
  onDragStop?: (widget: ImprovedWidget, position: GridPosition, e: MouseEvent) => void;
  onResizeStart?: (widget: ImprovedWidget, e: MouseEvent) => void;
  onResize?: (widget: ImprovedWidget, position: GridPosition, e: MouseEvent) => void;
  onResizeStop?: (widget: ImprovedWidget, position: GridPosition, e: MouseEvent) => void;
  onDrop?: (widget: ImprovedWidget, e: DragEvent) => void;
  onWidgetClick?: (widget: ImprovedWidget, e: MouseEvent) => void;
  onWidgetRemove?: (widgetId: string) => void;
}

/**
 * 대시보드 설정
 */
export interface DashboardConfig {
  // 그리드 설정
  cols: number;                    // 컬럼 수
  rowHeight: number;               // 행 높이 (px)
  gap: number;                     // 간격 (px)
  maxRows?: number;                // 최대 행 수
  
  // 동작 설정
  isDraggable?: boolean;           // 드래그 가능 여부
  isResizable?: boolean;           // 크기 조정 가능 여부
  preventCollision?: boolean;      // 충돌 방지
  allowOverlap?: boolean;          // 겹침 허용
  compactType?: 'vertical' | 'horizontal' | null; // 압축 타입
  
  // 성능 설정
  useCSSTransforms?: boolean;      // CSS transform 사용 (성능 향상)
  transformScale?: number;          // 스케일 계수
  
  // UI 설정
  draggableHandle?: string;        // 드래그 핸들 CSS 선택자
  draggableCancel?: string;        // 드래그 제외 CSS 선택자
  resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>; // 기본 리사이즈 핸들
  
  // 드롭 설정
  isDroppable?: boolean;           // 외부 드롭 허용
  droppingItem?: {                 // 드롭 중인 아이템 미리보기
    i: string;
    w: number;
    h: number;
  };
}

/**
 * 반응형 레이아웃 설정
 */
export interface ResponsiveLayout {
  breakpoints: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
    xxs?: number;
  };
  cols: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
    xxs?: number;
  };
  layouts: {
    lg?: ImprovedWidget[];
    md?: ImprovedWidget[];
    sm?: ImprovedWidget[];
    xs?: ImprovedWidget[];
    xxs?: ImprovedWidget[];
  };
}

/**
 * 위젯 템플릿
 */
export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  type: ImprovedWidget['type'];
  defaultPosition: GridPosition;
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  icon?: string;
  category?: string;
  tags?: string[];
}

/**
 * 대시보드 테마
 */
export interface DashboardTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    widget: string;
    border: string;
    text: string;
    accent: string;
  };
  spacing: {
    gap: number;
    padding: number;
  };
  borderRadius: number;
  shadow: string;
}