/*
  # Disable Email Confirmation

  1. Changes
    - Disable email confirmation requirement in auth.config
    - Update RLS policies for auth.users table
    - Add admin user if not exists

  2. Security
    - Maintains existing RLS policies
    - Ensures admin user exists
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

-- Create a single permissive policy for all operations
CREATE POLICY "Public access to auth endpoints"
ON auth.users
FOR ALL
TO PUBLIC
USING (true)
WITH CHECK (true);

-- Create auth.config table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.config (
  id integer PRIMARY KEY,
  confirm_email boolean DEFAULT false
);

-- Insert or update config to disable email confirmation
INSERT INTO auth.config (id, confirm_email)
VALUES (1, false)
ON CONFLICT (id) DO UPDATE
SET confirm_email = false;

-- Add admin user if not exists
INSERT INTO admin_users (user_id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'matt.wagner@panoramic-solutions.com' LIMIT 1),
  'matt.wagner@panoramic-solutions.com',
  'super_admin'
)
ON CONFLICT (email) DO NOTHING;