-- 복합 인덱스 추가 (성능 최적화)
-- 목적: 대시보드, 날짜 범위 쿼리, 정렬 성능 2-5배 향상
-- 영향: projects, tasks, events 테이블

-- ====================================================================
-- 대시보드 쿼리 최적화
-- ====================================================================

-- 프로젝트 대시보드: 사용자별 상태 필터링
-- SELECT * FROM projects WHERE user_id = ? AND status = ? AND deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_projects_user_status
ON projects(user_id, status)
WHERE deleted_at IS NULL;

-- 태스크 대시보드: 사용자별 상태 필터링
-- SELECT * FROM tasks WHERE user_id = ? AND status = ? AND deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_tasks_user_status
ON tasks(user_id, status)
WHERE deleted_at IS NULL;

-- 프로젝트별 태스크 조회: 상태 필터링
-- SELECT * FROM tasks WHERE project_id = ? AND status != 'completed'
CREATE INDEX IF NOT EXISTS idx_tasks_project_status
ON tasks(project_id, status);

-- ====================================================================
-- 날짜 범위 쿼리 최적화
-- ====================================================================

-- 이벤트 캘린더 뷰: 사용자별 날짜 범위 + 상태
-- SELECT * FROM events WHERE user_id = ? AND start_time >= ? AND start_time <= ? AND status = ?
CREATE INDEX IF NOT EXISTS idx_events_user_date_status
ON events(user_id, start_time, status);

-- 태스크 마감일 알림: 사용자별 마감일 범위 + 상태
-- SELECT * FROM tasks WHERE user_id = ? AND due_date < NOW() + INTERVAL '7 days' AND status != 'completed'
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date
ON tasks(user_id, due_date, status)
WHERE due_date IS NOT NULL;

-- ====================================================================
-- 정렬 최적화
-- ====================================================================

-- 프로젝트 목록: 최신순 정렬
-- SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_projects_user_created
ON projects(user_id, created_at DESC);

-- 태스크 목록: 최신순 정렬
-- SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_tasks_user_created
ON tasks(user_id, created_at DESC);

-- 이벤트 목록: 시작 시간 정렬
-- SELECT * FROM events WHERE user_id = ? ORDER BY start_time ASC
CREATE INDEX IF NOT EXISTS idx_events_user_start_time
ON events(user_id, start_time ASC);

-- ====================================================================
-- 프로젝트-섹션 연계 최적화
-- ====================================================================

-- 태스크 섹션별 조회 (투두 리스트)
-- SELECT * FROM tasks WHERE user_id = ? AND section_id = ?
CREATE INDEX IF NOT EXISTS idx_tasks_user_section
ON tasks(user_id, section_id)
WHERE section_id IS NOT NULL;

-- 섹션 정렬
-- SELECT * FROM todo_sections WHERE user_id = ? ORDER BY order_index
CREATE INDEX IF NOT EXISTS idx_todo_sections_order
ON todo_sections(user_id, order_index);

-- ====================================================================
-- 코멘트 추가
-- ====================================================================

COMMENT ON INDEX idx_projects_user_status IS 'Dashboard query optimization - user projects by status (active only)';
COMMENT ON INDEX idx_tasks_user_status IS 'Dashboard query optimization - user tasks by status (active only)';
COMMENT ON INDEX idx_tasks_project_status IS 'Project detail query optimization - tasks by status';

COMMENT ON INDEX idx_events_user_date_status IS 'Calendar view optimization - events by date range and status';
COMMENT ON INDEX idx_tasks_user_due_date IS 'Due date alerts optimization - tasks with upcoming deadlines';

COMMENT ON INDEX idx_projects_user_created IS 'Project list sorting optimization - newest first';
COMMENT ON INDEX idx_tasks_user_created IS 'Task list sorting optimization - newest first';
COMMENT ON INDEX idx_events_user_start_time IS 'Event list sorting optimization - chronological order';

COMMENT ON INDEX idx_tasks_user_section IS 'Todo list optimization - tasks by section';
COMMENT ON INDEX idx_todo_sections_order IS 'Section list optimization - ordered display';

-- ====================================================================
-- 성능 예상 효과
-- ====================================================================

-- 대시보드 로딩: 2-5배 향상
-- SELECT * FROM projects WHERE user_id = ? AND status = 'in_progress'
-- Before: Sequential Scan (100ms)
-- After: Index Scan (20ms)

-- 캘린더 뷰: 3-10배 향상
-- SELECT * FROM events WHERE user_id = ? AND start_time >= '2025-10-01' AND start_time <= '2025-10-31'
-- Before: Sequential Scan + Filter (150ms)
-- After: Index Scan (15ms)

-- 마감일 알림: 5-15배 향상
-- SELECT * FROM tasks WHERE user_id = ? AND due_date < NOW() + INTERVAL '7 days' AND status != 'completed'
-- Before: Sequential Scan + Filter (200ms)
-- After: Index Scan (15ms)

-- ====================================================================
-- 인덱스 사용률 모니터링 쿼리
-- ====================================================================

-- 인덱스 사용 통계 확인
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename IN ('projects', 'tasks', 'events', 'todo_sections')
-- ORDER BY idx_scan DESC;

-- 인덱스 크기 확인
-- SELECT
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
-- FROM pg_stat_user_indexes
-- WHERE tablename IN ('projects', 'tasks', 'events', 'todo_sections')
-- ORDER BY pg_relation_size(indexrelid) DESC;
