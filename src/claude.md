# src/ - 소스 코드 전체 아키텍처

## 🚨 CRITICAL: 이 파일은 소스 코드 작업 시 필수 참조

**이 문서를 읽지 않고 src/ 디렉토리에서 작업하면 아키텍처가 깨집니다.**

### ⚡ 작업 전 필수 확인
1. ✅ 루트 CLAUDE.md를 읽었는가?
2. ✅ 이 파일(src/claude.md)을 완전히 읽었는가?
3. ✅ 작업할 도메인의 하위 claude.md를 읽었는가?
4. ✅ config/brand.ts와 constants.ts를 확인했는가?

## 📁 소스 코드 구조 개요

이 디렉토리는 프로젝트의 모든 소스 코드를 포함하며, 도메인별로 명확히 분리된 아키텍처를 따릅니다.

### 🏗️ 아키텍처 원칙

1. **도메인 기반 분리**: 각 기능 영역별로 독립적인 디렉토리 구성
2. **중앙화된 설정**: `config/` 디렉토리를 통한 모든 설정 관리
3. **재사용 가능성**: 컴포넌트와 유틸리티의 최대 재사용
4. **타입 안정성**: 모든 코드에서 TypeScript 엄격 모드 적용

### 📂 디렉토리별 역할

```
src/
├── app/           # 📱 Next.js App Router (페이지, 레이아웃)
├── config/        # ⚙️ 중앙화된 설정 (브랜드, 상수)
├── components/    # 🧩 재사용 가능한 컴포넌트
├── hooks/         # 🪝 커스텀 React 훅
└── lib/           # 📚 유틸리티 함수 및 공통 로직
```

## 🔧 기술 스택 및 의존성

### 핵심 기술
- **Next.js 15**: App Router, Server Components
- **TypeScript**: 타입 안정성 및 개발자 경험
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **shadcn/ui**: 접근성 중심 컴포넌트 라이브러리

### 아키텍처 패턴
- **컴포지션 패턴**: 작은 컴포넌트들을 조합하여 복잡한 UI 구성
- **중앙화 패턴**: 설정, 상수, 텍스트의 단일 진실 공급원
- **타입 우선**: TypeScript를 활용한 컴파일 타임 안정성

## 📋 개발 가이드라인

### 파일 명명 규칙
- **컴포넌트**: PascalCase (예: `Button.tsx`, `UserProfile.tsx`)
- **훅**: camelCase + use 접두사 (예: `useToast.ts`)
- **유틸리티**: camelCase (예: `formatDate.ts`, `validateEmail.ts`)
- **설정**: kebab-case (예: `brand.ts`, `constants.ts`)

### 임포트 순서
```typescript
// 1. React 및 Next.js
import React from 'react'
import { NextPage } from 'next'

// 2. 외부 라이브러리
import { Button } from '@/components/ui/button'

// 3. 내부 컴포넌트
import { UserCard } from '@/components/UserCard'

// 4. 설정 및 상수
import { brand } from '@/config/brand'
import { layout } from '@/config/constants'

// 5. 유틸리티 및 훅
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// 6. 타입 정의 (마지막)
import type { User } from '@/types/user'
```

### 🚨 필수 준수 사항

1. **하드코딩 절대 금지**
   - 모든 텍스트: `@/config/brand.ts` 사용
   - 모든 상수: `@/config/constants.ts` 사용

2. **타입 안정성**
   - 모든 Props에 TypeScript 인터페이스 정의
   - `any` 타입 사용 금지

3. **접근성 준수**
   - 모든 UI 컴포넌트에 적절한 ARIA 속성
   - 키보드 내비게이션 지원

## 🔗 디렉토리별 상세 문서

각 하위 디렉토리의 `claude.md`에서 상세한 가이드를 확인하세요:

- [`app/claude.md`](./app/claude.md) - Next.js 페이지 및 라우팅
- [`config/claude.md`](./config/claude.md) - 중앙화 설정 시스템
- [`components/claude.md`](./components/claude.md) - 컴포넌트 라이브러리
- [`hooks/claude.md`](./hooks/claude.md) - 커스텀 훅 라이브러리
- [`lib/claude.md`](./lib/claude.md) - 유틸리티 라이브러리

## 🔀 h2 브랜치 통합 시 자동 처리

### 🚨 CRITICAL: UI 마이그레이션 자동 감지

**h2 브랜치 또는 UI 중앙화 실패 코드 병합 시 자동으로 활성화됩니다.**

#### 자동 감지 및 처리
```bash
# Claude 자동 실행 시퀀스
if (detected: "h2 브랜치" || "하드코딩된 UI") {
  1. npm run migrate:analyze     # 문제 파일 스캔
  2. npm run check:components     # 컴포넌트 설치
  3. 리팩토링 계획 생성
  4. 중앙화 시스템 적용
}
```

#### 마이그레이션 우선순위
1. **네이티브 HTML → shadcn/ui 컴포넌트**
2. **하드코딩 텍스트 → brand.ts**
3. **인라인 스타일 → constants.ts**
4. **로컬 상태 → 중앙화 상태 관리**

#### 자동 변환 패턴
```typescript
// Before (h2 브랜치)
<div className="px-4 py-2 bg-primary text-white">
  송장 관리
</div>

// After (자동 리팩토링)
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getInvoiceText } from '@/config/brand'
import { layout } from '@/config/constants'

<Card className={layout.card}>
  <CardHeader>
    <CardTitle>{getInvoiceText.title('ko')}</CardTitle>
  </CardHeader>
</Card>
```

## 📊 품질 메트릭

### 코드 품질 목표
- **타입 커버리지**: 100% (any 타입 0개)
- **린트 에러**: 0개
- **테스트 커버리지**: 80% 이상 (향후 목표)
- **번들 크기**: 초기 로드 < 200KB

### 성능 목표
- **빌드 시간**: < 10초
- **개발 서버 시작**: < 5초
- **Hot Reload**: < 1초
- **타입 체크**: < 3초

### UI 마이그레이션 메트릭
- **자동 감지율**: 95%
- **컴포넌트 설치**: 100% 자동화
- **텍스트 중앙화**: 80% 자동 제안
- **수동 작업**: 20% 이하

---

**이 아키텍처는 확장 가능하고 유지보수 가능한 React/Next.js 애플리케이션을 위한 최적화된 구조입니다.**