import { useState, useEffect, useCallback } from 'react';
import { getUserRole, AdminRole } from '../services/admin';

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Load saved address from localStorage on component mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('manualWalletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
      checkAdminRole(savedAddress);
    }
  }, []);

  const checkAdminRole = useCallback(async (walletAddress: string) => {
    try {
      const role = await getUserRole(walletAddress);
      setIsAdmin(!!role);
      setAdminRole(role);
    } catch (error) {
      console.error('Error fetching admin role:', error);
      setIsAdmin(false);
      setAdminRole(null);
    }
  }, []);

  const setManualAddress = async (walletAddress: string) => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }

      // Basic format validation (starts with 0x and is 42 characters)
      if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
        throw new Error('Invalid wallet address format');
      }

      // Save to localStorage and state
      localStorage.setItem('manualWalletAddress', walletAddress);
      setAddress(walletAddress);
      setIsConnected(true);

      // Check admin role
      await checkAdminRole(walletAddress);

      return walletAddress;
    } catch (err: any) {
      console.error('Error setting manual address:', err);
      setError(err.message || 'Error setting wallet address');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);

      // Clear localStorage and reset state
      localStorage.removeItem('manualWalletAddress');
      setAddress(null);
      setIsConnected(false);
      setIsAdmin(false);
      setAdminRole(null);
      setError(null);
    } catch (err: any) {
      console.error('Error disconnecting wallet:', err);
      setError(err.message || 'Error disconnecting wallet');
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = useCallback(() => {
    // This is now just checking if we have a manually set address
    const savedAddress = localStorage.getItem('manualWalletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
      checkAdminRole(savedAddress);
    }
  }, [checkAdminRole]);

  return {
    address,
    isConnected,
    loading,
    error,
    setManualAddress,
    disconnect,
    checkConnection,
    isAdmin,
    adminRole,
    connectionAttemptInProgress: false
  };
};