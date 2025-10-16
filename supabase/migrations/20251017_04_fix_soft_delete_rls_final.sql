-- =====================================================
-- Soft Delete RLS 정책 최종 수정
-- =====================================================
-- 문제: 여러 마이그레이션으로 인한 정책 충돌
-- 해결: 모든 기존 정책 완전 제거 후 단순한 정책 재생성
-- 작성일: 2025-10-17

-- =====================================================
-- 1단계: 기존 정책 완전 제거
-- =====================================================

-- Projects 테이블의 모든 RLS 정책 제거
DROP POLICY IF EXISTS "Users can view own active projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own active projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

-- =====================================================
-- 2단계: 새로운 정책 생성 (단순화)
-- =====================================================

-- SELECT: 활성 프로젝트만 조회
CREATE POLICY "projects_select_active"
ON projects FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
);

-- INSERT: 새 프로젝트 생성
CREATE POLICY "projects_insert"
ON projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: 모든 자신의 프로젝트 수정 가능 (Soft Delete 포함)
-- USING: 수정 권한 검증 (deleted_at 무관)
-- WITH CHECK: 결과 검증 (user_id만, deleted_at 무관)
CREATE POLICY "projects_update"
ON projects FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3단계: Tasks 테이블
-- =====================================================

DROP POLICY IF EXISTS "Users can view own active tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view assigned active tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own active tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;

CREATE POLICY "tasks_select_active"
ON tasks FOR SELECT
TO authenticated
USING (
    (auth.uid() = user_id OR auth.uid() = assignee_id)
    AND deleted_at IS NULL
);

CREATE POLICY "tasks_insert"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update"
ON tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4단계: Documents 테이블
-- =====================================================

DROP POLICY IF EXISTS "Users can view own active documents" ON documents;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can create documents" ON documents;
DROP POLICY IF EXISTS "Users can update own active documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
DROP POLICY IF EXISTS "Users can manage own documents" ON documents;

CREATE POLICY "documents_select_active"
ON documents FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
);

CREATE POLICY "documents_insert"
ON documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update"
ON documents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5단계: Events 테이블
-- =====================================================

DROP POLICY IF EXISTS "Users can view own active events" ON events;
DROP POLICY IF EXISTS "Users can view own events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own active events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;
DROP POLICY IF EXISTS "Users can manage own events" ON events;

CREATE POLICY "events_select_active"
ON events FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
);

CREATE POLICY "events_insert"
ON events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_update"
ON events FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6단계: Clients 테이블
-- =====================================================

DROP POLICY IF EXISTS "Users can view own active clients" ON clients;
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update own active clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;

CREATE POLICY "clients_select_active"
ON clients FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    AND deleted_at IS NULL
);

CREATE POLICY "clients_insert"
ON clients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "clients_update"
ON clients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Soft Delete RLS 정책 최종 수정 완료';
  RAISE NOTICE '🗑️ 모든 기존 정책 제거됨';
  RAISE NOTICE '✨ 새로운 단순 정책 적용됨';
  RAISE NOTICE '📝 UPDATE 정책: USING (user_id만) + WITH CHECK (user_id만)';
  RAISE NOTICE '👁️ SELECT 정책: deleted_at IS NULL 필터 유지';
  RAISE NOTICE '🎯 Soft Delete (UPDATE deleted_at) 이제 작동해야 함';
END $$;
