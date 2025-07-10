/*
  # Simplify Tool Submissions Structure

  1. Changes
    - Adds submission_status to tools table
    - Adds submitted_at and approved_at to tools table
    - Removes separate tool_submissions tables
    - Updates functions to work with simplified structure

  2. Security
    - Maintains existing RLS policies
    - Updates functions to use new structure
*/

-- Create submission status type if it doesn't exist
DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS create_tool_submission(text, tool_type);
DROP FUNCTION IF EXISTS update_tool_criteria(uuid, uuid, integer, text);
DROP FUNCTION IF EXISTS update_tool_tags(uuid, uuid[]);
DROP FUNCTION IF EXISTS submit_tool(uuid);

-- Add submission fields to tools table
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS submission_status submission_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD CONSTRAINT valid_status_timestamps CHECK (
  (submission_status = 'draft' AND submitted_at IS NULL AND approved_at IS NULL) OR
  (submission_status = 'submitted' AND submitted_at IS NOT NULL AND approved_at IS NULL) OR
  (submission_status = 'approved' AND submitted_at IS NOT NULL AND approved_at IS NOT NULL) OR
  (submission_status = 'rejected' AND submitted_at IS NOT NULL AND approved_at IS NULL)
);

-- Create new tool creation function
CREATE OR REPLACE FUNCTION create_tool_submission(
  p_name text,
  p_type tool_type DEFAULT 'user'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tool_id uuid;
BEGIN
  -- Check user authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Insert the tool
  INSERT INTO tools (name, type, created_by, submission_status)
  VALUES (p_name, p_type, auth.uid(), 'draft')
  RETURNING id INTO v_tool_id;
  
  RETURN v_tool_id;
END;
$$;

-- Create new criteria update function
CREATE OR REPLACE FUNCTION update_tool_criteria(
  p_tool_id uuid,
  p_criteria_id uuid,
  p_ranking integer,
  p_description text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify tool exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM tools
    WHERE id = p_tool_id
    AND created_by = auth.uid()
    AND submission_status = 'draft'
  ) THEN
    RETURN false;
  END IF;

  -- Update or insert criteria
  INSERT INTO criteria_tools (tool_id, criteria_id, ranking, description)
  VALUES (p_tool_id, p_criteria_id, p_ranking, p_description)
  ON CONFLICT (tool_id, criteria_id) 
  DO UPDATE SET 
    ranking = p_ranking,
    description = p_description;

  RETURN true;
END;
$$;

-- Create new tags update function
CREATE OR REPLACE FUNCTION update_tool_tags(
  p_tool_id uuid,
  p_tag_ids uuid[]
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify tool exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM tools
    WHERE id = p_tool_id
    AND created_by = auth.uid()
    AND submission_status = 'draft'
  ) THEN
    RETURN false;
  END IF;

  -- Delete existing tags
  DELETE FROM tag_tools
  WHERE tool_id = p_tool_id;

  -- Insert new tags
  INSERT INTO tag_tools (tool_id, tag_id)
  SELECT p_tool_id, unnest(p_tag_ids);

  RETURN true;
END;
$$;

-- Create new submit function
CREATE OR REPLACE FUNCTION submit_tool(
  p_tool_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify tool exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM tools
    WHERE id = p_tool_id
    AND created_by = auth.uid()
    AND submission_status = 'draft'
  ) THEN
    RETURN false;
  END IF;

  -- Verify all criteria have rankings
  IF NOT EXISTS (
    SELECT 1 FROM criteria_tools
    WHERE tool_id = p_tool_id
  ) THEN
    RETURN false;
  END IF;

  -- Verify at least one tag exists
  IF NOT EXISTS (
    SELECT 1 FROM tag_tools
    WHERE tool_id = p_tool_id
  ) THEN
    RETURN false;
  END IF;

  -- Update submission status
  UPDATE tools
  SET 
    submission_status = 'submitted',
    submitted_at = now()
  WHERE id = p_tool_id;

  RETURN true;
END;
$$;

-- Update tools view
CREATE OR REPLACE VIEW public.combined_tools_view WITH (security_barrier) AS
WITH criteria_array AS (
    SELECT 
        t.id AS tool_id,
        jsonb_agg(
            jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'ranking', ct.ranking,
                'description', ct.description
            )
            ORDER BY c.name
        ) FILTER (WHERE c.id IS NOT NULL) AS criteria
    FROM tools t
    LEFT JOIN criteria_tools ct ON t.id = ct.tool_id
    LEFT JOIN criteria c ON ct.criteria_id = c.id
    WHERE t.type = 'application' OR t.submission_status != 'draft'
    GROUP BY t.id
),
tags_array AS (
    SELECT 
        t.id AS tool_id,
        jsonb_agg(
            jsonb_build_object(
                'id', tg.id,
                'name', tg.name,
                'type', tt.name
            )
            ORDER BY tg.name
        ) FILTER (WHERE tg.id IS NOT NULL) AS tags
    FROM tools t
    LEFT JOIN tag_tools tt_link ON t.id = tt_link.tool_id
    LEFT JOIN tags tg ON tt_link.tag_id = tg.id
    LEFT JOIN tag_type tt ON tg.tag_type_id = tt.id
    WHERE t.type = 'application' OR t.submission_status != 'draft'
    GROUP BY t.id
)
SELECT 
    t.id,
    t.name,
    t.type,
    t.created_by,
    COALESCE(ca.criteria, '[]'::jsonb) AS criteria,
    COALESCE(ta.tags, '[]'::jsonb) AS tags,
    t.created_on
FROM tools t
LEFT JOIN criteria_array ca ON t.id = ca.tool_id
LEFT JOIN tags_array ta ON t.id = ta.tool_id
WHERE t.type = 'application' OR t.submission_status != 'draft';

-- Ensure public access to the view
GRANT SELECT ON combined_tools_view TO PUBLIC;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tools_submission_status ON tools(submission_status);
CREATE INDEX IF NOT EXISTS idx_tools_type_status ON tools(type, submission_status);

-- Migrate existing data from tool_submissions if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tool_submissions') THEN
    -- Update tools table with submission data
    UPDATE tools t
    SET 
      submission_status = ts.status,
      submitted_at = ts.submitted_at,
      approved_at = ts.approved_at
    FROM tool_submissions ts
    WHERE t.id = ts.id;

    -- Drop old tables
    DROP TABLE IF EXISTS tool_submission_tags CASCADE;
    DROP TABLE IF EXISTS tool_submission_criteria CASCADE;
    DROP TABLE IF EXISTS tool_submissions CASCADE;
  END IF;
END $$;