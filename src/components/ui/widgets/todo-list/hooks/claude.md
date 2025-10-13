# src/components/ui/widgets/todo-list/hooks - 할 일 훅

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~26: 파일 라인 맵
- 27~29: 중앙화·모듈화·캡슐화
- 30~33: 작업 규칙
- 34~38: 관련 문서

## 디렉토리 목적
할 일 위젯 상태 관리, 데이터 동기화, 통계 계산을 담당하는 훅을 제공합니다.

## 핵심 책임
- 태스크 로딩과 상태 업데이트
- 통계 계산과 배치 업데이트 로직

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- useDragAndDrop.ts 022~141 export useDragAndDrop
- useLocalStorage.ts 003~106 export useLocalStorage
- useTodoState.ts 103~774 export useTodoState

## 중앙화·모듈화·캡슐화
- 상수와 타입은 constants/ 및 types/에서 가져옴

## 작업 규칙
- 서비스 API 변경 시 반환 타입과 오류 처리 로직을 업데이트
- 메모이제이션과 구독 해제가 올바르게 적용되었는지 확인

## 관련 문서
- src/components/ui/widgets/todo-list/claude.md
- src/lib/storage/services/claude.md
- src/components/ui/widgets/todo-list/types/claude.md
