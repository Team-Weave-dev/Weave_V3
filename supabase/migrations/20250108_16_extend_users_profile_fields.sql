-- =====================================================
-- Users 테이블 프로필 필드 확장
-- =====================================================
-- 설명: User 엔티티 프로필 필드 추가 (비즈니스 정보 및 연락처)
-- 작성일: 2025-01-09
-- 의존성: 20250107_10_create_users_table_and_trigger.sql

-- 1. 프로필 필드 추가
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS business_number TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS address_detail TEXT,
  ADD COLUMN IF NOT EXISTS business_type TEXT
    CHECK (business_type IN ('freelancer', 'individual', 'corporation'));

-- 2. 인덱스 생성 (검색 최적화)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)
  WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_business_type ON users(business_type)
  WHERE business_type IS NOT NULL;

-- 3. 주석 추가 (문서화)
COMMENT ON COLUMN users.phone IS '사용자 전화번호 (선택)';
COMMENT ON COLUMN users.business_number IS '사업자 등록번호 (선택)';
COMMENT ON COLUMN users.address IS '주소 (선택)';
COMMENT ON COLUMN users.address_detail IS '상세 주소 (선택)';
COMMENT ON COLUMN users.business_type IS '사업자 유형: freelancer(프리랜서), individual(개인), corporation(법인)';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Users 테이블 프로필 필드 확장 완료';
END $$;
