-- Clients 테이블 생성
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 기본 정보
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,

  -- 담당자 정보
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,

  -- 비즈니스 정보
  business_number TEXT,
  business_type TEXT,
  industry TEXT,

  -- 메타데이터
  notes TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, email)
);

-- RLS 활성화
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 클라이언트만 관리 가능
CREATE POLICY "Users can manage own clients"
  ON clients FOR ALL
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();