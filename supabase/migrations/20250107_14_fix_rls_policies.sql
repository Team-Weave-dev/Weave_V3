-- =====================================================
-- RLS 정책 재설정 (올바른 정책으로 수정)
-- =====================================================
-- 설명: RLS를 다시 활성화하고 회원가입이 가능하도록 정책 수정
-- 작성일: 2025-10-08

-- 1. RLS 다시 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;
DROP POLICY IF EXISTS "Allow signup insert" ON public.users;

-- 3. INSERT 정책: 회원가입 시 누구나 자신의 레코드 생성 가능
CREATE POLICY "Enable insert for authenticated users only"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. SELECT 정책: 자신의 프로필만 조회 가능
CREATE POLICY "Enable read access for users based on user_id"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 5. UPDATE 정책: 자신의 프로필만 수정 가능
CREATE POLICY "Enable update for users based on user_id"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. DELETE 정책: 자신의 프로필만 삭제 가능 (선택사항)
CREATE POLICY "Enable delete for users based on user_id"
  ON public.users FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ RLS 정책 재설정 완료';
  RAISE NOTICE '📝 authenticated role만 INSERT 가능하도록 설정됨';
  RAISE NOTICE '🔒 모든 작업은 자신의 레코드에만 가능';
END $$;
