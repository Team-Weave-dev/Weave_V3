-- =====================================================
-- Notification Banners - 리셋 주기 기능 추가
-- =====================================================
-- 설명: 배너를 주기적으로 다시 표시하는 기능
-- 작성일: 2025-10-18
-- 의존성: 20251018_03_create_notification_banners.sql

-- 1. reset_period 컬럼 추가
ALTER TABLE notification_banners
ADD COLUMN reset_period TEXT CHECK (reset_period IN ('never', 'daily', 'weekly', 'monthly')) DEFAULT 'never';

-- 2. 기존 배너에 기본값 설정
UPDATE notification_banners
SET reset_period = 'never'
WHERE reset_period IS NULL;

-- 3. 컬럼 설명 추가 (주석)
COMMENT ON COLUMN notification_banners.reset_period IS '배너 리셋 주기: never(한번 닫으면 영구), daily(매일), weekly(매주), monthly(매월)';

-- 4. 예시: 유료 전환 공지 배너 (매일 리셋)
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  reset_period,
  is_active,
  priority,
  webhook_url,
  webhook_button_text
) VALUES (
  'alert',
  '💎 7일 후 유료 플랜으로 자동 전환됩니다. 미리 확인하세요!',
  'always',
  'daily',
  true,
  5,
  NULL,
  NULL
)
ON CONFLICT DO NOTHING;

-- 5. 예시: 주간 업데이트 공지 (매주 리셋)
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  reset_period,
  is_active,
  priority,
  webhook_url,
  webhook_button_text
) VALUES (
  'notice',
  '📢 이번 주 새로운 기능이 추가되었습니다!',
  'always',
  'weekly',
  true,
  30,
  NULL,
  NULL
)
ON CONFLICT DO NOTHING;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ reset_period 컬럼 추가 완료';
  RAISE NOTICE '   - never: 한 번 닫으면 영구적으로 숨김';
  RAISE NOTICE '   - daily: 매일 자정 이후 다시 표시';
  RAISE NOTICE '   - weekly: 매주 월요일 다시 표시';
  RAISE NOTICE '   - monthly: 매월 1일 다시 표시';
END $$;
