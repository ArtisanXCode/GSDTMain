
/*
  # Fix admin roles RLS policies
  
  1. Changes
    - Temporarily disable RLS to allow initial super admin creation
    - Create proper policies that don't cause recursion
    - Allow service role full access for admin operations
    
  2. Security
    - Maintain RLS for regular operations
    - Allow initial bootstrap of super admin accounts
*/

-- Temporarily disable RLS to clean up
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_read_all_roles" ON admin_roles;
DROP POLICY IF EXISTS "allow_insert_super_admin" ON admin_roles;
DROP POLICY IF EXISTS "allow_update_super_admin" ON admin_roles;
DROP POLICY IF EXISTS "allow_delete_super_admin" ON admin_roles;
DROP POLICY IF EXISTS "service_role_all_access" ON admin_roles;
DROP POLICY IF EXISTS "Users can read own role" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON admin_roles;
DROP POLICY IF EXISTS "Service role can access all" ON admin_roles;

-- Create function to safely check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin_safe(user_addr text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result boolean := false;
BEGIN
  -- Check if the address exists as a super admin
  SELECT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE LOWER(user_address) = LOWER(user_addr) 
    AND role = 'SUPER_ADMIN'
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- On any error, return false for security
    RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_super_admin_safe(text) TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin_safe(text) TO service_role;

-- Re-enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create policies that allow service role full access (for admin operations)
CREATE POLICY "service_role_full_access" ON admin_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read all admin roles
CREATE POLICY "authenticated_can_read_roles" ON admin_roles
FOR SELECT
TO authenticated
USING (true);

-- Allow inserts only by service role or existing super admins
CREATE POLICY "allow_role_insert" ON admin_roles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if no super admins exist (bootstrap case)
  NOT EXISTS (SELECT 1 FROM admin_roles WHERE role = 'SUPER_ADMIN')
  OR 
  -- Allow if current user is super admin
  is_super_admin_safe(auth.jwt() ->> 'wallet_address')
);

-- Allow updates only by service role or existing super admins
CREATE POLICY "allow_role_update" ON admin_roles
FOR UPDATE
TO authenticated
USING (is_super_admin_safe(auth.jwt() ->> 'wallet_address'))
WITH CHECK (is_super_admin_safe(auth.jwt() ->> 'wallet_address'));

-- Allow deletes only by service role or existing super admins
CREATE POLICY "allow_role_delete" ON admin_roles
FOR DELETE
TO authenticated
USING (is_super_admin_safe(auth.jwt() ->> 'wallet_address'));

-- Grant necessary permissions
GRANT ALL ON admin_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_roles TO authenticated;

-- Insert initial super admin if none exists
INSERT INTO admin_roles (user_address, role, name, email)
SELECT '0x1234567890123456789012345678901234567890', 'SUPER_ADMIN', 'Bootstrap Super Admin', 'bootstrap@gsdc.com'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_roles WHERE role = 'SUPER_ADMIN'
);
