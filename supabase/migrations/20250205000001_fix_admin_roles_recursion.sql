
-- Disable RLS temporarily to clean up
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "admin_roles_select_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_insert_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_update_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_delete_policy" ON admin_roles;
DROP POLICY IF EXISTS "Users can read own role" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON admin_roles;
DROP POLICY IF EXISTS "Service role can access all" ON admin_roles;

-- Create a function to check if user is super admin without recursion
CREATE OR REPLACE FUNCTION is_super_admin(user_addr text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result boolean := false;
BEGIN
  -- Direct check without RLS
  SELECT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_address = user_addr 
    AND role = 'SUPER_ADMIN'
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_super_admin(text) TO authenticated;

-- Re-enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create simple policies using the function
CREATE POLICY "allow_select_admin_roles" ON admin_roles
FOR SELECT 
TO authenticated
USING (true);  -- Allow all authenticated users to read roles

CREATE POLICY "allow_insert_super_admin_only" ON admin_roles
FOR INSERT 
TO authenticated
WITH CHECK (is_super_admin(auth.jwt() ->> 'wallet_address'));

CREATE POLICY "allow_update_super_admin_only" ON admin_roles
FOR UPDATE 
TO authenticated
USING (is_super_admin(auth.jwt() ->> 'wallet_address'))
WITH CHECK (is_super_admin(auth.jwt() ->> 'wallet_address'));

CREATE POLICY "allow_delete_super_admin_only" ON admin_roles
FOR DELETE 
TO authenticated
USING (is_super_admin(auth.jwt() ->> 'wallet_address'));

-- Create policy for service role
CREATE POLICY "service_role_full_access" ON admin_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON admin_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_roles TO authenticated;
