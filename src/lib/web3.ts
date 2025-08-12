import { ethers } from 'ethers';
import { abi, NFT_abi, contractAddress, NFT_contractAddress } from './constants';

// BSC Testnet RPC
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

// Default provider for read-only operations
const defaultProvider = new ethers.providers.JsonRpcProvider(BSC_TESTNET_RPC);

export const getContract = (): ethers.Contract | null => {
  try {
    if (!window.ethereum) {
      console.warn('MetaMask not detected');
      return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Check if wallet is connected
    if (!window.ethereum.selectedAddress) {
      console.warn('Wallet not connected');
      return null;
    }

    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Verify contract has a signer
    if (!contract.signer) {
      console.error('Contract does not have a signer attached');
      return null;
    }

    return contract;
  } catch (error) {
    console.error('Error creating contract instance:', error);
    return null;
  }
};

export const getReadOnlyContract = (): ethers.Contract | null => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    return new ethers.Contract(contractAddress, abi, provider);
  }
  // Fallback to default provider if no wallet
  return new ethers.Contract(contractAddress, abi, defaultProvider);
};

export const getNFTContract = (): ethers.Contract | null => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner();
  const NFTContract = new ethers.Contract(NFT_contractAddress, NFT_abi, signer);
  return NFTContract;
};

export const getReadOnlyNFTContract = (): ethers.Contract | null => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    return new ethers.Contract(NFT_contractAddress, NFT_abi, provider);
  }
  // Fallback to default provider if no wallet
  return new ethers.Contract(NFT_contractAddress, NFT_abi, defaultProvider);
};

// Connect wallet function
export const connectWallet = async (): Promise<string | null> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    if (accounts && accounts.length > 0) {
      return accounts[0];
    }

    return null;
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

// Get current wallet address
export const getAddress = async (): Promise<string | null> => {
  try {
    if (!window.ethereum) {
      return null;
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });

    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Failed to get address:', error);
    return null;
  }
};

// Check if wallet is connected
export const isConnected = async (): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      return false;
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });

    return accounts && accounts.length > 0;
  } catch (error) {
    console.error('Failed to check connection:', error);
    return false;
  }
};

// Initialize web3 connection
export const initializeWeb3 = async () => {
  try {
    if (window.ethereum) {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize web3:', error);
    return false;
  }
};

// Handle blockchain errors
export const handleBlockchainError = (error: any): string => {
  console.error('Blockchain Error:', error);

  if (error?.reason) {
    return error.reason;
  }

  if (error?.message) {
    // MetaMask specific errors
    if (error.message.includes('User denied transaction signature')) {
      return 'Transaction was cancelled by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('execution reverted')) {
      return 'Transaction failed: Smart contract execution reverted';
    }
    if (error.message.includes('network changed')) {
      return 'Network changed. Please try again';
    }
    if (error.message.includes('MetaMask is not installed')) {
      return 'MetaMask is not installed. Please install MetaMask to continue';
    }
    if (error.message.includes('Contract not initialized')) {
      return 'Contract not initialized. Please connect your wallet and try again';
    }

    return error.message;
  }

  if (error?.code) {
    switch (error.code) {
      case -32002:
        return 'MetaMask is processing another request. Please check your MetaMask extension';
      case -32603:
        return 'Internal JSON-RPC error';
      case 4001:
        return 'Transaction was rejected by user';
      case 4100:
        return 'The requested account and/or method has not been authorized';
      case 4200:
        return 'The requested method is not supported';
      case 4900:
        return 'The provider is disconnected from all chains';
      case 4901:
        return 'The provider is disconnected from the specified chain';
      default:
        return `Blockchain error (code: ${error.code})`;
    }
  }

  return 'An unknown blockchain error occurred';
};

// Switch to BSC network
export const switchToBSCNetwork = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to BSC testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x61' }], // BSC testnet chain ID
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x61', // BSC testnet
              chainName: 'BSC Testnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'tBNB',
                decimals: 18,
              },
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              blockExplorerUrls: ['https://testnet.bscscan.com/'],
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add BSC network to MetaMask');
      }
    } else {
      throw switchError;
    }
  }
};

// Get current network
export const getCurrentNetwork = async (): Promise<string | null> => {
  try {
    if (!window.ethereum) {
      return null;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting current network:', error);
    return null;
  }
};

// Check if on correct network (BSC testnet)
export const isOnCorrectNetwork = async (): Promise<boolean> => {
  try {
    const currentNetwork = await getCurrentNetwork();
    return currentNetwork === '0x61'; // BSC testnet
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};