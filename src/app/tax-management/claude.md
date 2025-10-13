# src/app/tax-management - 세무 일정 관리

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~27: 파일 라인 맵
- 28~30: 중앙화·모듈화·캡슐화
- 31~34: 작업 규칙
- 35~40: 관련 문서

## 디렉토리 목적
세무 일정과 마감일을 관리하는 페이지입니다.
통합 캘린더와 스토리지 데이터를 활용해 일정을 표시합니다.

## 핵심 책임
- 세무 마감일 목록과 상태 필터를 제공
- 캘린더 위젯과의 연동을 유지
- 알림과 진행 상태를 시각화

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- layout.tsx 03~09 export TaxManagementLayout
- page.tsx 009~165 export TaxManagementPage

## 중앙화·모듈화·캡슐화
- 라벨과 상태 텍스트는 brand 설정을 사용

## 작업 규칙
- 새 세무 항목을 추가하면 타입과 서비스 문서를 업데이트
- 데이터 소스 변경 시 테스트 스크립트를 갱신

## 관련 문서
- src/app/claude.md
- src/lib/calendar-integration/claude.md
- src/lib/storage/services/claude.md
- src/components/dashboard/claude.md
