/**
 * iOS 스타일 대시보드 타입 정의
 */

/**
 * 유연한 위젯 위치 정보
 */
export interface FlexibleWidgetPosition {
  gridColumnStart: number;
  gridColumnEnd: number;
  gridRowStart: number;
  gridRowEnd: number;
  width: number;
  height: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

/**
 * 편집 모드 상태
 */
export interface EditModeState {
  isActive: boolean;
  selectedWidgetId: string | null;
  draggingWidgetId: string | null;
  resizingWidgetId: string | null;
  enteredAt: Date | null;
  hasChanges: boolean;
  mode: 'move' | 'resize' | 'delete' | null;
}

/**
 * iOS 스타일 위젯 인터페이스
 */
export interface IOSStyleWidget {
  id: string;
  type: string | 'stats' | 'chart' | 'quickActions' | 'projectSummary';
  title?: string;
  position: FlexibleWidgetPosition & {
    x?: number;
    y?: number;
    gridColumn?: string;
    gridRow?: string;
  };
  size?: {
    width: number;
    height: number;
  };
  state?: WidgetState;
  style?: React.CSSProperties;
  animation?: WidgetAnimation;
  metadata?: WidgetMetadata;
  config?: Record<string, any>;
  data?: any;
  customSettings?: Record<string, any>;
  isLocked?: boolean;
  isVisible?: boolean;
}

/**
 * 위젯 상태
 */
export interface WidgetState {
  isLocked: boolean;
  isHidden: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  lastUpdated?: Date;
}

/**
 * 위젯 애니메이션 설정
 */
export interface WidgetAnimation {
  wiggle: boolean;
  dragAnimation?: {
    scale: number;
    opacity: number;
    transition: string;
  };
  resizeAnimation?: {
    duration: number;
    easing: string;
  };
}

/**
 * 위젯 메타데이터
 */
export interface WidgetMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: string;
  category?: string;
  tags?: string[];
  description?: string;
  icon?: string;
}

/**
 * 그리드 설정
 */
export interface GridConfig {
  columns: number;
  rowHeight: number;
  gap: number;
  padding: number;
  containerWidth?: number;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
}

/**
 * 그리드 구성 (간소화된 버전)
 */
export interface GridConfiguration {
  columns: number;
  gap: number;
  padding?: number;
}

/**
 * 애니메이션 설정
 */
export interface AnimationConfig {
  enableWiggle?: boolean;
  enableDrag?: boolean;
  enableScale?: boolean;
  duration?: number;
  stiffness?: number;
  damping?: number;
}

/**
 * 레이아웃 템플릿
 */
export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  widgets: IOSStyleWidget[];
  gridConfig: GridConfiguration;
}