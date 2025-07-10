/*
  # Add Tool Submission Form Schema

  1. New Tables
    - `tool_submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `type` (tool_type)
      - `status` (submission_status)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `submitted_at` (timestamptz)
      - `approved_at` (timestamptz)
      
    - `tool_submission_criteria`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references tool_submissions)
      - `criteria_id` (uuid, references criteria)
      - `ranking` (integer)
      - `description` (text)
      
    - `tool_submission_tags`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references tool_submissions)
      - `tag_id` (uuid, references tags)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their submissions
    - Add policies for admins to review submissions

  3. Functions
    - `create_tool_submission()`: Initializes a new tool submission
    - `update_tool_criteria()`: Updates criteria rankings and descriptions
    - `update_tool_tags()`: Updates tool tag associations
    - `submit_tool()`: Finalizes and submits the tool for review
*/

-- Create submission status enum
CREATE TYPE submission_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'rejected'
);

-- Create tool submissions table
CREATE TABLE IF NOT EXISTS tool_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type tool_type NOT NULL DEFAULT 'user',
  status submission_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  
  CONSTRAINT valid_status_timestamps CHECK (
    (status = 'draft' AND submitted_at IS NULL AND approved_at IS NULL) OR
    (status = 'submitted' AND submitted_at IS NOT NULL AND approved_at IS NULL) OR
    (status = 'approved' AND submitted_at IS NOT NULL AND approved_at IS NOT NULL) OR
    (status = 'rejected' AND submitted_at IS NOT NULL AND approved_at IS NULL)
  )
);

-- Create tool submission criteria table
CREATE TABLE IF NOT EXISTS tool_submission_criteria (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id uuid REFERENCES tool_submissions(id) ON DELETE CASCADE NOT NULL,
  criteria_id uuid REFERENCES criteria(id) ON DELETE CASCADE NOT NULL,
  ranking integer CHECK (ranking >= 1 AND ranking <= 5),
  description text,
  
  UNIQUE(submission_id, criteria_id)
);

-- Create tool submission tags table
CREATE TABLE IF NOT EXISTS tool_submission_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id uuid REFERENCES tool_submissions(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  
  UNIQUE(submission_id, tag_id)
);

-- Enable RLS
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_submission_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_submission_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own submissions" ON tool_submissions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own submission criteria" ON tool_submission_criteria
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tool_submissions
      WHERE tool_submissions.id = submission_id
      AND tool_submissions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tool_submissions
      WHERE tool_submissions.id = submission_id
      AND tool_submissions.user_id = auth.uid()
      AND tool_submissions.status = 'draft'
    )
  );

CREATE POLICY "Users can manage their own submission tags" ON tool_submission_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tool_submissions
      WHERE tool_submissions.id = submission_id
      AND tool_submissions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tool_submissions
      WHERE tool_submissions.id = submission_id
      AND tool_submissions.user_id = auth.uid()
      AND tool_submissions.status = 'draft'
    )
  );

-- Create helper functions
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

CREATE OR REPLACE FUNCTION update_tool_criteria(
  p_submission_id uuid,
  p_criteria_id uuid,
  p_ranking integer,
  p_description text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify submission exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM tool_submissions
    WHERE id = p_submission_id
    AND user_id = auth.uid()
    AND status = 'draft'
  ) THEN
    RETURN false;
  END IF;

  -- Update criteria
  UPDATE tool_submission_criteria
  SET 
    ranking = p_ranking,
    description = p_description
  WHERE submission_id = p_submission_id
  AND criteria_id = p_criteria_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION update_tool_tags(
  p_submission_id uuid,
  p_tag_ids uuid[]
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify submission exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM tool_submissions
    WHERE id = p_submission_id
    AND user_id = auth.uid()
    AND status = 'draft'
  ) THEN
    RETURN false;
  END IF;

  -- Delete existing tags
  DELETE FROM tool_submission_tags
  WHERE submission_id = p_submission_id;

  -- Insert new tags
  INSERT INTO tool_submission_tags (submission_id, tag_id)
  SELECT p_submission_id, unnest(p_tag_ids);

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION submit_tool(
  p_submission_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify submission exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM tool_submissions
    WHERE id = p_submission_id
    AND user_id = auth.uid()
    AND status = 'draft'
  ) THEN
    RETURN false;
  END IF;

  -- Verify all criteria have rankings
  IF EXISTS (
    SELECT 1 FROM tool_submission_criteria
    WHERE submission_id = p_submission_id
    AND (ranking IS NULL OR description IS NULL)
  ) THEN
    RETURN false;
  END IF;

  -- Verify at least one tag exists
  IF NOT EXISTS (
    SELECT 1 FROM tool_submission_tags
    WHERE submission_id = p_submission_id
  ) THEN
    RETURN false;
  END IF;

  -- Update submission status
  UPDATE tool_submissions
  SET 
    status = 'submitted',
    submitted_at = now()
  WHERE id = p_submission_id;

  RETURN true;
END;
$$;

-- Create indexes
CREATE INDEX idx_tool_submissions_user ON tool_submissions(user_id);
CREATE INDEX idx_tool_submissions_status ON tool_submissions(status);
CREATE INDEX idx_tool_submission_criteria_submission ON tool_submission_criteria(submission_id);
CREATE INDEX idx_tool_submission_tags_submission ON tool_submission_tags(submission_id);