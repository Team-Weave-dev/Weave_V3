-- =====================================================
-- Todo Sections 테이블 생성
-- =====================================================
-- 설명: 투두리스트 섹션(폴더) 관리를 위한 테이블 생성
-- 작성일: 2025-10-11
-- 의존성: 20250107_01_users.sql

-- 1. todo_sections 테이블 생성
CREATE TABLE IF NOT EXISTS todo_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 섹션 정보
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_expanded BOOLEAN DEFAULT true,

  -- 스타일 (선택사항)
  color TEXT,
  icon TEXT,

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 제약 조건: 사용자별 섹션명 중복 방지
  CONSTRAINT unique_user_section_name UNIQUE (user_id, name)
);

-- 2. RLS 활성화
ALTER TABLE todo_sections ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책: 사용자는 자신의 섹션만 관리 가능
CREATE POLICY "Enable insert for authenticated users only"
  ON todo_sections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for users based on user_id"
  ON todo_sections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id"
  ON todo_sections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
  ON todo_sections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_todo_sections_user_id ON todo_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_sections_order ON todo_sections(user_id, order_index);

-- 5. updated_at 자동 업데이트 트리거
CREATE TRIGGER update_todo_sections_updated_at
  BEFORE UPDATE ON todo_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ todo_sections 테이블 생성 완료';
END $$;
