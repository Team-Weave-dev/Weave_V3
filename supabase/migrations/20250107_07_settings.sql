-- User Settings 테이블 생성
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 대시보드 설정
  dashboard JSONB DEFAULT '{
    "layout": "grid",
    "widgets": [],
    "theme": "light",
    "showSidebar": true,
    "compactView": false
  }',

  -- 사용자 환경설정
  preferences JSONB DEFAULT '{
    "language": "ko",
    "timezone": "Asia/Seoul",
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "24h",
    "currency": "KRW",
    "firstDayOfWeek": 1,
    "notifications": {
      "email": true,
      "push": false,
      "desktop": true,
      "taskReminders": true,
      "projectUpdates": true
    },
    "privacy": {
      "profileVisibility": "private",
      "showEmail": false,
      "showPhone": false
    }
  }',

  -- UI 설정
  ui_settings JSONB DEFAULT '{
    "sidebarCollapsed": false,
    "tableRowsPerPage": 10,
    "defaultView": "list",
    "colorScheme": "blue",
    "fontSize": "medium",
    "density": "normal"
  }',

  -- 프로젝트 설정
  project_settings JSONB DEFAULT '{
    "defaultStatus": "planning",
    "defaultPriority": "medium",
    "autoArchive": false,
    "autoArchiveDays": 90,
    "projectNumberFormat": "PRJ-{YYYY}-{0000}",
    "showCompletedProjects": true
  }',

  -- 태스크 설정
  task_settings JSONB DEFAULT '{
    "defaultPriority": "medium",
    "autoComplete": false,
    "showCompletedTasks": false,
    "taskListView": "kanban",
    "groupBy": "status",
    "sortBy": "priority"
  }',

  -- 캘린더 설정
  calendar_settings JSONB DEFAULT '{
    "defaultView": "month",
    "weekStartDay": 1,
    "showWeekNumbers": false,
    "showWeekends": true,
    "workingHours": {
      "start": "09:00",
      "end": "18:00"
    },
    "defaultEventDuration": 60,
    "defaultReminder": 15
  }',

  -- 보안 설정
  security_settings JSONB DEFAULT '{
    "twoFactorEnabled": false,
    "sessionTimeout": 43200,
    "passwordChangeRequired": false,
    "lastPasswordChange": null
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- RLS 활성화
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 설정만 관리 가능
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 사용자 생성 시 기본 설정 자동 생성
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_settings_on_signup
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();