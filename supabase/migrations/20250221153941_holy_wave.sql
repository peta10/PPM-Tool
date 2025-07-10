/*
  # Fix tool submission function

  1. Changes
    - Update create_tool_submission function to properly handle user_id
    - Add error handling for unauthenticated users
*/

-- Drop and recreate the function with proper user_id handling
CREATE OR REPLACE FUNCTION create_tool_submission(
  p_name text,
  p_type tool_type DEFAULT 'user'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_submission_id uuid;
BEGIN
  -- Get the authenticated user's ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to submit a tool';
  END IF;

  -- Insert the submission
  INSERT INTO tool_submissions (user_id, name, type)
  VALUES (v_user_id, p_name, p_type)
  RETURNING id INTO v_submission_id;
  
  -- Create empty criteria entries
  INSERT INTO tool_submission_criteria (submission_id, criteria_id)
  SELECT v_submission_id, id
  FROM criteria
  WHERE active_on <= now();
  
  RETURN v_submission_id;
END;
$$;