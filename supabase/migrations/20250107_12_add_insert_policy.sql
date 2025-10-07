-- =====================================================
-- public.users 테이블에 INSERT 정책 추가
-- =====================================================
-- 설명: 회원가입 시 사용자가 자신의 레코드를 생성할 수 있도록 INSERT 정책 추가
-- 작성일: 2025-10-08

-- 1. INSERT 정책 추가 (사용자가 자신의 ID로만 레코드 생성 가능)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (
    -- 인증된 사용자가 자신의 ID로 레코드 생성
    auth.uid() = id
    OR
    -- 회원가입 시 아직 세션이 없는 경우를 위한 임시 허용
    -- (email이 auth.users와 일치하는지 확인)
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = users.id
      AND auth.users.email = users.email
    )
  );

-- 2. 기존 SELECT 정책 재생성 (명확성을 위해)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- 3. 기존 UPDATE 정책 재생성
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 4. DELETE 정책 추가 (선택사항)
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
CREATE POLICY "Users can delete own profile"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ INSERT 정책 추가 완료';
  RAISE NOTICE '📝 사용자는 이제 회원가입 시 자신의 프로필을 생성할 수 있습니다';
END $$;