-- =====================================================
-- User Settings 스키마 재설계
-- =====================================================
-- 설명: Storage Settings 엔티티와 1:1 매핑되도록 스키마 재설계
-- 작성일: 2025-10-08
-- 의존성: 20250107_07_settings.sql

-- 1. 기존 트리거 및 함수 삭제
DROP TRIGGER IF EXISTS create_user_settings_on_signup ON users;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP FUNCTION IF EXISTS create_default_user_settings();

-- 2. 기존 테이블 삭제
DROP TABLE IF EXISTS user_settings CASCADE;

-- 3. 새 user_settings 테이블 생성 (Storage Settings 엔티티 매핑)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Dashboard Settings
  -- Storage: dashboard: DashboardSettings
  dashboard JSONB NOT NULL DEFAULT '{
    "layout": {
      "widgets": [],
      "columns": 12,
      "rowHeight": 40,
      "gap": 16
    }
  }',

  -- Calendar Settings
  -- Storage: calendar: CalendarSettings
  calendar JSONB NOT NULL DEFAULT '{
    "defaultView": "month",
    "weekStartsOn": 0
  }',

  -- Project Settings
  -- Storage: projects: ProjectSettings
  projects JSONB NOT NULL DEFAULT '{
    "defaultView": "list"
  }',

  -- Notification Settings
  -- Storage: notifications: NotificationSettings
  notifications JSONB NOT NULL DEFAULT '{}',

  -- User Preferences
  -- Storage: preferences: UserPreferences
  preferences JSONB NOT NULL DEFAULT '{
    "language": "ko",
    "timezone": "Asia/Seoul"
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 4. RLS 활성화
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 생성
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- 7. updated_at 자동 업데이트 트리거
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 사용자 생성 시 기본 설정 자동 생성 함수
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 사용자 생성 시 기본 설정 자동 생성 트리거
CREATE TRIGGER create_user_settings_on_signup
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ User Settings 스키마 재설계 완료 (Storage 엔티티 매핑)';
END $$;
