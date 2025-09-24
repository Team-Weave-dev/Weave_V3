# tax-management/ - 세무 관리 서비스 (예정)

## 🧾 세무 관리 개요

이 디렉토리는 향후 구현될 종합적인 세무 관리 서비스의 랜딩 페이지를 제공합니다. 현재는 **서비스 소개 페이지** 형태로 구현되어 있으며, **완전한 중앙화 텍스트 시스템**과 **전문적인 UI 디자인**을 특징으로 합니다.

## 📁 파일 구조

```
tax-management/
├── layout.tsx    # 📱 세무 관리 페이지 레이아웃 래퍼
└── page.tsx      # 🧾 세무 관리 서비스 소개 페이지
```

## 📱 layout.tsx - 페이지 레이아웃

### 역할 및 기능
- **AppLayout 통합**: 공통 애플리케이션 레이아웃 적용
- **일관된 구조**: 다른 앱 페이지들과 동일한 레이아웃 시스템
- **네비게이션 통합**: 사이드바 및 헤더 공유

### 구현 코드
```typescript
import { AppLayout } from '@/components/layout/AppLayout'

export default function TaxManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}
```

### 특징
- **Server Component**: 서버 렌더링 최적화
- **레이아웃 일관성**: 전체 애플리케이션과 통합된 디자인

## 🧾 page.tsx - 세무 관리 서비스 소개

### 서비스 개요
현재는 **"Coming Soon"** 형태의 서비스 소개 페이지로, 향후 제공될 세무 관리 기능들을 미리 안내합니다. **전문 세무사 파트너십**을 통한 종합적인 세무 서비스를 계획하고 있습니다.

### 페이지 구성 요소

#### 1. 페이지 헤더
```typescript
<div className="flex justify-between items-center">
  <div>
    <h1 className={typography.title.page}>
      {getTaxManagementText.title('ko')}
    </h1>
    <p className={typography.text.subtitle}>
      {getTaxManagementText.subtitle('ko')}
    </p>
  </div>
</div>
```

**특징**:
- **중앙화 텍스트**: `getTaxManagementText` 함수 사용
- **타이포그래피 시스템**: `typography.*` 상수 활용
- **다국어 대응**: 한국어('ko') 기본 제공

#### 2. 메인 서비스 소개 카드
```typescript
<Card className="border-primary/20">
  <CardHeader className="text-center pb-2">
    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
      <Calculator className="h-8 w-8 text-primary" />
    </div>
    <CardTitle className={typography.title.pageSection}>
      {getTaxManagementText.serviceTitle('ko')}
    </CardTitle>
    <CardDescription className={`${typography.text.base} mt-3`}>
      {getTaxManagementText.serviceDescription('ko')}
    </CardDescription>
  </CardHeader>
  {/* 서비스 상세 내용 */}
</Card>
```

**특징**:
- **시각적 강조**: 기본 테마 색상과 원형 아이콘 배경
- **중앙 정렬**: 전문적인 서비스 소개 레이아웃
- **계산기 아이콘**: 세무/회계 서비스를 상징하는 아이콘

### 계획된 서비스 목록

#### 1. 종합소득세 (Comprehensive Tax)
```typescript
<div className="flex gap-3">
  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
    <FileText className="h-5 w-5 text-primary" />
  </div>
  <div className="space-y-1">
    <p className="font-medium">
      {getTaxManagementText.plannedServices.comprehensiveTax.title('ko')}
    </p>
    <p className={typography.text.description}>
      {getTaxManagementText.plannedServices.comprehensiveTax.description('ko')}
    </p>
  </div>
</div>
```

#### 2. 법인세 (Corporate Tax)
```typescript
<div className="flex gap-3">
  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
    <Building2 className="h-5 w-5 text-primary" />
  </div>
  <div className="space-y-1">
    <p className="font-medium">
      {getTaxManagementText.plannedServices.corporateTax.title('ko')}
    </p>
    <p className={typography.text.description}>
      {getTaxManagementText.plannedServices.corporateTax.description('ko')}
    </p>
  </div>
</div>
```

#### 3. 부가가치세 (VAT)
```typescript
<div className="flex gap-3">
  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
    <Calculator className="h-5 w-5 text-primary" />
  </div>
  <div className="space-y-1">
    <p className="font-medium">
      {getTaxManagementText.plannedServices.vat.title('ko')}
    </p>
    <p className={typography.text.description}>
      {getTaxManagementText.plannedServices.vat.description('ko')}
    </p>
  </div>
</div>
```

