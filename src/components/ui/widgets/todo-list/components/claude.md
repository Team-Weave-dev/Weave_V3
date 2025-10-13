# src/components/ui/widgets/todo-list/components - 할 일 컴포넌트

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~28: 파일 라인 맵
- 29~31: 중앙화·모듈화·캡슐화
- 32~35: 작업 규칙
- 36~39: 관련 문서

## 디렉토리 목적
할 일 목록, 항목, 헤더, 통계 카드 등 UI 컴포넌트를 제공합니다.

## 핵심 책임
- 태스크 아이템 렌더링과 액션 메뉴 제공
- 섹션 헤더와 통계 요약 구성

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- AddTaskInput.tsx 036~206 export AddTaskInput
- TodoDateGroup.tsx 25~96 export TodoDateGroup
- TodoOptionsModal.tsx 016~103 export TodoOptionsModal
- TodoSection.tsx 037~180 export TodoSection
- TodoTask.tsx 047~350 export TodoTask

## 중앙화·모듈화·캡슐화
- 라벨과 상태 텍스트는 brand 설정을 사용

## 작업 규칙
- 컴포넌트 추가 시 훅과 타입, 상수를 검토
- 스타일 변경 후 접근성과 반응형 동작을 확인

## 관련 문서
- src/components/ui/widgets/todo-list/claude.md
- src/components/ui/widgets/todo-list/hooks/claude.md
