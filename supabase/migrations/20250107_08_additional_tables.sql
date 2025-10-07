-- Activity Logs 테이블 (활동 기록)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 활동 정보
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  resource_name TEXT,

  -- 상세 정보
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,

  -- 결과
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 활동 로그만 볼 수 있음
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);


-- Migration Status 테이블 (마이그레이션 상태 추적)
CREATE TABLE IF NOT EXISTS migration_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 마이그레이션 정보
  version TEXT NOT NULL,
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 소스 데이터 정보
  source_data JSONB DEFAULT '{}',

  -- 결과
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'rolled_back')),
  error_details JSONB,

  -- 통계
  duration_ms INTEGER,
  records_migrated INTEGER,
  records_failed INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, version)
);

-- RLS 활성화
ALTER TABLE migration_status ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 마이그레이션 상태만 볼 수 있음
CREATE POLICY "Users can view own migration status"
  ON migration_status FOR SELECT
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_migration_status_user_id ON migration_status(user_id);
CREATE INDEX IF NOT EXISTS idx_migration_status_version ON migration_status(version);


-- File Uploads 테이블 (파일 업로드 관리)
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 연관 정보
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,

  -- 파일 정보
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,

  -- Storage 정보
  bucket_name TEXT DEFAULT 'uploads',
  storage_key TEXT NOT NULL,
  public_url TEXT,

  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  tags TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 파일만 관리 가능
CREATE POLICY "Users can manage own files"
  ON file_uploads FOR ALL
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_project_id ON file_uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_task_id ON file_uploads(task_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_document_id ON file_uploads(document_id);


-- Notifications 테이블 (알림)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 알림 정보
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,

  -- 연관 정보
  resource_type TEXT,
  resource_id UUID,
  action_url TEXT,

  -- 상태
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- 우선순위
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- 메타데이터
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- RLS 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 알림만 관리 가능
CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);


-- 프로젝트 번호 시퀀스
CREATE SEQUENCE IF NOT EXISTS project_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 1;

-- 프로젝트 번호 생성 함수
CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  project_no TEXT;
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');
  next_number := nextval('project_number_seq');
  project_no := 'PRJ-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');

  RETURN project_no;
END;
$$ language 'plpgsql';


-- 데이터 통계 뷰 (대시보드용)
CREATE OR REPLACE VIEW user_statistics AS
SELECT
  u.id as user_id,
  (SELECT COUNT(*) FROM projects WHERE user_id = u.id) as total_projects,
  (SELECT COUNT(*) FROM projects WHERE user_id = u.id AND status = 'completed') as completed_projects,
  (SELECT COUNT(*) FROM projects WHERE user_id = u.id AND status = 'in_progress') as active_projects,
  (SELECT COUNT(*) FROM tasks WHERE user_id = u.id) as total_tasks,
  (SELECT COUNT(*) FROM tasks WHERE user_id = u.id AND status = 'completed') as completed_tasks,
  (SELECT COUNT(*) FROM events WHERE user_id = u.id) as total_events,
  (SELECT COUNT(*) FROM events WHERE user_id = u.id AND start_time >= NOW()) as upcoming_events,
  (SELECT COUNT(*) FROM clients WHERE user_id = u.id) as total_clients,
  (SELECT COUNT(*) FROM documents WHERE user_id = u.id) as total_documents
FROM users u;