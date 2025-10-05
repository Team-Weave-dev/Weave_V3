# 위젯 개발 가이드

`src/components/ui/widgets` 폴더의 위젯 개발을 위한 필수 가이드라인.

## 🎯 핵심 원칙

- **중앙화 우선**: 텍스트는 `brand.ts`, 스타일은 `constants.ts` 사용
- **일관성**: 기존 위젯 패턴 준수
- **접근성**: WCAG 2.1 AA 표준
- **반응형**: 모든 화면 크기 지원

## 📏 위젯 크기 시스템

### 표준 규격
- **기본 크기**: 2x2 (모든 위젯 추가 시)
- **최소 높이**: 2 (가독성 보장)
- **최대 크기**: 5x5 (대시보드 균형)
- **리사이징**: 편집 모드에서 조절 가능

### 반응형 처리
```tsx
const isCompact = gridSize.w <= 2 || gridSize.h <= 2;
const isMedium = gridSize.w <= 3 || gridSize.h <= 3;
// 크기별 조건부 렌더링
```

## 📐 위젯 구조 표준

### 기본 구조
```tsx
export function YourWidget({ title, ...props }: YourWidgetProps) {
  const displayTitle = title || getWidgetText.yourWidget.title('ko');
  
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>{/* 헤더 */}</CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        {/* 콘텐츠 */}
      </CardContent>
    </Card>
  );
}
```

### 헤더 패턴

**기본 헤더**
```tsx
<CardHeader>
  <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
  <CardDescription className={typography.text.description}>
    {getWidgetText.yourWidget.description('ko')}
  </CardDescription>
</CardHeader>
```

**툴바 헤더 (우측 버튼)**
```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <CardTitle>{displayTitle}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </div>
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Icon className="h-4 w-4" />
      </Button>
    </div>
  </div>
</CardHeader>
```

### 콘텐츠 패턴
```tsx
<CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
  <div className="flex flex-col h-full">
    {/* 필터 영역 (옵션) */}
    <div className="mb-2 px-3">{/* 필터 */}</div>
    
    {/* 메인 콘텐츠 */}
    <ScrollArea className="flex-1">
      <div className="space-y-2 px-3">{/* 아이템 */}</div>
    </ScrollArea>
    
    {/* 하단 범례 (옵션) */}
    <div className="px-3 pt-3 mt-auto border-t">{/* 범례 */}</div>
  </div>
</CardContent>
```

## 🎨 스타일링 규칙

### 간격 시스템
| 요소 | 클래스 | 용도 |
|------|--------|------|
| CardContent | `px-1 pb-2` | 외곽 패딩 |
| 콘텐츠 내부 | `px-3` | 실제 콘텐츠 패딩 |
| 섹션 간 | `mb-2` | 섹션 마진 |
| 아이템 간 | `space-y-2` | 아이템 간격 |

### 크기 규칙
| 요소 | 크기 |
|------|------|
| 헤더 버튼 | `h-8 w-8 p-0` |
| 기본 아이콘 | `h-4 w-4` |
| 작은 아이콘 | `h-3 w-3` |
| Input/Select | `h-8` |

### 색상 시스템
```tsx
// 상태별 배경
"bg-red-50 border-red-200"     // 긴급
"bg-orange-50 border-orange-200" // 주의
"bg-blue-50 border-blue-200"    // 정보
"bg-green-50 border-green-200"  // 완료

// 텍스트 색상
"text-red-500"           // 긴급
"text-orange-500"        // 주의
"text-muted-foreground"  // 보조
```

### 타이포그래피 (constants.ts)
```tsx
typography.widget.title      // 위젯 제목
typography.text.description  // 설명
typography.widget.value      // 큰 값 (D-16)
typography.widget.label      // 레이블
typography.text.small        // 작은 텍스트
```

## 📦 컴포넌트 사용

### Badge
```tsx
<Badge variant="outline" className="text-xs">텍스트</Badge>
<Badge variant="error">긴급</Badge>
<Badge variant="warning">주의</Badge>
```

### ScrollArea
```tsx
<ScrollArea className="flex-1">
  <div className="space-y-2 px-3">{/* 콘텐츠 */}</div>
</ScrollArea>
```

### 빈 상태
```tsx
<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
  <Icon className="h-8 w-8 mb-2" />
  <p className="text-sm">데이터가 없습니다</p>
</div>
```

## 🔧 중앙화 통합

### brand.ts 추가
```typescript
export const getWidgetText = {
  yourWidget: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => 
      lang === 'ko' ? '위젯 제목' : 'Widget Title',
    description: (lang: 'ko' | 'en' = defaultLanguage) => 
      lang === 'ko' ? '위젯 설명' : 'Widget description',
  }
}
```

### 타입 정의
```typescript
// src/types/dashboard.ts
export interface YourWidgetProps {
  title?: string;
  // props...
}
```

## ✅ 체크리스트

- [ ] `brand.ts` 텍스트 시스템 사용
- [ ] `constants.ts` 스타일 상수 사용
- [ ] CardDescription 포함
- [ ] 간격 규칙 적용 (px-1, px-3, mb-2)
- [ ] ScrollArea 반응형 처리
- [ ] 빈 상태 UI 구현
- [ ] TypeScript 타입 정의
- [ ] 접근성 속성 (aria-label)
- [ ] 다크모드 지원

## 🔗 Storage API 통합 가이드

**데이터 통합 완료**: 모든 대시보드 위젯이 Storage API 기반 실시간 동기화로 동작합니다.

### Self-Loading Widget 패턴

모든 위젯은 **Custom Hook**을 통해 자체적으로 데이터를 로드합니다.

