# src/components/ui/widgets/todo-list/utils - 할 일 유틸리티

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~38: 파일 라인 맵
- 39~41: 중앙화·모듈화·캡슐화
- 42~45: 작업 규칙
- 46~50: 관련 문서

## 디렉토리 목적
할 일 위젯에서 사용하는 데이터 변환, 정렬, 통계 계산 유틸리티를 제공합니다.

## 핵심 책임
- 태스크 필터링·그룹핑·진행률 계산
- 날짜 변환과 상태 정렬 헬퍼 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- date.ts 05~10 export startOfDay - 날짜 관련 유틸리티 함수
- date.ts 11~16 export endOfDay
- date.ts 17~22 export addDays
- date.ts 23~28 export isSameDay
- date.ts 29~96 export formatDateBadge
- date.ts 097~149 export getDateGroups
- date.ts 150~156 export quickDateOptions - 빠른 날짜 선택 옵션
- migration.ts 012~123 export migrateTodoStorage - 기존 데이터를 새로운 통합 구조로 마이그레이션 @returns 마이그레이션된 sections (tasks 포함) 또는 null (마이그레이션 불필요)
- migration.ts 124~132 export needsMigration - 마이그레이션이 필요한지 확인
- migration.ts 133~149 export restoreDateFields - Date 객체 복원 헬퍼 localStorage에서 읽은 데이터의 Date 필드를 실제 Date 객체로 변환
- storage-debug.ts 12~81 export debugLocalStorageState - localStorage의 모든 데이터를 로그로 출력하여 상태 확인
- storage-debug.ts 082~198 export clearStaleTodoData - 오래된/잘못된 데이터 구조를 감지하고 정리
- storage-debug.ts 199~222 export resetAllTodoData - 강제로 모든 투두 데이터를 초기화 (핵옵션)
- storage-debug.ts 223~287 export debugTodoData - 투두 데이터 상태 확인
- storage-debug.ts 288~317 export fixTodoCacheIssues - 캐시 문제 해결을 위한 원스톱 함수

## 중앙화·모듈화·캡슐화
- 기준 값과 라벨은 constants/와 config에서 가져옴

## 작업 규칙
- 유틸 변경 시 사용하는 훅과 컴포넌트 동작을 검증
- 복잡한 계산은 테스트 또는 예시 시나리오를 문서화

## 관련 문서
- src/components/ui/widgets/todo-list/claude.md
- src/components/ui/widgets/todo-list/hooks/claude.md
- src/lib/storage/services/claude.md
