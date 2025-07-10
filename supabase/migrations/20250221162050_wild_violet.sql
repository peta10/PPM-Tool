/*
  # Fix tool submission functions

  1. Changes
    - Update create_tool_submission to properly handle criteria IDs
    - Fix update_tool_criteria parameter names
    - Add better error handling and validation
    - Ensure proper type casting for UUIDs

  2. Security
    - Maintain existing RLS policies
    - Keep security definer functions
*/

-- Drop and recreate the functions with proper UUID handling
CREATE OR REPLACE FUNCTION create_tool_submission(
  p_name text,
  p_type tool_type DEFAULT 'user'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tool_id uuid;
  v_criteria_id uuid;
BEGIN
  -- Check user authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Insert the tool
  INSERT INTO tools (name, type, created_by, submission_status)
  VALUES (p_name, p_type, auth.uid(), 'draft')
  RETURNING id INTO v_tool_id;
  
  -- Create empty criteria entries for all active criteria
  FOR v_criteria_id IN 
    SELECT id FROM criteria WHERE active_on <= now()
  LOOP
    INSERT INTO criteria_tools (tool_id, criteria_id)
    VALUES (v_tool_id, v_criteria_id);
  END LOOP;
  
  RETURN v_tool_id;
END;
$$;

-- Update criteria update function with proper parameter names
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

-- Update tags update function with better validation
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

  -- Verify all tags exist
  IF NOT EXISTS (
    SELECT 1 FROM tags
    WHERE id = ANY(p_tag_ids)
    HAVING count(*) = array_length(p_tag_ids, 1)
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

-- Update submit function with better validation
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
  IF EXISTS (
    SELECT 1 FROM criteria c
    LEFT JOIN criteria_tools ct ON ct.criteria_id = c.id AND ct.tool_id = p_tool_id
    WHERE c.active_on <= now()
    AND (ct.ranking IS NULL OR ct.description IS NULL)
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