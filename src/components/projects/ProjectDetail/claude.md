# src/components/projects/ProjectDetail - 프로젝트 상세 컴포넌트

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~26: 파일 라인 맵
- 27~29: 중앙화·모듈화·캡슐화
- 30~33: 작업 규칙
- 34~39: 관련 문서

## 디렉토리 목적
프로젝트 상세 패널의 탭 구조와 콘텐츠 렌더링을 제공합니다.
계약, 청구, 문서, 설정 등 섹션을 모듈화합니다.

## 핵심 책임
- 탭 네비게이션과 섹션 콘텐츠 렌더링
- 문서 생성·삭제 등 액션 연동
- 프로젝트 상태와 진행률 표시

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- index.tsx 0178~1803 export ProjectDetail

## 중앙화·모듈화·캡슐화
- 탭 이름과 콘텐츠 설명은 brand 설정을 사용

## 작업 규칙
- 탭 추가·삭제 시 브랜드 텍스트, 타입, 페이지 문서를 업데이트
- 문서 액션 로직 변경 시 document-generator와 서비스 계층을 동기화

## 관련 문서
- src/components/projects/claude.md
- src/app/projects/[id]/claude.md
- src/lib/document-generator/claude.md
- src/lib/storage/services/claude.md
