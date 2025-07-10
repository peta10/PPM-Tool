/*
  # Fix tool submission function

  1. Changes
    - Update create_tool_submission function to not create empty criteria entries
    - Ensure tool creation and submission process works correctly
    
  2. Security 
    - Maintains existing security policies
*/

-- Drop the old function
DROP FUNCTION IF EXISTS create_tool_submission(text, tool_type);

-- Create a new version of the function that doesn't create empty criteria entries
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
  
  -- We don't create empty criteria entries anymore
  -- Criteria will be added when the user sets ratings
  
  RETURN v_tool_id;
END;
$$;

-- Ensure the update_tool_criteria function handles empty criteria correctly
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

  -- Verify criteria exists
  IF NOT EXISTS (
    SELECT 1 FROM criteria
    WHERE id = p_criteria_id
    AND active_on <= now()
  ) THEN
    RETURN false;
  END IF;

  -- Validate ranking (must be between 1 and 5)
  IF p_ranking < 1 OR p_ranking > 5 THEN
    RETURN false;
  END IF;

  -- Update or insert criteria
  INSERT INTO criteria_tools (tool_id, criteria_id, ranking, description)
  VALUES (p_tool_id, p_criteria_id, p_ranking, p_description)
  ON CONFLICT (tool_id, criteria_id) 
  DO UPDATE SET 
    ranking = EXCLUDED.ranking,
    description = EXCLUDED.description;

  RETURN true;
END;
$$;

-- Update the submit_tool function to validate criteria more thoroughly
CREATE OR REPLACE FUNCTION submit_tool(
  p_tool_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_criteria_count integer;
  v_tool_criteria_count integer;
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

  -- Count active criteria
  SELECT COUNT(*) INTO v_criteria_count
  FROM criteria
  WHERE active_on <= now();

  -- Count criteria with ratings for this tool
  SELECT COUNT(*) INTO v_tool_criteria_count
  FROM criteria_tools ct
  JOIN criteria c ON ct.criteria_id = c.id
  WHERE ct.tool_id = p_tool_id
  AND c.active_on <= now()
  AND ct.ranking IS NOT NULL
  AND ct.description IS NOT NULL;

  -- Verify all criteria have rankings
  IF v_tool_criteria_count < v_criteria_count THEN
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