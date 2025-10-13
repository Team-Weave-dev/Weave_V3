# src/app/api/auth/google - Google OAuth

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~22: 구조 요약
- 23~26: 파일 라인 맵
- 27~29: 중앙화·모듈화·캡슐화
- 30~33: 작업 규칙
- 34~38: 관련 문서

## 디렉토리 목적
Google OAuth 콜백을 처리하여 Supabase 세션을 확정합니다.
성공·실패에 따른 리디렉션과 로그를 관리합니다.

## 핵심 책임
- OAuth 응답 검증과 사용자 정보 추출
- 오류 로깅 및 재시도 안내 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- route.ts 08~09 const supabase
- route.ts 10~47 const redirectTo

## 중앙화·모듈화·캡슐화
- 리디렉션 경로와 메시지는 brand 설정을 재사용

## 작업 규칙
- Supabase OAuth 설정 변경 시 콜백 URL과 문서를 점검
- 오류 경로가 `src/app/auth/auth-code-error`와 일치하는지 확인

## 관련 문서
- src/app/api/auth/claude.md
- src/app/auth/claude.md
- src/lib/supabase/claude.md
