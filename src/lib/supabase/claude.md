# src/lib/supabase - Supabase 클라이언트

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~34: 파일 라인 맵
- 35~37: 중앙화·모듈화·캡슐화
- 38~41: 작업 규칙
- 42~47: 관련 문서

## 디렉토리 목적
Supabase 인증 및 데이터 접근을 위한 클라이언트를 제공합니다.
서버·클라이언트 런타임 맞춤 헬퍼와 미들웨어를 관리합니다.

## 핵심 책임
- client.ts로 브라우저 클라이언트 생성
- server.ts로 서버용 클라이언트 제공
- middleware.ts로 보호 라우트 구현

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- client.ts 07~12 export createClient - Creates a Supabase client for Client Components. This client uses cookies from the browser.
- middleware.ts 05~07 const pathname
- middleware.ts 08~11 let supabaseResponse
- middleware.ts 12~17 const supabase
- middleware.ts 18~47 const cookies
- middleware.ts 48~55 const publicPaths - 공개 경로 정의
- middleware.ts 56~64 const isPublicPath
- middleware.ts 65~74 const url - 비인증 사용자를 로그인 페이지로 리다이렉트
- server.ts 09~33 const cookieStore

## 중앙화·모듈화·캡슐화
- Supabase URL과 키는 환경 변수로 주입하고 코드에 하드코딩하지 않음

## 작업 규칙
- Supabase 버전 업데이트 시 클라이언트 설정을 우선 조정
- 인증 정책 변경 시 middleware와 페이지·문서를 동기화

## 관련 문서
- src/lib/claude.md
- supabase/claude.md
- src/app/api/auth/claude.md
- src/lib/storage/claude.md
