import { ethers } from 'ethers';
import { getContract } from '../../lib/web3';
import { supabase } from '../../lib/supabase';
import { AdminRole, AdminUser } from './types';
import { SMART_CONTRACT_ROLES } from '../../constants/roles';

// Role mapping to smart contract role hashes
const ROLE_HASHES = {
  [SMART_CONTRACT_ROLES.SUPER_ADMIN]: ethers.constants.HashZero, // DEFAULT_ADMIN_ROLE
  [SMART_CONTRACT_ROLES.MINTER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
  [SMART_CONTRACT_ROLES.BURNER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")),
  [SMART_CONTRACT_ROLES.PAUSER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAUSER_ROLE")),
  [SMART_CONTRACT_ROLES.PRICE_UPDATER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PRICE_UPDATER_ROLE")),
  [SMART_CONTRACT_ROLES.BLACKLIST_MANAGER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BLACKLIST_MANAGER_ROLE")),
  [SMART_CONTRACT_ROLES.APPROVER]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("APPROVER_ROLE")),
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AdminUser[];
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

export const getUserRole = async (address: string): Promise<AdminRole | null> => {
  try {
    // Validate address format
    if (!address || typeof address !== 'string') {
      return null;
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .abortSignal(controller.signal)
      .maybeSingle(); // Use maybeSingle to handle no results gracefully

    clearTimeout(timeoutId);

    if (error) {
      console.error('Database error in getUserRole:', error);
      return null;
    }

    // Return the role if found, null if not found
    return data?.role as AdminRole || null;
  } catch (error: any) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const assignUserRole = async (
  address: string, 
  role: AdminRole, 
  assignedBy: string
): Promise<boolean> => {
  try {
    // Check if any super admin exists (bootstrap check)
    const { data: existingSuperAdmin } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('role', SMART_CONTRACT_ROLES.SUPER_ADMIN)
      .limit(1);

    const isBootstrap = !existingSuperAdmin || existingSuperAdmin.length === 0;

    // If not bootstrap, check if the assigner is a super admin
    if (!isBootstrap) {
      const assignerRole = await getUserRole(assignedBy);
      if (assignerRole !== SMART_CONTRACT_ROLES.SUPER_ADMIN) {
        throw new Error('Only super admins can assign roles');
      }
    } else {
      // Bootstrap case: only allow creating SUPER_ADMIN roles
      if (role !== SMART_CONTRACT_ROLES.SUPER_ADMIN) {
        throw new Error('First user must be assigned SUPER_ADMIN role');
      }
    }

    // Update smart contract
    const contract = getContract();
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    const roleHash = ROLE_HASHES[role];
    if (!roleHash) {
      throw new Error('Invalid contract role');
    }

    const tx = await contract.grantRole(roleHash, address);
    await tx.wait();

    // Update database
    const { data: existingRole } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .single();

    if (existingRole) {
      const { error: updateError } = await supabase
        .from('admin_roles')
        .update({ role })
        .eq('user_address', address.toLowerCase());

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('admin_roles')
        .insert([{
          user_address: address.toLowerCase(),
          role,
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error assigning user role:', error);
    throw error;
  }
};

export const removeUserRole = async (address: string, removedBy: string): Promise<boolean> => {
  try {
    // Check if the remover is a super admin
    const removerRole = await getUserRole(removedBy);
    if (removerRole !== SMART_CONTRACT_ROLES.SUPER_ADMIN) {
      throw new Error('Only super admins can remove roles');
    }

    // Get the user's current role before removing it
    const { data: userData } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .single();

    if (!userData) {
      throw new Error('User role not found');
    }

    const currentRole = userData.role as AdminRole;

    // Revoke from smart contract
    const contract = getContract();
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    const roleHash = ROLE_HASHES[currentRole];
    if (!roleHash) {
      throw new Error('Invalid contract role');
    }

    const tx = await contract.revokeRole(roleHash, address);
    await tx.wait();

    // Delete from database
    const { error } = await supabase
      .from('admin_roles')
      .delete()
      .eq('user_address', address.toLowerCase());

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing user role:', error);
    throw error;
  }
};

export const createBootstrapSuperAdmin = async (address: string, name?: string, email?: string): Promise<boolean> => {
  try {
    // Validate address
    if (!address || typeof address !== 'string') {
      throw new Error('Valid wallet address is required');
    }

    // Check if any super admin already exists
    const { data: existingSuperAdmin } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('role', SMART_CONTRACT_ROLES.SUPER_ADMIN)
      .limit(1);

    if (existingSuperAdmin && existingSuperAdmin.length > 0) {
      throw new Error('Super admin already exists');
    }

    // Check if this address already has a role
    const existingRole = await getUserRole(address);
    if (existingRole) {
      throw new Error('Address already has an assigned role');
    }

    // Insert the first super admin directly
    const { error } = await supabase
      .from('admin_roles')
      .insert([{
        user_address: address.toLowerCase(),
        role: SMART_CONTRACT_ROLES.SUPER_ADMIN,
        name: name || 'Super Admin',
        email: email || null,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating bootstrap super admin:', error);
    throw error;
  }
};

export const hasPermission = (userRole: AdminRole | null, requiredRole: AdminRole): boolean => {
  if (!userRole) return false;

  // Super admin has all permissions
  if (userRole === SMART_CONTRACT_ROLES.SUPER_ADMIN) return true;

  // Exact role match for specific permissions
  return userRole === requiredRole;
};