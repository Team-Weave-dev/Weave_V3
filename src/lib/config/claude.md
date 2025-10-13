# src/lib/config - 서비스 설정

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~17: 핵심 책임
- 18~20: 구조 요약
- 21~30: 파일 라인 맵
- 31~33: 중앙화·모듈화·캡슐화
- 34~36: 작업 규칙
- 37~41: 관련 문서

## 디렉토리 목적
라이브러리 계층에서 사용하는 도메인별 설정과 매핑을 정의합니다.

## 핵심 책임
- project-columns 등 도메인 구성 유지

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- project-columns.ts 09~22 export EnhancedProjectTableColumn - 개요 탭 표시를 위한 확장 인터페이스
- project-columns.ts 023~190 export PROJECT_COLUMNS - 프로젝트 테이블 칼럼 메타데이터 리스트뷰와 개요 탭에서 공통으로 사용하는 칼럼 정의
- project-columns.ts 191~200 export OVERVIEW_SECTIONS - 섹션별 칼럼 그룹핑
- project-columns.ts 201~207 export OVERVIEW_COLUMNS - 개요에 표시할 칼럼 필터링
- project-columns.ts 208~214 export getColumnConfig - 칼럼 메타데이터 조회 함수
- project-columns.ts 215~223 export getColumnsBySection - 섹션별 칼럼 조회 함수
- project-columns.ts 224~237 export createOverviewData - 개요 표시용 칼럼 데이터 생성
- project-columns.ts 238~285 export formatColumnValue - 칼럼 값 포맷팅 함수

## 중앙화·모듈화·캡슐화
- 설정 값은 lib/config에서 관리하고 외부에서 재정의하지 않음

## 작업 규칙
- 설정 변경 시 UI와 서비스가 일치하는지 확인

## 관련 문서
- src/lib/claude.md
- src/app/projects/claude.md
- src/config/claude.md
