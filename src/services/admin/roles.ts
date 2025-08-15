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
      // Log error but don't treat "no rows found" as a critical error
      if (error.code !== 'PGRST116') {
        console.error('Database error in getUserRole:', error);
      }
      return null;
    }

    // Return the role if found, null if not found
    return data?.role as AdminRole || null;
  } catch (error: any) {
    // Handle AbortError from timeout
    if (error.name === 'AbortError') {
      console.warn('getUserRole request timed out for address:', address);
    } else {
      console.error('Error getting user role:', error);
    }
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

    // Update smart contract first
    const contract = getContract();
    if (!contract) {
      console.warn('Contract not available, skipping smart contract role assignment');
      // For bootstrap or when contract is not available, only update database
      // The smart contract role can be assigned later when the contract is available
    }

    // Only perform smart contract operations if contract is available
    if (contract) {
      const roleHash = ROLE_HASHES[role];
      if (!roleHash) {
        throw new Error('Invalid contract role');
      }

      try {
        console.log(`Granting role ${role} to address ${address}`);
        console.log(`Role hash: ${roleHash}`);
        
        // Check if the grantRole function exists on the contract
        if (!contract.grantRole) {
          console.warn('grantRole function not found on contract, skipping smart contract role assignment');
        } else {
          // This will trigger MetaMask popup
          const tx = await contract.grantRole(roleHash, address);
          console.log('Transaction sent:', tx.hash);
          
          // Wait for transaction confirmation
          const receipt = await tx.wait();
          console.log('Transaction confirmed:', receipt.transactionHash);
          
          if (receipt.status !== 1) {
            throw new Error('Smart contract transaction failed');
          }
        }
      } catch (contractError: any) {
        console.error('Smart contract role assignment failed:', contractError);
        
        // Check if user rejected the transaction
        if (contractError.code === 4001 || contractError.message?.includes('User denied')) {
          throw new Error('Transaction was rejected by user');
        }
        
        // Check for insufficient funds
        if (contractError.message?.includes('insufficient funds')) {
          throw new Error('Insufficient funds for transaction');
        }
        
        // Check for network issues
        if (contractError.message?.includes('network changed')) {
          throw new Error('Network changed. Please try again');
        }

        // Check if grantRole function doesn't exist
        if (contractError.message?.includes('is not a function')) {
          console.warn('Role management functions not available on contract, proceeding with database-only assignment');
        } else {
          // Generic contract error
          throw new Error(`Smart contract error: ${contractError.message || 'Unknown error'}`);
        }
      }
    }

    // Update database - use upsert to handle existing roles gracefully
    const { error: upsertError } = await supabase
      .from('admin_roles')
      .upsert({
        user_address: address.toLowerCase(),
        role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_address'
      });

    if (upsertError) throw upsertError;

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
      .maybeSingle();

    if (!userData) {
      throw new Error('User role not found');
    }

    const currentRole = userData.role as AdminRole;

    // Revoke from smart contract (if available)
    const contract = getContract();
    if (contract) {
      const roleHash = ROLE_HASHES[currentRole];
      if (roleHash) {
        try {
          console.log(`Revoking role ${currentRole} from address ${address}`);
          
          // Check if the revokeRole function exists on the contract
          if (!contract.revokeRole) {
            console.warn('revokeRole function not found on contract, skipping smart contract role revocation');
          } else {
            // This will trigger MetaMask popup
            const tx = await contract.revokeRole(roleHash, address);
            console.log('Transaction sent:', tx.hash);
            
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.transactionHash);
            
            if (receipt.status !== 1) {
              throw new Error('Smart contract transaction failed');
            }
          }
        } catch (contractError: any) {
          console.error('Smart contract role revocation failed:', contractError);
          
          // Check if user rejected the transaction
          if (contractError.code === 4001 || contractError.message?.includes('User denied')) {
            throw new Error('Transaction was rejected by user');
          }
          
          // Check for insufficient funds
          if (contractError.message?.includes('insufficient funds')) {
            throw new Error('Insufficient funds for transaction');
          }

          // Check if revokeRole function doesn't exist
          if (contractError.message?.includes('is not a function')) {
            console.warn('Role management functions not available on contract, proceeding with database-only removal');
          } else {
            // Generic contract error
            throw new Error(`Smart contract error: ${contractError.message || 'Unknown error'}`);
          }
        }
      }
    } else {
      console.warn('Contract not available, skipping smart contract role revocation');
    }

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