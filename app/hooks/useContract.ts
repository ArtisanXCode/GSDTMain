
'use client';

import { useContract, useProvider, useSigner } from 'wagmi';
import { Contract } from 'ethers';
import GSDC_ABI from '../contracts/GSDC.json';

const GSDC_ADDRESS = '0x892404Da09f3D7871C49Cd6d6C167F8EB176C804';

export function useGSDCContract() {
  const provider = useProvider();
  const { data: signer } = useSigner();

  return useContract({
    address: GSDC_ADDRESS,
    abi: GSDC_ABI.abi,
    signerOrProvider: signer || provider,
  }) as Contract;
}
