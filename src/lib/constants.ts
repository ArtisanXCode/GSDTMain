
import { GSDC_ADDRESS, GSDC_ABI } from '../contracts/GSDC';
import { GSDC_NFT_ADDRESS, GSDC_NFT_ABI } from '../contracts/GSDC_NFT';

console.log('Constants loaded:', {
  GSDC_ADDRESS,
  GSDC_NFT_ADDRESS,
  GSDC_ABI_length: GSDC_ABI ? GSDC_ABI.length : 0,
  GSDC_NFT_ABI_length: GSDC_NFT_ABI ? GSDC_NFT_ABI.length : 0
});

export const contractAddress = GSDC_ADDRESS;
export const abi = GSDC_ABI;

export const NFT_contractAddress = GSDC_NFT_ADDRESS;
export const NFT_abi = GSDC_NFT_ABI;