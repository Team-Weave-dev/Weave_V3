# src/components - 재사용 UI 시스템

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~26: 구조 요약
- 27~29: 파일 라인 맵
- 30~32: 중앙화·모듈화·캡슐화
- 33~36: 작업 규칙
- 37~41: 관련 문서

## 디렉토리 목적
shadcn/ui 기반 컴포넌트와 맞춤형 위젯을 모아 재사용 가능한 UI 계층을 제공합니다.
레이아웃, 대시보드, 프로젝트 전문 컴포넌트를 모듈화합니다.

## 핵심 책임
- 기본 UI 프리미티브 제공
- 대시보드·프로젝트 등 도메인 특화 컴포넌트 관리
- 디자인 시스템과 접근성 규칙 집행

## 구조 요약
- dashboard/: 대시보드 위젯 (→ src/components/dashboard/claude.md)
- layout/: 전역 레이아웃 컴포넌트 (→ src/components/layout/claude.md)
- projects/: 프로젝트 도메인 컴포넌트 (→ src/components/projects/claude.md)
- ui/: shadcn/ui 확장 컴포넌트 (→ src/components/ui/claude.md)

## 파일 라인 맵
- StorageInitializer.tsx 15~87 export StorageInitializer - Storage 시스템 초기화 컴포넌트 앱 시작 시 자동으로 Storage 시스템을 초기화합니다: - 인증 상태 확인 (Supabase Auth 완전히 로드될 때까지 대기) - LocalStorage 전용 또는 Supabase 모드 선택 - 자동 마이그레이션 실행 (필요 시)

## 중앙화·모듈화·캡슐화
- 텍스트, 색상, 크기는 config 설정을 사용해 일관성 유지

## 작업 규칙
- 새 컴포넌트를 추가하면 props 타입과 접근성 준수를 문서화
- 구조 변경 시 사용하는 페이지가 깨지지 않는지 점검

## 관련 문서
- src/claude.md
- src/app/claude.md
- src/config/brand.ts