#### 4. 세무 상담 (Tax Consultation)
```typescript
<div className="flex gap-3">
  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
    <Clock className="h-5 w-5 text-primary" />
  </div>
  <div className="space-y-1">
    <p className="font-medium">
      {getTaxManagementText.plannedServices.consultation.title('ko')}
    </p>
    <p className={typography.text.description}>
      {getTaxManagementText.plannedServices.consultation.description('ko')}
    </p>
  </div>
</div>
```

### 서비스별 아이콘 시스템

| 서비스 | 아이콘 | 의미 |
|--------|--------|------|
| **종합소득세** | `FileText` | 문서, 서류 작성 |
| **법인세** | `Building2` | 기업, 법인 업무 |
| **부가가치세** | `Calculator` | 계산, 세금 산정 |
| **세무 상담** | `Clock` | 시간, 상담 서비스 |

### Coming Soon 알림

#### 정보 블록
```typescript
<div className="mt-6 p-4 bg-primary/5 rounded-lg">
  <div className="flex gap-2">
    <div className="flex-shrink-0 mt-0.5">
      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-xs font-bold text-primary">!</span>
      </div>
    </div>
    <div className="space-y-1">
      <p className={`${typography.text.small} font-medium`}>
        {getTaxManagementText.comingSoon.title('ko')}
      </p>
      <p className="text-sm text-muted-foreground">
        {getTaxManagementText.comingSoon.description('ko')}
      </p>
    </div>
  </div>
</div>
```

**특징**:
- **주의 표시**: 원형 느낌표 아이콘으로 중요 정보 강조
- **부드러운 배경**: `bg-primary/5`로 은은한 강조 효과
- **계층적 정보**: 제목과 설명의 시각적 구분

### 핵심 기능 소개 카드

#### 3열 그리드 레이아웃
```typescript
<div className="grid gap-4 md:grid-cols-3">
  {/* 파트너십 */}
  <Card>
    <CardHeader>
      <CardTitle className={typography.title.subsection}>
        {getTaxManagementText.features.partnership.title('ko')}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        {getTaxManagementText.features.partnership.description('ko')}
      </p>
    </CardContent>
  </Card>

  {/* 자동화 */}
  <Card>
    <CardHeader>
      <CardTitle className={typography.title.subsection}>
        {getTaxManagementText.features.automation.title('ko')}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        {getTaxManagementText.features.automation.description('ko')}
      </p>
    </CardContent>
  </Card>

  {/* 최적화 */}
  <Card>
    <CardHeader>
      <CardTitle className={typography.title.subsection}>
        {getTaxManagementText.features.optimization.title('ko')}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        {getTaxManagementText.features.optimization.description('ko')}
      </p>
    </CardContent>
  </Card>
</div>
```

#### 핵심 기능 설명

1. **전문 파트너십** (`partnership`)
   - 전문 세무사와의 협업 시스템
   - 정확하고 신뢰할 수 있는 세무 서비스

2. **프로세스 자동화** (`automation`)
   - 반복 업무의 자동화로 효율성 증대
   - 실수 방지와 시간 절약

3. **세무 최적화** (`optimization`)
   - 개인/기업별 맞춤형 세무 전략
   - 세금 부담 최소화 방안 제시

### 레이아웃 및 스타일링

#### 컨테이너 설정
```typescript
<div className={`max-w-[1300px] mx-auto ${layout.spacing.page.paddingX} ${layout.spacing.page.paddingY} ${layout.spacing.page.contentGap}`}>
```

**특징**:
- **최대폭 제한**: `max-w-[1300px]`로 가독성 보장
- **중앙 정렬**: `mx-auto`로 콘텐츠 중앙 배치
- **일관된 여백**: `layout.spacing.page.*` 상수 사용

#### 반응형 그리드
```css
/* 계획된 서비스 */
md:grid-cols-2    /* 태블릿: 2열 */

/* 핵심 기능 카드 */
md:grid-cols-3    /* 태블릿/데스크톱: 3열 */
```

### 중앙화 텍스트 시스템

