-- =====================================================
-- Soft Delete RLS 정책 수정
-- =====================================================
-- 문제: deleted_at 필드를 NULL → NOT NULL로 변경할 수 없음
-- 해결: UPDATE 정책의 WITH CHECK 조건을 완화
-- 작성일: 2025-10-17

-- Projects 테이블 정책 수정
DROP POLICY IF EXISTS "Users can update own active projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- 1. 활성 프로젝트 UPDATE 정책 (일반 수정용)
CREATE POLICY "Users can update own active projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);  -- deleted_at 변경 허용

-- 2. Soft Delete 정책은 제거 (일반 UPDATE 정책으로 충분)
-- 삭제는 deleted_at을 NULL → NOW()로 변경하는 일반 UPDATE

-- Tasks 테이블 정책 수정
DROP POLICY IF EXISTS "Users can update own active tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "Users can update own active tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Documents 테이블 정책 수정
DROP POLICY IF EXISTS "Users can update own active documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

CREATE POLICY "Users can update own active documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Events 테이블 정책 수정
DROP POLICY IF EXISTS "Users can update own active events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

CREATE POLICY "Users can update own active events"
ON events FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Clients 테이블 정책 수정
DROP POLICY IF EXISTS "Users can update own active clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

CREATE POLICY "Users can update own active clients"
ON clients FOR UPDATE
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Soft Delete RLS 정책 수정 완료';
  RAISE NOTICE '📝 UPDATE 정책의 WITH CHECK 조건 완화 (deleted_at 변경 허용)';
  RAISE NOTICE '🗑️ 별도의 DELETE 정책 제거 (일반 UPDATE로 통합)';
END $$;
