
import { getContract } from '../lib/web3';
import { supabase } from '../lib/supabase';

export interface PauseAction {
  id: string;
  action_type: 'PAUSE' | 'UNPAUSE';
  reason: string;
  admin_address: string;
  admin_name: string;
  transaction_hash: string | null;
  created_at: string;
  is_active: boolean;
}

export const pauseService = {
  async pauseContract(reason: string): Promise<string> {
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // Call the pause function on the smart contract
      const tx = await contract.pause({
        gasLimit: 100000,
      });

      console.log("Pause transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("Pause transaction confirmed:", receipt.transactionHash);

      // Log the pause action in the database
      await supabase.from('pause_actions').insert({
        action_type: 'PAUSE',
        reason,
        transaction_hash: receipt.transactionHash,
        is_active: true
      });

      return receipt.transactionHash;
    } catch (error: any) {
      console.error("Error pausing contract:", error);
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        throw new Error("Transaction was rejected by user.");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient funds for gas fees.");
      } else {
        const errorMessage = error.reason || error.message || "Failed to pause contract";
        throw new Error(errorMessage);
      }
    }
  },

  async unpauseContract(reason: string): Promise<string> {
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // Call the unpause function on the smart contract
      const tx = await contract.unpause({
        gasLimit: 100000,
      });

      console.log("Unpause transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("Unpause transaction confirmed:", receipt.transactionHash);

      // Mark previous pause as inactive and log the unpause action
      await supabase.from('pause_actions').update({ is_active: false }).eq('is_active', true);
      
      await supabase.from('pause_actions').insert({
        action_type: 'UNPAUSE',
        reason,
        transaction_hash: receipt.transactionHash,
        is_active: false
      });

      return receipt.transactionHash;
    } catch (error: any) {
      console.error("Error unpausing contract:", error);
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        throw new Error("Transaction was rejected by user.");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient funds for gas fees.");
      } else {
        const errorMessage = error.reason || error.message || "Failed to unpause contract";
        throw new Error(errorMessage);
      }
    }
  },

  async isPaused(): Promise<boolean> {
    try {
      const contract = getContract();
      if (!contract) {
        return false;
      }

      return await contract.paused();
    } catch (error) {
      console.error("Error checking pause status:", error);
      return false;
    }
  },

  async getPauseHistory(): Promise<PauseAction[]> {
    try {
      const { data, error } = await supabase
        .from('pause_actions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching pause history:", error);
      throw error;
    }
  }
};
