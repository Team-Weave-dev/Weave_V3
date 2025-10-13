# src - 소스 코드 아키텍처

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~28: 구조 요약
- 29~31: 파일 라인 맵
- 32~35: 중앙화·모듈화·캡슐화
- 36~39: 작업 규칙
- 40~42: 관련 문서

## 디렉토리 목적
애플리케이션 실행 코드를 담당하는 루트 디렉터리입니다.
도메인 분리와 중앙화 규칙을 통해 유지보수 가능한 구조를 제공합니다.

## 핵심 책임
- App Router 페이지, 컴포넌트, 서비스 계층을 관리
- 타입·훅·컨텍스트를 통해 모듈 간 계약을 정의

## 구조 요약
- app/: Next.js 페이지 및 라우트 (→ src/app/claude.md)
- components/: 재사용 UI와 위젯 (→ src/components/claude.md)
- config/: 중앙화 설정 (→ src/config/claude.md)
- contexts/: 공유 상태 공급자 (→ src/contexts/claude.md)
- hooks/: 공용 React 훅 (→ src/hooks/claude.md)
- lib/: 서비스와 유틸리티 (→ src/lib/claude.md)
- types/: 전역 타입 정의 (→ src/types/claude.md)

## 파일 라인 맵
- middleware.ts 08~20 export config

## 중앙화·모듈화·캡슐화
- 절대 경로 `@/`를 사용해 의존성 경로를 명확히 유지
- 브랜드·상수는 config 디렉터리에서만 정의

## 작업 규칙
- 새 도메인을 추가하면 구조 요약과 관련 문서를 갱신
- 컨벤션 변경 시 config 및 하위 claude.md를 함께 수정

## 관련 문서
- claude.md
