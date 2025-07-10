/*
  # Add admin roles and policies

  1. New Tables
    - `admin_users` - Stores admin user emails and roles
  
  2. Security
    - Enable RLS on admin_users table
    - Add policies for admin access
    - Add function to check admin status
*/

-- Create admin roles enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'tool_admin');

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role admin_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create admin check function
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
END;
$$;

-- Add admin policies
CREATE POLICY "Only super admins can manage admin users" ON admin_users
    FOR ALL USING (is_admin('super_admin'));

-- Allow admins to approve/reject submissions
CREATE POLICY "Admins can manage tool submissions" ON tool_submissions
    FOR ALL USING (is_admin());

-- Insert initial admin users
INSERT INTO admin_users (email, role) VALUES
    ('Matt.Wagner@Panoramic-Solutions.com', 'super_admin'),
    ('Rachel.Losser@Panoramic-Solutions.com', 'super_admin')
ON CONFLICT (email) DO NOTHING;