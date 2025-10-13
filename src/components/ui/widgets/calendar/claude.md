# src/components/ui/widgets/calendar - 통합 캘린더 위젯

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~26: 구조 요약
- 27~37: 파일 라인 맵
- 38~40: 중앙화·모듈화·캡슐화
- 41~44: 작업 규칙
- 45~49: 관련 문서

## 디렉토리 목적
월·주·일·Agenda 뷰를 제공하는 통합 캘린더 위젯을 구성합니다.
이벤트 생성, 설정, 동기화를 담당합니다.

## 핵심 책임
- 다양한 뷰 컴포넌트 제공
- 이벤트 상세/생성 모달과 설정 모달 관리
- 캘린더 이벤트 훅과 서비스 연동

## 구조 요약
- components/: 캘린더 UI 구성 요소 (→ src/components/ui/widgets/calendar/components/claude.md)
- hooks/: 캘린더 상태 훅 (→ src/components/ui/widgets/calendar/hooks/claude.md)
- services/: 외부 서비스 연동 (→ src/components/ui/widgets/calendar/services/claude.md)
- views/: 뷰 컴포넌트 (→ src/components/ui/widgets/calendar/views/claude.md)

## 파일 라인 맵
- types.ts 04~49 export eventTypeConfig - Event type configuration
- types.ts 50~57 export viewModes - View modes configuration
- types.ts 58~72 export CalendarSettings - Calendar settings interface
- types.ts 73~79 export GoogleCalendarConfig - Google Calendar integration types
- types.ts 080~103 export GoogleCalendarEvent
- types.ts 104~110 export MiniEventProps - Props interfaces for subcomponents
- types.ts 111~118 export EventDetailModalProps
- types.ts 119~131 export CalendarViewProps
- types.ts 132~132 export ViewMode

## 중앙화·모듈화·캡슐화
- 날짜 포맷과 텍스트는 brand 및 config 상수를 사용

## 작업 규칙
- 새 기능 추가 시 해당 디렉터리와 구조 요약을 갱신
- 데이터 업데이트 로직 변경 시 calendar-integration 문서를 동기화

## 관련 문서
- src/components/ui/widgets/claude.md
- src/lib/calendar-integration/claude.md
- src/app/dashboard/claude.md
