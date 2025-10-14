-- Fix Documents RLS Policy - Add WITH CHECK for INSERT operations
-- Issue: Original policy only had USING clause, which doesn't apply to INSERT
-- Solution: Add WITH CHECK clause to allow INSERT operations

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage own documents" ON documents;

-- Create corrected policy with both USING and WITH CHECK
CREATE POLICY "Users can manage own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Explanation:
-- USING: Applied to SELECT, UPDATE, DELETE (checks existing rows)
-- WITH CHECK: Applied to INSERT, UPDATE (validates new/modified rows)
-- Both clauses are needed for FOR ALL to work correctly with INSERT
