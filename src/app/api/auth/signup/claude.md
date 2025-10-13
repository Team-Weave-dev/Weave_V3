# src/app/api/auth/signup - 회원가입 API

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~24: 파일 라인 맵
- 25~27: 중앙화·모듈화·캡슐화
- 28~31: 작업 규칙
- 32~36: 관련 문서

## 디렉토리 목적
Supabase 회원가입을 처리하고 확인 절차를 안내합니다.

## 핵심 책임
- 입력 검증과 Supabase signUp 호출
- 성공 메시지와 리디렉션 경로 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- route.ts 023~116 const supabase

## 중앙화·모듈화·캡슐화
- 안내 문구는 brand.ts 구조와 동기화

## 작업 규칙
- 필수 필드 변경 시 타입과 UI를 업데이트
- 이메일 확인 정책이 바뀌면 문구와 후속 페이지를 수정

## 관련 문서
- src/app/api/auth/claude.md
- src/app/signup/claude.md
- src/lib/supabase/claude.md
