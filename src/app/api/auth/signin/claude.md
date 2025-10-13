# src/app/api/auth/signin - 로그인 API

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~22: 구조 요약
- 23~26: 파일 라인 맵
- 27~29: 중앙화·모듈화·캡슐화
- 30~33: 작업 규칙
- 34~38: 관련 문서

## 디렉토리 목적
이메일·비밀번호 로그인을 Supabase와 연동합니다.
스토리지 마이그레이션 필요 여부를 계산해 응답합니다.

## 핵심 책임
- 입력 검증과 오류 응답 처리
- migration_status 조회로 마이그레이션 플래그 반환

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- route.ts 16~40 const supabase
- route.ts 41~66 const shouldMigrate

## 중앙화·모듈화·캡슐화
- 응답 메시지는 brand 텍스트와 일치시킴

## 작업 규칙
- 마이그레이션 로직 변경 시 storage 문서와 동기화
- 로그 기록 시 민감 정보가 포함되지 않도록 주의

## 관련 문서
- src/app/api/auth/claude.md
- src/app/login/claude.md
- src/lib/storage/migrations/claude.md
