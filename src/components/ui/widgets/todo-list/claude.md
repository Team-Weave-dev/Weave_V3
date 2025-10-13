# src/components/ui/widgets/todo-list - 할 일 위젯

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~27: 구조 요약
- 28~30: 파일 라인 맵
- 31~33: 중앙화·모듈화·캡슐화
- 34~37: 작업 규칙
- 38~42: 관련 문서

## 디렉토리 목적
대시보드와 프로젝트 페이지에서 사용하는 할 일 위젯을 제공합니다.
태스크 생성, 상태 변경, 통계를 캡슐화합니다.

## 핵심 책임
- 태스크 목록·섹션·우선순위 관리
- 생성·삭제·완료 처리
- 상태 필터와 통계 표시

## 구조 요약
- components/: 할 일 컴포넌트 (→ src/components/ui/widgets/todo-list/components/claude.md)
- constants/: 위젯 상수 (→ src/components/ui/widgets/todo-list/constants/claude.md)
- hooks/: 상태 훅 (→ src/components/ui/widgets/todo-list/hooks/claude.md)
- types/: 위젯 타입 (→ src/components/ui/widgets/todo-list/types/claude.md)
- utils/: 유틸리티 함수 (→ src/components/ui/widgets/todo-list/utils/claude.md)

## 파일 라인 맵
- 추적 가능한 파일이 없습니다.

## 중앙화·모듈화·캡슐화
- 텍스트와 상태 라벨은 brand 설정과 상수를 사용

## 작업 규칙
- 태스크 구조 변경 시 타입·상수·유틸을 동시에 업데이트
- 서비스 호출 변경 시 storage 서비스 문서를 동기화

## 관련 문서
- src/components/ui/widgets/claude.md
- src/lib/storage/services/claude.md
- src/app/dashboard/claude.md
