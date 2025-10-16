-- =====================================================
-- Soft Delete 전용 함수 (RLS 우회)
-- =====================================================
-- 목적: RLS 정책을 우회하여 안전하게 Soft Delete 수행
-- 장점: 함수 내부에서 권한 검증 후 SECURITY DEFINER로 실행
-- 작성일: 2025-10-17

-- =====================================================
-- 1. Projects Soft Delete 함수
-- =====================================================

CREATE OR REPLACE FUNCTION soft_delete_project_safe(p_project_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- 현재 인증된 사용자 ID 가져오기
  v_user_id := auth.uid();

  -- 인증되지 않은 경우 에러
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User not authenticated';
  END IF;

  -- 프로젝트 소유권 확인 및 Soft Delete 수행
  UPDATE projects
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = p_project_id
    AND user_id = v_user_id
    AND deleted_at IS NULL;  -- 이미 삭제된 것은 제외

  -- 결과 확인
  IF NOT FOUND THEN
    -- 프로젝트가 없거나, 이미 삭제되었거나, 권한이 없음
    RETURN json_build_object(
      'success', false,
      'error', 'Project not found or already deleted',
      'project_id', p_project_id
    );
  END IF;

  -- 성공
  RETURN json_build_object(
    'success', true,
    'project_id', p_project_id,
    'deleted_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    -- 예외 처리
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'project_id', p_project_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. Tasks Soft Delete 함수
-- =====================================================

CREATE OR REPLACE FUNCTION soft_delete_task_safe(p_task_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User not authenticated';
  END IF;

  UPDATE tasks
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = p_task_id
    AND user_id = v_user_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Task not found or already deleted',
      'task_id', p_task_id
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'task_id', p_task_id,
    'deleted_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. Documents Soft Delete 함수
-- =====================================================

CREATE OR REPLACE FUNCTION soft_delete_document_safe(p_document_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User not authenticated';
  END IF;

  UPDATE documents
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = p_document_id
    AND user_id = v_user_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Document not found or already deleted',
      'document_id', p_document_id
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'document_id', p_document_id,
    'deleted_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Events Soft Delete 함수
-- =====================================================

CREATE OR REPLACE FUNCTION soft_delete_event_safe(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User not authenticated';
  END IF;

  UPDATE events
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = p_event_id
    AND user_id = v_user_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Event not found or already deleted',
      'event_id', p_event_id
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'event_id', p_event_id,
    'deleted_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. Clients Soft Delete 함수
-- =====================================================

CREATE OR REPLACE FUNCTION soft_delete_client_safe(p_client_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User not authenticated';
  END IF;

  UPDATE clients
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = p_client_id
    AND user_id = v_user_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Client not found or already deleted',
      'client_id', p_client_id
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'client_id', p_client_id,
    'deleted_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. 권한 부여
-- =====================================================

-- authenticated 역할에 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION soft_delete_project_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_task_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_document_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_event_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_client_safe(UUID) TO authenticated;

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Soft Delete 함수 생성 완료';
  RAISE NOTICE '';
  RAISE NOTICE '사용 가능한 함수:';
  RAISE NOTICE '- soft_delete_project_safe(project_id)';
  RAISE NOTICE '- soft_delete_task_safe(task_id)';
  RAISE NOTICE '- soft_delete_document_safe(document_id)';
  RAISE NOTICE '- soft_delete_event_safe(event_id)';
  RAISE NOTICE '- soft_delete_client_safe(client_id)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 이제 TypeScript 코드를 수정하여 이 함수들을 호출하세요';
  RAISE NOTICE '예: SELECT soft_delete_project_safe(''uuid-here'')';
END $$;
