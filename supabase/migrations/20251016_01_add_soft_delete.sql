-- Soft Delete 패턴 구현
-- 목적: 데이터 복구 가능성 확보, 실수 방지, 감사 추적
-- 영향: users, clients, projects, tasks, events, documents 테이블

-- ====================================================================
-- 1단계: deleted_at 컬럼 추가
-- ====================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ====================================================================
-- 2단계: RLS 정책 업데이트 (Active 데이터만 조회)
-- ====================================================================

-- Projects 정책
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;

CREATE POLICY "Users can view own active projects"
ON projects FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Tasks 정책
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;

CREATE POLICY "Users can view own active tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Tasks 할당 조회 정책 업데이트
DROP POLICY IF EXISTS "Users can view assigned tasks" ON tasks;

CREATE POLICY "Users can view assigned active tasks"
ON tasks FOR SELECT
USING (auth.uid() = assignee_id AND deleted_at IS NULL);

-- Documents 정책
DROP POLICY IF EXISTS "Users can manage own documents" ON documents;

CREATE POLICY "Users can view own active documents"
ON documents FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Events 정책
DROP POLICY IF EXISTS "Users can manage own events" ON events;

CREATE POLICY "Users can view own active events"
ON events FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create events"
ON events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active events"
ON events FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
ON events FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Clients 정책
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;

CREATE POLICY "Users can view own active clients"
ON clients FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create clients"
ON clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active clients"
ON clients FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
ON clients FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- Users 정책 (본인 계정만)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own active profile"
ON users FOR SELECT
USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can update own active profile"
ON users FOR UPDATE
USING (auth.uid() = id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND deleted_at IS NOT NULL);

-- ====================================================================
-- 3단계: Partial Index 추가 (성능 최적화)
-- ====================================================================

-- Active 데이터만 인덱싱
CREATE INDEX IF NOT EXISTS idx_projects_active
ON projects(user_id, status)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_active
ON tasks(user_id, status)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_events_active
ON events(user_id, start_time)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_documents_active
ON documents(user_id, project_id)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_clients_active
ON clients(user_id)
WHERE deleted_at IS NULL;

-- ====================================================================
-- 4단계: Soft Delete 함수
-- ====================================================================

-- 사용자 및 모든 관련 데이터 Soft Delete
CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 사용자 삭제 표시
  UPDATE users SET deleted_at = NOW() WHERE id = p_user_id;

  -- 연관 데이터 삭제 표시
  UPDATE projects SET deleted_at = NOW() WHERE user_id = p_user_id;
  UPDATE tasks SET deleted_at = NOW() WHERE user_id = p_user_id;
  UPDATE events SET deleted_at = NOW() WHERE user_id = p_user_id;
  UPDATE documents SET deleted_at = NOW() WHERE user_id = p_user_id;
  UPDATE clients SET deleted_at = NOW() WHERE user_id = p_user_id;

  -- activity_logs는 보존 (감사 추적)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 프로젝트 및 하위 데이터 Soft Delete
CREATE OR REPLACE FUNCTION soft_delete_project(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE projects SET deleted_at = NOW() WHERE id = p_project_id;
  UPDATE tasks SET deleted_at = NOW() WHERE project_id = p_project_id;
  UPDATE documents SET deleted_at = NOW() WHERE project_id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 5단계: 영구 삭제 함수 (30일 후 자동 정리)
-- ====================================================================

CREATE OR REPLACE FUNCTION permanent_delete_old_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- 30일 이상 된 soft-deleted 데이터 영구 삭제

  -- Users (CASCADE로 모든 관련 데이터 삭제됨)
  DELETE FROM users
  WHERE deleted_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- 고아 데이터 정리 (부모가 삭제된 경우)
  DELETE FROM tasks
  WHERE deleted_at < NOW() - INTERVAL '30 days'
    AND project_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM projects WHERE id = tasks.project_id);

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  DELETE FROM documents
  WHERE deleted_at < NOW() - INTERVAL '30 days'
    AND project_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM projects WHERE id = documents.project_id);

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 코멘트 추가
-- ====================================================================

COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN projects.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN tasks.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN events.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN documents.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN clients.deleted_at IS 'Soft delete timestamp - NULL means active';

COMMENT ON FUNCTION soft_delete_user(UUID) IS 'Soft delete user and all related data';
COMMENT ON FUNCTION soft_delete_project(UUID) IS 'Soft delete project and all related data';
COMMENT ON FUNCTION permanent_delete_old_data() IS 'Permanently delete data older than 30 days (scheduled job)';

-- ====================================================================
-- 사용 예시 및 참고사항
-- ====================================================================

-- Soft Delete 실행:
-- UPDATE projects SET deleted_at = NOW() WHERE id = 'project-id';
-- 또는
-- SELECT soft_delete_project('project-id');

-- 복구:
-- UPDATE projects SET deleted_at = NULL WHERE id = 'project-id';

-- 영구 삭제 스케줄 (pg_cron 사용 시):
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT permanent_delete_old_data()');
