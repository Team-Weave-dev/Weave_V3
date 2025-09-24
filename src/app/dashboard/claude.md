# dashboard/ - 대시보드 위젯 시스템

## 📊 대시보드 시스템 개요

이 디렉토리는 프리랜서와 1인 기업을 위한 인터랙티브 대시보드를 제공합니다. **9x9 반응형 그리드** 기반의 위젯 시스템으로 사용자가 자유롭게 위젯을 배치하고 관리할 수 있습니다.

## 📁 페이지 구조

```
dashboard/
├── layout.tsx          # 📋 대시보드 전용 레이아웃
└── page.tsx            # 📊 대시보드 메인 페이지 (/dashboard)
```

## 🎯 핵심 기능

### 1. 반응형 그리드 시스템
- **9x9 그리드**: 기존 12x12에서 최적화된 9x9 레이아웃
- **컨테이너 최대폭**: 1300px로 대형 화면 최적화
- **반응형 컬럼**: 화면 크기별 자동 컬럼 조정
  - `>=1200px`: 9컬럼
  - `>=768px`: 6컬럼
  - `>=480px`: 4컬럼
  - `<480px`: 2컬럼

### 2. 드래그 앤 드롭 시스템
- **@hello-pangea/dnd**: 부드러운 위젯 이동
- **스마트 충돌 처리**: 위젯 간 겹침 방지
- **실시간 위치 업데이트**: 드롭 시 즉시 레이아웃 저장
- **iOS 스타일 애니메이션**: 자연스러운 모션

### 3. 위젯 라이브러리 (7개)
- **TodoListWidget**: 드래그 앤 드롭 할 일 관리
- **TaxDeadlineWidget**: 세무 일정 및 D-day 알림
- **CalendarWidget**: 월간 캘린더 및 일정 관리
- **ProjectSummaryWidget**: 프로젝트 현황 탭
- **ChartWidget**: 데이터 시각화 차트
- **QuickActionsWidget**: 빠른 실행 버튼들
- **StatsWidget**: 통계 및 메트릭 표시

## 📄 주요 페이지 구성

### layout.tsx - 대시보드 레이아웃
```typescript
// 대시보드 전용 레이아웃 (전체화면 최적화)
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="w-full max-w-[1300px] mx-auto p-6">
        {children}
      </main>
    </div>
  )
}
```

### page.tsx - 메인 대시보드 페이지
```typescript
import { ImprovedDashboard } from '@/components/dashboard/ImprovedDashboard'

export default function DashboardPage() {
  return <ImprovedDashboard />
}
```

## 🏗️ 아키텍처 패턴

### 상태 관리 (Zustand)
```typescript
// src/lib/stores/useImprovedDashboardStore.ts
interface DashboardState {
  widgets: WidgetConfig[]
  cols: number
  maxRows: number
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void
  resetLayout: () => void
}
```

### 그리드 유틸리티
```typescript
// src/lib/dashboard/grid-utils.ts
- getColsForWidth(): 화면 크기별 컬럼 계산
- findOptimalPosition(): 위젯 최적 배치 위치 찾기
- detectCollisions(): 위젯 간 충돌 감지
- compactLayout(): 레이아웃 압축 및 최적화
```

### iOS 스타일 애니메이션
```typescript
// src/lib/dashboard/ios-animations.ts
- easeInOutCubic(): 자연스러운 이징 함수
- createSpringAnimation(): 스프링 애니메이션 효과
- performanceOptimizer(): 60fps 유지를 위한 최적화
```

## 🎨 시각적 디자인

### 위젯 카드 스타일
```css
/* 기본 위젯 카드 */
.widget-card {
  @apply bg-white border border-gray-200 rounded-lg shadow-sm;
  @apply transition-all duration-200 hover:shadow-md;
}

/* 드래그 중 스타일 */
.widget-dragging {
  @apply shadow-lg scale-105 z-50;
  @apply border-primary/30 bg-primary/5;
}
```

### 반응형 브레이크포인트
```typescript
const BREAKPOINTS = {
  xl: 1200,  // 9 columns
  lg: 768,   // 6 columns
  md: 480,   // 4 columns
  sm: 0      // 2 columns
}
```

## 🔧 개발 가이드라인

### 새 위젯 추가 과정
1. **위젯 컴포넌트 생성**: `src/components/ui/widgets/`에 새 위젯 추가
2. **위젯 가이드 준수**: `widgets/claude.md`의 표준 구조 적용
3. **타입 정의**: `dashboard.ts`에 위젯 Props 타입 추가
4. **스토어 연동**: 대시보드 스토어에 위젯 등록
5. **테스트**: 드래그 앤 드롭, 리사이징 동작 확인

### 성능 최적화 가이드
```typescript
// 위젯 메모화
const MemoizedWidget = React.memo(WidgetComponent)

// 무거운 계산 캐싱
const expensiveValue = useMemo(() => calculateData(), [dependencies])

// 디바운스된 레이아웃 업데이트
const debouncedUpdateLayout = useDeferredValue(layoutConfig)
```

## 📊 성능 메트릭

### 런타임 성능
- **초기 로딩**: < 2초
- **위젯 드래그**: 60fps 유지
- **레이아웃 재계산**: < 50ms
- **메모리 사용량**: < 50MB (위젯 7개 기준)

### 사용자 경험
- **드래그 지연**: < 16ms (60fps)
- **애니메이션 부드러움**: iOS 수준 품질
- **반응형 전환**: < 200ms

## 🔄 상태 지속성

### 로컬 스토리지 연동
```typescript
// 레이아웃 자동 저장
useEffect(() => {
  localStorage.setItem('dashboardLayout', JSON.stringify(widgets))
}, [widgets])

// 초기 로딩 시 복원
const savedLayout = localStorage.getItem('dashboardLayout')
if (savedLayout) restoreLayout(JSON.parse(savedLayout))
```

### URL 상태 동기화 (선택사항)
```typescript
// 대시보드 구성을 URL에 압축 인코딩
/dashboard?layout=eyJ3aWRnZXRzIjpbey...
```

## 🎯 타겟 사용자 워크플로우

### 프리랜서 시나리오
1. **TodoList**: 일일 작업 관리
2. **TaxDeadline**: 세무 일정 추적
3. **ProjectSummary**: 진행 중인 프로젝트 현황
4. **Calendar**: 클라이언트 미팅 일정

### 1인 기업 시나리오
1. **Stats**: 매출 및 성과 지표
2. **QuickActions**: 자주 사용하는 기능 바로가기
3. **Chart**: 비즈니스 데이터 시각화
4. **Calendar**: 사업 일정 및 마케팅 캠페인

## 🔗 관련 문서

- [`../../components/dashboard/claude.md`] - 대시보드 컴포넌트 구현 가이드
- [`../../components/ui/widgets/claude.md`] - 위젯 개발 표준 가이드
- [`../../lib/stores/useImprovedDashboardStore.ts`] - 상태 관리 로직
- [`../../lib/dashboard/grid-utils.ts`] - 그리드 유틸리티 함수

---

**이 대시보드 시스템은 사용자의 비즈니스 워크플로우를 지원하는 개인화된 작업 공간을 제공합니다.**