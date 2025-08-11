import { useState, useEffect, useCallback } from 'react';
import { initializeWeb3, connectWallet, getAddress, isConnected } from '../lib/web3';
import { getUserRole, AdminRole } from '../services/admin';

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [connectionAttemptInProgress, setConnectionAttemptInProgress] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const checkConnection = useCallback(async () => {
    try {
      // Check if MetaMask is available
      if (window.ethereum) {
        try {
          // Try to get accounts without requesting permission
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });

          if (accounts && accounts.length > 0 && window.ethereum.selectedAddress) {
            const addr = accounts[0];
            setAddress(addr);
            setIsConnected(true);

            // Check if user is admin and get role
            try {
              const role = await getUserRole(addr);
              setIsAdmin(!!role);
              setAdminRole(role);
            } catch (error) {
              console.error('Error fetching admin role:', error);
              setIsAdmin(false);
              setAdminRole(null);
            }
          } else {
            // MetaMask is not connected or locked
            setAddress(null);
            setIsConnected(false);
            setIsAdmin(false);
            setAdminRole(null);
          }
        } catch (error) {
          // Error getting accounts (likely MetaMask is locked)
          console.log('MetaMask is locked or not connected');
          setAddress(null);
          setIsConnected(false);
          setIsAdmin(false);
          setAdminRole(null);
        }
      } else {
        // MetaMask not installed
        setAddress(null);
        setIsConnected(false);
        setIsAdmin(false);
        setAdminRole(null);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error checking wallet connection:', err);
      setError(err.message || 'Error checking wallet connection');
      setAddress(null);
      setIsConnected(false);
      setIsAdmin(false);
      setAdminRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, []);

  // Additional effect to ensure address is always up to date
  useEffect(() => {
    if (isConnected && !address) {
      checkConnection();
    }
  }, [isConnected, address]);

  const connect = async () => {
    // Prevent multiple simultaneous connection attempts
    if (connectionAttemptInProgress) {
      return null;
    }

    try {
      setConnectionAttemptInProgress(true);
      setLoading(true);
      setError(null);

      // Connect wallet - this will handle the MetaMask popup
      const addr = await connectWallet();

      if (addr) {
        setAddress(addr);
        setIsConnected(true);

        // Check if user is admin and get role
        try {
          const role = await getUserRole(addr);
          setIsAdmin(!!role);
          setAdminRole(role);
        } catch (error) {
          console.error('Error fetching admin role:', error);
          setIsAdmin(false);
          setAdminRole(null);
        }

        return addr;
      }

      throw new Error('Failed to connect wallet');
    } catch (err: any) {
      // Handle specific MetaMask errors
      if (err.code === -32002) {
        console.log('MetaMask is already processing a request. Please check your MetaMask extension.');
        setError('MetaMask is processing another request. Please check your MetaMask extension and try again.');
      } else if (err.code === 4001 || err.message && (
        err.message.includes('User rejected') ||
        err.message.includes('user rejected') ||
        err.message.includes('User denied')
      )) {
        console.log('User rejected wallet connection');
        // Don't set error for user rejection, just reset state
      } else {
        console.error('Error connecting wallet:', err);
        setError(err.message || 'Error connecting wallet');
      }
      return null;
    } finally {
      setLoading(false);
      setConnectionAttemptInProgress(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);

      // Reset state - no localStorage clearing needed
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

  return {
    address,
    isConnected,
    loading,
    error,
    connect,
    disconnect,
    checkConnection,
    isAdmin,
    adminRole,
    connectionAttemptInProgress
  };
};