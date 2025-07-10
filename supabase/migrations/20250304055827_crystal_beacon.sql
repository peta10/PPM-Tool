-- Improve admin check function to be more robust
CREATE OR REPLACE FUNCTION is_admin(p_role admin_role DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
  v_email text;
BEGIN
  -- Get current user ID
  v_uid := auth.uid();
  
  -- If no user is authenticated, they're not an admin
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;
  
  -- Try to get user email
  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  
  -- First check by user_id
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE (user_id = v_uid OR email = v_email)
    AND (p_role IS NULL OR role = p_role)
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in is_admin check: %', SQLERRM;
    RETURN false;
END;
$$;

-- Completely rewrite update_tool_tags function to be more robust
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
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in update_tool_tags: %', SQLERRM;
    RETURN false;
END;
$$;

-- Update tool criteria function with same robust permissions checking
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

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in update_tool_criteria: %', SQLERRM;
    RETURN false;
END;
$$;

-- Update or insert admin users for Matt and Rachel
-- First fix the table to ensure user_id can be null (for admins added by email first)
ALTER TABLE admin_users ALTER COLUMN user_id DROP NOT NULL;

-- Add Matt Wagner as super_admin
INSERT INTO admin_users (email, role)
VALUES ('matt.wagner@panoramic-solutions.com', 'super_admin')
ON CONFLICT (email) 
DO UPDATE SET role = 'super_admin';

-- Add Rachel Losser as super_admin
INSERT INTO admin_users (email, role)
VALUES ('rachel.losser@panoramic-solutions.com', 'super_admin')
ON CONFLICT (email) 
DO UPDATE SET role = 'super_admin';

-- Add a policy to allow admin users to also manage tools
DO $$ 
BEGIN
  -- First check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies 
    WHERE tablename = 'tools' AND policyname = 'Admin users can manage all tools'
  ) THEN
    -- If it doesn't exist, create it
    EXECUTE 'CREATE POLICY "Admin users can manage all tools" ON tools FOR ALL TO authenticated USING (is_admin())';
  END IF;
END $$;

-- Add updated_at column to tools table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tools' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE tools ADD COLUMN updated_at timestamptz;
    
    -- Update existing records to set updated_at to the most recent of the timestamps
    UPDATE tools
    SET updated_at = 
      CASE
        WHEN approved_at IS NOT NULL THEN approved_at
        WHEN submitted_at IS NOT NULL THEN submitted_at
        ELSE created_on
      END;
  END IF;
END $$;

-- First drop the existing view to avoid column name conflicts
DROP VIEW IF EXISTS public.tools_view CASCADE;

-- Create or replace tools_view with all columns including timestamps
CREATE VIEW public.tools_view AS
WITH criteria_array AS (
    SELECT 
        t.id AS tool_id,
        jsonb_agg(
            jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'ranking', COALESCE(ct.ranking, 0),
                'description', COALESCE(ct.description, '')
            )
            ORDER BY c.name
        ) FILTER (WHERE c.id IS NOT NULL) AS criteria
    FROM tools t
    CROSS JOIN (
        SELECT * FROM criteria WHERE active_on <= now()
    ) c
    LEFT JOIN criteria_tools ct ON t.id = ct.tool_id AND ct.criteria_id = c.id
    WHERE t.type = 'application'
    GROUP BY t.id
),
tags_array AS (
    SELECT 
        t.id AS tool_id,
        jsonb_agg(
            jsonb_build_object(
                'id', tg.id,
                'name', tg.name,
                'type', tt.name
            )
            ORDER BY tg.name
        ) FILTER (WHERE tg.id IS NOT NULL) AS tags
    FROM tools t
    LEFT JOIN tag_tools tt_link ON t.id = tt_link.tool_id
    LEFT JOIN tags tg ON tt_link.tag_id = tg.id
    LEFT JOIN tag_type tt ON tg.tag_type_id = tt.id
    WHERE t.type = 'application'
    GROUP BY t.id
)
SELECT 
    t.id,
    t.name,
    t.type,
    t.created_by,
    COALESCE(ca.criteria, '[]'::jsonb) AS criteria,
    COALESCE(ta.tags, '[]'::jsonb) AS tags,
    t.created_on,
    t.updated_at,
    t.submitted_at,
    t.approved_at,
    t.submission_status
FROM tools t
LEFT JOIN criteria_array ca ON t.id = ca.tool_id
LEFT JOIN tags_array ta ON t.id = ta.tool_id
WHERE t.type = 'application';

-- Ensure public access to the view
GRANT SELECT ON tools_view TO PUBLIC;