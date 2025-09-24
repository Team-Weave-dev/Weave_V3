# dashboard/ - 대시보드 유틸리티 라이브러리

## 🎯 대시보드 시스템 개요

이 디렉토리는 ImprovedDashboard의 핵심 기능을 지원하는 고급 유틸리티 함수들을 포함합니다. **고성능 그리드 시스템**, **iOS 스타일 애니메이션**, **60fps 성능 최적화**가 주요 특징입니다.

## 📁 파일 구조

```
dashboard/
├── grid-utils.ts                    # 🔧 그리드 시스템 핵심 알고리즘
├── ios-animations.ts                # 🎨 iOS 스타일 애니메이션 정의
└── ios-animations/                  # 🚀 성능 최적화 시스템
    └── performance-optimizer.ts     # GPU 가속, 60fps 모니터링
```

## 🔧 grid-utils.ts - 그리드 시스템 핵심

### 주요 기능
- **위치 관리**: 그리드 좌표 ↔ 픽셀 좌표 변환
- **충돌 감지**: 정교한 위젯 간 겹침 검사 알고리즘
- **레이아웃 최적화**: 자동 컴팩트 레이아웃 생성
- **경계 관리**: 그리드 영역 내 위치 제한 및 조정
- **드래그 지원**: 픽셀 드래그를 그리드 단위로 변환

### 핵심 인터페이스

#### GridPosition - 그리드 아이템 위치
```typescript
export interface GridPosition {
  x: number; // 그리드 X 위치 (0부터 시작)
  y: number; // 그리드 Y 위치 (0부터 시작)
  w: number; // 너비 (그리드 단위)
  h: number; // 높이 (그리드 단위)
}
```

#### GridConfig - 그리드 설정
```typescript
export interface GridConfig {
  cols: number;               // 그리드 컬럼 수
  rowHeight: number;          // 행 높이 (px)
  gap: number;                // 그리드 간격 (px)
  maxRows?: number;           // 최대 행 수
  preventCollision?: boolean; // 충돌 방지 여부
  allowOverlap?: boolean;     // 겹침 허용 여부
}
```

### 주요 함수들

#### 충돌 감지 시스템
```typescript
// 두 그리드 영역이 겹치는지 확인
export function checkCollision(item1: GridPosition, item2: GridPosition): boolean

// 현재 아이템과 충돌하는 아이템들의 인덱스 반환
export function getCollisions(
  item: GridPosition,
  items: GridPosition[],
  excludeIndex?: number
): number[]

// 겹침 비율 계산 (0-1)
export function getOverlapRatio(item1: GridPosition, item2: GridPosition): number
```

#### 위치 관리 시스템
```typescript
// 그리드 경계 내에 있는지 확인
export function isWithinBounds(position: GridPosition, config: GridConfig): boolean

// 그리드 위치를 경계 내로 조정
export function constrainToBounds(position: GridPosition, config: GridConfig): GridPosition

// 빈 공간 찾기 (새 위젯 배치용)
export function findEmptySpace(
  width: number,
  height: number,
  items: GridPosition[],
  config: GridConfig
): GridPosition | null
```

#### 좌표 변환 시스템
```typescript
// 픽셀 좌표 → 그리드 좌표
export function pixelsToGrid(
  pixelX: number,
  pixelY: number,
  cellWidth: number,
  cellHeight: number,
  gap: number
): GridPosition

// 그리드 좌표 → 픽셀 좌표
export function gridToPixels(
  position: GridPosition,
  cellWidth: number,
  cellHeight: number,
  gap: number
): { left: number; top: number; width: number; height: number }

// 드래그 델타를 그리드 단위로 변환 (스냅 기능 포함)
export function deltaToGrid(
  deltaX: number,
  deltaY: number,
  cellWidth: number,
  cellHeight: number,
  gap: number,
  snapThreshold: number = 0.5
): { dx: number; dy: number }
```

