-- =====================================================
-- RLS 정책 추가: activity_logs 테이블
-- =====================================================
-- 설명: activity_logs 테이블에 INSERT/UPDATE/DELETE 정책 추가
-- 작성일: 2025-10-12
-- 의존성: 20250107_08_additional_tables.sql

-- 1. 기존 SELECT 정책 유지 (이미 존재)

-- 2. INSERT 정책 추가 (authenticated 사용자가 자신의 로그 생성 가능)
CREATE POLICY "Users can insert own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE 정책 추가 (자신의 로그만 수정 가능)
CREATE POLICY "Users can update own activity logs"
  ON activity_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. DELETE 정책 추가 (자신의 로그만 삭제 가능)
CREATE POLICY "Users can delete own activity logs"
  ON activity_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ activity_logs RLS 정책 추가 완료';
END $$;
