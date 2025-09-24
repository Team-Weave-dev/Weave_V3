# dashboard/ - 대시보드 컴포넌트 라이브러리

## 📊 대시보드 컴포넌트 시스템 개요

이 디렉토리는 대시보드의 핵심 구현을 담당하는 컴포넌트들을 포함합니다. **ImprovedDashboard**를 중심으로 한 현대적인 위젯 기반 대시보드 시스템을 제공합니다.

## 📁 컴포넌트 구조

```
dashboard/
├── DashboardContainer.tsx    # 📦 대시보드 컨테이너 래퍼
└── ImprovedDashboard.tsx     # 🎯 메인 대시보드 컴포넌트
```

## 🎯 주요 컴포넌트

### ImprovedDashboard.tsx - 메인 대시보드

**핵심 대시보드 구현체**로, 9x9 반응형 그리드 기반의 드래그 앤 드롭 위젯 시스템을 제공합니다.

#### 주요 기능
- **반응형 그리드**: 화면 크기별 자동 컬럼 조정 (9/6/4/2)
- **드래그 앤 드롭**: @hello-pangea/dnd 기반 위젯 이동
- **스마트 충돌 처리**: 위젯 간 겹침 방지 및 자동 재배치
- **실시간 상태 관리**: Zustand 기반 위젯 설정 저장
- **60fps 최적화**: 부드러운 애니메이션과 인터랙션

#### 컴포넌트 구조
```typescript
'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useImprovedDashboardStore } from '@/lib/stores/useImprovedDashboardStore'
import { useResponsiveCols } from '@/components/ui/use-responsive-cols'
import { widgets } from '@/components/ui/widgets'

export function ImprovedDashboard() {
  const { widgets, cols, updateWidget } = useImprovedDashboardStore()
  const responsiveCols = useResponsiveCols()

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = (result) => {
    // 위젯 위치 업데이트 로직
  }

  return (
    <div className="w-full max-w-[1300px] mx-auto p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-grid">
          {(provided) => (
            <div
              ref={provided.innerRef}
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridAutoRows: '120px'
              }}
            >
              {widgets.map((widget, index) => (
                <DraggableWidget
                  key={widget.id}
                  widget={widget}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
```

### DashboardContainer.tsx - 컨테이너 래퍼

**대시보드의 전체 레이아웃과 공통 기능**을 담당하는 컨테이너 컴포넌트입니다.

#### 주요 역할
- **레이아웃 관리**: 최대폭 1300px의 중앙 정렬 컨테이너
- **공통 스타일**: 대시보드 전체 테마 및 스타일링
- **에러 경계**: 위젯 오류 시 전체 대시보드 보호
- **로딩 상태**: 초기 로딩 및 위젯 지연 로딩 관리

#### 컴포넌트 구조
```typescript
interface DashboardContainerProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
}

export function DashboardContainer({
  children,
  title,
  actions
}: DashboardContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 영역 */}
      {title && (
        <div className="bg-white border-b shadow-sm">
          <div className="w-full max-w-[1300px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {title}
              </h1>
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <main className="w-full max-w-[1300px] mx-auto p-6">
        <ErrorBoundary fallback={<DashboardError />}>
          <Suspense fallback={<DashboardSkeleton />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
```

## 🏗️ 아키텍처 패턴

### 1. 반응형 그리드 시스템
```typescript
// 화면 크기별 컬럼 수 결정
const getColsForWidth = (width: number): number => {
  if (width >= 1200) return 9
  if (width >= 768) return 6
  if (width >= 480) return 4
  return 2
}

// 실시간 반응형 컬럼 훅
export function useResponsiveCols() {
  const [cols, setCols] = useState(9)

  useEffect(() => {
    const updateCols = () => setCols(getColsForWidth(window.innerWidth))
    updateCols()
    window.addEventListener('resize', updateCols)
    return () => window.removeEventListener('resize', updateCols)
  }, [])

  return cols
}
```

### 2. 위젯 상태 관리
```typescript
// Zustand 스토어 구조
interface DashboardState {
  widgets: WidgetConfig[]
  cols: number
  maxRows: number

  // 액션들
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void
  addWidget: (widget: WidgetConfig) => void
  removeWidget: (id: string) => void
  resetLayout: () => void

  // 고급 기능
  optimizeLayout: () => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}
```

### 3. 충돌 감지 및 해결
```typescript
// 위젯 충돌 감지 알고리즘
function detectCollisions(widgets: WidgetConfig[]): CollisionInfo[] {
  const collisions: CollisionInfo[] = []

  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      if (isOverlapping(widgets[i], widgets[j])) {
        collisions.push({
          widget1: widgets[i],
          widget2: widgets[j],
          overlapArea: calculateOverlap(widgets[i], widgets[j])
        })
      }
    }
  }

  return collisions
}

// 자동 충돌 해결
function resolveCollisions(widgets: WidgetConfig[]): WidgetConfig[] {
  const resolved = [...widgets]
  const collisions = detectCollisions(resolved)

  collisions.forEach(collision => {
    // 작은 위젯을 아래로 이동
    const smaller = getSmallerWidget(collision.widget1, collision.widget2)
    const newPosition = findNextAvailablePosition(smaller, resolved)
    updateWidgetPosition(smaller, newPosition, resolved)
  })

  return resolved
}
```

