/*
  # Add status editing capabilities
  
  1. Add functions to change tool status
     - Allows admins to update status with proper timestamps
  2. Enhance admin security
     - Improve permissions checking for admin users
  3. Add proper triggers
     - Automatically update timestamps when status changes
*/

-- Create a function to update tool status
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
BEGIN
  -- Get current user ID
  v_uid := auth.uid();
  
  -- Check if user is admin
  v_is_admin := is_admin();
  
  -- Only admins can change status
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only administrators can change tool status';
  END IF;
  
  -- Validate the tool exists
  IF NOT EXISTS (
    SELECT 1 FROM tools
    WHERE id = p_tool_id
  ) THEN
    RAISE EXCEPTION 'Tool not found';
  END IF;
  
  -- Update the tool status with appropriate timestamps
  UPDATE tools
  SET 
    submission_status = p_status,
    updated_at = now(),
    submitted_at = CASE 
      WHEN p_status = 'submitted' THEN now()
      WHEN p_status = 'draft' THEN NULL
      ELSE submitted_at
    END,
    approved_at = CASE 
      WHEN p_status = 'approved' THEN now()
      WHEN p_status = 'draft' OR p_status = 'submitted' THEN NULL
      ELSE approved_at
    END
  WHERE id = p_tool_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error updating tool status: %', SQLERRM;
    RETURN false;
END;
$$;

-- Ensure updated_at is set automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_timestamp' 
    AND tgrelid = 'tools'::regclass
  ) THEN
    CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Update admin_tools_view to ensure it has all needed fields
DROP VIEW IF EXISTS public.admin_tools_view;

CREATE VIEW public.admin_tools_view AS
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
LEFT JOIN tags_array ta ON t.id = ta.tool_id;

-- Make sure the view is accessible
GRANT SELECT ON admin_tools_view TO PUBLIC;