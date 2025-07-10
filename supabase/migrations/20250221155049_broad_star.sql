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

-- Create a permissive policy for auth operations
CREATE POLICY "Enable auth operations"
ON auth.users
FOR ALL
TO PUBLIC
USING (true)
WITH CHECK (true);

-- Disable email confirmation requirement
UPDATE auth.config
SET confirm_email = false
WHERE id = 1;