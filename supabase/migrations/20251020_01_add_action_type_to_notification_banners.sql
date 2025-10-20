-- =====================================================
-- Notification Banners - action_type 컬럼 추가
-- =====================================================
-- 설명: 웹훅 액션 타입을 명시적으로 지정하는 컬럼 추가
-- 작성일: 2025-10-20
-- 의존성: 20251018_03_create_notification_banners.sql

-- =====================================================
-- 1. action_type 컬럼 추가
-- =====================================================
ALTER TABLE notification_banners
ADD COLUMN IF NOT EXISTS action_type TEXT;

-- =====================================================
-- 2. 기본값 설정 (기존 데이터는 'participate'로 설정)
-- =====================================================
UPDATE notification_banners
SET action_type = 'participate'
WHERE action_type IS NULL;

-- =====================================================
-- 3. 제약 조건 추가
-- =====================================================
ALTER TABLE notification_banners
ADD CONSTRAINT check_action_type CHECK (
  action_type IN ('review', 'confirm', 'participate')
);

-- =====================================================
-- 4. 웹훅이 있는 배너는 action_type 필수
-- =====================================================
ALTER TABLE notification_banners
ADD CONSTRAINT check_webhook_action_type CHECK (
  (webhook_url IS NULL) OR (action_type IS NOT NULL)
);

-- =====================================================
-- 5. 기존 샘플 데이터 업데이트
-- =====================================================

-- 별점/리뷰 요청 배너를 'review' 타입으로 변경
UPDATE notification_banners
SET action_type = 'review'
WHERE message LIKE '%별점%' OR webhook_button_text LIKE '%별점%';

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ notification_banners 테이블 업데이트 완료';
  RAISE NOTICE '   - action_type 컬럼 추가';
  RAISE NOTICE '   - 제약 조건 추가: review | confirm | participate';
  RAISE NOTICE '   - 기존 데이터 마이그레이션 완료';
END $$;
