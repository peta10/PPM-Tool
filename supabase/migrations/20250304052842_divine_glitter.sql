/*
  # Create Admin Users Table and Fix Functions

  1. New Tables
    - `admin_users` - Stores admin user information
  
  2. Changes
    - Ensure admin_users table exists
    - Fix update_tool_tags function to handle missing admin_users table
    - Fix update_tool_criteria function to handle missing admin_users table
*/

-- Create admin role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('super_admin', 'tool_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create admin users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role admin_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create admin check function with better error handling
CREATE OR REPLACE FUNCTION is_admin(p_role admin_role DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND (p_role IS NULL OR role = p_role)
  );
EXCEPTION
  WHEN undefined_table THEN
    RETURN FALSE;
END;
$$;

-- Fix update_tool_tags function to handle missing admin_users table
CREATE OR REPLACE FUNCTION update_tool_tags(
  p_tool_id uuid,
  p_tag_ids uuid[]
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tag_id uuid;
  v_is_admin boolean;
BEGIN
  -- Input validation
  IF p_tool_id IS NULL THEN
    RAISE EXCEPTION 'Tool ID cannot be null';
  END IF;
  
  IF p_tag_ids IS NULL OR array_length(p_tag_ids, 1) = 0 THEN
    RAISE EXCEPTION 'Tag IDs array cannot be empty';
  END IF;
  
  -- Safely check if user is admin (handles case where admin_users table might not exist)
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    ) INTO v_is_admin;
  EXCEPTION
    WHEN undefined_table THEN
      v_is_admin := FALSE;
  END;
  
  -- Verify tool exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM tools
    WHERE id = p_tool_id
    AND (created_by = auth.uid() OR v_is_admin)
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

-- Fix update_tool_criteria function to handle missing admin_users table
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
  v_is_admin boolean;
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
  
  -- Safely check if user is admin (handles case where admin_users table might not exist)
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    ) INTO v_is_admin;
  EXCEPTION
    WHEN undefined_table THEN
      v_is_admin := FALSE;
  END;
  
  -- Verify tool exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM tools
    WHERE id = p_tool_id
    AND (created_by = auth.uid() OR v_is_admin)
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

-- Add admin policy if it doesn't exist
DO $$ BEGIN
  CREATE POLICY "Only super admins can manage admin users" ON admin_users
      FOR ALL USING (is_admin('super_admin'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Insert initial admin user if not exists
INSERT INTO admin_users (email, role, user_id)
SELECT 'admin@example.com', 'super_admin', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@example.com')
AND auth.uid() IS NOT NULL;