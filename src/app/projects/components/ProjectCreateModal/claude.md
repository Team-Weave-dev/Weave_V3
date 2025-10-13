# src/app/projects/components/ProjectCreateModal - 생성 모달

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~19: 핵심 책임
- 20~22: 구조 요약
- 23~26: 파일 라인 맵
- 27~29: 중앙화·모듈화·캡슐화
- 30~33: 작업 규칙
- 34~38: 관련 문서

## 디렉토리 목적
신규 프로젝트 생성을 위한 모달과 상태 로직을 캡슐화합니다.

## 핵심 책임
- 입력 검증과 제출 처리
- 스토리지 또는 Supabase 서비스 호출
- 성공·실패 토스트 메시지 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- DocumentGeneratorModal.tsx 033~480 export DocumentGeneratorModal
- index.tsx 057~786 export ProjectCreateModal

## 중앙화·모듈화·캡슐화
- 라벨과 버튼 텍스트는 brand 설정 사용

## 작업 규칙
- 필드 추가 시 타입·서비스와 문서를 업데이트
- 유효성 규칙 변경 시 안내 문구와 테스트를 갱신

## 관련 문서
- src/app/projects/components/claude.md
- src/lib/storage/services/claude.md
- src/lib/document-generator/claude.md
