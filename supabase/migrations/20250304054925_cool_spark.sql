-- Update the update_tool_tags function to set the updated_at field
CREATE OR REPLACE FUNCTION update_tool_tags(
  p_tool_id uuid,
  p_tag_ids uuid[]
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_is_admin boolean;
  v_tag_id uuid;
BEGIN
  -- Get current user ID
  v_uid := auth.uid();
  
  -- Input validation
  IF p_tool_id IS NULL THEN
    RAISE EXCEPTION 'Tool ID cannot be null';
  END IF;
  
  IF p_tag_ids IS NULL OR array_length(p_tag_ids, 1) = 0 THEN
    RAISE EXCEPTION 'Tag IDs array cannot be empty';
  END IF;
  
  -- Check if user is admin (using both direct admin check and email check for fallback)
  v_is_admin := EXISTS (
    SELECT 1 FROM admin_users a
    JOIN auth.users u ON a.email = u.email
    WHERE u.id = v_uid
  );
  
  -- Also check by user_id for completeness
  IF NOT v_is_admin THEN
    v_is_admin := EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = v_uid
    );
  END IF;
  
  -- Verify tool exists and belongs to user or user is admin
  IF NOT EXISTS (
    SELECT 1 FROM tools
    WHERE id = p_tool_id
    AND (created_by = v_uid OR v_is_admin)
  ) THEN
    RAISE EXCEPTION 'Tool not found or you do not have permission to edit it';
  END IF;

  -- Verify all tags exist
  FOR v_tag_id IN SELECT unnest(p_tag_ids)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM tags
      WHERE id = v_tag_id
    ) THEN
      RAISE EXCEPTION 'Tag ID % does not exist', v_tag_id;
    END IF;
  END LOOP;

  -- Delete existing tags first
  DELETE FROM tag_tools
  WHERE tool_id = p_tool_id;
  
  -- Then insert new tags
  INSERT INTO tag_tools (tool_id, tag_id)
  SELECT p_tool_id, unnest(p_tag_ids);
  
  -- Update the updated_at timestamp
  UPDATE tools
  SET updated_at = now()
  WHERE id = p_tool_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in update_tool_tags: %', SQLERRM;
    RETURN false;
END;
$$;

-- Update the update_tool_criteria function to also update the timestamp
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
  v_uid uuid;
  v_is_admin boolean;
BEGIN
  -- Get current user ID
  v_uid := auth.uid();
  
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
  
  -- Check if user is admin (using both direct admin check and email check for fallback)
  v_is_admin := EXISTS (
    SELECT 1 FROM admin_users a
    JOIN auth.users u ON a.email = u.email
    WHERE u.id = v_uid
  );
  
  -- Also check by user_id for completeness
  IF NOT v_is_admin THEN
    v_is_admin := EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = v_uid
    );
  END IF;
  
  -- Verify tool exists and belongs to user or user is admin
  IF NOT EXISTS (
    SELECT 1 FROM tools
    WHERE id = p_tool_id
    AND (created_by = v_uid OR v_is_admin)
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

  -- Update or insert criteria using upsert pattern
  INSERT INTO criteria_tools (tool_id, criteria_id, ranking, description)
  VALUES (p_tool_id, p_criteria_id, p_ranking, COALESCE(p_description, ''))
  ON CONFLICT (tool_id, criteria_id) 
  DO UPDATE SET 
    ranking = EXCLUDED.ranking,
    description = EXCLUDED.description;

  -- Update the updated_at timestamp
  UPDATE tools
  SET updated_at = now()
  WHERE id = p_tool_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in update_tool_criteria: %', SQLERRM;
    RETURN false;
END;
$$;