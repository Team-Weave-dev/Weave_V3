# src/lib/stores - 전역 스토어

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~30: 파일 라인 맵
- 31~33: 중앙화·모듈화·캡슐화
- 34~37: 작업 규칙
- 38~43: 관련 문서

## 디렉토리 목적
위젯과 페이지에서 공유하는 전역 상태 스토어를 정의합니다.

## 핵심 책임
- useImprovedDashboardStore 등 전역 상태 관리
- 로컬 스토리지 동기화와 UI 업데이트 지원

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- useImprovedDashboardStore.ts 102~817 export useImprovedDashboardStore - Zustand 스토어 생성 (Storage API 연동)
- useImprovedDashboardStore.ts 818~818 export selectWidgets - 셀렉터
- useImprovedDashboardStore.ts 819~819 export selectConfig
- useImprovedDashboardStore.ts 820~820 export selectEditState
- useImprovedDashboardStore.ts 821~821 export selectIsEditMode
- useImprovedDashboardStore.ts 822~892 export selectSelectedWidget
- useImprovedDashboardStore.ts 893~916 export setupDashboardAutoSave - Setup auto-save subscription This should be called once when the app starts (after initialization)

## 중앙화·모듈화·캡슐화
- 상태 기본값과 상수는 config에서 가져와 일관성 유지

## 작업 규칙
- 상태 구조 변경 시 사용하는 컴포넌트와 문서를 동시에 업데이트
- 퍼시스턴스 전략 변경 시 storage 서비스와 동기화

## 관련 문서
- src/lib/claude.md
- src/components/dashboard/claude.md
- src/lib/calendar-integration/claude.md
- src/config/brand.ts
