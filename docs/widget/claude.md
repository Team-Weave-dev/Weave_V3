# docs/widget - 위젯 레퍼런스

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~22: 구조 요약
- 23~39: 파일 라인 맵
- 40~42: 중앙화·모듈화·캡슐화
- 43~46: 작업 규칙
- 47~51: 관련 문서

## 디렉토리 목적
대시보드 및 모바일 위젯 설계 자료와 목업을 보관합니다.
UI 구현 전 필요한 정보 구조와 인터랙션 패턴을 정의합니다.

## 핵심 책임
- 위젯 인벤토리와 상태를 문서화
- 목업 파일과 인터랙션 노트를 관리

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- dashboard-widget-inventory.md 03~59 핵심 기술 스택 (실제 프로젝트 기준) - ```javascript
- dashboard-widget-inventory.md 060~103 프로젝트 구조 설명 - ```
- dashboard-widget-inventory.md 104~114 🔢 위젯 카테고리별 분류 - | 카테고리 | 위젯 수 | 위젯 목록 |
- dashboard-widget-inventory.md 115~312 📂 프로젝트 관리 위젯 (2개) - <!-- ### 1. 📊 프로젝트 요약 위젯 (ProjectSummaryWidget)
- dashboard-widget-inventory.md 313~330 💰 세무 관련 위젯 (2개) - <!-- ### 3. 📅 세무 일정 위젯 (TaxDeadlineWidget)
- dashboard-widget-inventory.md 331~376 📊 분석 및 지표 위젯 (6개) - **타입**: `revenue-chart`
- dashboard-widget-inventory.md 377~485 🚀 생산성 위젯 (10개) - <!-- ### 11. 📝 할 일 목록 위젯 (TodoListWidget)
- dashboard-widget-inventory.md 486~587 🎨 커스텀/기타 위젯 (2개) - **타입**: `quick-actions`
- dashboard-widget-inventory.md 588~598 📊 성능 최적화 체크리스트 - [ ] React.lazy()로 위젯 동적 로딩
- dashboard-widget-inventory.md 599~610 🎯 접근성(A11y) 체크리스트 - [ ] 모든 인터랙티브 요소에 aria-label
- dashboard-widget-inventory.md 611~760 🏛️ 아키텍처 패턴 상세 - ```typescript
- dashboard-widget-inventory.md 761~796 🔐 보안 가이드라인 - ```typescript
- dashboard-widget-inventory.md 797~839 📈 성능 모니터링 - ```typescript
- dashboard-widget-inventory.md 840~867 📊 분석 및 모니터링 - ```typescript
- dashboard-widget-inventory.md 868~881 🎯 결론 - 이 문서는 WEAVE 대시보드 위젯 시스템을 iOS 스타일로 재설계한 포괄적인 가이드입니다.

## 중앙화·모듈화·캡슐화
- 위젯 서술 정보는 docs/widget에 집중하고 실제 구현 세부는 src/components/dashboard에서 관리

## 작업 규칙
- 새 위젯을 추가하면 인벤토리 문서와 구현 문서를 함께 업데이트
- 목업이 변경되면 대시보드 문서에 요약을 남김

## 관련 문서
- src/components/dashboard/claude.md
- src/app/dashboard/claude.md
- src/config/brand.ts
