# src/components/projects - 프로젝트 UI

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~23: 구조 요약
- 24~27: 파일 라인 맵
- 28~30: 중앙화·모듈화·캡슐화
- 31~34: 작업 규칙
- 35~40: 관련 문서

## 디렉토리 목적
프로젝트 도메인에서 재사용되는 UI 컴포넌트를 제공합니다.
카드, 상세 탭, 공유 요소를 캡슐화해 페이지 간 일관성을 보장합니다.

## 핵심 책임
- ProjectDetail 탭 구조 제공
- 공용 카드·정보 렌더러 관리

## 구조 요약
- ProjectDetail/: 프로젝트 상세 컴포넌트 (→ src/components/projects/ProjectDetail/claude.md)
- shared/: 공용 프로젝트 컴포넌트 (→ src/components/projects/shared/claude.md)

## 파일 라인 맵
- DocumentDeleteDialog.tsx 17~57 export DocumentDeleteDialog
- DocumentGeneratorModal.tsx 027~188 export ProjectDocumentGeneratorModal

## 중앙화·모듈화·캡슐화
- 텍스트는 brand 설정, 데이터 포맷은 lib 유틸을 사용

## 작업 규칙
- 새 컴포넌트 추가 시 페이지와 문서를 동기화
- 데이터 구조 변경 시 타입·서비스를 검토

## 관련 문서
- src/components/claude.md
- src/app/projects/claude.md
- src/lib/storage/services/claude.md
- src/lib/document-generator/claude.md
