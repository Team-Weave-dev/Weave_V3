# src/components/ui/widgets/todo-list/constants - 할 일 상수

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~33: 파일 라인 맵
- 34~36: 중앙화·모듈화·캡슐화
- 37~40: 작업 규칙
- 41~45: 관련 문서

## 디렉토리 목적
할 일 위젯에서 사용하는 상태, 필터, 컬러, 텍스트 상수를 정의합니다.

## 핵심 책임
- 상태 라벨, 아이콘 매핑, 색상 팔레트 유지
- 기본 섹션과 우선순위 설정 관리

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- index.ts 06~13 export priorityColors - 우선순위 색상 매핑
- index.ts 14~14 export STORAGE_KEY - 로컬 스토리지 키
- index.ts 15~15 export SECTIONS_KEY
- index.ts 16~16 export VIEW_MODE_KEY
- index.ts 17~19 export OPTIONS_KEY
- index.ts 20~22 export DEFAULT_PRIORITY - 기본 우선순위
- index.ts 23~25 export DEFAULT_SIZE - 기본 크기
- index.ts 26~31 export DEFAULT_OPTIONS - 기본 옵션 설정
- index.ts 32~82 export getDateGroups - 날짜 그룹 생성 함수
- mock-data.ts 005~590 export generateInitialData - 초기 목데이터 생성 함수 (Phase 5 테스트를 위해 임시로 비활성화)

## 중앙화·모듈화·캡슐화
- 텍스트는 brand 설정과 동기화하고 상수는 이 디렉터리에만 존재

## 작업 규칙
- 상태·색상 정책 변경 시 UI·문서·서비스를 업데이트
- 상수 추가 시 타입과 훅 반환값을 검토

## 관련 문서
- src/components/ui/widgets/todo-list/claude.md
- src/components/ui/widgets/todo-list/hooks/claude.md
- src/config/brand.ts
