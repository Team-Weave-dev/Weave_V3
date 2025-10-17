-- Fix: CTE scope issue in circular reference check
-- 문제: task_tree CTE가 스코프를 벗어난 후 참조되어 "relation does not exist" 오류 발생
-- 해결: max_depth 검사를 CTE 내부에서 계산하도록 수정

-- ====================================================================
-- 1단계: Tasks 순환 참조 검사 함수 수정
-- ====================================================================

CREATE OR REPLACE FUNCTION check_task_cycle()
RETURNS TRIGGER AS $$
DECLARE
  cycle_detected BOOLEAN;
  max_depth_reached BOOLEAN;
  max_depth CONSTANT INTEGER := 10;
BEGIN
  -- parent_task_id가 NULL이면 검사 불필요
  IF NEW.parent_task_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- 재귀 CTE로 부모 체인 탐색 (순환 참조와 최대 깊이를 동시에 검사)
  WITH RECURSIVE task_tree AS (
    -- 초기: 지정된 부모 태스크부터 시작
    SELECT
      id,
      parent_task_id,
      1 as depth
    FROM tasks
    WHERE id = NEW.parent_task_id

    UNION ALL

    -- 재귀: 부모의 부모를 계속 탐색
    SELECT
      t.id,
      t.parent_task_id,
      tt.depth + 1
    FROM tasks t
    INNER JOIN task_tree tt ON t.id = tt.parent_task_id
    WHERE tt.depth < max_depth  -- 무한 루프 방지
  )
  -- 순환 참조와 최대 깊이를 동시에 검사
  SELECT
    EXISTS(SELECT 1 FROM task_tree WHERE id = NEW.id),
    MAX(depth) >= max_depth
  INTO cycle_detected, max_depth_reached
  FROM task_tree;

  -- 순환 참조 발견 시 에러
  IF cycle_detected THEN
    RAISE EXCEPTION 'Circular reference detected in task hierarchy: task % cannot have parent %',
      NEW.id, NEW.parent_task_id
      USING HINT = 'Check parent task chain for cycles';
  END IF;

  -- 최대 깊이 초과 경고 (선택적)
  IF max_depth_reached THEN
    RAISE WARNING 'Task hierarchy depth limit (%) reached. Consider flattening the structure.',
      max_depth;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 2단계: Documents 순환 참조 검사 함수 수정
-- ====================================================================

CREATE OR REPLACE FUNCTION check_document_cycle()
RETURNS TRIGGER AS $$
DECLARE
  cycle_detected BOOLEAN;
  max_depth_reached BOOLEAN;
  max_depth CONSTANT INTEGER := 10;
BEGIN
  -- parent_document_id가 NULL이면 검사 불필요
  IF NEW.parent_document_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- 재귀 CTE로 부모 체인 탐색 (순환 참조와 최대 깊이를 동시에 검사)
  WITH RECURSIVE document_tree AS (
    -- 초기: 지정된 부모 문서부터 시작
    SELECT
      id,
      parent_document_id,
      1 as depth
    FROM documents
    WHERE id = NEW.parent_document_id

    UNION ALL

    -- 재귀: 부모의 부모를 계속 탐색
    SELECT
      d.id,
      d.parent_document_id,
      dt.depth + 1
    FROM documents d
    INNER JOIN document_tree dt ON d.id = dt.parent_document_id
    WHERE dt.depth < max_depth  -- 무한 루프 방지
  )
  -- 순환 참조와 최대 깊이를 동시에 검사
  SELECT
    EXISTS(SELECT 1 FROM document_tree WHERE id = NEW.id),
    MAX(depth) >= max_depth
  INTO cycle_detected, max_depth_reached
  FROM document_tree;

  -- 순환 참조 발견 시 에러
  IF cycle_detected THEN
    RAISE EXCEPTION 'Circular reference detected in document hierarchy: document % cannot have parent %',
      NEW.id, NEW.parent_document_id
      USING HINT = 'Check parent document chain for cycles';
  END IF;

  -- 최대 깊이 초과 경고 (선택적)
  IF max_depth_reached THEN
    RAISE WARNING 'Document hierarchy depth limit (%) reached.',
      max_depth;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 코멘트
-- ====================================================================

COMMENT ON FUNCTION check_task_cycle() IS 'Prevents circular references in task parent-child relationships (fixed CTE scope issue)';
COMMENT ON FUNCTION check_document_cycle() IS 'Prevents circular references in document parent-child relationships (fixed CTE scope issue)';
