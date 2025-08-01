import { Buffer } from 'buffer';

// Polyfill Buffer for browser compatibility
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

import { Contract } from 'ethers';
import { useProvider, useSigner } from '../utils/web3';
import { GSDC_ADDRESS, GSDC_ABI } from '../contracts/GSDC';

export function useGSDCContract() {
  const provider = useProvider();
  const signer = useSigner();

  if (!provider) return null;

  return new Contract(
    GSDC_ADDRESS,
    GSDC_ABI,
    signer || provider
  );
}