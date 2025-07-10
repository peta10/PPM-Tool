/*
  # Enable email signup and add admin user

  1. Changes
    - Enable email signup without confirmation
    - Add matt.wagner@panoramic-solutions.com as admin user
*/

-- Enable email signup without confirmation
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create auth policy to allow email signup
CREATE POLICY "Enable email signup"
ON auth.users
FOR INSERT
WITH CHECK (
  auth.role() = 'anon' AND
  auth.email() IS NOT NULL
);

-- Add matt.wagner@panoramic-solutions.com as admin if not exists
INSERT INTO admin_users (user_id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'matt.wagner@panoramic-solutions.com' LIMIT 1),
  'matt.wagner@panoramic-solutions.com',
  'super_admin'
)
ON CONFLICT (email) DO NOTHING;