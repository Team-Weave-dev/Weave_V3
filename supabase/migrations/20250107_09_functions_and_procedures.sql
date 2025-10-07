-- ============================================
-- 비즈니스 로직 함수 및 저장 프로시저
-- ============================================

-- 프로젝트 완료 처리 함수 (트랜잭션)
CREATE OR REPLACE FUNCTION complete_project(
  p_project_id UUID,
  p_user_id UUID
)
RETURNS projects AS $$
DECLARE
  v_project projects;
BEGIN
  -- 프로젝트 존재 및 권한 확인
  SELECT * INTO v_project
  FROM projects
  WHERE id = p_project_id AND user_id = p_user_id
  FOR UPDATE;

  IF v_project IS NULL THEN
    RAISE EXCEPTION 'Project not found or access denied';
  END IF;

  IF v_project.status = 'completed' THEN
    RAISE EXCEPTION 'Project is already completed';
  END IF;

  -- 프로젝트 상태 업데이트
  UPDATE projects
  SET
    status = 'completed',
    progress = 100,
    payment_progress = COALESCE(payment_progress, 100),
    modified_date = NOW()
  WHERE id = p_project_id
  RETURNING * INTO v_project;

  -- 관련 태스크 완료 처리
  UPDATE tasks
  SET
    status = 'completed',
    completed_at = NOW()
  WHERE project_id = p_project_id
    AND status NOT IN ('completed', 'cancelled');

  -- WBS 태스크 모두 완료 처리
  UPDATE projects
  SET wbs_tasks = (
    SELECT jsonb_agg(
      CASE
        WHEN task->>'status' != 'completed'
        THEN task || jsonb_build_object('status', 'completed', 'completedAt', NOW())
        ELSE task
      END
    )
    FROM jsonb_array_elements(wbs_tasks) AS task
  )
  WHERE id = p_project_id;

  -- 활동 로그 기록
  INSERT INTO activity_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    p_user_id,
    'project_completed',
    'project',
    p_project_id,
    jsonb_build_object(
      'project_name', v_project.name,
      'completion_date', NOW()
    )
  );

  RETURN v_project;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 프로젝트별 진행 상태 계산 함수
CREATE OR REPLACE FUNCTION calculate_project_statistics(p_project_id UUID)
RETURNS TABLE (
  total_tasks INTEGER,
  completed_tasks INTEGER,
  pending_tasks INTEGER,
  overdue_tasks INTEGER,
  task_completion_rate NUMERIC,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  efficiency_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_tasks,
    COUNT(*) FILTER (WHERE status != 'completed' AND due_date < NOW())::INTEGER as overdue_tasks,
    CASE
      WHEN COUNT(*) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)) * 100, 2)
      ELSE 0
    END as task_completion_rate,
    COALESCE(SUM(estimated_hours), 0) as estimated_hours,
    COALESCE(SUM(actual_hours), 0) as actual_hours,
    CASE
      WHEN COALESCE(SUM(actual_hours), 0) > 0 AND COALESCE(SUM(estimated_hours), 0) > 0
      THEN ROUND((SUM(estimated_hours) / SUM(actual_hours)) * 100, 2)
      ELSE 100
    END as efficiency_rate
  FROM tasks
  WHERE project_id = p_project_id;
END;
$$ LANGUAGE plpgsql STABLE;


