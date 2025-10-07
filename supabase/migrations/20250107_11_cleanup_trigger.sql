-- =====================================================
-- 불필요한 트리거 정리
-- =====================================================
-- 설명: on_auth_user_created 트리거 삭제 (회원가입 코드에서 직접 처리하므로)
-- 작성일: 2025-10-08

-- 1. auth.users 테이블의 트리거 삭제 (먼저 삭제해야 함)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. public.users 테이블의 트리거 삭제 (혹시 있다면)
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;

-- 3. handle_new_user 함수 삭제 (이제 의존성 없음)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 불필요한 트리거 및 함수 삭제 완료';
  RAISE NOTICE '📝 회원가입은 애플리케이션 코드에서 직접 처리됩니다';
END $$;
