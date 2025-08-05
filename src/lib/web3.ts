import { ethers } from 'ethers';
import { GSDC_ABI, GSDC_ADDRESS } from '../contracts/GSDC';
import { GSDC_NFT_ADDRESS, GSDC_NFT_ABI } from '../contracts/GSDC_NFT';
import { supabase } from './supabase';

// Create a default provider for read-only operations
// const defaultProvider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/your-infura-key');

// Create read-only contract instance
// const readOnlyContract = new ethers.Contract(GSDC_ADDRESS, GSDC_ABI, defaultProvider);

// Track connection state
let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;
let connectionInProgress = false;
let connectionPromise: Promise<boolean> | null = null;

export const getReadOnlyContract = () => {
  // Return null if no proper provider is configured
  return null;
};


let nftContract: ethers.Contract | null = null;
// const readOnlyNFTContract = new ethers.Contract(GSDC_NFT_ADDRESS, GSDC_NFT_ABI, defaultProvider);


// Hardcoded DEFAULT_ADMIN_ROLE value from OpenZeppelin's AccessControl
export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// RPC Configuration
const RPC_CONFIG = {
  bscTestnet: {
    url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    chainId: 97,
    name: "BSC Testnet",
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoff: 1.5
    }
  }
};

// POODL RPC Configuration
const RPC_POODL_CONFIG = {
  poodlTestnet: {
    url: "https://testnet-rpc.poodl.org/",
    chainId: 15257,
    name: "POODL Testnet",
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoff: 1.5
    }
  }
};

// Create a provider with retry mechanism
const createProvider = (rpcUrl: string) => {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    name: RPC_CONFIG.bscTestnet.name,
    chainId: RPC_CONFIG.bscTestnet.chainId
  });

  // Wrap provider's send method to add retry logic
  const originalSend = provider.send.bind(provider);
  provider.send = async (method: string, params: any[]) => {
    let lastError;
    let attempt = 0;
    let delay = RPC_CONFIG.bscTestnet.retry.delay;

    while (attempt < RPC_CONFIG.bscTestnet.retry.maxAttempts) {
      try {
        return await originalSend(method, params);
      } catch (error: any) {
        lastError = error;

        // Only retry on rate limit or timeout errors
        if (!error.message?.includes('limit exceeded') &&
            !error.message?.includes('timeout') &&
            error.code !== 'TIMEOUT') {
          throw error;
        }

        attempt++;
        if (attempt === RPC_CONFIG.bscTestnet.retry.maxAttempts) {
          break;
        }

        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= RPC_CONFIG.bscTestnet.retry.backoff;
      }
    }

    throw lastError;
  };

  return provider;
};

// Create default provider for read-only operations
// const defaultProvider = createProvider(RPC_CONFIG.bscTestnet.url);
// const readOnlyContract = new ethers.Contract(GSDC_ADDRESS, GSDC_ABI, defaultProvider);

// Track connection state
// let provider: ethers.providers.Web3Provider | null = null;
// let signer: ethers.Signer | null = null;
// let contract: ethers.Contract | null = null;
// let connectionInProgress = false;
// let connectionPromise: Promise<boolean> | null = null;

// export const getReadOnlyContract = () => readOnlyContract;


// let nftContract: ethers.Contract | null = null;
// const readOnlyNFTContract = new ethers.Contract(GSDC_NFT_ADDRESS, GSDC_NFT_ABI, defaultProvider);


