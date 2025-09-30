# 로딩 UI 시스템 가이드라인

이 문서는 프로젝트의 모든 로딩 상태 UI에 대한 표준 사용 가이드입니다.

## 🎯 로딩 UI 결정 트리

로딩 상태가 발생했을 때 어떤 컴포넌트를 사용해야 할지 결정하는 플로우차트입니다.

```
로딩 상태 발생
    │
    ├─ 전체 페이지 초기 로딩?
    │   └─ YES → 스켈레톤 UI (권장) 또는 FullPageLoadingSpinner
    │
    ├─ 라우트 전환?
    │   └─ YES → RouteChangeProgressBar (상단 프로그레스바)
    │
    ├─ 버튼 액션?
    │   └─ YES → LoadingButton
    │
    ├─ 데이터 시각화 (진행률)?
    │   └─ YES → ProjectProgress
    │
    └─ 컴포넌트 내부 로딩?
        ├─ 구조적 콘텐츠 (리스트, 카드, 테이블) → 스켈레톤 UI
        └─ 단순 데이터 → LoadingSpinner (인라인)
```

## 📦 사용 가능한 로딩 컴포넌트

### 1. 스켈레톤 UI (추천) ⭐

**사용 시기**: 전체 페이지 초기 로딩, 구조적 콘텐츠 로딩

**장점**:
- CLS (Cumulative Layout Shift) 최소화
- 인지된 성능 향상
- 사용자가 로딩 구조를 미리 파악

**단점**:
- 구현 시간 증가
- 각 페이지별 맞춤 스켈레톤 필요

**사용 예시**:
```tsx
import { Skeleton } from '@/components/ui/skeleton'

// 기본 스켈레톤
<Skeleton className="w-full h-12" />

// 카드 스켈레톤
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>
```

**적용 권장 영역**:
- ✅ 프로젝트 목록 (ListView)
- ✅ 프로젝트 상세 (DetailView)
- ✅ 대시보드 위젯
- ✅ 테이블 데이터

### 2. FullPageLoadingSpinner

**사용 시기**: 전체 페이지 초기 로딩 (스켈레톤 없을 때만)

**장점**:
- 구현 간단
- 모든 페이지에서 일관된 경험

**단점**:
- 빈 화면으로 인한 사용자 불안감
- CLS 발생 가능성

**사용 예시**:
```tsx
import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner'
import { getLoadingText } from '@/config/brand'

export default function Loading() {
  return <FullPageLoadingSpinner text={getLoadingText.page('ko')} />
}
```

**현재 적용 위치**:
- `src/app/loading.tsx`
- `src/app/dashboard/loading.tsx`
- `src/app/projects/loading.tsx`
- `src/app/projects/[id]/loading.tsx`
- `src/app/components/loading.tsx`

### 3. LoadingSpinner

**사용 시기**: 컴포넌트 내부 인라인 로딩, 단순 데이터 로딩

**장점**:
- 작고 가벼움
- 다양한 크기 지원 (sm, md, lg)

**단점**:
- 콘텐츠 구조 미리보기 불가

**사용 예시**:
```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getLoadingText } from '@/config/brand'

// 기본 크기
<LoadingSpinner />

// 텍스트와 함께
<LoadingSpinner text={getLoadingText.data('ko')} />

// 크기 지정
<LoadingSpinner size="lg" text={getLoadingText.content('ko')} />
```

### 4. RouteChangeProgressBar

**사용 시기**: 페이지 간 네비게이션 (자동 적용)

**장점**:
- 사용자에게 즉각적인 피드백
- 네이티브 앱과 유사한 경험
- 전역에서 자동 작동

**단점**:
- 없음 (권장 사용)

**사용 예시**:
```tsx
// layout.tsx에 한 번만 추가
import { RouteChangeProgressBar } from '@/components/ui/route-progress-bar'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RouteChangeProgressBar />
        {children}
      </body>
    </html>
  )
}
```

**현재 적용 위치**: `src/app/layout.tsx` (전역)

### 5. LoadingButton

**사용 시기**: 버튼 클릭 후 액션 처리 중

**장점**:
- 자동 비활성화
- 명확한 로딩 상태 표시
- 3가지 스피너 위치 (left, right, center)

**단점**:
- 없음 (권장 사용)

**사용 예시**:
```tsx
import { LoadingButton } from '@/components/ui/loading-button'
import { getButtonText } from '@/config/brand'

function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitData()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LoadingButton
      loading={isSubmitting}
      onClick={handleSubmit}
    >
      {getButtonText.submit('ko')}
    </LoadingButton>
  )
}
```

### 6. ProjectProgress

**사용 시기**: 프로젝트 진행률 또는 메트릭 시각화

**장점**:
- 시각적 진행률 표시
- 다양한 크기 지원
- 애니메이션 효과

**단점**:
- 프로젝트 전용 (범용 Progress는 별도)

**사용 예시**:
```tsx
import { ProjectProgress } from '@/components/ui/project-progress'

<ProjectProgress
  value={65}
  size="md"
  showLabel
  labelPlacement="bottom"
/>
```

## 🎨 중앙화된 로딩 텍스트 시스템

