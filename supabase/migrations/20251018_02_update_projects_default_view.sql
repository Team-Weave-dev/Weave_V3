-- =====================================================
-- Projects 기본 뷰 변경: list → detail (타입 통일)
-- =====================================================
-- 설명: user_settings 테이블의 projects 컬럼 기본값을 detail로 변경
--       기존 grid 값도 detail로 통일하여 UI-Storage 타입 불일치 해소
-- 작성일: 2025-10-18
-- 의존성: 20250108_15_update_settings_schema.sql

-- 1. projects 컬럼의 기본값 변경
ALTER TABLE user_settings
  ALTER COLUMN projects
  SET DEFAULT '{
    "defaultView": "detail"
  }';

-- 2. 기존 사용자 설정 업데이트
-- list → detail
UPDATE user_settings
SET
  projects = jsonb_set(
    projects,
    '{defaultView}',
    '"detail"'
  ),
  updated_at = NOW()
WHERE
  projects->>'defaultView' = 'list';

-- grid → detail (레거시 값 정리)
UPDATE user_settings
SET
  projects = jsonb_set(
    projects,
    '{defaultView}',
    '"detail"'
  ),
  updated_at = NOW()
WHERE
  projects->>'defaultView' = 'grid';

-- 완료 메시지
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM user_settings
  WHERE projects->>'defaultView' = 'detail';

  RAISE NOTICE '✅ Projects 기본 뷰 변경 완료';
  RAISE NOTICE '   - 새로운 기본값: detail';
  RAISE NOTICE '   - UI-Storage 타입 불일치 해소';
  RAISE NOTICE '   - detail 뷰를 사용하는 사용자 수: %', updated_count;
END $$;
