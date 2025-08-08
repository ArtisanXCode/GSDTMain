
import { GSDC_ADDRESS, GSDC_ABI } from '../contracts/GSDC';
import { GSDC_NFT_ADDRESS } from '../contracts/GSDC';

// Import the full ABI from the JSON file
import GSDCAbi from '../contracts/GSDC.json';

export const contractAddress = GSDC_ADDRESS;
export const abi = GSDCAbi.abi;

export const NFT_contractAddress = GSDC_NFT_ADDRESS;
export const NFT_abi = [
  // Add your NFT ABI here - this is a placeholder
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol", 
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];
