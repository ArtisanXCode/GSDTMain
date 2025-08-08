
/*
  # Fix role check constraint for admin roles
  
  1. Changes
    - Update role_check constraint to include all valid roles used in the application
    - Ensure all roles from constants/roles.ts are included
    
  2. Security
    - Maintain data integrity with proper role validation
*/

-- Drop existing role_check constraint
ALTER TABLE admin_roles 
DROP CONSTRAINT IF EXISTS role_check;

-- Add new role_check constraint with all valid roles from the application
ALTER TABLE admin_roles
ADD CONSTRAINT role_check CHECK (
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

-- Update any existing records that might have inconsistent role names
-- Convert role names to match the constants used in the application
UPDATE admin_roles SET role = 'MINTER' WHERE role = 'MINTER_ROLE';
UPDATE admin_roles SET role = 'BURNER' WHERE role = 'BURNER_ROLE';
UPDATE admin_roles SET role = 'PAUSER' WHERE role = 'PAUSER_ROLE';
UPDATE admin_roles SET role = 'PRICE_UPDATER' WHERE role = 'PRICE_UPDATER_ROLE';
UPDATE admin_roles SET role = 'BLACKLIST_MANAGER' WHERE role = 'BLACKLIST_MANAGER_ROLE';
UPDATE admin_roles SET role = 'APPROVER' WHERE role = 'APPROVER_ROLE';
