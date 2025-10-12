-- =====================================================
-- Tax Schedules 테이블 생성
-- =====================================================
-- 설명: 모든 사용자가 조회 가능한 공통 세무 일정 테이블
-- 작성일: 2025-10-12
-- 의존성: 없음

-- Tax Schedules 테이블 생성
CREATE TABLE IF NOT EXISTS tax_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  title TEXT NOT NULL,
  description TEXT,

  -- 일정
  tax_date DATE NOT NULL,

  -- 분류
  category TEXT NOT NULL
    CHECK (category IN (
      'vat',                    -- 부가가치세
      'income_tax',             -- 종합소득세
      'corporate_tax',          -- 법인세
      'withholding_tax',        -- 원천세
      'year_end_settlement',    -- 연말정산
      'other'                   -- 기타
    )),

  type TEXT NOT NULL DEFAULT 'filing'
    CHECK (type IN ('filing', 'payment', 'report', 'other')),

  -- 반복 설정
  recurring BOOLEAN DEFAULT true,  -- 매년 반복 여부

  -- 표시 옵션
  color TEXT DEFAULT '#F97316',    -- 주황색 (세무 일정 기본 색상)

  -- 메타데이터
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE tax_schedules ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 authenticated 사용자가 조회 가능 (읽기 전용)
CREATE POLICY "Anyone can read tax schedules"
  ON tax_schedules FOR SELECT
  TO authenticated
  USING (true);

-- RLS 정책: INSERT/UPDATE/DELETE는 금지 (나중에 관리자 정책 추가 예정)
CREATE POLICY "No one can modify tax schedules"
  ON tax_schedules FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No one can update tax schedules"
  ON tax_schedules FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No one can delete tax schedules"
  ON tax_schedules FOR DELETE
  TO authenticated
  USING (false);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_tax_schedules_tax_date ON tax_schedules(tax_date);
CREATE INDEX IF NOT EXISTS idx_tax_schedules_category ON tax_schedules(category);
CREATE INDEX IF NOT EXISTS idx_tax_schedules_recurring ON tax_schedules(recurring);

-- 복합 인덱스: 캘린더 뷰 최적화 (날짜 범위 검색)
CREATE INDEX IF NOT EXISTS idx_tax_schedules_calendar_view
  ON tax_schedules(tax_date, category)
  WHERE recurring = true;

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_tax_schedules_updated_at
  BEFORE UPDATE ON tax_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2025년 한국 세무 일정 시드 데이터
-- =====================================================

-- 1월: 연말정산 & 부가가치세
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('근로소득 간이지급명세서 제출', '2024년 7월~12월 지급분', '2025-01-31', 'year_end_settlement', 'report', true, '#3B82F6'),
  ('부가가치세 2기 확정 신고', '2024년 7월~12월분 (설 연휴로 1/31까지 연장)', '2025-01-31', 'vat', 'filing', true, '#F97316'),
  ('원천세 납부', '전월 인건비 지급분', '2025-01-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 2월: 연말정산 & 지급명세서
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('면세사업자 사업장 현황신고', '2024년 귀속', '2025-02-10', 'other', 'report', true, '#10B981'),
  ('이자/배당/기타소득 지급명세서 제출', '2024년 1월~12월분', '2025-02-28', 'year_end_settlement', 'report', true, '#3B82F6'),
  ('원천세 납부', '전월 인건비 지급분', '2025-02-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 3월: 법인세 & 연말정산 환급
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('연말정산 환급 신청', '2024년 연말정산분', '2025-03-10', 'year_end_settlement', 'filing', true, '#3B82F6'),
  ('법인세 신고 (12월 결산법인)', '2024년 12월 결산법인 신고', '2025-03-31', 'corporate_tax', 'filing', true, '#EF4444'),
  ('원천세 납부', '전월 인건비 지급분', '2025-03-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 4월: 부가가치세 예정신고 & 법인세 연장
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('부가가치세 1기 예정신고 (법인)', '법인사업자 예정신고', '2025-04-25', 'vat', 'filing', true, '#F97316'),
  ('법인세 신고 (성실신고확인 대상)', '외부감사 대상 법인 등', '2025-04-30', 'corporate_tax', 'filing', true, '#EF4444'),
  ('원천세 납부', '전월 인건비 지급분', '2025-04-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 5월: 종합소득세
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('종합소득세 신고 시작', '2024년 종합소득세 신고 기간 시작', '2025-05-01', 'income_tax', 'filing', true, '#059669'),
  ('원천세 납부', '전월 인건비 지급분', '2025-05-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 6월: 종합소득세 마감
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('종합소득세 신고 마감', '2024년 종합소득세 신고 마감 (5/31이 토요일이므로 6/2까지)', '2025-06-02', 'income_tax', 'filing', true, '#059669'),
  ('종합소득세 성실신고확인서 제출', '성실신고확인 대상자', '2025-06-30', 'income_tax', 'filing', true, '#059669'),
  ('원천세 납부', '전월 인건비 지급분', '2025-06-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 7월: 부가가치세 1기 확정
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('부가가치세 1기 확정 신고', '2025년 1월~6월분', '2025-07-25', 'vat', 'filing', true, '#F97316'),
  ('원천세 납부', '전월 인건비 지급분', '2025-07-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 8월~9월: 원천세만
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('원천세 납부', '전월 인건비 지급분', '2025-08-10', 'withholding_tax', 'payment', true, '#8B5CF6'),
  ('원천세 납부', '전월 인건비 지급분', '2025-09-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 10월: 부가가치세 2기 예정신고
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('부가가치세 2기 예정신고 (법인)', '법인사업자 예정신고', '2025-10-25', 'vat', 'filing', true, '#F97316'),
  ('원천세 납부', '전월 인건비 지급분', '2025-10-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 11월~12월: 원천세만
INSERT INTO tax_schedules (title, description, tax_date, category, type, recurring, color) VALUES
  ('원천세 납부', '전월 인건비 지급분', '2025-11-10', 'withholding_tax', 'payment', true, '#8B5CF6'),
  ('원천세 납부', '전월 인건비 지급분', '2025-12-10', 'withholding_tax', 'payment', true, '#8B5CF6');

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Tax Schedules 테이블 생성 및 2025년 한국 세무 일정 데이터 삽입 완료';
END $$;
