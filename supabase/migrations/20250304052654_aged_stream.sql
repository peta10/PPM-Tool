/*
  # Fix Tool Criteria Update Function

  1. Changes
    - Improved error handling in update_tool_criteria function
    - Enhanced parameter validation
    - Better transaction management
*/

-- Improve update_tool_criteria function
CREATE OR REPLACE FUNCTION update_tool_criteria(
  p_tool_id uuid,
  p_criteria_id uuid,
  p_ranking integer,
  p_description text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_count integer;
BEGIN
  -- Input validation
  IF p_tool_id IS NULL THEN
    RAISE EXCEPTION 'Tool ID cannot be null';
  END IF;
  
  IF p_criteria_id IS NULL THEN
    RAISE EXCEPTION 'Criteria ID cannot be null';
  END IF;
  
  IF p_ranking IS NULL OR p_ranking < 1 OR p_ranking > 5 THEN
    RAISE EXCEPTION 'Ranking must be between 1 and 5';
  END IF;
  
  -- Verify tool exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM tools
    WHERE id = p_tool_id
    AND (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    ))
  ) THEN
    RAISE EXCEPTION 'Tool not found or you do not have permission to edit it';
  END IF;

  -- Verify criteria exists
  IF NOT EXISTS (
    SELECT 1 FROM criteria
    WHERE id = p_criteria_id
  ) THEN
    RAISE EXCEPTION 'Criterion not found';
  END IF;

  -- Check if entry already exists
  SELECT COUNT(*) INTO v_existing_count
  FROM criteria_tools
  WHERE tool_id = p_tool_id AND criteria_id = p_criteria_id;
  
  -- Delete existing entry if it exists (to prevent partial updates)
  IF v_existing_count > 0 THEN
    DELETE FROM criteria_tools
    WHERE tool_id = p_tool_id AND criteria_id = p_criteria_id;
  END IF;

  -- Insert new entry
  INSERT INTO criteria_tools (tool_id, criteria_id, ranking, description)
  VALUES (p_tool_id, p_criteria_id, p_ranking, COALESCE(p_description, ''));

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in update_tool_criteria: %', SQLERRM;
    RETURN false;
END;
$$;