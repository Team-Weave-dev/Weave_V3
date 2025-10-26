-- 요금제 시스템 추가
-- 2025-10-27
-- plans 테이블 생성 및 users 테이블에 plan 컬럼 추가

-- =====================================================
-- 1. plans 테이블 생성
-- =====================================================
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  limits_projects INTEGER NOT NULL DEFAULT -1, -- -1 = unlimited
  limits_widgets INTEGER NOT NULL DEFAULT -1, -- -1 = unlimited
  limits_storage INTEGER NOT NULL DEFAULT 200, -- MB
  limits_ai_service BOOLEAN NOT NULL DEFAULT false,
  features TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. plans 시드 데이터 삽입
-- =====================================================
INSERT INTO plans (id, name, price, limits_projects, limits_widgets, limits_storage, limits_ai_service, features)
VALUES
  ('free', 'Free', 0, 2, 3, 200, false, ARRAY['community-support']),
  ('basic', 'Basic', 9900, -1, -1, 1024, false, ARRAY['email-support', 'unlimited-projects', 'unlimited-widgets']),
  ('pro', 'Pro', 29700, -1, -1, 5120, true, ARRAY['priority-support', 'unlimited-projects', 'unlimited-widgets', 'ai-service'])
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  limits_projects = EXCLUDED.limits_projects,
  limits_widgets = EXCLUDED.limits_widgets,
  limits_storage = EXCLUDED.limits_storage,
  limits_ai_service = EXCLUDED.limits_ai_service,
  features = EXCLUDED.features,
  updated_at = NOW();

-- =====================================================
-- 3. users 테이블에 plan 컬럼 추가
-- =====================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' REFERENCES plans(id);

-- 기존 사용자에게 기본 요금제 할당 (NULL인 경우)
UPDATE users
SET plan = 'free'
WHERE plan IS NULL;

-- =====================================================
-- 4. RLS (Row Level Security) 정책
-- =====================================================

-- plans 테이블 RLS 활성화
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 plans를 읽을 수 있음 (요금제 정보 조회)
DROP POLICY IF EXISTS "Anyone can view plans" ON plans;
CREATE POLICY "Anyone can view plans"
  ON plans FOR SELECT
  USING (true);

-- users의 plan 컬럼은 기존 RLS 정책에 자동으로 포함됨
-- (users 테이블의 SELECT/UPDATE 정책이 이미 존재하므로 추가 정책 불필요)

-- =====================================================
-- 5. 인덱스 최적화
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- =====================================================
-- 6. updated_at 자동 업데이트 트리거
-- =====================================================
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. 제약조건 추가
-- =====================================================
-- price는 0 이상이어야 함
ALTER TABLE plans
ADD CONSTRAINT check_price_non_negative
CHECK (price >= 0);

-- storage limit는 양수여야 함
ALTER TABLE plans
ADD CONSTRAINT check_storage_positive
CHECK (limits_storage > 0);
