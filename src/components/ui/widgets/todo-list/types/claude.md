# src/components/ui/widgets/todo-list/types - 할 일 타입

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~32: 파일 라인 맵
- 33~35: 중앙화·모듈화·캡슐화
- 36~39: 작업 규칙
- 40~44: 관련 문서

## 디렉토리 목적
할 일 위젯에 필요한 TypeScript 타입과 인터페이스를 정의합니다.

## 핵심 책임
- 태스크·섹션·통계 타입 정의
- API/스토리지 변환을 위한 타입 도우미 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- index.ts 03~04 export TodoPriority - TodoList 위젯 타입 정의
- index.ts 05~06 export ViewMode
- index.ts 07~22 export TodoTask
- index.ts 23~30 export TodoSection
- index.ts 31~43 export DateGroup
- index.ts 44~54 export TodoListWidgetProps
- index.ts 55~57 export DateFormatType - 날짜 표기 형식
- index.ts 58~60 export SubtaskDisplayMode - 하위 태스크 표시 설정
- index.ts 61~64 export TodoListOptions - 옵션 설정 인터페이스

## 중앙화·모듈화·캡슐화
- 위젯 전용 타입은 이 디렉터리에 모아 유지

## 작업 규칙
- 데이터 구조 변경 시 서비스·훅·컴포넌트를 동시에 업데이트
- 타입 변경 후 `npm run type-check`로 검증

## 관련 문서
- src/components/ui/widgets/todo-list/claude.md
- src/lib/storage/services/claude.md
- src/types/claude.md
