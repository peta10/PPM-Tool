/*
  # Add Admin Users

  1. Changes
    - Adds Matt Wagner and Rachel Losser as super_admin users
*/

-- Make sure admin_users table exists
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role admin_role NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

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