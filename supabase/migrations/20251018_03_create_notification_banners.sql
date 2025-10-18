-- =====================================================
-- Notification Banners 시스템
-- =====================================================
-- 설명: DB 관리형 공지/알림 배너 시스템
-- 작성일: 2025-10-18
-- 의존성: 20250107_01_users.sql

-- =====================================================
-- 1. notification_banners 테이블 (메인 배너 관리)
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 배너 타입
  type TEXT NOT NULL CHECK (type IN ('notice', 'alert', 'urgent')),

  -- 메시지 내용
  message TEXT NOT NULL,

  -- 표시 설정
  display_duration INTEGER, -- 표시 시간 (초, NULL이면 무제한)
  display_rule TEXT NOT NULL CHECK (display_rule IN ('always', 'user_action', 'dwell_time')),

  -- 표시 규칙 상세 설정
  trigger_action TEXT, -- user_action일 때 트리거 조건 (예: 'page_visit:/dashboard')
  dwell_time_seconds INTEGER, -- dwell_time일 때 필요한 체류 시간

  -- 웹훅 설정
  webhook_url TEXT, -- 웹훅 POST URL
  webhook_button_text TEXT, -- 웹훅 버튼 텍스트 (예: '별점 남기기')

  -- 활성화 및 일정 관리
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- 우선순위 (낮을수록 높은 우선순위, 기본값: 100)
  priority INTEGER DEFAULT 100,

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- 제약 조건: dwell_time일 때는 dwell_time_seconds 필수
  CONSTRAINT check_dwell_time_config CHECK (
    (display_rule != 'dwell_time') OR (dwell_time_seconds IS NOT NULL)
  ),
  -- 제약 조건: user_action일 때는 trigger_action 필수
  CONSTRAINT check_user_action_config CHECK (
    (display_rule != 'user_action') OR (trigger_action IS NOT NULL)
  ),
  -- 제약 조건: 날짜 범위 유효성
  CONSTRAINT check_date_range CHECK (
    (start_date IS NULL) OR (end_date IS NULL) OR (start_date < end_date)
  )
);

-- =====================================================
-- 2. notification_banner_views 테이블 (사용자 조회 기록)
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_banner_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES notification_banners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL 허용 (비인증 사용자)

  -- 조회 정보
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ, -- 사용자가 닫은 시간
  interacted BOOLEAN DEFAULT false, -- 웹훅 액션 수행 여부

  -- 제약 조건: 사용자당 배너당 1개 기록
  CONSTRAINT unique_user_banner_view UNIQUE (banner_id, user_id)
);

-- =====================================================
-- 3. notification_banner_webhook_logs 테이블 (웹훅 로그)
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_banner_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES notification_banners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- 웹훅 요청 정보
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,

  -- 웹훅 응답 정보
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. RLS 활성화
-- =====================================================
ALTER TABLE notification_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_banner_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_banner_webhook_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. notification_banners RLS 정책
-- =====================================================

-- 모든 인증된 사용자는 활성 배너 조회 가능
CREATE POLICY "Enable read access for active banners"
  ON notification_banners FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- 인증된 사용자는 모든 배너 관리 가능 (추후 관리자 권한으로 제한 가능)
CREATE POLICY "Enable full access for authenticated users"
  ON notification_banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. notification_banner_views RLS 정책
-- =====================================================

-- 사용자는 자신의 조회 기록만 조회 가능
CREATE POLICY "Enable read access for own records"
  ON notification_banner_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 조회 기록만 생성 가능
CREATE POLICY "Enable insert for own records"
  ON notification_banner_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 조회 기록만 업데이트 가능
CREATE POLICY "Enable update for own records"
  ON notification_banner_views FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. notification_banner_webhook_logs RLS 정책
-- =====================================================

-- 웹훅 로그는 시스템만 접근 가능 (일반 사용자 접근 불가)
-- service_role 키를 사용하는 서버 사이드에서만 접근

-- =====================================================
-- 8. 인덱스 생성
-- =====================================================

-- notification_banners 인덱스
CREATE INDEX IF NOT EXISTS idx_notification_banners_is_active
  ON notification_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_banners_type
  ON notification_banners(type);
CREATE INDEX IF NOT EXISTS idx_notification_banners_priority
  ON notification_banners(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_banners_dates
  ON notification_banners(start_date, end_date) WHERE is_active = true;

-- notification_banner_views 인덱스
CREATE INDEX IF NOT EXISTS idx_notification_banner_views_banner_id
  ON notification_banner_views(banner_id);
CREATE INDEX IF NOT EXISTS idx_notification_banner_views_user_id
  ON notification_banner_views(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_banner_views_dismissed
  ON notification_banner_views(banner_id, user_id, dismissed_at);

-- notification_banner_webhook_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_notification_banner_webhook_logs_banner_id
  ON notification_banner_webhook_logs(banner_id);
CREATE INDEX IF NOT EXISTS idx_notification_banner_webhook_logs_created_at
  ON notification_banner_webhook_logs(created_at);

-- =====================================================
-- 9. updated_at 자동 업데이트 트리거
-- =====================================================
CREATE TRIGGER update_notification_banners_updated_at
  BEFORE UPDATE ON notification_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. 샘플 데이터 (개발/테스트용)
-- =====================================================
-- 공지사항 예시
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  is_active,
  priority,
  webhook_url,
  webhook_button_text
) VALUES (
  'notice',
  '🎉 Weave 프로젝트 관리 시스템에 오신 것을 환영합니다! 프로젝트 생성부터 시작해보세요.',
  'always',
  true,
  10,
  NULL,
  NULL
);

-- 별점/리뷰 요청 예시
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  dwell_time_seconds,
  is_active,
  priority,
  webhook_url,
  webhook_button_text
) VALUES (
  'alert',
  '⭐ Weave 사용 경험이 어떠신가요? 간단한 별점을 남겨주세요!',
  'dwell_time',
  30,
  true,
  50,
  'https://example.com/api/reviews',
  '별점 남기기'
);

-- 긴급 공지 예시 (비활성)
INSERT INTO notification_banners (
  type,
  message,
  display_rule,
  is_active,
  priority,
  webhook_url,
  webhook_button_text
) VALUES (
  'urgent',
  '🚨 시스템 점검이 예정되어 있습니다. 2025-10-20 02:00 ~ 04:00 (KST)',
  'always',
  false,
  1,
  NULL,
  NULL
);

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Notification Banners 시스템 생성 완료';
  RAISE NOTICE '   - notification_banners 테이블';
  RAISE NOTICE '   - notification_banner_views 테이블';
  RAISE NOTICE '   - notification_banner_webhook_logs 테이블';
  RAISE NOTICE '   - RLS 정책 적용 완료';
  RAISE NOTICE '   - 샘플 데이터 3개 추가';
END $$;
