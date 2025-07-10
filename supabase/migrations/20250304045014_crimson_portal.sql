-- Add additional validation to criteria functions
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

  -- Verify criteria exists and is a valid UUID
  IF p_criteria_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM criteria
    WHERE id = p_criteria_id
    AND active_on <= now()
  ) THEN
    RETURN false;
  END IF;

  -- Validate ranking (must be between 1 and 5)
  IF p_ranking IS NULL OR p_ranking < 1 OR p_ranking > 5 THEN
    RETURN false;
  END IF;

  -- Update or insert criteria
  INSERT INTO criteria_tools (tool_id, criteria_id, ranking, description)
  VALUES (p_tool_id, p_criteria_id, p_ranking, COALESCE(p_description, ''))
  ON CONFLICT (tool_id, criteria_id) 
  DO UPDATE SET 
    ranking = EXCLUDED.ranking,
    description = EXCLUDED.description;

  RETURN true;
END;
$$;