```tsx
// 1. 커스텀 훅 생성 (src/hooks/useYourWidgetData.tsx)
'use client';

import React, { useEffect, useState } from 'react';
import { yourService } from '@/lib/storage';
import type { YourEntity } from '@/lib/storage/types/entities/your-entity';
import type { WidgetDataType } from '@/types/dashboard';

interface UseYourWidgetDataReturn {
  data: WidgetDataType[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useYourWidgetData(): UseYourWidgetDataReturn {
  const [data, setData] = useState<WidgetDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Storage Service에서 데이터 로드
      const entities = await yourService.getAll();

      // 위젯 타입으로 변환
      const converted = entities.map(convertToWidgetType);
      setData(converted);
    } catch (err) {
      console.error('Failed to load widget data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Storage 구독: 데이터 변경 시 자동 리로드
    const unsubscribe = yourService['storage'].subscribe(
      'your_storage_key',
      loadData
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error, refresh: loadData };
}
```

```tsx
// 2. 위젯 컴포넌트에서 훅 사용
export function YourWidget({ title }: YourWidgetProps) {
  const displayTitle = title || getWidgetText.yourWidget.title('ko');

  // Self-loading: 훅이 모든 데이터 로딩 담당
  const { data, loading, error } = useYourWidgetData();

  // 로딩 상태
  if (loading) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="md" text={getLoadingText.data('ko')} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-destructive">
            <XCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className={typography.text.small}>데이터를 불러오는 중 오류가 발생했습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 정상 상태: 데이터 표시
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
        <CardDescription className={typography.text.description}>
          {getWidgetText.yourWidget.description('ko')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
        {/* 데이터 렌더링 */}
        {data.map(item => (
          <YourWidgetItem key={item.id} data={item} />
        ))}
      </CardContent>
    </Card>
  );
}
```

### Storage API 통합 체크리스트

- [ ] **커스텀 훅 생성**: `src/hooks/useYourWidgetData.tsx`
- [ ] **Storage Service 연결**: `yourService.getAll()` 또는 `getById()`
- [ ] **실시간 구독**: `yourService['storage'].subscribe()`
- [ ] **타입 변환**: Storage 엔티티 → Widget 타입
- [ ] **로딩/에러/빈 상태**: 3가지 상태 UI 구현
- [ ] **Props 제거**: `data` prop 제거, self-loading으로 전환
- [ ] **ImprovedDashboard 수정**: `data: undefined` 설정
- [ ] **빌드 검증**: `npm run type-check && npm run build`

### 다중 Service 통합 예시

일부 위젯은 여러 Service의 데이터를 통합해야 합니다.

```tsx
// 예시: KPIWidget (프로젝트 + 작업)
export function useKPIMetrics() {
  const [monthlyMetrics, setMonthlyMetrics] = useState<KPIMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // 여러 Service에서 데이터 로드
      const [allProjects, allTasks] = await Promise.all([
        projectService.getAll(),
        taskService.getAll(),
      ]);

      // 통합 집계 로직
      const monthly = calculateMonthlyMetrics(allProjects, allTasks);
      setMonthlyMetrics(monthly);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();

    // 다중 구독: 두 Service 모두 감시
    const unsubscribeProjects = projectService['storage'].subscribe('projects', loadMetrics);
    const unsubscribeTasks = taskService['storage'].subscribe('tasks', loadMetrics);

    return () => {
      unsubscribeProjects();
      unsubscribeTasks();
    };
  }, []);

  return { monthlyMetrics, loading, error, refresh: loadMetrics };
}
```

### 실시간 동기화 동작 원리

1. **초기 로드**: 컴포넌트 마운트 시 `useEffect`가 실행되어 데이터 로드
2. **Storage 구독**: `subscribe()` 메서드로 Storage 이벤트 리스닝
3. **자동 리로드**: Storage 데이터 변경 시 콜백 함수 자동 실행
4. **UI 업데이트**: 새 데이터로 React state 업데이트 → 자동 리렌더링
5. **Cleanup**: 컴포넌트 언마운트 시 `unsubscribe()` 호출로 메모리 누수 방지

## 📝 현재 위젯 목록

| 위젯 | 파일 | 설명 | Storage API | Custom Hook |
|------|------|------|-------------|-------------|
| 캘린더 | CalendarWidget.tsx | 월간 일정 관리 | ✅ | useIntegratedCalendar |
| 할 일 | TodoListWidget.tsx | 드래그 앤 드롭 | ✅ | useIntegratedCalendar |
| 프로젝트 | ProjectSummaryWidget.tsx | 프로젝트 탭 뷰 | ✅ | useProjectSummary |
| KPI | KPIWidget.tsx | 성과 지표 | ✅ | useKPIMetrics |
| 매출 | RevenueChartWidget.tsx | 매출 차트 | ✅ | useRevenueChart |
| 활동 | RecentActivityWidget.tsx | 최근 활동 | ✅ | useRecentActivity |
| 세무 | TaxDeadlineWidget.tsx | D-day 알림 | ⏳ | 예정 |

**마지막 업데이트**: 2025-01-06 (Phase 7-1 완료)

### 위젯 타입
```typescript
export type ImprovedWidget['type'] =
  | 'calendar' | 'todoList' | 'projectSummary'
  | 'kpiMetrics' | 'revenueChart' | 'recentActivity'
  | 'taxDeadline' | 'custom'
```

## 🚨 주의사항

- **하드코딩 금지**: 모든 텍스트는 `brand.ts`
- **인라인 스타일 금지**: Tailwind 클래스 사용
- **매직 넘버 금지**: 상수로 정의
- **console.log 제거**: 프로덕션 코드 정리
- **TODO 주석 금지**: 완성된 코드만