#### 텍스트 구조 예상
```typescript
// @/config/brand.ts에 포함된 것으로 추정
export const getTaxManagementText = {
  title: (lang: 'ko' | 'en' = 'ko') => ({
    ko: '세무 관리',
    en: 'Tax Management'
  }[lang]),

  subtitle: (lang: 'ko' | 'en' = 'ko') => ({
    ko: '전문적인 세무 관리 서비스',
    en: 'Professional Tax Management Services'
  }[lang]),

  serviceTitle: (lang: 'ko' | 'en' = 'ko') => ({
    ko: '종합 세무 관리 솔루션',
    en: 'Comprehensive Tax Management Solution'
  }[lang]),

  plannedServices: {
    comprehensiveTax: {
      title: (lang: 'ko' | 'en' = 'ko') => ({
        ko: '종합소득세 신고',
        en: 'Comprehensive Income Tax Filing'
      }[lang])
    },
    // ... 기타 서비스들
  },

  features: {
    partnership: {
      title: (lang: 'ko' | 'en' = 'ko') => ({
        ko: '전문 파트너십',
        en: 'Professional Partnership'
      }[lang])
    }
    // ... 기타 기능들
  },

  comingSoon: {
    title: (lang: 'ko' | 'en' = 'ko') => ({
      ko: '서비스 준비 중',
      en: 'Coming Soon'
    }[lang])
  }
}
```

### 사용된 UI 컴포넌트

#### shadcn/ui 컴포넌트
- **Card**: 서비스 소개 및 기능 카드
- **CardContent**: 카드 내용 영역
- **CardDescription**: 부제목 및 설명
- **CardHeader**: 카드 헤더 영역
- **CardTitle**: 카드 제목

#### Lucide Icons
- **Calculator**: 메인 서비스 아이콘, 부가가치세 아이콘
- **FileText**: 종합소득세 서류 아이콘
- **Building2**: 법인세 기업 아이콘
- **Clock**: 세무 상담 시간 아이콘

### 디자인 시스템

#### 색상 활용
```css
/* 메인 카드 강조 */
border-primary/20

/* 아이콘 배경 */
bg-primary/10

/* 텍스트 색상 */
text-primary

/* 알림 배경 */
bg-primary/5
bg-primary/20
```

#### 타이포그래피
```typescript
typography.title.page          // 메인 페이지 제목
typography.text.subtitle       // 페이지 부제목
typography.title.pageSection   // 섹션 제목
typography.text.base           // 기본 본문
typography.text.description    // 설명 텍스트
typography.title.subsection    // 하위 섹션 제목
typography.text.small          // 작은 텍스트
```

### 향후 구현 계획

#### 예상되는 실제 기능들
1. **세무 신고 도구**
   - 소득세/법인세 계산기
   - 온라인 세무 신고 시스템
   - 필요 서류 체크리스트

2. **세무 일정 관리**
   - 세무 캘린더
   - 신고 기한 알림
   - 납부 스케줄링

3. **전문가 연결**
   - 세무사 매칭 시스템
   - 온라인 상담 예약
   - 실시간 세무 Q&A

4. **자료 관리**
   - 세무 서류 디지털 보관
   - 영수증 OCR 스캔
   - 지출 카테고리 자동 분류

### 접근성 (Accessibility)

#### 구조적 접근성
- **적절한 헤딩 구조**: h1 → h3 계층 구조
- **의미론적 마크업**: Card 컴포넌트의 시맨틱 구조
- **아이콘 대체 텍스트**: 아이콘과 함께 명확한 텍스트 제공

#### 시각적 접근성
- **적절한 대비**: muted 색상으로 가독성 확보
- **일관된 간격**: 시스템화된 spacing 사용
- **명확한 정보 구조**: 카드와 섹션으로 정보 구분

### 성능 최적화

#### 서버 컴포넌트 활용
- **정적 콘텐츠**: 모든 텍스트가 빌드 타임에 결정
- **최소 JavaScript**: 상호작용이 없는 정보 페이지
- **빠른 로딩**: 이미지 없는 아이콘 기반 디자인

#### 번들 최적화
- **Tree Shaking**: 사용된 아이콘만 번들에 포함
- **CSS 최적화**: Tailwind의 unused CSS 제거

## 🔗 관련 문서

- [`../../config/brand.ts`](../../config/brand.ts) - 중앙화된 텍스트 시스템
- [`../../config/constants.ts`](../../config/constants.ts) - 레이아웃 및 타이포그래피 상수
- [`../../components/layout/AppLayout.tsx`](../../components/layout/AppLayout.tsx) - 공통 앱 레이아웃
- [`../clients/claude.md`](../clients/claude.md) - 유사한 비즈니스 페이지 구조

---

**이 세무 관리 서비스는 향후 전문적인 세무 솔루션으로 발전할 예정이며, 현재는 서비스 비전과 계획을 명확히 제시하는 랜딩 페이지 역할을 수행합니다.**