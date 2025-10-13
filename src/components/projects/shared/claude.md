# src/components/projects/shared - 공용 프로젝트 컴포넌트

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~23: 구조 요약
- 24~28: 파일 라인 맵
- 29~31: 중앙화·모듈화·캡슐화
- 32~35: 작업 규칙
- 36~40: 관련 문서

## 디렉토리 목적
프로젝트 카드, 정보 렌더러 등 여러 페이지에서 재사용되는 UI를 제공합니다.
리스트와 상세 뷰가 공유하는 시각 요소를 캡슐화합니다.

## 핵심 책임
- ProjectCardCustom 관리
- ProjectInfoRenderer 관리

## 구조 요약
- ProjectCardCustom/: 프로젝트 카드 (→ src/components/projects/shared/ProjectCardCustom/claude.md)
- ProjectInfoRenderer/: 정보 렌더러 (→ src/components/projects/shared/ProjectInfoRenderer/claude.md)

## 파일 라인 맵
- MiniWBS.tsx 044~204 export MiniWBS - 미니 WBS (Work Breakdown Structure) 컴포넌트 @description - 프로젝트 작업 목록 표시 - 접기/펼치기 기능 - 편집 모드에서 작업 추가/삭제/상태 변경 - 템플릿으로 빠르게 작업 추가 (Phase 2.2) - 드래그 앤 드롭으로 순서 변경 (Phase 2.3) - 읽기 모드에서 상태만 표시
- WBSTaskItem.tsx 031~196 export WBSTaskItem - WBS 작업 아이템 컴포넌트 @description - 읽기 모드: 상태 배지만 표시 - 편집 모드: Select 드롭다운으로 3단계 상태 변경 (대기/진행중/완료) + 삭제 버튼 + 드래그 핸들 - Phase 2.3: 드래그 앤 드롭으로 순서 변경
- WBSTemplateSelectDialog.tsx 032~101 export WBSTemplateSelectDialog - WBS 템플릿 선택 다이얼로그 @description - 4가지 템플릿 중 선택 (standard, consulting, education, custom 제외) - 각 템플릿의 이름과 설명 표시 - 선택 후 확인 버튼으로 템플릿 작업 추가

## 중앙화·모듈화·캡슐화
- 텍스트와 배지 라벨은 brand 설정을 사용

## 작업 규칙
- 카드 구조 변경 시 사용 중인 모든 페이지를 업데이트
- 데이터 속성이 추가되면 타입과 서비스 레이어를 검토

## 관련 문서
- src/components/projects/claude.md
- src/app/projects/claude.md
- src/lib/storage/services/claude.md
