-- Migration: Add updated_by columns to all entity tables for conflict resolution
-- Phase 2: Timestamp System for multi-device sync
-- Date: 2025-10-10

-- ============================================================================
-- Description
-- ============================================================================
-- This migration adds the 'updated_by' column to all 7 entity tables.
-- The column stores the user_id of the last person who modified the record.
-- This enables Last Write Wins (LWW) conflict resolution based on:
-- - updated_at (timestamp)
-- - updated_by (user_id)
--
-- Tables modified:
-- 1. users
-- 2. clients
-- 3. projects
-- 4. tasks
-- 5. calendar_events
-- 6. documents
-- 7. user_settings

-- ============================================================================
-- 1. Users Table
-- ============================================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN users.updated_by IS 'User ID who last updated this record (for conflict resolution)';

-- ============================================================================
-- 2. Clients Table
-- ============================================================================

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN clients.updated_by IS 'User ID who last updated this record (for conflict resolution)';

-- ============================================================================
-- 3. Projects Table
-- ============================================================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN projects.updated_by IS 'User ID who last updated this record (for conflict resolution)';

-- ============================================================================
-- 4. Tasks Table
-- ============================================================================

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN tasks.updated_by IS 'User ID who last updated this record (for conflict resolution)';

-- ============================================================================
-- 5. Calendar Events Table
-- ============================================================================

ALTER TABLE calendar_events
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN calendar_events.updated_by IS 'User ID who last updated this record (for conflict resolution)';

-- ============================================================================
-- 6. Documents Table
-- ============================================================================

ALTER TABLE documents
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN documents.updated_by IS 'User ID who last updated this record (for conflict resolution)';

-- ============================================================================
-- 7. User Settings Table
-- ============================================================================

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN user_settings.updated_by IS 'User ID who last updated this record (for conflict resolution)';

-- ============================================================================
-- Indexes (Optional - for query optimization)
-- ============================================================================

-- Create indexes on updated_by for faster queries
CREATE INDEX IF NOT EXISTS idx_users_updated_by ON users(updated_by);
CREATE INDEX IF NOT EXISTS idx_clients_updated_by ON clients(updated_by);
CREATE INDEX IF NOT EXISTS idx_projects_updated_by ON projects(updated_by);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_by ON tasks(updated_by);
CREATE INDEX IF NOT EXISTS idx_calendar_events_updated_by ON calendar_events(updated_by);
CREATE INDEX IF NOT EXISTS idx_documents_updated_by ON documents(updated_by);
CREATE INDEX IF NOT EXISTS idx_user_settings_updated_by ON user_settings(updated_by);

-- ============================================================================
-- Verification Query (for testing)
-- ============================================================================

-- Run this query to verify the migration:
-- SELECT
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE column_name = 'updated_by'
--   AND table_schema = 'public'
-- ORDER BY table_name;

-- Expected result: 7 rows (one for each table)
