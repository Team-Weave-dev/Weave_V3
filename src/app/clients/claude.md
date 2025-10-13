# src/app/clients - 클라이언트 관리

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~27: 파일 라인 맵
- 28~30: 중앙화·모듈화·캡슐화
- 31~34: 작업 규칙
- 35~39: 관련 문서

## 디렉토리 목적
클라이언트 목록과 상태를 관리하는 페이지입니다.
프로젝트 데이터와 연동된 고객 정보를 제공합니다.

## 핵심 책임
- 클라이언트 목록과 필터링을 제공
- 프로젝트 상세로 이동하는 링크를 노출
- 전역 텍스트와 레이아웃 상수를 적용

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- layout.tsx 03~09 export ClientsLayout
- page.tsx 039~346 export ClientsPage

## 중앙화·모듈화·캡슐화
- 라벨과 수치는 brand 및 config 상수를 사용

## 작업 규칙
- 데이터 소스 변경 시 storage/서비스 문서를 갱신
- 새 필터 추가 시 브랜드 상수와 타입을 동기화

## 관련 문서
- src/app/claude.md
- src/components/projects/claude.md
- src/lib/storage/services/claude.md
