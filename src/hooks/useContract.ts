
import { Contract } from 'ethers';
import { useProvider, useSigner } from '../utils/web3';
import { GSDC_ADDRESS, GSDC_ABI, MULTISIG_ADMIN_ADDRESS, MULTISIG_ADMIN_ABI } from '../contracts/GSDC';

export function useGSDCContract() {
  const provider = useProvider();
  const signer = useSigner();

  if (!provider) return { contract: null };

  try {
    const contract = new Contract(
      GSDC_ADDRESS,
      GSDC_ABI,
      signer || provider
    );

    return { contract };
  } catch (error) {
    console.warn('Failed to create GSDC contract:', error);
    return { contract: null };
  }
}

export function useMultiSigAdminContract() {
  const provider = useProvider();
  const signer = useSigner();

  if (!provider) return null;

  try {
    const contract = new Contract(
      MULTISIG_ADMIN_ADDRESS,
      MULTISIG_ADMIN_ABI,
      signer || provider
    );

    return contract;
  } catch (error) {
    console.warn('Failed to create MultiSig contract:', error);
    return null;
  }
}

// Add the missing useContract export for compatibility
export const useContract = useGSDCContract;