// Hardcoded DEFAULT_ADMIN_ROLE value from OpenZeppelin's AccessControl
// export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const initializeWeb3 = async (requestAccounts = false) => {
  try {
    // If we already have a provider and don't need to request accounts, just return
    if (provider && !requestAccounts) {
      return true;
    }

    // If there's already a connection in progress, return the existing promise
    if (connectionPromise) {
      return connectionPromise;
    }

    // If we're already connected and have a provider, just return
    if (window.ethereum && window.ethereum.selectedAddress && provider && !requestAccounts) {
      return true;
    }

    // Set connection in progress flag
    connectionInProgress = true;

    // Create a new connection promise
    connectionPromise = (async () => {
      try {
        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error('Please install MetaMask to connect your wallet');
        }

        // Create provider if it doesn't exist
        if (!provider) {
          provider = new ethers.providers.Web3Provider(window.ethereum, {
            name: RPC_CONFIG.bscTestnet.name,
            chainId: RPC_CONFIG.bscTestnet.chainId
          });
        }

        // Only request accounts if explicitly asked to
        if (requestAccounts) {
          try {
            // Check if we're already connected
            if (!window.ethereum.selectedAddress) {
              await provider.send("eth_requestAccounts", []);
            }

            // Initialize signer and contract
            signer = provider.getSigner();
            contract = new ethers.Contract(GSDC_ADDRESS, GSDC_ABI, signer);
            nftContract = new ethers.Contract(GSDC_NFT_ADDRESS, GSDC_NFT_ABI, signer);

          } catch (error: any) {
            // If MetaMask is already processing a request, wait for it
            if (error.code === -32002) {
              console.log('MetaMask is already processing a connection request. Waiting...');
              return false;
            }
            throw error;
          }
        } else if (window.ethereum.selectedAddress && !signer) {
          // If already connected but signer not initialized
          signer = provider.getSigner();
          contract = new ethers.Contract(GSDC_ADDRESS, GSDC_ABI, signer);
          nftContract = new ethers.Contract(GSDC_NFT_ADDRESS, GSDC_NFT_ABI, signer);
        }

        return true;
      } catch (error) {
        console.error('Error initializing web3:', error);
        throw error;
      } finally {
        // Clear the connection state
        connectionPromise = null;
        connectionInProgress = false;
      }
    })();

    return connectionPromise;
  } catch (error) {
    console.error('Error in initializeWeb3:', error);
    return false;
  }
};

export const connectWallet = async (): Promise<string | null> => {
  if (connectionInProgress) {
    throw new Error('Connection already in progress');
  }

  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install MetaMask to use this application');
  }

  connectionInProgress = true;

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (accounts.length > 0) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(GSDC_ADDRESS, GSDC_ABI, signer);
      nftContract = new ethers.Contract(GSDC_NFT_ADDRESS, GSDC_NFT_ABI, signer);

      return accounts[0];
    }

    return null;
  } catch (error: any) {
    // Re-throw the error with proper error codes for the hook to handle
    if (error.code === -32002) {
      throw { code: -32002, message: 'Already processing eth_requestAccounts. Please wait.' };
    } else if (error.code === 4001) {
      throw { code: 4001, message: 'User rejected the request.' };
    } else {
      throw error;
    }
  } finally {
    connectionInProgress = false;
  }
};

// Enhanced error handling utility
export const handleBlockchainError = (error: any): string => {
  console.error('Blockchain error details:', error);

  // Handle specific blockchain infrastructure errors
  if (error.code === 'CALL_EXCEPTION') {
    if (error.error?.data?.message?.includes('missing trie node')) {
      return 'Blockchain network is temporarily unavailable due to node synchronization issues. Please wait a moment and try again.';
    }
    if (error.error?.message?.includes('Internal JSON-RPC error')) {
      return 'Blockchain network error occurred. Please check your connection and try again in a few moments.';
    }
    if (error.data === '0x' || error.message?.includes('missing revert data')) {
      return 'The requested contract method is not available or you lack permission to access it. Please ensure you are connected to the correct network and have the required role permissions.';
    }
  }

  // Handle MetaMask/Wallet errors
  if (error.code === -32603 && error.message?.includes('Internal JSON-RPC error')) {
    if (error.data?.message?.includes('missing trie node')) {
      return 'Network synchronization error. Please wait a moment and try again, or switch to a different network and back.';
    }
    return 'Network connectivity issue. Please check your wallet connection and try again.';
  }

  // Handle user rejection
  if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
    return 'Transaction was rejected by user.';
  }

  // Handle insufficient funds
  if (error.code === 'INSUFFICIENT_FUNDS' || error.code === -32000) {
    if (error.message?.includes('insufficient funds')) {
      return 'Insufficient funds for gas fees. Please add more ETH to your wallet.';
    }
  }

  // Handle permission errors
  if (error.message?.includes('AccessControl') || error.message?.includes('missing role')) {
    return 'You do not have the required permissions to perform this action.';
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
    return 'Network connection timeout. Please check your internet connection and try again.';
  }

  // Handle unpredictable gas limit
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Cannot estimate gas for this transaction. Please check your permissions and wallet connection.';
  }

  // Generic fallback
  return error.reason || error.message || 'An unexpected blockchain error occurred. Please try again.';
};

