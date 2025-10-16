-- 자기 참조 외래키 CASCADE 정책 명시
-- 목적: 부모 삭제 시 명확한 동작 정의, 데이터 일관성 보장
-- 영향: tasks, documents 테이블

-- ====================================================================
-- Tasks 테이블 자기 참조 CASCADE
-- ====================================================================

-- 기존 외래키 제약 제거
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_parent_task_id_fkey;

-- CASCADE 정책으로 재생성
-- 부모 태스크 삭제 시 하위 태스크도 함께 삭제
ALTER TABLE tasks
ADD CONSTRAINT tasks_parent_task_id_fkey
FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
ON DELETE CASCADE;

-- 자기 참조 방지 (무한 루프 방지)
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_no_self_reference;

ALTER TABLE tasks
ADD CONSTRAINT tasks_no_self_reference
CHECK (id != parent_task_id);

-- ====================================================================
-- Documents 테이블 자기 참조 CASCADE
-- ====================================================================

-- 기존 외래키 제약 제거
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_parent_document_id_fkey;

-- CASCADE 정책으로 재생성
-- 부모 문서 삭제 시 하위 버전도 함께 삭제
ALTER TABLE documents
ADD CONSTRAINT documents_parent_document_id_fkey
FOREIGN KEY (parent_document_id) REFERENCES documents(id)
ON DELETE CASCADE;

-- 자기 참조 방지
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_no_self_reference;

ALTER TABLE documents
ADD CONSTRAINT documents_no_self_reference
CHECK (id != parent_document_id);

-- ====================================================================
-- 코멘트 추가
-- ====================================================================

COMMENT ON CONSTRAINT tasks_parent_task_id_fkey ON tasks IS 'Parent task deletion cascades to child tasks';
COMMENT ON CONSTRAINT tasks_no_self_reference ON tasks IS 'Prevents task from referencing itself';

COMMENT ON CONSTRAINT documents_parent_document_id_fkey ON documents IS 'Parent document deletion cascades to child versions';
COMMENT ON CONSTRAINT documents_no_self_reference ON documents IS 'Prevents document from referencing itself';

-- ====================================================================
-- 검증 쿼리 (문제 확인용)
-- ====================================================================

-- 순환 참조 확인 (실행 전 검증)
-- SELECT id, parent_task_id FROM tasks WHERE id = parent_task_id;
-- SELECT id, parent_document_id FROM documents WHERE id = parent_document_id;

-- CASCADE 동작 테스트 (개발 환경에서만)
-- BEGIN;
-- INSERT INTO tasks (id, user_id, title) VALUES ('parent-id', 'user-id', 'Parent Task');
-- INSERT INTO tasks (id, user_id, title, parent_task_id) VALUES ('child-id', 'user-id', 'Child Task', 'parent-id');
-- DELETE FROM tasks WHERE id = 'parent-id';
-- SELECT * FROM tasks WHERE id = 'child-id'; -- Should return empty
-- ROLLBACK;
