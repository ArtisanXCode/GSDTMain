
export const GSDC_NFT_ADDRESS = '0xee41d086AFe902F66D48011d147c0A873568Da9D' as const;

export const GSDC_NFT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string", 
        "name": "symbol",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
] as const;
