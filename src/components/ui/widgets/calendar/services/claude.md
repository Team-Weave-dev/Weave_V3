# src/components/ui/widgets/calendar/services - 캘린더 서비스

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~25: 파일 라인 맵
- 26~28: 중앙화·모듈화·캡슐화
- 29~32: 작업 규칙
- 33~37: 관련 문서

## 디렉토리 목적
캘린더 위젯과 외부 데이터 소스를 연결하는 서비스 모음을 제공합니다.

## 핵심 책임
- googleCalendarService 등 API 연동 로직 유지
- 이벤트 동기화·삭제·업데이트 헬퍼 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- googleCalendar.ts 008~325 export GoogleCalendarService - Google Calendar Service 구글 캘린더 API와 통합을 위한 서비스
- googleCalendar.ts 326~326 export googleCalendarService - 싱글톤 인스턴스

## 중앙화·모듈화·캡슐화
- API 키와 설정은 환경 변수와 config에서 주입

## 작업 규칙
- API 스키마 변경 시 통합 매니저와 훅·컴포넌트를 업데이트
- 재시도·오류 처리 전략을 문서화

## 관련 문서
- src/components/ui/widgets/calendar/claude.md
- src/lib/calendar-integration/claude.md
- src/lib/storage/claude.md