export const getContract = () => {
  try {
    if (!contract) {
      // Try to initialize if we have a selected address
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          // Create provider if it doesn't exist
          if (!provider) {
            provider = new ethers.providers.Web3Provider(window.ethereum, {
              name: RPC_CONFIG.bscTestnet.name,
              chainId: RPC_CONFIG.bscTestnet.chainId
            });
          }

          // Initialize signer and contract
          signer = provider.getSigner();
          contract = new ethers.Contract(GSDC_ADDRESS, GSDC_ABI, signer);
          nftContract = new ethers.Contract(GSDC_NFT_ADDRESS, GSDC_NFT_ABI, signer);
        } catch (error) {
          console.error('Error initializing contract:', error);
          return null;
        }
      } else {
        return null;
      }
    }
    return contract;
  } catch (error) {
    console.error('Error in getContract:', error);
    return null;
  }
};

export const getNFTContract = () => {
  try {
    if (!nftContract) {
      // Try to initialize if we have a selected address
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          // Create provider if it doesn't exist
          if (!provider) {
            provider = new ethers.providers.Web3Provider(window.ethereum, {
              name: RPC_CONFIG.bscTestnet.name,
              chainId: RPC_CONFIG.bscTestnet.chainId
            });
          }

          // Initialize signer and nftContract
          signer = provider.getSigner();
          nftContract = new ethers.Contract(GSDC_NFT_ADDRESS, GSDC_NFT_ABI, signer);
        } catch (error) {
          console.error('Error initializing nftContract:', error);
          return null;
        }
      } else {
        return null;
      }
    }
    return nftContract;
  } catch (error) {
    console.error('Error in getContract:', error);
    return null;
  }
};

export const getAddress = async () => {
  try {
    // Check if MetaMask is available
    if (window.ethereum) {
      try {
        // Try to get accounts without requesting permission
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });

        if (accounts && accounts.length > 0) {
          // Initialize without requesting accounts if we haven't already
          if (!provider || !signer) {
            await initializeWeb3(false);
          }
          return accounts[0];
        }
      } catch (error) {
        // MetaMask is locked or error occurred
        console.log('MetaMask is locked or not accessible');
      }
    }

    // No accounts connected or MetaMask is locked
    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};

export const isConnected = async () => {
  try {
    // Check if MetaMask is available
    if (window.ethereum) {
      try {
        // Try to get accounts without requesting permission
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts && accounts.length > 0;
      } catch (error) {
        // MetaMask is locked or error occurred
        return false;
      }
    }

    return false;
  } catch {
    return false;
  }
};

// Removed checkAdminRole function - use getUserRole from services/admin/roles.ts instead
// This prevents duplicate API calls and infinite recursion issues

export const useProvider = () => provider;
export const useSigner = () => signer;
export const useGSDCContract = () => contract;
export const useGSDCNFTContract = () => nftContract;

export const getTokenBalance = async (address: string): Promise<string> => {
  try {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    const activeContract = contract;
    const balance = await activeContract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
};

export const getCurrentPrice = async (): Promise<string> => {
  try {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    const activeContract = contract;
    const price = await activeContract.currentPrice();
    return ethers.utils.formatEther(price);
  } catch (error) {
    console.error('Error getting current price:', error);
    return '0';
  }
};

export const getKYCStatus = async (address: string): Promise<boolean> => {
  try {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    const activeContract = contract;
    return await activeContract.kycApproved(address);
  } catch (error) {
    console.error('Error getting KYC status:', error);
    return false;
  }
};