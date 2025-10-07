-- Documents 테이블 생성
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Markdown 또는 HTML 콘텐츠

  -- 문서 타입
  type TEXT NOT NULL DEFAULT 'other'
    CHECK (type IN ('contract', 'invoice', 'estimate', 'report', 'meeting_note', 'specification', 'proposal', 'other')),

  -- 카테고리
  category TEXT DEFAULT 'etc'
    CHECK (category IN ('contract', 'invoice', 'estimate', 'report', 'etc')),

  -- 상태
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'approved', 'sent', 'signed', 'archived')),

  -- 파일 정보
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,

  -- 템플릿 정보
  template_id TEXT,
  template_name TEXT,

  -- 버전 관리
  version TEXT DEFAULT '1.0',
  parent_document_id UUID REFERENCES documents(id),
  is_latest BOOLEAN DEFAULT true,

  -- 서명 정보
  requires_signature BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  signature_url TEXT,

  -- 메타데이터
  metadata JSONB DEFAULT '{}',
  tags TEXT[],

  -- 날짜 정보
  issued_date DATE,
  due_date DATE,
  expiry_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 문서만 관리 가능
CREATE POLICY "Users can manage own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_parent_document_id ON documents(parent_document_id);

-- 복합 인덱스: 프로젝트별 문서 조회 최적화
CREATE INDEX IF NOT EXISTS idx_documents_project_type
  ON documents(project_id, type, status)
  WHERE project_id IS NOT NULL;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 새 버전 생성 시 이전 버전 is_latest 업데이트
CREATE OR REPLACE FUNCTION update_document_version_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_document_id IS NOT NULL AND NEW.is_latest = true THEN
    -- 같은 부모를 가진 다른 문서들의 is_latest를 false로 설정
    UPDATE documents
    SET is_latest = false
    WHERE parent_document_id = NEW.parent_document_id
      AND id != NEW.id;

    -- 부모 문서의 is_latest도 false로 설정
    UPDATE documents
    SET is_latest = false
    WHERE id = NEW.parent_document_id;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER manage_document_versions
  BEFORE INSERT OR UPDATE OF is_latest ON documents
  FOR EACH ROW
  WHEN (NEW.is_latest = true)
  EXECUTE FUNCTION update_document_version_status();