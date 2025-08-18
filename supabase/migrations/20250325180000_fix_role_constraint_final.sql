
/*
  # Fix role check constraint to match application constants
  
  1. Changes
    - Update role_check constraint to include all roles used in the application
    - Ensure consistency between smart contract roles and database
    
  2. Security
    - Maintain data integrity with proper role validation
*/

-- Drop existing role_check constraint
ALTER TABLE admin_roles 
DROP CONSTRAINT IF EXISTS admin_roles_role_check;
DROP CONSTRAINT IF EXISTS role_check;

-- Add new role_check constraint with all valid roles from the application
ALTER TABLE admin_roles
ADD CONSTRAINT admin_roles_role_check CHECK (
  role IN (
    'SUPER_ADMIN',
    'ADMIN', 
    'MODERATOR',
    'MINTER',
    'BURNER',
    'PAUSER',
    'PRICE_UPDATER',
    'BLACKLIST_MANAGER',
    'APPROVER',
    'MINTER_ROLE',
    'BURNER_ROLE',
    'PAUSER_ROLE',
    'PRICE_UPDATER_ROLE',
    'BLACKLIST_MANAGER_ROLE',
    'APPROVER_ROLE'
  )
);

-- Grant necessary permissions to ensure the constraint works
GRANT ALL ON admin_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_roles TO authenticated;
