# src/app/projects/components/ProjectsView - 뷰 컨테이너

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~28: 파일 라인 맵
- 29~31: 중앙화·모듈화·캡슐화
- 32~35: 작업 규칙
- 36~40: 관련 문서

## 디렉토리 목적
프로젝트 리스트와 상세 패널을 배치하는 컨테이너입니다.
페이지네이션과 선택 상태를 조정합니다.

## 핵심 책임
- 마스터-디테일 레이아웃을 유지
- 페이지네이션과 선택 상태를 관리
- 반응형 모드에서 패널 토글을 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- DetailView.tsx 069~782 export DetailView - DetailView Component Displays projects in Master-Detail layout: - Left panel: Project list with selection - Right panel: Selected project details using ProjectDetail component Features: - Clickable project list - Full project detail in right panel - Responsive layout
- index.tsx 020~406 export ProjectsView
- ListView.tsx 070~529 export ListView - ListView Component Displays projects in a table format with advanced features: - Column resizing (60fps optimized) - Column drag-and-drop reordering - Sorting and filtering - Pagination - Delete mode with bulk selection This component focuses solely on table display logic, delegating data management to parent component.

## 중앙화·모듈화·캡슐화
- 빈 상태와 라벨은 brand 설정을 사용

## 작업 규칙
- 페이지네이션 정책 변경 시 UI와 서비스 문서를 업데이트
- 레이아웃 수정 후 접근성과 테스트를 검증

## 관련 문서
- src/app/projects/components/claude.md
- src/components/projects/claude.md
- src/lib/storage/services/claude.md
