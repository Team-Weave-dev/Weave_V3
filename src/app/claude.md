# src/app - App Router 페이지

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~32: 구조 요약
- 33~38: 파일 라인 맵
- 39~42: 중앙화·모듈화·캡슐화
- 43~46: 작업 규칙
- 47~51: 관련 문서

## 디렉토리 목적
Next.js 15 App Router 기반 페이지와 레이아웃을 관리합니다.
인증, 대시보드, 프로젝트 등 핵심 UX 흐름을 구성합니다.

## 핵심 책임
- 고정 페이지(홈, 로그인, 설정 등)를 렌더링
- 프로젝트·클라이언트 관리용 마스터-디테일 뷰를 제공
- API 라우트와 연계되어 데이터 흐름을 제어

## 구조 요약
- api/: 서버 기능 라우트 (→ src/app/api/claude.md)
- auth/: OAuth 보조 페이지 (→ src/app/auth/claude.md)
- clients/: 클라이언트 관리 페이지 (→ src/app/clients/claude.md)
- components/: 컴포넌트 데모 페이지 (→ src/app/components/claude.md)
- dashboard/: 비즈니스 대시보드 (→ src/app/dashboard/claude.md)
- login/: 로그인 페이지 (→ src/app/login/claude.md)
- projects/: 프로젝트 관리 (→ src/app/projects/claude.md)
- settings/: 사용자 설정 (→ src/app/settings/claude.md)
- signup/: 회원가입 페이지 (→ src/app/signup/claude.md)
- tax-management/: 세무 일정 관리 (→ src/app/tax-management/claude.md)

## 파일 라인 맵
- layout.tsx 07~16 export metadata
- layout.tsx 17~33 export RootLayout
- loading.tsx 09~11 export Loading - 루트 로딩 상태 Next.js App Router가 자동으로 사용하는 로딩 UI입니다. 페이지 전환 시 서버 컴포넌트가 로딩되는 동안 표시됩니다.
- page.tsx 033~282 export Home

## 중앙화·모듈화·캡슐화
- 텍스트와 라벨은 `@/config/brand.ts`에서 로드
- 공통 UI는 `@/components` 계층에서 재사용

## 작업 규칙
- 새 페이지 추가 시 라우팅 구조와 관련 문서를 업데이트
- Server/Client 컴포넌트 사용 여부를 명확히 지정

## 관련 문서
- src/claude.md
- src/lib/supabase/claude.md
- src/components/claude.md
