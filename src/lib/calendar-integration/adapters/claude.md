# src/lib/calendar-integration/adapters - 캘린더 어댑터

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~30: 파일 라인 맵
- 31~33: 중앙화·모듈화·캡슐화
- 34~37: 작업 규칙
- 38~43: 관련 문서

## 디렉토리 목적
다양한 데이터 소스를 통합 캘린더 포맷으로 변환합니다.

## 핵심 책임
- 캘린더·세무·투두 데이터를 통합 이벤트로 매핑
- 저장소·API 응답을 통일된 구조로 변환

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- calendar-adapter.ts 136~211 export CalendarDataAdapter - CalendarEvent를 UnifiedCalendarItem으로 변환하는 어댑터
- calendar-adapter.ts 212~212 export calendarAdapter - 싱글톤 인스턴스
- tax-adapter.ts 165~241 export TaxDataAdapter - TaxDeadline을 UnifiedCalendarItem으로 변환하는 어댑터
- tax-adapter.ts 242~242 export taxAdapter - 싱글톤 인스턴스
- tax-schedule-adapter.ts 158~158 export taxScheduleAdapter - 싱글톤 인스턴스
- todo-adapter.ts 111~219 export TodoDataAdapter - TodoTask를 UnifiedCalendarItem으로 변환하는 어댑터
- todo-adapter.ts 220~220 export todoAdapter - 싱글톤 인스턴스

## 중앙화·모듈화·캡슐화
- 필드 이름과 매핑 규칙은 types와 상수를 기준으로 유지

## 작업 규칙
- 엔티티 구조 변경 시 어댑터와 타입 정의를 업데이트
- 새 도메인을 추가하면 어댑터 파일과 테스트를 작성

## 관련 문서
- src/lib/calendar-integration/claude.md
- src/lib/calendar-integration/data-sources/claude.md
- src/components/ui/widgets/calendar/claude.md
- src/types/claude.md
