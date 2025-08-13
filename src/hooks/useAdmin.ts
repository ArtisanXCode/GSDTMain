import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { supabase } from '../lib/supabase';
import { getTransactionStats, TransactionType, TransactionStatus } from '../services/admin/transactions';

export interface AdminRole {
  id: string;
  wallet_address: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export function useAdmin() {
  const { address } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMinter, setIsMinter] = useState(false);
  const [isBurner, setIsBurner] = useState(false);
  const [isPauser, setIsPauser] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRoles = async () => {
      if (!address) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setIsMinter(false);
        setIsBurner(false);
        setIsPauser(false);
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data: adminRoles, error } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('wallet_address', address.toLowerCase());

        if (error) {
          console.error('Error checking admin roles:', error);
          setLoading(false);
          return;
        }

        const userRoles = adminRoles ? adminRoles.map(r => r.role) : [];
        setRoles(userRoles);

        const hasAdmin = userRoles.includes('admin');
        const hasSuperAdmin = userRoles.includes('super_admin');
        const hasMinter = userRoles.includes('minter');
        const hasBurner = userRoles.includes('burner');
        const hasPauser = userRoles.includes('pauser');

        setIsAdmin(hasAdmin || hasSuperAdmin);
        setIsSuperAdmin(hasSuperAdmin);
        setIsMinter(hasMinter || hasAdmin || hasSuperAdmin);
        setIsBurner(hasBurner || hasAdmin || hasSuperAdmin);
        setIsPauser(hasPauser || hasAdmin || hasSuperAdmin);
      } catch (error) {
        console.error('Error in checkAdminRoles:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRoles();
  }, [address]);

  // Function to get user transaction stats
  const getUserTransactionStats = async () => {
    if (!address) return null;

    try {
      return await getTransactionStats(address);
    } catch (error) {
      console.error('Error fetching user transaction stats:', error);
      return null;
    }
  };

  return {
    isAdmin,
    isSuperAdmin,
    isMinter,
    isBurner,
    isPauser,
    roles,
    loading,
    getUserTransactionStats
  };
}