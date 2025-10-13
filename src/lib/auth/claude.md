# src/lib/auth - 인증 유틸리티

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~27: 파일 라인 맵
- 28~30: 중앙화·모듈화·캡슐화
- 31~34: 작업 규칙
- 35~40: 관련 문서

## 디렉토리 목적
인증 관련 공통 유틸리티와 세션 관리 로직을 제공합니다.

## 핵심 책임
- 세션 검사와 사용자 정보 추출
- 리디렉션 로직과 에러 처리 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- session.ts 09~24 const supabase
- session.ts 25~40 const supabase
- session.ts 41~54 const session
- session.ts 55~57 const session

## 중앙화·모듈화·캡슐화
- 인증 메시지와 경로는 brand 설정과 상수를 사용

## 작업 규칙
- 세션 구조 변경 시 API·페이지·문서를 동기화
- 보안 정책 변경 시 brand와 supabase 문서를 업데이트

## 관련 문서
- src/lib/claude.md
- src/app/api/auth/claude.md
- src/app/login/claude.md
- src/lib/supabase/claude.md
