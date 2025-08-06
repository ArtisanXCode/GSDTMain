
'use client';

import { useContract, useProvider, useSigner } from 'wagmi';
import { Contract } from 'ethers';
import { GSDC_ADDRESS, GSDC_ABI } from '../contracts/GSDC.json';

export function useGSDCContract() {
  const provider = useProvider();
  const { data: signer } = useSigner();

  return useContract({
    address: GSDC_ADDRESS,
    abi: GSDC_ABI.abi,
    signerOrProvider: signer || provider,
  }) as Contract;
}
