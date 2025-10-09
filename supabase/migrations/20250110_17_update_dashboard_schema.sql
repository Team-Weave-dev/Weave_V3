-- =====================================================
-- Dashboard 스키마 업데이트 (DashboardData 구조와 일치)
-- =====================================================
-- 설명: user_settings.dashboard를 DashboardData 구조로 변경
-- 작성일: 2025-01-10
-- 의존성: 20250107_07_settings.sql

-- 1. 기존 dashboard 컬럼 제거 및 새 구조로 재생성
ALTER TABLE user_settings
DROP COLUMN IF EXISTS dashboard;

ALTER TABLE user_settings
ADD COLUMN dashboard JSONB DEFAULT '{
  "widgets": [],
  "config": {
    "cols": 9,
    "rowHeight": 120,
    "gap": 16,
    "isDraggable": true,
    "isResizable": true,
    "preventCollision": true,
    "allowOverlap": false,
    "compactType": "vertical",
    "useCSSTransforms": true,
    "transformScale": 1,
    "resizeHandles": ["se"],
    "isDroppable": false
  }
}';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Dashboard 스키마 업데이트 완료';
END $$;
