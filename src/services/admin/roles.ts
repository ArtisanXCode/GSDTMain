import { ethers } from 'ethers';
import { getContract } from '../../lib/web3';
import { supabase } from '../../lib/supabase';
import { AdminRole, AdminUser } from './types';
import { SMART_CONTRACT_ROLES } from '../../constants/roles';

// Role mapping to smart contract role hashes
const ROLE_HASHES = {
  [SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE]: ethers.constants.HashZero, // DEFAULT_ADMIN_ROLE
  [SMART_CONTRACT_ROLES.MINTER_ROLE]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
  [SMART_CONTRACT_ROLES.BURNER_ROLE]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BURNER_ROLE")),
  [SMART_CONTRACT_ROLES.PAUSER_ROLE]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAUSER_ROLE")),
  [SMART_CONTRACT_ROLES.PRICE_UPDATER_ROLE]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PRICE_UPDATER_ROLE")),
  [SMART_CONTRACT_ROLES.BLACKLIST_MANAGER_ROLE]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BLACKLIST_MANAGER_ROLE")),
  [SMART_CONTRACT_ROLES.APPROVER_ROLE]: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("APPROVER_ROLE")),
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
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .abortSignal(controller.signal)
      .maybeSingle(); // Use maybeSingle instead of single

    clearTimeout(timeoutId);

    if (error) {
      console.error('Database error in getUserRole:', error);
      return null; // Return null on any error to prevent infinite loops
    }

    return data?.role as AdminRole || null;
  } catch (error: any) {
    console.error('Error getting user role:', error);

    // Return null for all errors to prevent cascading failures
    return null;
  }
};

export const assignUserRole = async (
  address: string,
  role: AdminRole,
  assignedBy: string
): Promise<boolean> => {
  try {
    // Check if the assigner is a super admin
    const assignerRole = await getUserRole(assignedBy);
    if (assignerRole !== SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE) {
      throw new Error('Only super admins can assign roles');
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
      .select('id')
      .eq('user_address', address.toLowerCase())
      .maybeSingle();

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
    if (removerRole !== SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE) {
      throw new Error('Only super admins can remove roles');
    }

    // Get the user's current role before removing it
    const { data: userData } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .maybeSingle();

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

export const hasPermission = (userRole: AdminRole | null, requiredRole: AdminRole): boolean => {
  if (!userRole) return false;

  // Super admin has all permissions
  if (userRole === SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE) return true;

  // Exact role match for specific permissions
  return userRole === requiredRole;
};