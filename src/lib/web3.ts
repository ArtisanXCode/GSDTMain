import { ethers } from 'ethers';
import { abi, NFT_abi, contractAddress, NFT_contractAddress } from './constants';

// BSC Testnet RPC
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';

// Default provider for read-only operations
const defaultProvider = new ethers.providers.JsonRpcProvider(BSC_TESTNET_RPC);

export const getContract = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  return contract;
};

export const getReadOnlyContract = () => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    return new ethers.Contract(contractAddress, abi, provider);
  }
  // Fallback to default provider if no wallet
  return new ethers.Contract(contractAddress, abi, defaultProvider);
};

export const getNFTContract = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner();
  const NFTContract = new ethers.Contract(NFT_contractAddress, NFT_abi, signer);
  return NFTContract;
};

export const getReadOnlyNFTContract = () => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    return new ethers.Contract(NFT_contractAddress, NFT_abi, provider);
  }
  // Fallback to default provider if no wallet
  return new ethers.Contract(NFT_contractAddress, NFT_abi, defaultProvider);
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