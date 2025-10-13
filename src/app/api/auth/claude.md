# src/app/api/auth - 인증 API

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~26: 구조 요약
- 27~29: 파일 라인 맵
- 30~32: 중앙화·모듈화·캡슐화
- 33~36: 작업 규칙
- 37~41: 관련 문서

## 디렉토리 목적
Supabase 기반 인증 흐름을 API 라우트로 제공합니다.
로그인, 로그아웃, 회원가입, OAuth 콜백을 처리합니다.

## 핵심 책임
- 이메일 로그인과 마이그레이션 상태 확인
- OAuth 콜백 및 오류 대응
- 세션 종료와 후속 안내

## 구조 요약
- google/: Google OAuth 콜백 (→ src/app/api/auth/google/claude.md)
- signin/: 로그인 처리 (→ src/app/api/auth/signin/claude.md)
- signout/: 로그아웃 처리 (→ src/app/api/auth/signout/claude.md)
- signup/: 회원가입 처리 (→ src/app/api/auth/signup/claude.md)

## 파일 라인 맵
- 추적 가능한 파일이 없습니다.

## 중앙화·모듈화·캡슐화
- 응답 문구와 리디렉션 경로는 brand 설정과 상수를 사용

## 작업 규칙
- 오류 메시지 변경 시 UI와 문서를 업데이트
- OAuth 공급자 추가 시 config·UI와 동기화

## 관련 문서
- src/app/api/claude.md
- src/lib/supabase/claude.md
- src/app/login/claude.md
