
-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "admin_roles_select_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_insert_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_update_policy" ON admin_roles;
DROP POLICY IF EXISTS "admin_roles_delete_policy" ON admin_roles;

-- Create new policies without recursion
-- Allow select for authenticated users (simplified check)
CREATE POLICY "admin_roles_select_policy" ON admin_roles
FOR SELECT 
TO authenticated
USING (true);

-- Allow insert only for existing super admins (using direct role check)
CREATE POLICY "admin_roles_insert_policy" ON admin_roles
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_roles ar 
    WHERE ar.user_address = auth.jwt() ->> 'wallet_address' 
    AND ar.role = 'SUPER_ADMIN'
  )
);

-- Allow update only for existing super admins
CREATE POLICY "admin_roles_update_policy" ON admin_roles
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar 
    WHERE ar.user_address = auth.jwt() ->> 'wallet_address' 
    AND ar.role = 'SUPER_ADMIN'
  )
);

-- Allow delete only for existing super admins
CREATE POLICY "admin_roles_delete_policy" ON admin_roles
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar 
    WHERE ar.user_address = auth.jwt() ->> 'wallet_address' 
    AND ar.role = 'SUPER_ADMIN'
  )
);

-- Ensure RLS is enabled
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
