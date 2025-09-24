# app/ - Next.js App Router 페이지 시스템

## 🌐 App Router 개요

이 디렉토리는 Next.js 15의 App Router를 사용하여 애플리케이션의 모든 페이지와 레이아웃을 관리합니다. **Server Components**와 **Client Components**를 적절히 조합하여 최적의 성능을 제공합니다.

## 📁 페이지 구조

```
app/
├── layout.tsx          # 🏗️ 루트 레이아웃 (모든 페이지 공통)
├── page.tsx            # 🏠 홈 페이지 (/)
├── globals.css         # 🎨 전역 스타일
└── components/         # 🧩 컴포넌트 데모 섹션
    └── page.tsx        # 📄 컴포넌트 데모 페이지 (/components)
```

## 🏗️ layout.tsx - 루트 레이아웃

### 역할 및 책임
- **전역 HTML 구조**: `<html>`, `<body>` 요소 정의
- **메타데이터 관리**: SEO, 소셜 미디어 최적화
- **폰트 로딩**: Inter 폰트 최적화 로딩
- **전역 설정**: 중앙화된 브랜드 정보 적용

### 핵심 구현
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { brand } from '@/config/brand'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: brand.metadata.title.ko,
  description: brand.metadata.description.ko,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### 특징
- **Server Component**: 서버에서 렌더링되어 초기 로딩 최적화
- **중앙화 메타데이터**: `@/config/brand.ts`에서 모든 정보 가져옴
- **타입 안정성**: Metadata 타입으로 완전한 타입 안정성 보장

## 🏠 page.tsx - 홈 페이지

### 역할 및 책임
- **브랜드 소개**: 프로젝트의 주요 가치 제안 전달
- **CTA 버튼**: 컴포넌트 페이지로의 내비게이션
- **반응형 디자인**: 모든 디바이스에서 최적화된 레이아웃

### 핵심 구현
```typescript
import { brand, getBrandName, getDescription, getLogoAlt, getExtendedDescription, getButtonText, routes } from '@/config/brand'
import { layout, typography } from '@/config/constants'

export default function Home() {
  return (
    <div className="container relative">
      <section className={`mx-auto flex flex-col items-center gap-2`} style={{maxWidth: layout.container.maxWidth, padding: layout.spacing.section.lg}}>
        <div className="flex items-center justify-center gap-4 mb-2">
          <img
            src={brand.logo.favicon}
            alt={getLogoAlt('ko')}
            className={`${layout.heights.logoMedium} md:${layout.heights.logoLarge}`}
          />
          <h1 className={`text-center ${typography.title.hero}`}>
            {getBrandName('ko')}
          </h1>
        </div>
        <span className={`text-center ${typography.text.body}`} style={{maxWidth: layout.container.textMaxWidth}}>
          {getDescription('ko')}
          {getExtendedDescription('ko')}
        </span>
        <div className="flex w-full items-center justify-center py-4 md:pb-10">
          <a
            href={routes.components}
            className={`inline-flex ${layout.heights.button} items-center justify-center rounded-md bg-primary px-8 ${typography.text.button} text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50`}
          >
            {getButtonText.viewComponents('ko')}
          </a>
        </div>
      </section>
    </div>
  )
}
```

### 특징
- **완전 중앙화**: 모든 텍스트와 상수가 config에서 관리됨
- **반응형 레이아웃**: `layout.container.*` 상수로 일관된 크기 관리
- **접근성 최적화**: 적절한 의미론적 HTML 구조

## 🧩 components/page.tsx - 컴포넌트 데모 페이지

### 역할 및 책임
- **컴포넌트 쇼케이스**: 모든 shadcn/ui 컴포넌트의 실제 사용 예시
- **상호작용 데모**: 사용자가 직접 컴포넌트와 상호작용 가능
- **디자인 시스템 검증**: 일관된 디자인 시스템 적용 확인

### 주요 섹션
1. **네비게이션 헤더**: 브랜드 정보 및 메뉴
2. **사이드바**: 프로젝트 네비게이션 및 진행률
3. **메인 콘텐츠**: 탭 기반 컴포넌트 분류
   - **컴포넌트**: 기본 UI 요소들
   - **폼**: 입력 및 폼 관련 컴포넌트
   - **데이터**: 테이블, 리스트 등 데이터 표시
   - **레이아웃**: 히어로, 푸터 등 레이아웃 컴포넌트

