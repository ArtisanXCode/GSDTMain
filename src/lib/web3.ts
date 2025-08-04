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

export const checkAdminRole = async (address: string): Promise<boolean> => {
  try {
    // Query the admin_roles table from Supabase
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return false;
      }
      console.error('Error fetching user role:', error);

      // Return mock role for testing
      const mockUser = [
        '0x1234567890123456789012345678901234567890',
        '0x2345678901234567890123456789012345678901',
        '0x3456789012345678901234567890123456789012'
      ].find(addr => addr.toLowerCase() === address.toLowerCase());

      return Boolean(mockUser);
    }

    return Boolean(data?.role);
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};

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