#### 레이아웃 최적화
```typescript
// 컴팩트 레이아웃 생성 (위쪽/왼쪽으로 압축)
export function compactLayout(
  items: GridPosition[],
  config: GridConfig,
  compactType: 'vertical' | 'horizontal' = 'vertical'
): GridPosition[]

// CSS Transform 스타일 생성 (성능 최적화된)
export function getTransformStyle(
  position: GridPosition,
  cellWidth: number,
  cellHeight: number,
  gap: number,
  useCSSTransforms: boolean = true,
  skipTransition: boolean = false
): CSSProperties
```

### 사용 예시
```typescript
import {
  checkCollision,
  findEmptySpace,
  compactLayout,
  getTransformStyle
} from '@/lib/dashboard/grid-utils'

// 위젯 충돌 검사
const widget1 = { x: 0, y: 0, w: 2, h: 2 }
const widget2 = { x: 1, y: 1, w: 2, h: 2 }
const hasCollision = checkCollision(widget1, widget2) // true

// 새 위젯을 위한 빈 공간 찾기
const emptyPosition = findEmptySpace(2, 1, existingWidgets, gridConfig)

// 레이아웃 최적화
const optimizedLayout = compactLayout(widgets, gridConfig, 'vertical')

// 성능 최적화된 스타일 적용
const widgetStyle = getTransformStyle(widget1, 120, 120, 16)
```

## 🎨 ios-animations.ts - iOS 스타일 애니메이션

### 주요 기능
- **Wiggle 애니메이션**: iOS 홈 화면 앱 아이콘 흔들림 효과
- **드래그 애니메이션**: 부드러운 드래그 앤 드롭 효과
- **편집 모드**: iOS 스타일 편집 모드 진입/종료
- **상태 전환**: 자연스러운 상태 변화 애니메이션

### Framer Motion Variants

#### Wiggle Animation - 편집 모드 흔들림
```typescript
export const wiggleAnimation: Variants = {
  initial: { rotate: 0, scale: 1 },
  wiggle: {
    rotate: [-1.5, 1.5, -1.5, 1.5, 0],
    scale: [1, 0.99, 1, 0.99, 1],
    transition: {
      rotate: { duration: 1.2, repeat: Infinity, repeatType: 'reverse' },
      scale: { duration: 1.2, repeat: Infinity, repeatType: 'reverse' }
    }
  }
}
```

#### Drag Animations - 드래그 앤 드롭
```typescript
// 드래그 시작 시 애니메이션
export const dragStartAnimation: TargetAndTransition = {
  scale: 1.1,
  opacity: 0.8,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  zIndex: 1000,
  transition: { duration: 0.2, ease: 'easeOut' }
}

// 드래그 종료 시 애니메이션
export const dragEndAnimation: TargetAndTransition = {
  scale: 1,
  opacity: 1,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  zIndex: 'auto',
  transition: dragSpringTransition
}
```

#### Edit Mode Transitions - 편집 모드
```typescript
export const enterEditModeAnimation: Variants = {
  normal: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  edit: {
    scale: 0.95,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}
```

#### Control Elements - 편집 컨트롤
```typescript
// 삭제 버튼 애니메이션
export const deleteButtonAnimation: Variants = {
  hidden: { scale: 0, opacity: 0, rotate: -90 },
  visible: {
    scale: 1, opacity: 1, rotate: 0,
    transition: { type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }
  },
  hover: { scale: 1.2, transition: { duration: 0.2 } },
  tap: { scale: 0.9 }
}

// 리사이즈 핸들 애니메이션
export const resizeHandleAnimation: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1, opacity: 1,
    transition: { type: 'spring', damping: 15, stiffness: 300, delay: 0.15 }
  },
  hover: {
    scale: 1.1,
    backgroundColor: 'hsl(var(--primary))',
    transition: { duration: 0.2 }
  }
}
```

### 사용 예시
```typescript
import { motion } from 'framer-motion'
import { wiggleAnimation, dragStartAnimation, deleteButtonAnimation } from '@/lib/dashboard/ios-animations'

// Wiggle 애니메이션 적용
<motion.div
  variants={wiggleAnimation}
  initial="initial"
  animate={isEditMode ? "wiggle" : "initial"}
>
  위젯 내용
</motion.div>

// 드래그 시작 애니메이션
<motion.div
  animate={isDragging ? dragStartAnimation : {}}
  drag
>
  드래그 가능한 위젯
</motion.div>

// 삭제 버튼
<motion.button
  variants={deleteButtonAnimation}
  initial="hidden"
  animate={isEditMode ? "visible" : "hidden"}
  whileHover="hover"
  whileTap="tap"
>
  ×
</motion.button>
```

