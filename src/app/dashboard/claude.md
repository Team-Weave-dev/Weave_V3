# src/app/dashboard - 비즈니스 대시보드

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~28: 파일 라인 맵
- 29~31: 중앙화·모듈화·캡슐화
- 32~35: 작업 규칙
- 36~40: 관련 문서

## 디렉토리 목적
주요 지표, 일정, 할 일 등 업무 위젯을 한 화면에서 제공합니다.
통합 캘린더와 스토리지 데이터를 조합합니다.

## 핵심 책임
- 카드·차트·테이블 기반 위젯을 배치
- 캘린더·투두 위젯과 데이터를 연동
- 중앙화된 텍스트와 레이아웃 상수를 적용

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- layout.tsx 03~09 export DashboardLayout
- loading.tsx 07~09 export Loading - 대시보드 페이지 로딩 상태
- page.tsx 020~364 export DashboardPage

## 중앙화·모듈화·캡슐화
- 위젯 라벨은 brand 설정을 사용하고 데이터는 lib 계층에서 주입

## 작업 규칙
- 위젯 추가 시 컴포넌트·서비스 문서를 업데이트
- 레이아웃 변경 후 반응형·접근성을 검증

## 관련 문서
- src/components/dashboard/claude.md
- src/lib/calendar-integration/claude.md
- src/lib/storage/claude.md
