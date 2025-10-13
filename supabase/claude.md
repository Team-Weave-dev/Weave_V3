# supabase - 프로젝트 설정 가이드

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~23: 구조 요약
- 24~26: 파일 라인 맵
- 27~29: 중앙화·모듈화·캡슐화
- 30~33: 작업 규칙
- 34~38: 관련 문서

## 디렉토리 목적
Supabase 프로젝트 설정과 로컬 개발 환경 구성을 관리합니다.
인증, RLS, 데이터 싱크 전략의 기준 정보를 제공합니다.

## 핵심 책임
- config.toml 및 CLI 설정을 유지
- 마이그레이션 폴더와 연계하여 스키마를 관리
- 권한 정책과 환경 구성 문서화

## 구조 요약
- migrations/: SQL 마이그레이션과 정책 문서 (→ supabase/migrations/claude.md)

## 파일 라인 맵
- 추적 가능한 파일이 없습니다.

## 중앙화·모듈화·캡슐화
- Supabase 관련 설정과 정책은 supabase/와 `src/lib/supabase`에서만 정의

## 작업 규칙
- 마이그레이션 추가 시 storage·types 문서를 동기화
- 환경 변수 변경 시 `.env.local` 예시와 문서를 업데이트

## 관련 문서
- src/lib/supabase/claude.md
- src/lib/storage/claude.md
- supabase/migrations/claude.md