-- 반복 이벤트 생성 함수
CREATE OR REPLACE FUNCTION generate_recurring_events(
  p_event_id UUID,
  p_until_date DATE DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_event events;
  v_recurrence JSONB;
  v_frequency TEXT;
  v_interval INTEGER;
  v_count INTEGER := 0;
  v_max_occurrences INTEGER := 365; -- 최대 1년치
  v_current_date TIMESTAMPTZ;
  v_end_date DATE;
BEGIN
  -- 원본 이벤트 조회
  SELECT * INTO v_event FROM events WHERE id = p_event_id;

  IF v_event IS NULL OR v_event.recurrence IS NULL THEN
    RETURN 0;
  END IF;

  v_recurrence := v_event.recurrence;
  v_frequency := v_recurrence->>'frequency'; -- daily, weekly, monthly, yearly
  v_interval := COALESCE((v_recurrence->>'interval')::INTEGER, 1);

  -- 종료 날짜 결정
  v_end_date := COALESCE(
    p_until_date,
    v_event.recurrence_end,
    (NOW() + INTERVAL '1 year')::DATE
  );

  v_current_date := v_event.start_time;

  -- 반복 이벤트 생성
  WHILE v_count < v_max_occurrences AND v_current_date::DATE <= v_end_date LOOP
    -- 다음 발생일 계산
    CASE v_frequency
      WHEN 'daily' THEN
        v_current_date := v_current_date + (v_interval || ' days')::INTERVAL;
      WHEN 'weekly' THEN
        v_current_date := v_current_date + (v_interval || ' weeks')::INTERVAL;
      WHEN 'monthly' THEN
        v_current_date := v_current_date + (v_interval || ' months')::INTERVAL;
      WHEN 'yearly' THEN
        v_current_date := v_current_date + (v_interval || ' years')::INTERVAL;
      ELSE
        EXIT; -- 알 수 없는 빈도
    END CASE;

    -- 예외 날짜 확인
    IF v_current_date::DATE = ANY(v_event.recurrence_exceptions) THEN
      CONTINUE;
    END IF;

    -- 새 이벤트 생성
    INSERT INTO events (
      user_id, project_id, client_id,
      title, description, location,
      start_time, end_time, all_day,
      type, status, color, icon,
      reminders, attendees, metadata,
      tags, is_private, is_busy
    ) VALUES (
      v_event.user_id, v_event.project_id, v_event.client_id,
      v_event.title, v_event.description, v_event.location,
      v_current_date,
      v_current_date + (v_event.end_time - v_event.start_time),
      v_event.all_day,
      v_event.type, v_event.status, v_event.color, v_event.icon,
      v_event.reminders, v_event.attendees,
      v_event.metadata || jsonb_build_object('recurring_parent_id', p_event_id),
      v_event.tags, v_event.is_private, v_event.is_busy
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;


-- 데이터 무결성 체크 함수
CREATE OR REPLACE FUNCTION check_data_integrity(p_user_id UUID)
RETURNS TABLE (
  entity TEXT,
  total_count INTEGER,
  orphaned_count INTEGER,
  invalid_count INTEGER,
  issues JSONB
) AS $$
BEGIN
  RETURN QUERY

  -- Projects 체크
  SELECT
    'projects'::TEXT as entity,
    COUNT(*)::INTEGER as total_count,
    COUNT(*) FILTER (WHERE client_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM clients WHERE id = projects.client_id
    ))::INTEGER as orphaned_count,
    COUNT(*) FILTER (WHERE progress < 0 OR progress > 100)::INTEGER as invalid_count,
    jsonb_build_object(
      'missing_clients', array_agg(DISTINCT client_id) FILTER (
        WHERE client_id IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM clients WHERE id = projects.client_id
        )
      )
    ) as issues
  FROM projects
  WHERE user_id = p_user_id

  UNION ALL

  -- Tasks 체크
  SELECT
    'tasks'::TEXT as entity,
    COUNT(*)::INTEGER as total_count,
    COUNT(*) FILTER (WHERE project_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM projects WHERE id = tasks.project_id
    ))::INTEGER as orphaned_count,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL AND status != 'completed')::INTEGER as invalid_count,
    jsonb_build_object(
      'missing_projects', array_agg(DISTINCT project_id) FILTER (
        WHERE project_id IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM projects WHERE id = tasks.project_id
        )
      )
    ) as issues
  FROM tasks
  WHERE user_id = p_user_id

  UNION ALL

  -- Documents 체크
  SELECT
    'documents'::TEXT as entity,
    COUNT(*)::INTEGER as total_count,
    COUNT(*) FILTER (WHERE project_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM projects WHERE id = documents.project_id
    ))::INTEGER as orphaned_count,
    0::INTEGER as invalid_count,
    jsonb_build_object(
      'missing_projects', array_agg(DISTINCT project_id) FILTER (
        WHERE project_id IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM projects WHERE id = documents.project_id
        )
      )
    ) as issues
  FROM documents
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;