## 🚀 ios-animations/performance-optimizer.ts - 성능 최적화 시스템

### 주요 기능
- **GPU 가속**: 하드웨어 가속을 위한 CSS 최적화
- **60fps 모니터링**: 실시간 프레임 드롭 감지
- **애니메이션 스케줄링**: RAF 기반 배치 처리
- **성능 프로파일링**: 상세한 성능 메트릭 수집
- **메모리 최적화**: 애니메이션 리소스 효율적 관리

### AnimationPerformanceOptimizer 클래스

#### GPU 가속 스타일 생성
```typescript
// GPU 가속 CSS 속성 자동 생성
static getGPUAcceleratedStyles(config: AnimationConfig = {}): React.CSSProperties {
  return {
    transform: 'translate3d(0, 0, 0)',
    webkitTransform: 'translate3d(0, 0, 0)',
    webkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    perspective: 1000,
    willChange: config.willChange?.join(', '),
    contain: 'layout style paint',
    isolation: 'isolate'
  }
}
```

#### 애니메이션 스케줄링
```typescript
// RAF 기반 애니메이션 배치 처리
scheduleAnimation(id: string, callback: () => void): void

// 성능 모니터링 시작
startMonitoring(callback?: (metrics: PerformanceMetrics) => void): void

// 배치 DOM 업데이트 (리플로우 최소화)
static batchDOMUpdates(updates: (() => void)[]): void
```

#### 성능 메트릭
```typescript
interface PerformanceMetrics {
  fps: number;           // 현재 FPS
  frameTime: number;     // 프레임 처리 시간
  droppedFrames: number; // 드롭된 프레임 수
  jank: number;          // Jank 발생 횟수 (50ms+ 프레임)
}
```

### 최적화된 애니메이션 프리셋

#### 위젯 전용 최적화
```typescript
// 위젯 애니메이션 중 성능 최적화
static getOptimizedWidgetStyles(isAnimating: boolean = false): React.CSSProperties

// 최적화된 Wiggle 애니메이션
static getOptimizedWiggleAnimation() {
  return {
    animate: { rotate: [0, -2, 2, -2, 0], scale: [1, 1.02, 1, 1.02, 1] },
    transition: {
      duration: 0.3, repeat: Infinity, repeatDelay: 0.1,
      ease: [0.4, 0, 0.2, 1], // 최적화된 easing
      type: 'spring', damping: 10, stiffness: 100
    }
  }
}

// 최적화된 드래그 애니메이션
static getOptimizedDragAnimation() {
  return {
    whileDrag: { scale: 1.05, opacity: 0.8, zIndex: 1000 },
    transition: {
      type: 'spring', damping: 20, stiffness: 300,
      restDelta: 0.001, restSpeed: 0.01 // 모멘텀 최적화
    }
  }
}
```

### 애니메이션 프리셋
```typescript
export const AnimationPresets = {
  wiggle: AnimationPerformanceOptimizer.getOptimizedWiggleAnimation(),
  drag: AnimationPerformanceOptimizer.getOptimizedDragAnimation(),
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: 'spring', damping: 15, stiffness: 200 }
  },
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', damping: 10, stiffness: 400 }
  }
}
```

### PerformanceProfiler 클래스

#### 성능 측정 및 분석
```typescript
// 성능 마커 설정
mark(name: string): void

// 시간 측정 및 기록
measure(name: string, startMark: string): number

// 평균 시간 계산
getAverageTime(measureName: string): number

// 상세 성능 리포트
getReport(): Record<string, { average: number; count: number; total: number }>
```

### 사용 예시

