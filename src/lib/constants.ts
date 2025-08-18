
import { GSDC_ADDRESS, GSDC_ABI } from '../contracts/GSDC';
import { GSDC_NFT_ADDRESS, GSDC_NFT_ABI } from '../contracts/GSDC_NFT';

console.log('Constants loaded:', {
  GSDC_ADDRESS,
  GSDC_NFT_ADDRESS,
  GSDC_ABI_length: GSDC_ABI ? GSDC_ABI.length : 0,
  GSDC_NFT_ABI_length: GSDC_NFT_ABI ? GSDC_NFT_ABI.length : 0,
  GSDC_NFT_ADDRESS_valid: GSDC_NFT_ADDRESS ? true : false,
  GSDC_NFT_ABI_valid: Array.isArray(GSDC_NFT_ABI) && GSDC_NFT_ABI.length > 0
});

// Validate NFT contract configuration
if (!GSDC_NFT_ADDRESS) {
  console.error('GSDC_NFT_ADDRESS is not defined!');
}

if (!GSDC_NFT_ABI || !Array.isArray(GSDC_NFT_ABI) || GSDC_NFT_ABI.length === 0) {
  console.error('GSDC_NFT_ABI is not properly defined!');
}

export const contractAddress = GSDC_ADDRESS;
export const abi = GSDC_ABI;

export const NFT_contractAddress = GSDC_NFT_ADDRESS;
export const NFT_abi = GSDC_NFT_ABI;