/*
  # Fix Authentication Setup

  1. Changes
    - Drop all existing auth policies
    - Enable RLS on auth.users table
    - Create permissive policy for public access
    - Add default admin user

  2. Security
    - Enables row level security on auth.users
    - Creates policy for public access to auth endpoints
*/

-- Drop any existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public access to auth endpoints" ON auth.users;
  DROP POLICY IF EXISTS "Enable email signup" ON auth.users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Enable RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a single permissive policy that allows all operations
CREATE POLICY "Public access to auth endpoints"
ON auth.users
FOR ALL
TO PUBLIC
USING (true)
WITH CHECK (true);

-- Add admin user if not exists
INSERT INTO admin_users (user_id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'matt.wagner@panoramic-solutions.com' LIMIT 1),
  'matt.wagner@panoramic-solutions.com',
  'super_admin'
)
ON CONFLICT (email) DO NOTHING;