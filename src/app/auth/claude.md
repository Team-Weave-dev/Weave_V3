# src/app/auth - 인증 보조 페이지

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~23: 구조 요약
- 24~26: 파일 라인 맵
- 27~29: 중앙화·모듈화·캡슐화
- 30~33: 작업 규칙
- 34~37: 관련 문서

## 디렉토리 목적
OAuth와 이메일 인증에 필요한 보조 UI를 제공합니다.
콜백, 오류 안내, 로딩 상태를 관리합니다.

## 핵심 책임
- OAuth 콜백 경로에서 성공·실패 분기 처리
- 오류 상황에 대한 재시도·지원 안내 제공

## 구조 요약
- auth-code-error/: 인증 오류 안내 (→ src/app/auth/auth-code-error/claude.md)
- callback/: OAuth 콜백 뷰 (→ src/app/auth/callback/claude.md)

## 파일 라인 맵
- 추적 가능한 파일이 없습니다.

## 중앙화·모듈화·캡슐화
- 안내 문구와 버튼 텍스트는 brand 설정 사용

## 작업 규칙
- API 응답 구조가 변하면 조건문과 문서를 업데이트
- 새 OAuth 공급자 추가 시 콜백 분기를 확장

## 관련 문서
- src/app/claude.md
- src/app/api/auth/claude.md