모든 로딩 관련 텍스트는 `@/config/brand.ts`의 `getLoadingText` 헬퍼를 사용합니다.

### 사용 가능한 텍스트

```typescript
import { getLoadingText } from '@/config/brand'

// 기본 로딩 메시지
getLoadingText.page('ko')        // "페이지를 불러오는 중..."
getLoadingText.content('ko')     // "콘텐츠를 불러오는 중..."
getLoadingText.data('ko')        // "데이터를 불러오는 중..."
getLoadingText.component('ko')   // "컴포넌트를 불러오는 중..."
getLoadingText.pleaseWait('ko')  // "잠시만 기다려주세요..."

// 접근성 레이블
getLoadingText.aria('ko')        // "로딩 중"

// 프로젝트 관련 로딩
getLoadingText.contract('ko')    // "계약서 정보를 불러오는 중입니다..."
getLoadingText.billing('ko')     // "청구서 정보를 불러오는 중입니다..."
getLoadingText.documents('ko')   // "문서 목록을 불러오는 중입니다..."
```

### ❌ 하드코딩 금지

```tsx
// ❌ 절대 금지
<FullPageLoadingSpinner text="로딩 중..." />
<LoadingSpinner text="데이터를 불러오는 중..." />

// ✅ 올바른 사용
<FullPageLoadingSpinner text={getLoadingText.page('ko')} />
<LoadingSpinner text={getLoadingText.data('ko')} />
```

## 📝 페이지별 loading.tsx 패턴

Next.js의 `loading.tsx` 파일은 페이지 전환 시 자동으로 표시됩니다.

### 표준 패턴

```tsx
import { FullPageLoadingSpinner } from '@/components/ui/loading-spinner'
import { getLoadingText } from '@/config/brand'

/**
 * [페이지명] 로딩 상태
 */
export default function Loading() {
  return <FullPageLoadingSpinner text={getLoadingText.[적절한텍스트]('ko')} />
}
```

### 텍스트 선택 가이드

| 페이지 유형 | 권장 텍스트 |
|------------|------------|
| 일반 페이지 | `getLoadingText.page('ko')` |
| 데이터 중심 | `getLoadingText.data('ko')` |
| 컴포넌트 데모 | `getLoadingText.component('ko')` |
| 콘텐츠 중심 | `getLoadingText.content('ko')` |
| 프로젝트 관련 | `getLoadingText.[contract/billing/documents]('ko')` |

## 🚀 향후 개선 계획 (Phase 2)

### 스켈레톤 UI 구현

#### 우선순위
1. **Skeleton 기본 컴포넌트** (1시간)
   - `src/components/ui/skeleton.tsx`
   - variant: default, circle, rounded

2. **SkeletonCard** (1시간)
   - 재사용 가능한 카드 스켈레톤
   - 프로젝트 카드 구조 모방

3. **SkeletonTable** (1-2시간)
   - 테이블 구조 스켈레톤
   - AdvancedTable 호환

4. **페이지별 적용** (1시간)
   - DetailView: SkeletonCard
   - ListView: SkeletonTable
   - 프로젝트 상세: SkeletonProjectDetail

#### 구현 예시 (미리보기)

```tsx
// src/components/ui/skeleton.tsx
import { cn } from "@/lib/utils"

interface SkeletonProps {
  variant?: 'default' | 'circle' | 'rounded'
  className?: string
}

export function Skeleton({
  variant = 'default',
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variant === 'circle' && "rounded-full",
        variant === 'rounded' && "rounded-md",
        className
      )}
      {...props}
    />
  )
}
```

## 📊 품질 체크리스트

로딩 UI를 구현할 때 다음 항목들을 확인하세요:

### 필수 체크
- [ ] 중앙화된 텍스트 시스템 사용 (`getLoadingText`)
- [ ] 적절한 로딩 컴포넌트 선택 (결정 트리 참조)
- [ ] 접근성 레이블 적용 (aria-label)
- [ ] 다국어 지원 (ko/en)

### 권장 체크
- [ ] 스켈레톤 UI 우선 고려
- [ ] CLS (Cumulative Layout Shift) 최소화
- [ ] 로딩 상태가 1초 이상일 때만 표시
- [ ] 애니메이션 부드러움 (60fps)

### 접근성 체크
- [ ] 스크린 리더 지원 (aria-label)
- [ ] 키보드 내비게이션 영향 없음
- [ ] 색상에만 의존하지 않는 시각적 피드백
- [ ] 고대비 모드 지원

## 🔗 관련 문서

- [`src/components/ui/claude.md`](../src/components/ui/claude.md) - UI 컴포넌트 상세 가이드
- [`src/config/claude.md`](../src/config/claude.md) - 중앙화 설정 시스템
- [`CLAUDE.md`](../CLAUDE.md) - 프로젝트 전체 가이드

## 📞 도움말

로딩 UI 관련 질문이나 개선 제안은 다음을 참고하세요:

1. 이 문서의 결정 트리 활용
2. 관련 컴포넌트의 코드 주석 확인
3. `src/components/ui/claude.md`의 상세 가이드 참조

---

**마지막 업데이트**: 2025-09-30
**작성자**: Claude Code