## 🎨 시각적 디자인 시스템

### CSS Grid 레이아웃
```css
/* 기본 그리드 설정 */
.dashboard-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  grid-auto-rows: 120px;
  max-width: 1300px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* 반응형 브레이크포인트 */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    padding: 1rem;
  }
}
```

### 드래그 앤 드롭 시각적 피드백
```css
/* 드래그 중인 위젯 */
.widget-dragging {
  transform: scale(1.05);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 2px solid hsl(var(--primary));
  background: hsl(var(--primary) / 0.05);
  z-index: 1000;
}

/* 드롭 가능 영역 */
.drop-zone-active {
  background: hsl(var(--primary) / 0.1);
  border: 2px dashed hsl(var(--primary));
}

/* 충돌 경고 */
.widget-collision-warning {
  border-color: hsl(var(--destructive));
  background: hsl(var(--destructive) / 0.1);
}
```

## 🚀 성능 최적화

### 1. 렌더링 최적화
```typescript
// 위젯 컴포넌트 메모화
const MemoizedWidget = React.memo(({ widget, ...props }) => {
  return <WidgetComponent widget={widget} {...props} />
}, (prevProps, nextProps) => {
  // 위젯 설정이나 데이터가 변경된 경우만 리렌더링
  return (
    prevProps.widget.id === nextProps.widget.id &&
    prevProps.widget.x === nextProps.widget.x &&
    prevProps.widget.y === nextProps.widget.y &&
    prevProps.widget.w === nextProps.widget.w &&
    prevProps.widget.h === nextProps.widget.h
  )
})

// 그리드 레이아웃 계산 최적화
const memoizedLayout = useMemo(() => {
  return calculateGridLayout(widgets, cols, maxRows)
}, [widgets, cols, maxRows])
```

### 2. 애니메이션 최적화
```typescript
// requestAnimationFrame을 활용한 60fps 애니메이션
function smoothUpdatePosition(element: HTMLElement, x: number, y: number) {
  let currentX = parseFloat(element.style.left) || 0
  let currentY = parseFloat(element.style.top) || 0

  const animate = () => {
    const dx = (x - currentX) * 0.15
    const dy = (y - currentY) * 0.15

    currentX += dx
    currentY += dy

    element.style.transform = `translate(${currentX}px, ${currentY}px)`

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}
```

### 3. 메모리 관리
```typescript
// 컴포넌트 정리 시 이벤트 리스너 제거
useEffect(() => {
  const handleResize = debounce(updateGridCols, 200)
  const handleScroll = throttle(updateVisibleWidgets, 16)

  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)

  return () => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleScroll)
  }
}, [])
```

## 🔄 데이터 흐름

### 위젯 생명주기
```typescript
// 1. 위젯 등록
const addNewWidget = (type: WidgetType) => {
  const newWidget: WidgetConfig = {
    id: generateId(),
    type,
    x: 0,
    y: 0,
    w: getDefaultWidth(type),
    h: getDefaultHeight(type),
    ...getDefaultProps(type)
  }

  // 최적 위치 찾기
  const position = findOptimalPosition(newWidget, widgets)
  newWidget.x = position.x
  newWidget.y = position.y

  // 스토어에 추가
  addWidget(newWidget)
}

// 2. 위젯 업데이트
const updateWidgetData = (id: string, data: any) => {
  updateWidget(id, { data, lastUpdated: Date.now() })
}

// 3. 위젯 제거
const removeWidgetSafe = (id: string) => {
  // 애니메이션과 함께 제거
  const element = document.getElementById(`widget-${id}`)
  element?.style.setProperty('transform', 'scale(0)')

  setTimeout(() => {
    removeWidget(id)
    optimizeLayout() // 레이아웃 재정렬
  }, 200)
}
```

## 📊 품질 메트릭

### 성능 지표
- **초기 렌더링**: < 1초
- **드래그 응답성**: < 16ms (60fps)
- **레이아웃 재계산**: < 100ms
- **메모리 사용량**: < 50MB (위젯 7개 기준)

### 사용자 경험
- **드래그 시작 지연**: < 100ms
- **애니메이션 부드러움**: 60fps 유지
- **충돌 감지 정확도**: 99% 이상

## 🔗 관련 문서

- [`../../app/dashboard/claude.md`](../../app/dashboard/claude.md) - 대시보드 페이지 시스템
- [`../ui/widgets/claude.md`](../ui/widgets/claude.md) - 위젯 개발 가이드
- [`../../lib/stores/useImprovedDashboardStore.ts`] - 대시보드 상태 관리
- [`../../lib/dashboard/grid-utils.ts`] - 그리드 유틸리티

---

**이 대시보드 컴포넌트 시스템은 현대적이고 직관적인 위젯 기반 작업 공간을 제공합니다.**