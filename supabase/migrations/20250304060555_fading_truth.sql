/*
  # Fix tool status update function

  1. Changes
     - Improves the update_tool_status function to properly handle the valid_status_timestamps constraint
     - Ensures proper timestamp handling for each status transition
*/

-- Fix the update_tool_status function to properly handle timestamps
CREATE OR REPLACE FUNCTION update_tool_status(
  p_tool_id uuid,
  p_status submission_status
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_is_admin boolean;
  v_tool tools%ROWTYPE;
  v_now timestamptz;
BEGIN
  -- Get current user ID and timestamp
  v_uid := auth.uid();
  v_now := now();
  
  -- Check if user is admin
  v_is_admin := is_admin();
  
  -- Only admins can change status
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only administrators can change tool status';
  END IF;
  
  -- Get the current tool data
  SELECT * INTO v_tool 
  FROM tools
  WHERE id = p_tool_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tool not found';
  END IF;
  
  -- Handle status-specific timestamp logic
  CASE p_status
    WHEN 'draft' THEN
      -- Reset both timestamps for draft
      UPDATE tools
      SET 
        submission_status = p_status,
        submitted_at = NULL,
        approved_at = NULL,
        updated_at = v_now
      WHERE id = p_tool_id;
      
    WHEN 'submitted' THEN
      -- Set submitted_at, clear approved_at
      UPDATE tools
      SET 
        submission_status = p_status,
        submitted_at = v_now,
        approved_at = NULL,
        updated_at = v_now
      WHERE id = p_tool_id;
      
    WHEN 'approved' THEN
      -- For approval, we need both timestamps
      -- If there's no submitted_at, we'll set it to now() as well
      UPDATE tools
      SET 
        submission_status = p_status,
        submitted_at = COALESCE(v_tool.submitted_at, v_now),
        approved_at = v_now,
        updated_at = v_now
      WHERE id = p_tool_id;
      
    WHEN 'rejected' THEN
      -- For rejection, we need submitted_at but not approved_at
      -- If there's no submitted_at, we'll set it to now()
      UPDATE tools
      SET 
        submission_status = p_status,
        submitted_at = COALESCE(v_tool.submitted_at, v_now),
        approved_at = NULL,
        updated_at = v_now
      WHERE id = p_tool_id;
      
    ELSE
      RAISE EXCEPTION 'Invalid status: %', p_status;
  END CASE;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error updating tool status: %', SQLERRM;
    RETURN false;
END;
$$;