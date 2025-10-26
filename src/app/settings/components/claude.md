# src/app/settings/components - 설정 섹션

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~27: 파일 라인 맵
- 28~30: 중앙화·모듈화·캡슐화
- 31~34: 작업 규칙
- 35~39: 관련 문서

## 디렉토리 목적
설정 페이지에서 사용하는 섹션별 UI 컴포넌트를 제공합니다.

## 핵심 책임
- 토글·입력·카드 등 섹션 요소 렌더링
- 저장 결과를 상위에 전달

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- BillingTab.tsx 014~150 export BillingTab - 결제 탭 컴포넌트 결제 수단 및 결제 내역 관리
- PlanTab.tsx 017~175 export PlanTab - 요금제 탭 컴포넌트 요금제 비교 및 변경 사용자 plan 변경 기능 포함 (userService.updatePlan 사용)
- ProfileTab.tsx 023~566 export ProfileTab - 프로필 탭 컴포넌트 사용자 정보 및 환경설정 관리
- UsageTab.tsx 015~154 export UsageTab - 사용량 탭 컴포넌트 현재 사용 중인 리소스 현황 표시 Supabase에서 실제 사용자 plan과 프로젝트/위젯 수 조회

## 중앙화·모듈화·캡슐화
- 라벨과 설명은 brand 설정 사용

## 작업 규칙
- 새 섹션 추가 시 관련 서비스와 문서를 작성
- 저장 로직 변경 시 storage·supabase 문서를 갱신

## 관련 문서
- src/app/settings/claude.md
- src/components/ui/claude.md
- src/lib/storage/services/claude.md
