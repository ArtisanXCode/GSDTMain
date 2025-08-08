import { ethers } from 'ethers';
import { abi, NFT_abi, contractAddress, NFT_contractAddress } from './constants';

export const getContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  return contract;
};

export const getReadOnlyContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const readOnlyContract = new ethers.Contract(contractAddress, abi, provider);
  return readOnlyContract;
};

export const getNFTContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner();
  const NFTContract = new ethers.Contract(NFT_contractAddress, NFT_abi, signer);
  return NFTContract;
};

export const getReadOnlyNFTContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const readOnlyNFTContract = new ethers.Contract(NFT_contractAddress, NFT_abi, provider);
  return readOnlyNFTContract;
};