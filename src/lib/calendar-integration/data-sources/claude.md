# src/lib/calendar-integration/data-sources - 데이터 소스

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~25: 파일 라인 맵
- 26~28: 중앙화·모듈화·캡슐화
- 29~32: 작업 규칙
- 33~37: 관련 문서

## 디렉토리 목적
통합 캘린더가 사용하는 데이터 소스 의존성을 정의합니다.

## 핵심 책임
- LocalStorageDataSource로 이벤트·세무·태스크 데이터를 로딩
- 확장을 위한 인터페이스 기반 구조 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- LocalStorageDataSource.ts 036~257 export LocalStorageDataSource - Storage API 기반 데이터 소스 ImprovedDashboard의 위젯 데이터를 통합 캘린더로 제공
- LocalStorageDataSource.ts 258~258 export localStorageDataSource - 싱글톤 인스턴스

## 중앙화·모듈화·캡슐화
- 스토리지 키와 구조는 src/lib/storage 정의를 사용

## 작업 규칙
- 스토리지 구조 변경 시 데이터 소스와 문서를 업데이트
- 새 소스를 추가하면 인증·오류 처리 전략을 정의

## 관련 문서
- src/lib/calendar-integration/claude.md
- src/lib/storage/claude.md
- src/components/ui/widgets/calendar/claude.md