### 기술적 특징
```typescript
"use client"  // Client Component로 상호작용 지원

import { useState } from "react"
import { useForm } from "react-hook-form"
// ... 모든 UI 컴포넌트 import
import { brand, getBrandName, getLogoAlt, getNavText, getNotificationText, getBadgeText } from "@/config/brand"
import { defaults, layout } from "@/config/constants"
```

### 중앙화 적용 예시
```typescript
// 하드코딩 제거된 상태 관리
const [progressValue, setProgressValue] = useState(defaults.progress.initialValue)

// 중앙화된 토스트 메시지
const handleToastClick = () => {
  toast({
    title: getNotificationText.title('ko'),
    description: getNotificationText.systemSuccess('ko'),
  })
}

// 중앙화된 네비게이션 텍스트
<Link href={routes.home}>
  {getNavText.home('ko')}
</Link>
```

## 🎨 globals.css - 전역 스타일

### 주요 기능
- **Tailwind CSS 기반**: `@tailwind` 지시어로 유틸리티 클래스 로딩
- **CSS 변수 시스템**: 라이트/다크 테마 지원
- **커스텀 스타일**: 특정 컴포넌트의 포커스 링 제거 등

### 핵심 구조
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 라이트 테마 CSS 변수 */
    --background: 0 0% 100%;
    --primary: 175.748 55.9471% 55.4902%;
    /* ... */
  }

  .dark {
    /* 다크 테마 CSS 변수 */
    --background: 240 1.9608% 10%;
    --primary: 0 0% 89.8039%;
    /* ... */
  }

  /* 네비게이션 메뉴 포커스 링 제거 */
  nav a:focus {
    outline: none !important;
    box-shadow: none !important;
  }
}
```

## 🚦 라우팅 및 내비게이션

### 페이지 라우팅
- **홈 페이지**: `/` → `page.tsx`
- **컴포넌트 데모**: `/components` → `components/page.tsx`
- **프로젝트 관리**: `/projects` → `projects/page.tsx`
  - **ListView**: 테이블 형태 프로젝트 목록 (AdvancedTable 내장 페이지네이션)
  - **DetailView**: 카드 형태 프로젝트 목록 + 상세 패널 (좌측 목록에 커스텀 페이지네이션)
  - **프로젝트 상세**: `/projects/[id]` → `projects/[id]/page.tsx`

### 내비게이션 패턴
```typescript
// 중앙화된 라우트 관리
import { routes } from '@/config/brand'

<a href={routes.components}>  // "/components"
<a href={routes.home}>        // "/"
```

## 📏 페이지 여백 규칙 (New)

- 모든 페이지의 루트 래퍼는 `layout.page.container`와 `layout.page.padding.default` 조합을 사용해 프로젝트 페이지와 동일한 여백을 유지한다.
- 섹션 간 수직 간격은 `layout.page.section.stack`, 그리드 기반 배치는 `layout.page.section.gridGap`을 활용한다.
- 헤더/액션 영역 배치는 `layout.page.header.block`, `layout.page.header.actions`, `layout.page.header.titleWithControls`로 통일한다.
- 상황에 따라 컴팩트/릴랙스 레이아웃이 필요하면 `layout.page.padding.compact` 또는 `layout.page.padding.relaxed`를 선택한다.

## 📱 반응형 디자인

### 브레이크포인트 활용
```typescript
// constants.ts에서 정의된 브레이크포인트 사용
className={`${layout.heights.logoMedium} md:${layout.heights.logoLarge}`}

// 반응형 타이포그래피
className={typography.title.hero}  // "text-3xl ... md:text-6xl"
```

### 모바일 우선 접근법
- **Mobile First**: 작은 화면부터 시작하여 점진적 개선
- **터치 친화적**: 충분한 터치 타겟 크기 (44px 이상)
- **성능 최적화**: 이미지 lazy loading, 폰트 최적화

## 🔄 자동 업데이트 감지

이 디렉토리의 파일이 변경되면 다음 항목들이 업데이트되어야 합니다:

- **메인 CLAUDE.md**: 새로운 페이지 추가 시 구조 업데이트
- **사이트맵**: SEO를 위한 자동 사이트맵 생성
- **메타데이터**: 새로운 페이지의 메타데이터 설정

## 📊 성능 메트릭

### Core Web Vitals 목표
- **LCP** (Largest Contentful Paint): < 2.5초
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### 번들 크기
- **홈 페이지**: < 120KB
- **컴포넌트 페이지**: < 190KB (많은 컴포넌트 포함)

---

**이 페이지 시스템은 Next.js App Router의 모든 장점을 활용하여 최적의 사용자 경험을 제공합니다.**
