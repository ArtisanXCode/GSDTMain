import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

// Provider and signer state
let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;

// Initialize provider and signer
export const initWeb3 = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      signer = provider.getSigner();
      return true;
    } catch (error) {
      console.error('User denied account access', error);
      return false;
    }
  } else {
    console.log('No Ethereum browser extension detected');
    return false;
  }
};

// Get provider
export function useProvider() {
  if (!window.ethereum) return null;

  try {
    return new ethers.providers.Web3Provider(window.ethereum);
  } catch (error) {
    console.warn('Failed to get provider:', error);
    return null;
  }
}

// Get signer
export function useSigner() {
  const { address, isConnected } = useAccount(); // Assuming useAccount is defined elsewhere and returns { address, isConnected }

  if (!isConnected || !address || !window.ethereum) return null;

  try {
    return new ethers.providers.Web3Provider(window.ethereum).getSigner();
  } catch (error) {
    console.warn('Failed to get signer:', error);
    return null;
  }
}

// Get account
export const useAccount = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const getAccount = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          } else {
            setAddress(null);
            setIsConnected(false);
          }
        } catch (error) {
          console.error('Error getting accounts:', error);
          setAddress(null);
          setIsConnected(false);
        }
      }
    };

    getAccount();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const connect = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          return accounts[0];
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
    return null;
  };

  return { address, isConnected, connect };
};