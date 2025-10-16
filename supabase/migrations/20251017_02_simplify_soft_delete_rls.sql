-- =====================================================
-- Soft Delete RLS 정책 단순화
-- =====================================================
-- 문제: USING 절의 deleted_at IS NULL 조건이 Soft Delete를 막음
-- 해결: USING 절에서 deleted_at 조건 완전 제거
-- 작성일: 2025-10-17

-- Projects 테이블 정책 재설정
DROP POLICY IF EXISTS "Users can view own active projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own active projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- SELECT: 활성 프로젝트만 조회
CREATE POLICY "Users can view own active projects"
ON projects FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT: 새 프로젝트 생성
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: 모든 자신의 프로젝트 수정 가능 (Soft Delete 포함)
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id)  -- deleted_at 조건 제거!
WITH CHECK (auth.uid() = user_id);  -- 결과 검증도 user_id만

-- Tasks 테이블
DROP POLICY IF EXISTS "Users can view own active tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own active tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "Users can view own active tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Documents 테이블
DROP POLICY IF EXISTS "Users can view own active documents" ON documents;
DROP POLICY IF EXISTS "Users can create documents" ON documents;
DROP POLICY IF EXISTS "Users can update own active documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

CREATE POLICY "Users can view own active documents"
ON documents FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Events 테이블
DROP POLICY IF EXISTS "Users can view own active events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own active events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

CREATE POLICY "Users can view own active events"
ON events FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create events"
ON events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
ON events FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Clients 테이블
DROP POLICY IF EXISTS "Users can view own active clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update own active clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

CREATE POLICY "Users can view own active clients"
ON clients FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create clients"
ON clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
ON clients FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Soft Delete RLS 정책 단순화 완료';
  RAISE NOTICE '📝 UPDATE USING 절에서 deleted_at 조건 제거';
  RAISE NOTICE '👁️ SELECT만 deleted_at IS NULL 필터 유지';
  RAISE NOTICE '🗑️ Soft Delete (UPDATE deleted_at) 이제 작동함';
END $$;
