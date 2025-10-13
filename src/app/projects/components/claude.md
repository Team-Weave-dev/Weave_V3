# src/app/projects/components - 페이지 전용 컴포넌트

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~25: 구조 요약
- 26~28: 파일 라인 맵
- 29~31: 중앙화·모듈화·캡슐화
- 32~35: 작업 규칙
- 36~40: 관련 문서

## 디렉토리 목적
프로젝트 페이지에 특화된 상위 컴포넌트를 모읍니다.
리스트, 헤더, 모달을 통해 사용자 흐름을 제어합니다.

## 핵심 책임
- ProjectsView 레이아웃 컨테이너 유지
- ProjectHeader 필터와 액션 제공
- ProjectCreateModal 생성 플로우 처리

## 구조 요약
- ProjectCreateModal/: 생성 모달 (→ src/app/projects/components/ProjectCreateModal/claude.md)
- ProjectHeader/: 헤더 컴포넌트 (→ src/app/projects/components/ProjectHeader/claude.md)
- ProjectsView/: 마스터-디테일 컨테이너 (→ src/app/projects/components/ProjectsView/claude.md)

## 파일 라인 맵
- 추적 가능한 파일이 없습니다.

## 중앙화·모듈화·캡슐화
- 라벨과 옵션은 brand 설정, 데이터 타입은 lib/types 사용

## 작업 규칙
- 컴포넌트 책임이 바뀌면 상위·하위 문서를 동기화
- 데이터 구조 변경 시 storage 서비스와 타입을 업데이트

## 관련 문서
- src/app/projects/claude.md
- src/components/projects/claude.md
- src/lib/storage/services/claude.md
