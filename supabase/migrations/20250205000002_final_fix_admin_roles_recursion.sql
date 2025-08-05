
-- Final fix for admin roles RLS recursion
-- This completely eliminates the recursion by using a security definer function

-- Disable RLS temporarily
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_roles_select_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_insert_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_update_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_delete_policy" ON admin_roles;
DROP POLICY IF EXISTS "Users can read own role" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON admin_roles;
DROP POLICY IF EXISTS "Service role can access all" ON admin_roles;
DROP POLICY IF EXISTS "allow_select_admin_roles" ON admin_roles;
DROP POLICY IF EXISTS "allow_insert_super_admin_only" ON admin_roles;
DROP POLICY IF EXISTS "allow_update_super_admin_only" ON admin_roles;
DROP POLICY IF EXISTS "allow_delete_super_admin_only" ON admin_roles;
DROP POLICY IF EXISTS "service_role_full_access" ON admin_roles;

-- Drop existing function
DROP FUNCTION IF EXISTS is_super_admin(text);

-- Create a secure function that bypasses RLS to check roles
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
  WHERE user_address = user_addr
  LIMIT 1;
  
  -- Return true if user has the required role or is super admin
  RETURN (user_role = required_role OR user_role = 'SUPER_ADMIN');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_user_role(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_role(text, text) TO service_role;

-- Re-enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "allow_read_all_roles" ON admin_roles
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "allow_insert_super_admin" ON admin_roles
FOR INSERT 
TO authenticated
WITH CHECK (
  CASE 
    WHEN auth.jwt() ->> 'wallet_address' IS NULL THEN false
    ELSE check_user_role(auth.jwt() ->> 'wallet_address', 'SUPER_ADMIN')
  END
);

CREATE POLICY "allow_update_super_admin" ON admin_roles
FOR UPDATE 
TO authenticated
USING (
  CASE 
    WHEN auth.jwt() ->> 'wallet_address' IS NULL THEN false
    ELSE check_user_role(auth.jwt() ->> 'wallet_address', 'SUPER_ADMIN')
  END
)
WITH CHECK (
  CASE 
    WHEN auth.jwt() ->> 'wallet_address' IS NULL THEN false
    ELSE check_user_role(auth.jwt() ->> 'wallet_address', 'SUPER_ADMIN')
  END
);

CREATE POLICY "allow_delete_super_admin" ON admin_roles
FOR DELETE 
TO authenticated
USING (
  CASE 
    WHEN auth.jwt() ->> 'wallet_address' IS NULL THEN false
    ELSE check_user_role(auth.jwt() ->> 'wallet_address', 'SUPER_ADMIN')
  END
);

-- Service role policy (full access)
CREATE POLICY "service_role_all_access" ON admin_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON admin_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_roles TO authenticated;

-- Ensure we have a test super admin
INSERT INTO admin_roles (user_address, role, name, email)
VALUES ('0x1234567890123456789012345678901234567890', 'SUPER_ADMIN', 'Test Super Admin', 'test@example.com')
ON CONFLICT (user_address) DO UPDATE SET role = 'SUPER_ADMIN';
