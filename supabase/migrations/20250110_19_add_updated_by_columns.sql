-- =====================================================
-- Add updated_by column to all tables
-- =====================================================
-- 설명: 모든 테이블에 updated_by 컬럼 추가 (DualWrite 동기화 지원)
-- 작성일: 2025-10-10
-- 의존성: 20250107_01_users.sql, 20250107_07_settings.sql

-- 1. user_settings에 updated_by 추가
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 2. projects에 updated_by 추가 (이미 있을 수 있음, IF NOT EXISTS 사용)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 3. tasks에 updated_by 추가
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 4. events에 updated_by 추가
ALTER TABLE events
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 5. clients에 updated_by 추가
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 6. documents에 updated_by 추가
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 7. users에 updated_by 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ updated_by 컬럼 추가 완료 (7개 테이블)';
END $$;
