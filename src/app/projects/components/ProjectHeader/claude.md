# src/app/projects/components/ProjectHeader - 헤더

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~19: 핵심 책임
- 20~22: 구조 요약
- 23~28: 파일 라인 맵
- 29~31: 중앙화·모듈화·캡슐화
- 32~35: 작업 규칙
- 36~40: 관련 문서

## 디렉토리 목적
프로젝트 헤더 영역에서 필터와 액션을 제공합니다.

## 핵심 책임
- 필터·정렬 옵션 노출
- 생성 모달 등 CTA 트리거
- 요약 지표를 표시

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- CombinedStatsCard.tsx 031~185 export CombinedStatsCard - 통합 프로젝트 통계 카드 전체 프로젝트와 6가지 상태별 통계를 시각적으로 구분하여 표시 - 좌측: 전체 프로젝트 (단독 배치) - 우측: 2열 3행 그리드 (기획/검토/진행중, 보류/취소/완료)
- DeadlineStatsCard.tsx 036~269 export DeadlineStatsCard - 마감일 임박 프로젝트 통계 카드 (테이블 레이아웃) 마감일이 임박한 프로젝트들을 표시하고 경고 - 7일 미만: 긴급 (빨간색) - 7-14일: 주의 (주황색) - 14일 이상: 여유 (파란색)
- index.tsx 42~96 export ProjectHeader - ProjectHeader Component Responsible for: - Displaying project management title and description - View mode switcher (List/Detail) - Action buttons (Create new project, etc.) - Summary statistics cards This component is separated from the main view logic for better maintainability
- RevenueStatCard.tsx 056~171 export RevenueStatCard - 예상 월 매출 통계 카드 기능: - 드롭다운으로 월 선택 (1년 치 데이터) - 환율 적용한 매출 계산 (USD → KRW) - 호버 시 계산식과 설명 표시

## 중앙화·모듈화·캡슐화
- 버튼과 통계 라벨은 brand 설정을 사용

## 작업 규칙
- 액션 또는 필터가 추가되면 타입·브랜드 문구를 동기화
- 반응형 구성 변경 시 접근성을 검토

## 관련 문서
- src/app/projects/components/claude.md
- src/components/projects/claude.md
- src/config/brand.ts
