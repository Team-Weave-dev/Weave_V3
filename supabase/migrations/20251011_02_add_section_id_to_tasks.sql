-- =====================================================
-- Tasks 테이블에 section_id 컬럼 추가
-- =====================================================
-- 설명: tasks 테이블에 todo_sections 테이블 참조 컬럼 추가
-- 작성일: 2025-10-11
-- 의존성: 20251011_01_create_todo_sections.sql

-- 1. section_id 컬럼 추가 (NULL 허용 - 섹션 없는 태스크 가능)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'section_id'
  ) THEN
    ALTER TABLE tasks
    ADD COLUMN section_id UUID REFERENCES todo_sections(id) ON DELETE SET NULL;

    RAISE NOTICE '✅ tasks.section_id 컬럼 추가 완료';
  ELSE
    RAISE NOTICE 'ℹ️ tasks.section_id 컬럼이 이미 존재합니다';
  END IF;
END $$;

-- 2. 인덱스 생성 (섹션별 태스크 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_tasks_section_id ON tasks(section_id);

-- 3. 인덱스 생성 (사용자+섹션별 태스크 조회)
CREATE INDEX IF NOT EXISTS idx_tasks_user_section ON tasks(user_id, section_id);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ tasks 테이블 section_id 컬럼 및 인덱스 추가 완료';
END $$;
