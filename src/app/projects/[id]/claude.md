# src/app/projects/[id] - 프로젝트 상세

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~27: 파일 라인 맵
- 28~30: 중앙화·모듈화·캡슐화
- 31~34: 작업 규칙
- 35~39: 관련 문서

## 디렉토리 목적
프로젝트 ID 기반으로 상세 정보를 렌더링합니다.
ProjectDetail 컴포넌트와 탭 구조를 사용합니다.

## 핵심 책임
- URL 파라미터로 프로젝트 데이터를 로딩
- 탭 기반 상세 콘텐츠를 렌더링
- 예외 상황과 리디렉션을 관리

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- page.tsx 22~25 const resolvedParams
- ProjectDetailClient.tsx 069~721 export ProjectDetailClient - Client Component Wrapper for ProjectDetail Handles client-side interactions and navigation with localStorage support

## 중앙화·모듈화·캡슐화
- 텍스트는 brand 설정, 열 정의는 lib/config/project-columns에서 사용

## 작업 규칙
- 데이터 소스 변경 시 서비스 호출부와 타입을 업데이트
- 탭 구조 변경 시 ProjectDetail 문서를 갱신

## 관련 문서
- src/app/projects/claude.md
- src/components/projects/ProjectDetail/claude.md
- src/lib/storage/services/claude.md
