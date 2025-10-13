# src/components/ui/widgets/calendar/hooks - 캘린더 훅

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~25: 파일 라인 맵
- 26~28: 중앙화·모듈화·캡슐화
- 29~32: 작업 규칙
- 33~37: 관련 문서

## 디렉토리 목적
캘린더 위젯이 사용하는 상태 관리와 데이터 동기화 훅을 제공합니다.

## 핵심 책임
- useCalendarEvents, useCalendarSettings 등 이벤트·설정 노출
- 통합 캘린더 매니저 및 Storage 이벤트 구독

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- useCalendarEvents.ts 015~166 export useCalendarEvents - useCalendarEvents Hook 캘린더 이벤트 관리를 위한 커스텀 훅
- useCalendarSettings.ts 20~82 export useCalendarSettings - useCalendarSettings Hook 캘린더 설정 관리를 위한 커스텀 훅

## 중앙화·모듈화·캡슐화
- 필터 키와 기본 설정은 config 상수를 사용

## 작업 규칙
- 이벤트 소스 변경 시 calendar-integration과 동기화
- 훅 반환 값이 변하면 뷰·컴포넌트와 타입을 업데이트

## 관련 문서
- src/components/ui/widgets/calendar/claude.md
- src/lib/calendar-integration/claude.md
- src/app/dashboard/claude.md
