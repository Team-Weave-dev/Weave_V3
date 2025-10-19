-- =====================================================
-- Notification Banner Views RLS 수정
-- =====================================================
-- 설명: 비인증 사용자도 배너 시스템을 사용할 수 있도록 RLS 정책 수정
-- 작성일: 2025-10-19
-- 의존성: 20251018_03_create_notification_banners.sql

-- =====================================================
-- 1. 기존 정책 삭제
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for own records" ON notification_banner_views;
DROP POLICY IF EXISTS "Enable insert for own records" ON notification_banner_views;
DROP POLICY IF EXISTS "Enable update for own records" ON notification_banner_views;

-- =====================================================
-- 2. 새로운 정책 생성 (비인증 사용자 지원)
-- =====================================================

-- 조회 정책: 인증된 사용자는 자신의 기록만, 비인증 사용자는 user_id가 null인 기록만
CREATE POLICY "Enable read access for own records or anonymous"
  ON notification_banner_views FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR  -- 인증된 사용자
    (auth.uid() IS NULL AND user_id IS NULL)              -- 비인증 사용자
  );

-- 생성 정책: 인증된 사용자는 자신의 기록만, 비인증 사용자는 user_id null로만
CREATE POLICY "Enable insert for own records or anonymous"
  ON notification_banner_views FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR  -- 인증된 사용자
    (auth.uid() IS NULL AND user_id IS NULL)              -- 비인증 사용자
  );

-- 업데이트 정책: 인증된 사용자는 자신의 기록만, 비인증 사용자는 user_id null인 기록만
CREATE POLICY "Enable update for own records or anonymous"
  ON notification_banner_views FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR  -- 인증된 사용자
    (auth.uid() IS NULL AND user_id IS NULL)              -- 비인증 사용자
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR  -- 인증된 사용자
    (auth.uid() IS NULL AND user_id IS NULL)              -- 비인증 사용자
  );

-- =====================================================
-- 3. notification_banners 읽기 정책도 비인증 사용자 지원
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for active banners" ON notification_banners;

-- 새로운 정책: 모든 사용자(인증/비인증)가 활성 배너 조회 가능
CREATE POLICY "Enable read access for active banners to all"
  ON notification_banners FOR SELECT
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Notification Banner Views RLS 정책 수정 완료';
  RAISE NOTICE '   - 비인증 사용자도 배너 시스템 사용 가능';
  RAISE NOTICE '   - 인증 사용자: auth.uid() = user_id';
  RAISE NOTICE '   - 비인증 사용자: user_id IS NULL';
END $$;
