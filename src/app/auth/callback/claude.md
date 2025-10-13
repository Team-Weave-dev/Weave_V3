# src/app/auth/callback - OAuth 콜백 페이지

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~31: 파일 라인 맵
- 32~34: 중앙화·모듈화·캡슐화
- 35~38: 작업 규칙
- 39~42: 관련 문서

## 디렉토리 목적
OAuth 완료 후 사용자를 애플리케이션으로 되돌립니다.
성공·실패 상태에 따른 피드백과 리디렉션을 처리합니다.

## 핵심 책임
- Supabase OAuth 응답 확인
- 성공 시 대시보드, 실패 시 오류 페이지로 이동
- 로딩 상태 안내 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- route.ts 06~06 const code
- route.ts 07~12 const next
- route.ts 13~13 const forwardedHost - Determine redirect URL based on environment
- route.ts 14~27 const isLocalEnv
- route.ts 28~30 let response - Create response object first (CRITICAL for cookie setting in Route Handlers)
- route.ts 031~111 const supabase - Create Supabase client with cookie configuration for Route Handler

## 중앙화·모듈화·캡슐화
- 문구와 버튼 텍스트는 brand 설정을 사용

## 작업 규칙
- 리디렉션 경로 변경 시 API 응답과 문서를 동기화
- 애니메이션·타이밍 조정 시 접근성을 검토

## 관련 문서
- src/app/auth/claude.md
- src/app/api/auth/google/claude.md
