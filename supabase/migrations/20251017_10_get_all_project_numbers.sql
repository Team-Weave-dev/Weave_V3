-- =====================================================
-- 프로젝트 번호 조회 함수 (소프트 삭제 포함)
-- =====================================================
-- 목적: RLS 정책을 우회하여 소프트 삭제된 프로젝트 포함 모든 번호 조회
-- 사용처: 프로젝트 생성 시 중복되지 않는 번호 생성
-- 작성일: 2025-10-17

-- =====================================================
-- 함수 생성
-- =====================================================

CREATE OR REPLACE FUNCTION get_all_project_numbers(p_user_id UUID)
RETURNS TABLE (no VARCHAR) AS $$
BEGIN
  -- 현재 인증된 사용자 ID와 요청한 user_id가 일치하는지 검증
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other user''s project numbers';
  END IF;

  -- 소프트 삭제된 프로젝트 포함 모든 프로젝트의 번호 반환
  -- SECURITY DEFINER로 RLS 정책 우회
  RETURN QUERY
  SELECT projects.no
  FROM projects
  WHERE projects.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 권한 부여
-- =====================================================

-- authenticated 역할에 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION get_all_project_numbers(UUID) TO authenticated;

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ get_all_project_numbers 함수 생성 완료';
  RAISE NOTICE '🔒 SECURITY DEFINER로 RLS 우회';
  RAISE NOTICE '📊 소프트 삭제된 프로젝트 포함 모든 번호 조회 가능';
  RAISE NOTICE '';
  RAISE NOTICE '사용 예시:';
  RAISE NOTICE 'SELECT * FROM get_all_project_numbers(auth.uid());';
END $$;
