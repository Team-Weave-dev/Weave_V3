-- =====================================================
-- public.users 테이블에 anon/authenticated role 권한 부여
-- =====================================================
-- 설명: RLS 정책 외에도 기본 GRANT 권한이 필요함
-- 작성일: 2025-10-08

-- 1. anon role에게 INSERT, SELECT 권한 부여
GRANT INSERT, SELECT ON public.users TO anon;

-- 2. authenticated role에게 전체 CRUD 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;

-- 3. 권한 확인 쿼리 (실행 후 결과 확인)
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name='users';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ anon/authenticated role에 users 테이블 권한 부여 완료';
  RAISE NOTICE '📝 이제 회원가입 시 public.users 레코드 생성이 가능합니다';
END $$;
