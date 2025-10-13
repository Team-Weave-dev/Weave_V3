-- Phase 17: Add project_table_config to user_settings
-- Adds projectTableConfig field to store UI preferences for project table view
-- This replaces localStorage-based project table configuration

-- Add project_table_config column to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS project_table_config JSONB DEFAULT NULL;

-- Add comment explaining the structure
COMMENT ON COLUMN user_settings.project_table_config IS
'Project table UI configuration
Structure:
{
  "columns": [
    {
      "id": "string",
      "key": "string",
      "label": "string",
      "sortable": boolean,
      "filterable": boolean,
      "width": number (optional),
      "visible": boolean,
      "order": number,
      "type": "text|date|number|status|progress|currency|payment_progress"
    }
  ],
  "filters": {
    "searchQuery": "string",
    "statusFilter": "planning|in_progress|review|completed|on_hold|cancelled|all",
    "clientFilter": "string",
    "customFilters": {}
  },
  "sort": {
    "column": "string",
    "direction": "asc|desc"
  },
  "pagination": {
    "page": number,
    "pageSize": number,
    "total": number
  }
}';

-- Create index for performance (JSONB GIN index for efficient querying)
CREATE INDEX IF NOT EXISTS idx_user_settings_project_table_config
ON user_settings USING GIN (project_table_config);

-- No RLS changes needed - existing policy covers this column:
-- "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id)
