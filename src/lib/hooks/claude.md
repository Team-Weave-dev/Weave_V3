# src/lib/hooks - 라이브러리 훅

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~24: 파일 라인 맵
- 25~27: 중앙화·모듈화·캡슐화
- 28~30: 작업 규칙
- 31~35: 관련 문서

## 디렉토리 목적
서비스 계층에서 사용하는 커스텀 훅을 정의합니다.

## 핵심 책임
- 프로젝트 테이블 데이터 변환
- 서비스 통합 로직을 재사용 가능한 API로 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- useProjectTable.ts 038~438 export useProjectTable

## 중앙화·모듈화·캡슐화
- 텍스트와 설정은 lib/config와 brand를 사용

## 작업 규칙
- 새 훅 추가 시 상위 문서 구조를 갱신하고 사용처를 점검

## 관련 문서
- src/lib/claude.md
- src/app/projects/claude.md
- src/lib/config/claude.md
