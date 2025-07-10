/*
  # Fix authentication handling

  1. Changes
    - Add auth.users policy to allow email/password signup
    - Add function to check user authentication
    - Update tool submission function to verify user auth

  2. Security
    - Enable RLS on auth.users
    - Add policy for email/password signup
    - Add auth check function
*/

-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for email/password signup
CREATE POLICY "Enable email/password signup"
ON auth.users
FOR INSERT
TO anon
WITH CHECK (
  -- Only allow email/password signup
  auth.role() = 'anon' AND
  email IS NOT NULL AND
  encrypted_password IS NOT NULL
);

-- Create function to check user authentication
CREATE OR REPLACE FUNCTION check_user_auth()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  RETURN true;
END;
$$;

-- Update tool submission function to use auth check
CREATE OR REPLACE FUNCTION create_tool_submission(
  p_name text,
  p_type tool_type DEFAULT 'user'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_submission_id uuid;
BEGIN
  -- Check user authentication
  PERFORM check_user_auth();
  
  -- Insert the submission
  INSERT INTO tool_submissions (user_id, name, type)
  VALUES (auth.uid(), p_name, p_type)
  RETURNING id INTO v_submission_id;
  
  -- Create empty criteria entries
  INSERT INTO tool_submission_criteria (submission_id, criteria_id)
  SELECT v_submission_id, id
  FROM criteria
  WHERE active_on <= now();
  
  RETURN v_submission_id;
END;
$$;