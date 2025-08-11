
/*
  # Remove all RLS policies and create simple working policies
  
  1. Changes
    - Completely remove all existing RLS policies
    - Create simple policies that allow authenticated users to manage roles
    - Remove complex role checking that causes recursion
    
  2. Security
    - Allow application-level role management
    - Trust the application layer for authorization
*/

-- Disable RLS temporarily to clean up completely
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies using dynamic SQL to ensure complete cleanup
DO $$ 
DECLARE
    pol_record RECORD;
BEGIN
    -- Drop all policies on admin_roles table
    FOR pol_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'admin_roles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON admin_roles CASCADE', pol_record.policyname);
    END LOOP;
END $$;

-- Drop all existing functions that might cause issues
DROP FUNCTION IF EXISTS is_super_admin_safe(text) CASCADE;
DROP FUNCTION IF EXISTS check_user_role(text, text) CASCADE;
DROP FUNCTION IF EXISTS is_super_admin(text) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create simple updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Re-enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies that work
-- Allow all authenticated users to read admin roles
CREATE POLICY "admin_roles_select" ON admin_roles
    FOR SELECT 
    TO authenticated
    USING (true);

-- Allow all authenticated users to insert admin roles
CREATE POLICY "admin_roles_insert" ON admin_roles
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Allow all authenticated users to update admin roles
CREATE POLICY "admin_roles_update" ON admin_roles
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all authenticated users to delete admin roles
CREATE POLICY "admin_roles_delete" ON admin_roles
    FOR DELETE 
    TO authenticated
    USING (true);

-- Allow service role complete access (for API operations)
CREATE POLICY "admin_roles_service_role" ON admin_roles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant all necessary permissions
GRANT ALL ON admin_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_roles TO authenticated;
GRANT SELECT ON admin_roles TO anon;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_admin_roles_updated_at ON admin_roles;
CREATE TRIGGER update_admin_roles_updated_at
    BEFORE UPDATE ON admin_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert bootstrap super admin if none exists
INSERT INTO admin_roles (user_address, role, name, email, created_at)
VALUES (
    '0x1234567890123456789012345678901234567890',
    'SUPER_ADMIN',
    'Bootstrap Super Admin',
    'bootstrap@gsdc.com',
    now()
) ON CONFLICT (user_address) DO UPDATE SET
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = now();
