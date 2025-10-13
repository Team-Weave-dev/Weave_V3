# src/components/projects/shared/ProjectInfoRenderer - 정보 렌더러

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~30: 파일 라인 맵
- 31~33: 중앙화·모듈화·캡슐화
- 34~37: 작업 규칙
- 38~42: 관련 문서

## 디렉토리 목적
프로젝트 속성을 텍스트, 배지, 아이콘으로 일관되게 렌더링합니다.

## 핵심 책임
- 상태·라벨·수치 데이터 포맷팅
- null 데이터를 안전하게 처리

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- index.tsx 16~27 export ProjectInfoRendererProps
- index.tsx 28~79 export ProjectInfoField
- index.tsx 080~213 export ProjectInfoRenderer - 통합 프로젝트 정보 렌더러 모든 뷰모드(ListView, DetailView, ProjectDetail)에서 일관된 프로젝트 정보 표시를 위한 통합 컴포넌트 @example // ListView 테이블 셀에서 <ProjectInfoRenderer project={project} mode="table" fields={['name', 'status', 'paymentStatus']} layout="horizontal" /> // DetailView 카드에서 <ProjectInfoRenderer project={project} mode="card" fields={['name', 'status', 'paymentStatus', 'meta']} layout="vertical" /> // ProjectDetail 상세에서 <ProjectInfoRenderer project={project} mode="detail" fields={['name', 'status', 'paymentStatus', 'progress', 'meta']} layout="grid" isEditing={true} />
- PaymentStatus.tsx 23~89 export PaymentStatus - 공통 수금상태 컴포넌트 모든 뷰모드(ListView, DetailView, ProjectDetail)에서 일관된 수금상태 표시
- ProjectMeta.tsx 023~113 export ProjectMeta - 공통 프로젝트 메타정보 컴포넌트 클라이언트, 날짜 등의 부가 정보 표시
- ProjectName.tsx 21~75 export ProjectName - 공통 프로젝트명 컴포넌트 모든 뷰모드에서 일관된 프로젝트명 표시
- ProjectStatus.tsx 023~128 export ProjectStatus - 공통 프로젝트 상태 컴포넌트 모든 뷰모드에서 일관된 프로젝트 상태 표시

## 중앙화·모듈화·캡슐화
- 텍스트와 색상 맵은 brand 설정과 상수를 사용

## 작업 규칙
- 새 속성이 추가되면 타입과 매핑 로직을 업데이트
- 색상/아이콘 정책 변경 시 브랜드 상수와 문서를 수정

## 관련 문서
- src/components/projects/shared/claude.md
- src/components/projects/ProjectDetail/claude.md
- src/config/brand.ts
