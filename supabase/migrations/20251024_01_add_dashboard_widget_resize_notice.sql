-- =====================================================
-- 대시보드 위젯 배열 변경 안내 배너 추가
-- =====================================================
-- 설명: 브라우저 크기 조절 시 위젯 배열 변경 안내 배너
-- 작성일: 2025-10-24
-- 의존성: 20251018_03_create_notification_banners.sql

-- =====================================================
-- 대시보드 위젯 리사이즈 안내 배너
-- =====================================================
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  trigger_action,
  is_active,
  priority,
  webhook_url,
  webhook_button_text
) VALUES (
  'notice',
  '📱 브라우저 크기 조절 시, 위젯 배열이 변경될 수 있습니다. 프리셋 저장을 반드시 해주세요.',
  'user_action',
  'page_visit:/dashboard',
  true,
  20,
  NULL,
  NULL
);

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ 대시보드 위젯 리사이즈 안내 배너 추가 완료';
  RAISE NOTICE '   - 타입: notice';
  RAISE NOTICE '   - 표시 규칙: 대시보드 페이지 방문 시';
  RAISE NOTICE '   - 우선순위: 20';
END $$;
