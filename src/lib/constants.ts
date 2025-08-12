
import { GSDC_ADDRESS, GSDC_ABI } from '../contracts/GSDC';
import { GSDC_NFT_ADDRESS, GSDC_NFT_ABI } from '../contracts/GSDC_NFT';

// Import the full ABI from the JSON file
import GSDCAbi from '../contracts/GSDC.json';

export const contractAddress = GSDC_ADDRESS;
export const abi = GSDCAbi.abi;

export const NFT_contractAddress = GSDC_NFT_ADDRESS;
export const NFT_abi = GSDC_NFT_ABI;
