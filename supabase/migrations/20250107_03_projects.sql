-- Projects 테이블 생성 (WBS 포함)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),

  -- 기본 정보
  no TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_content TEXT,

  -- 상태
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  payment_progress INTEGER DEFAULT 0 CHECK (payment_progress >= 0 AND payment_progress <= 100),

  -- 일정
  start_date DATE,
  end_date DATE,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 금액
  budget DECIMAL(15, 2),
  actual_cost DECIMAL(15, 2),
  total_amount DECIMAL(15, 2),
  currency TEXT DEFAULT 'KRW',

  -- 결제
  settlement_method TEXT,
  payment_status TEXT,

  -- WBS 작업 (JSONB로 저장)
  wbs_tasks JSONB DEFAULT '[]',

  -- 문서 상태
  document_status JSONB DEFAULT '{
    "contract": {"exists": false, "status": "none"},
    "invoice": {"exists": false, "status": "none"},
    "report": {"exists": false, "status": "none"},
    "estimate": {"exists": false, "status": "none"},
    "etc": {"exists": false, "status": "none"}
  }',

  -- 메타데이터
  has_contract BOOLEAN DEFAULT false,
  has_billing BOOLEAN DEFAULT false,
  has_documents BOOLEAN DEFAULT false,
  tags TEXT[],
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, no)
);

-- RLS 활성화
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 프로젝트만 관리 가능
CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_wbs_tasks ON projects USING GIN (wbs_tasks);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects(end_date);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- WBS 기반 프로젝트 진행률 자동 계산 함수
CREATE OR REPLACE FUNCTION calculate_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  wbs_tasks JSONB;
  completed_count INT := 0;
  total_count INT := 0;
  progress_value INT;
BEGIN
  wbs_tasks := NEW.wbs_tasks;

  IF wbs_tasks IS NOT NULL AND jsonb_array_length(wbs_tasks) > 0 THEN
    total_count := jsonb_array_length(wbs_tasks);

    SELECT COUNT(*)
    INTO completed_count
    FROM jsonb_array_elements(wbs_tasks) AS task
    WHERE task->>'status' = 'completed';

    progress_value := ROUND((completed_count::DECIMAL / total_count) * 100);
    NEW.progress := progress_value;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- WBS 업데이트 시 진행률 자동 계산 트리거
CREATE TRIGGER calculate_progress_on_wbs_update
  BEFORE INSERT OR UPDATE OF wbs_tasks ON projects
  FOR EACH ROW
  EXECUTE FUNCTION calculate_project_progress();