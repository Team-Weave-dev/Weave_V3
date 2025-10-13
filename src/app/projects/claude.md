# src/app/projects - 프로젝트 관리

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~24: 구조 요약
- 25~29: 파일 라인 맵
- 30~32: 중앙화·모듈화·캡슐화
- 33~36: 작업 규칙
- 37~42: 관련 문서

## 디렉토리 목적
프로젝트 목록과 상세 정보를 제공하는 마스터-디테일 페이지입니다.
문서 생성, 탭 기반 상세 뷰, 모달을 통해 업무 흐름을 지원합니다.

## 핵심 책임
- 리스트·상세·헤더 구성 유지
- ProjectDetail 탭과 문서 생성 기능 연동
- 중앙화 텍스트와 데이터 서비스를 활용

## 구조 요약
- [id]/: 프로젝트 상세 동적 페이지 (→ src/app/projects/[id]/claude.md)
- components/: 프로젝트 전용 컴포넌트 (→ src/app/projects/components/claude.md)

## 파일 라인 맵
- layout.tsx 03~09 export ProjectsLayout
- loading.tsx 07~09 export Loading - 프로젝트 목록 페이지 로딩 상태
- page.tsx 13~23 export ProjectsPage - Projects page - Main routing entry point This is kept simple and delegates all logic to ProjectsView component. This separation makes it clear that page.tsx is just for routing, while the actual business logic lives in components.

## 중앙화·모듈화·캡슐화
- 프로젝트 관련 텍스트는 brand 설정, 데이터는 storage 서비스 사용

## 작업 규칙
- 새 기능 추가 시 관련 컴포넌트·서비스 문서를 동기화
- 동적 라우트 구조 변경 시 링크와 타입을 업데이트

## 관련 문서
- src/app/claude.md
- src/components/projects/claude.md
- src/lib/storage/services/claude.md
- src/lib/document-generator/claude.md
