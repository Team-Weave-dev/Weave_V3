# supabase/migrations - SQL 마이그레이션

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~22: 구조 요약
- 23~25: 파일 라인 맵
- 26~28: 중앙화·모듈화·캡슐화
- 29~33: 작업 규칙
- 34~38: 관련 문서

## 디렉토리 목적
Supabase 데이터베이스 스키마 변화를 관리하는 SQL 마이그레이션 모음입니다.
Storage 시스템과 1:1 매핑되는 테이블과 정책을 유지합니다.

## 핵심 책임
- 테이블·뷰·정책 마이그레이션 정의
- 버전 순서와 롤백 전략 기록

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- 20251027_01_add_plan_system.sql 08~19 CREATE TABLE plans - plans 테이블 생성 (id, name, price, limits_*, features, timestamps)
- 20251027_01_add_plan_system.sql 24~38 INSERT INTO plans - plans 시드 데이터 삽입 (free, basic, pro) with conflict resolution
- 20251027_01_add_plan_system.sql 43~49 ALTER TABLE users ADD COLUMN plan - users 테이블에 plan 컬럼 추가 및 기본값 설정
- 20251027_01_add_plan_system.sql 55~62 RLS policies for plans - plans 테이블 RLS 정책 (모든 사용자 읽기 가능)
- 20251027_01_add_plan_system.sql 70~70 CREATE INDEX idx_users_plan - users.plan 인덱스 생성
- 20251027_01_add_plan_system.sql 75~79 CREATE TRIGGER update_plans_updated_at - plans 테이블 updated_at 자동 업데이트 트리거
- 20251027_01_add_plan_system.sql 84~92 ALTER TABLE plans ADD CONSTRAINT - plans 테이블 제약조건 (price >= 0, storage > 0)

## 중앙화·모듈화·캡슐화
- 데이터베이스 스키마 변경은 이 디렉터리에서만 정의하고 수동 변경을 금지

## 작업 규칙
- 새 마이그레이션 작성 후 Supabase CLI로 검증
- Storage 타입과 구조가 일치하는지 확인
- RLS 정책 변경 시 인증 문서와 동기화

## 관련 문서
- src/lib/storage/migrations/claude.md
- src/lib/types/claude.md
- src/lib/supabase/claude.md
