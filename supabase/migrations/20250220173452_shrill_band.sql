/*
  # Enable Email Authentication

  1. Changes
    - Enable RLS on auth.users table
    - Create policy to allow email signup
    - Add default admin user

  2. Security
    - Enables row level security on auth.users
    - Creates policy for public email signup
*/

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable email signup" ON auth.users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Enable RLS and create new policy
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable email signup"
ON auth.users
FOR INSERT
WITH CHECK (
  auth.role() = 'anon' AND
  auth.email() IS NOT NULL
);

-- Add admin user if not exists
INSERT INTO admin_users (user_id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'matt.wagner@panoramic-solutions.com' LIMIT 1),
  'matt.wagner@panoramic-solutions.com',
  'super_admin'
)
ON CONFLICT (email) DO NOTHING;