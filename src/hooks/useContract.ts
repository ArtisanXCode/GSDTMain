
import { Contract } from 'ethers';
import { useProvider, useSigner } from '../utils/web3';
import GSDC_ABI from '../contracts/GSDC.json';

const GSDC_ADDRESS = '0x220d5864596FF5da9E361B55841299840673E32b';

export function useGSDCContract() {
  const provider = useProvider();
  const signer = useSigner();

  if (!provider) return null;

  return new Contract(
    GSDC_ADDRESS,
    GSDC_ABI.abi,
    signer || provider
  );
}
