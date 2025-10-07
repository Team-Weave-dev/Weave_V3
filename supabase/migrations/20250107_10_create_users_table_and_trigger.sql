-- =====================================================
-- Weave Users 테이블 및 자동 생성 트리거
-- =====================================================
-- 설명: Authentication 사용자 생성 시 자동으로 public.users 테이블에 레코드 생성
-- 작성일: 2025-10-08

-- 1. users 테이블은 이미 존재하므로 생성 생략
-- 기존 테이블 구조:
-- - id (uuid, PRIMARY KEY)
-- - email (text, NOT NULL)
-- - name (text, NULLABLE)
-- - avatar (text, NULLABLE)
-- - metadata (jsonb, NULLABLE)
-- - created_at (timestamptz)
-- - updated_at (timestamptz)

-- 2. RLS (Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책: 사용자는 자신의 데이터만 조회/수정 가능
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 4. 외래 키 제약 조건 추가 (아직 없다면)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_id_fkey'
    AND table_name = 'users'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 6. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. updated_at 트리거
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. 신규 사용자 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar, metadata, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'avatar', ''),
    NEW.raw_user_meta_data,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. auth.users INSERT 시 자동으로 public.users에도 생성하는 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 10. 기존 auth.users 데이터를 public.users로 마이그레이션
-- ON CONFLICT로 안전하게 처리
INSERT INTO public.users (id, email, name, avatar, metadata, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'avatar', ''),
  raw_user_meta_data,
  created_at,
  COALESCE(updated_at, created_at)
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, public.users.name),
  avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Users 테이블 및 자동 생성 트리거 설정 완료';
  RAISE NOTICE '📊 기존 auth.users 데이터 마이그레이션 완료';
END $$;
