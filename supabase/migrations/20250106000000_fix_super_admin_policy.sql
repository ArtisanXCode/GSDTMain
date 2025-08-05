
-- Disable RLS temporarily to clean up
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_read_all_roles" ON admin_roles;
DROP POLICY IF EXISTS "allow_insert_super_admin" ON admin_roles;
DROP POLICY IF EXISTS "allow_update_super_admin" ON admin_roles;
DROP POLICY IF EXISTS "allow_delete_super_admin" ON admin_roles;
DROP POLICY IF EXISTS "service_role_all_access" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_select_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_insert_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_update_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_delete_policy" ON admin_roles;

-- Drop existing function
DROP FUNCTION IF EXISTS check_user_role(text, text);

-- Create a simplified function for role checking
CREATE OR REPLACE FUNCTION check_user_role(user_addr text, required_role text DEFAULT 'SUPER_ADMIN')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Direct query without RLS interference
  SELECT role INTO user_role
  FROM admin_roles
  WHERE LOWER(user_address) = LOWER(user_addr)
  LIMIT 1;
  
  -- Return true if user has the required role or is super admin
  RETURN (user_role = required_role OR user_role = 'SUPER_ADMIN');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_user_role(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_role(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION check_user_role(text, text) TO anon;

-- Re-enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
CREATE POLICY "allow_all_select" ON admin_roles
FOR SELECT 
USING (true);

CREATE POLICY "allow_authenticated_insert" ON admin_roles
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_authenticated_update" ON admin_roles
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete" ON admin_roles
FOR DELETE 
TO authenticated
USING (true);

-- Service role gets full access
CREATE POLICY "service_role_full_access" ON admin_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Anonymous role gets read access
CREATE POLICY "anon_read_access" ON admin_roles
FOR SELECT
TO anon
USING (true);

-- Grant all necessary permissions
GRANT ALL ON admin_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_roles TO authenticated;
GRANT SELECT ON admin_roles TO anon;

-- Ensure the test super admin exists
INSERT INTO admin_roles (user_address, role, name, email, created_at)
VALUES ('0x1234567890123456789012345678901234567890', 'SUPER_ADMIN', 'Test Super Admin', 'test@example.com', NOW())
ON CONFLICT (user_address) 
DO UPDATE SET 
  role = 'SUPER_ADMIN',
  name = 'Test Super Admin',
  email = 'test@example.com',
  updated_at = NOW();

-- Add some additional test admin addresses for development
INSERT INTO admin_roles (user_address, role, name, email, created_at)
VALUES 
  ('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'SUPER_ADMIN', 'Dev Super Admin', 'dev@example.com', NOW()),
  ('0x1111111111111111111111111111111111111111', 'ADMIN', 'Test Admin', 'admin@example.com', NOW())
ON CONFLICT (user_address) 
DO UPDATE SET 
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  updated_at = NOW();