#### 기본 사용법
```typescript
import {
  AnimationPerformanceOptimizer,
  animationOptimizer,
  AnimationPresets,
  performanceProfiler
} from '@/lib/dashboard/ios-animations/performance-optimizer'

// GPU 가속 스타일 적용
const optimizedStyles = AnimationPerformanceOptimizer.getGPUAcceleratedStyles({
  willChange: ['transform', 'opacity'],
  useGPU: true,
  transform3d: true
})

// 애니메이션 스케줄링
animationOptimizer.scheduleAnimation('widget-move', () => {
  // 애니메이션 로직
})

// 프리셋 애니메이션 사용
<motion.div {...AnimationPresets.scale}>
  Scalable Widget
</motion.div>
```

#### 성능 모니터링
```typescript
// 성능 모니터링 시작
animationOptimizer.startMonitoring((metrics) => {
  if (metrics.fps < 30) {
    console.warn('낮은 FPS 감지:', metrics.fps)
  }
  if (metrics.jank > 10) {
    console.warn('Jank 발생:', metrics.jank)
  }
})

// 성능 프로파일링
performanceProfiler.mark('animation-start')
// ... 애니메이션 실행 ...
const duration = performanceProfiler.measure('animation', 'animation-start')
console.log(`애니메이션 시간: ${duration}ms`)
```

## 🏗️ 통합 사용 패턴

### 완전한 위젯 드래그 시스템
```typescript
import { motion } from 'framer-motion'
import { checkCollision, getTransformStyle } from '@/lib/dashboard/grid-utils'
import { dragStartAnimation, dragEndAnimation } from '@/lib/dashboard/ios-animations'
import { AnimationPerformanceOptimizer, animationOptimizer } from '@/lib/dashboard/ios-animations/performance-optimizer'

function DraggableWidget({ widget, gridConfig, otherWidgets }) {
  const [isDragging, setIsDragging] = useState(false)

  // GPU 가속 스타일 적용
  const optimizedStyles = AnimationPerformanceOptimizer.getOptimizedWidgetStyles(isDragging)

  // 그리드 기반 스타일 계산
  const baseStyle = getTransformStyle(
    widget.position,
    gridConfig.cellWidth,
    gridConfig.cellHeight,
    gridConfig.gap,
    true, // CSS Transform 사용
    isDragging // 드래그 중 트랜지션 비활성화
  )

  const handleDragStart = () => {
    setIsDragging(true)
    // 애니메이션 스케줄링
    animationOptimizer.scheduleAnimation('drag-start', () => {
      // 추가 드래그 시작 로직
    })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    // 충돌 검사
    const hasCollision = otherWidgets.some(other =>
      checkCollision(widget.position, other.position)
    )

    if (hasCollision) {
      // 충돌 시 원래 위치로 복원
    }
  }

  return (
    <motion.div
      style={{
        ...baseStyle,
        ...optimizedStyles
      }}
      animate={isDragging ? dragStartAnimation : dragEndAnimation}
      drag
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      dragElastic={0.1}
      dragMomentum={false}
    >
      {/* 위젯 콘텐츠 */}
    </motion.div>
  )
}
```

## 📊 성능 지표

### 목표 성능
- **FPS**: 60fps 유지 (드롭 허용 < 1%)
- **애니메이션 지연**: < 16.67ms
- **메모리 사용량**: < 10MB (위젯 7개 기준)
- **GPU 가속**: 100% 활용

### 최적화 기법
- **Transform 3D**: 하드웨어 가속 강제 활성화
- **will-change**: 브라우저 최적화 힌트 제공
- **Containment**: 레이아웃 격리로 리플로우 방지
- **RAF 스케줄링**: 부드러운 애니메이션 보장

### 모니터링 메트릭
- **실시간 FPS**: 성능 저하 즉시 감지
- **프레임 드롭**: 16.67ms 초과 프레임 카운트
- **Jank 감지**: 50ms+ 지연 프레임 추적
- **성능 프로파일링**: 평균/최대/최소 처리 시간

## 🔗 관련 문서

- [`../../components/dashboard/claude.md`](../../components/dashboard/claude.md) - 대시보드 컴포넌트 구현
- [`../stores/claude.md`](../stores/claude.md) - 대시보드 상태 관리
- [`../../types/claude.md`](../../types/claude.md) - 대시보드 타입 정의

---

**이 대시보드 유틸리티 시스템은 60fps 성능과 iOS 품질의 사용자 경험을 보장하는 고급 기술 스택입니다.**