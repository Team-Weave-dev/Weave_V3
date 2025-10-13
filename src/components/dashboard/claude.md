# src/components/dashboard - 대시보드 컴포넌트

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~29: 파일 라인 맵
- 30~32: 중앙화·모듈화·캡슐화
- 33~36: 작업 규칙
- 37~42: 관련 문서

## 디렉토리 목적
대시보드 페이지에서 사용하는 핵심 레이아웃과 위젯 컴포넌트를 제공합니다.
위젯 선택, 정렬, 애니메이션을 캡슐화합니다.

## 핵심 책임
- ImprovedDashboard 레이아웃과 데이터 결합 유지
- 위젯 컨테이너 및 선택 모달 제공
- iOS 스타일 애니메이션 적용

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- DashboardContainer.tsx 015~146 export DashboardContainer
- ImprovedDashboard.tsx 0264~1356 export ImprovedDashboard - 세무 일정 목 데이터 (TaxDeadlineWidget 내부에 하드코딩되어 있어 별도 데이터 불필요)
- WidgetSelectorModal.tsx 042~181 export WidgetSelectorModal
- WidgetSidebar.tsx 119~415 export WidgetSidebar

## 중앙화·모듈화·캡슐화
- 위젯 라벨은 brand 설정, 애니메이션은 lib/dashboard를 사용

## 작업 규칙
- 새 위젯 추가 시 인벤토리·문서를 함께 업데이트
- 애니메이션 변경 시 ios-animations 문서를 갱신

## 관련 문서
- src/components/claude.md
- src/app/dashboard/claude.md
- src/lib/dashboard/claude.md
- docs/widget/claude.md
