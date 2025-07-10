/*
  # Enhance Tag Update Functions

  1. Changes
    - Improved update_tool_tags function to handle tag deletions and insertions properly
    - Better error handling and reporting
    - Improved transaction safety
*/

-- Fix update_tool_tags function
CREATE OR REPLACE FUNCTION update_tool_tags(
  p_tool_id uuid,
  p_tag_ids uuid[]
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tag_id uuid;
BEGIN
  -- Input validation
  IF p_tool_id IS NULL THEN
    RAISE EXCEPTION 'Tool ID cannot be null';
  END IF;
  
  IF p_tag_ids IS NULL OR array_length(p_tag_ids, 1) = 0 THEN
    RAISE EXCEPTION 'Tag IDs array cannot be empty';
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

  -- Delete existing tags then insert new ones
  BEGIN
    -- First delete all existing tags
    DELETE FROM tag_tools
    WHERE tool_id = p_tool_id;
    
    -- Then insert new tags
    INSERT INTO tag_tools (tool_id, tag_id)
    SELECT p_tool_id, unnest(p_tag_ids);
    
    RETURN true;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error in update_tool_tags: %', SQLERRM;
      RETURN false;
  END;
END;
$$;