-- 대시보드 통계 조회 함수
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
  projects_total INTEGER,
  projects_active INTEGER,
  projects_completed INTEGER,
  tasks_total INTEGER,
  tasks_pending INTEGER,
  tasks_overdue INTEGER,
  events_today INTEGER,
  events_this_week INTEGER,
  clients_active INTEGER,
  documents_recent INTEGER,
  avg_project_progress NUMERIC,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id)::INTEGER as projects_total,
    (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id AND status = 'in_progress')::INTEGER as projects_active,
    (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id AND status = 'completed')::INTEGER as projects_completed,
    (SELECT COUNT(*) FROM tasks WHERE user_id = p_user_id)::INTEGER as tasks_total,
    (SELECT COUNT(*) FROM tasks WHERE user_id = p_user_id AND status = 'pending')::INTEGER as tasks_pending,
    (SELECT COUNT(*) FROM tasks WHERE user_id = p_user_id AND status != 'completed' AND due_date < NOW())::INTEGER as tasks_overdue,
    (SELECT COUNT(*) FROM events WHERE user_id = p_user_id AND DATE(start_time) = CURRENT_DATE)::INTEGER as events_today,
    (SELECT COUNT(*) FROM events WHERE user_id = p_user_id AND start_time BETWEEN NOW() AND NOW() + INTERVAL '7 days')::INTEGER as events_this_week,
    (SELECT COUNT(*) FROM clients WHERE user_id = p_user_id AND status = 'active')::INTEGER as clients_active,
    (SELECT COUNT(*) FROM documents WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '7 days')::INTEGER as documents_recent,
    (SELECT AVG(progress) FROM projects WHERE user_id = p_user_id AND status = 'in_progress')::NUMERIC as avg_project_progress,
    (SELECT COALESCE(SUM(total_amount), 0) FROM projects WHERE user_id = p_user_id AND payment_status = 'paid')::NUMERIC as total_revenue;
END;
$$ LANGUAGE plpgsql STABLE;


-- 검색 함수 (전체 텍스트 검색)
CREATE OR REPLACE FUNCTION search_all(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  description TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  -- 프로젝트 검색
  SELECT
    'project'::TEXT as entity_type,
    id as entity_id,
    name as title,
    description,
    ts_rank(to_tsvector('simple', name || ' ' || COALESCE(description, '')), plainto_tsquery('simple', p_query)) as relevance
  FROM projects
  WHERE user_id = p_user_id
    AND (name ILIKE '%' || p_query || '%' OR description ILIKE '%' || p_query || '%')

  UNION ALL

  -- 태스크 검색
  SELECT
    'task'::TEXT as entity_type,
    id as entity_id,
    title,
    description,
    ts_rank(to_tsvector('simple', title || ' ' || COALESCE(description, '')), plainto_tsquery('simple', p_query)) as relevance
  FROM tasks
  WHERE user_id = p_user_id
    AND (title ILIKE '%' || p_query || '%' OR description ILIKE '%' || p_query || '%')

  UNION ALL

  -- 문서 검색
  SELECT
    'document'::TEXT as entity_type,
    id as entity_id,
    title,
    description,
    ts_rank(to_tsvector('simple', title || ' ' || COALESCE(description, '')), plainto_tsquery('simple', p_query)) as relevance
  FROM documents
  WHERE user_id = p_user_id
    AND (title ILIKE '%' || p_query || '%' OR description ILIKE '%' || p_query || '%')

  ORDER BY relevance DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;