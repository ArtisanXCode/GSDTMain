import { supabase } from "../lib/supabase";
import { getContract, getNFTContract, getReadOnlyNFTContract } from "../lib/web3";
import { ethers } from "ethers";

import { getSumsubApplicantStatus } from "../services/sumsub";

export enum KYCStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface KYCRequest {
  id: string;
  user_address: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  document_type: string;
  document_url: string;
  status: KYCStatus;
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  verification_method?: "manual" | "sumsub";
  sumsub_applicant_id?: string;
  sumsub_data?: any;
}

export interface KYCStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface KYCSubmissionData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  document_type: string;
  document_url: string;
  user_address: string;
  verification_method?: "manual" | "sumsub";
  sumsub_applicant_id?: string;
}

export const getDatabaseUserKYCStatus = async (
  userAddress: string,
): Promise<KYCStats> => {
  try {
    let query = supabase
      .from("kyc_requests")
      .select("*")
      .eq("user_address", userAddress);
    const { data: dataRes, error: error1 } = await query;

    if (dataRes.length > 0) {
      return dataRes[0];
    } else {
      return false;
    }
  } catch (error) {}
};

export const getKYCStats = async (): Promise<KYCStats> => {
  try {
    const { data, error } = await supabase
      .from("kyc_requests")
      .select("status");

    if (error) throw error;

    return {
      total: data.length,
      pending: data.filter((r) => r.status === KYCStatus.PENDING).length,
      approved: data.filter((r) => r.status === KYCStatus.APPROVED).length,
      rejected: data.filter((r) => r.status === KYCStatus.REJECTED).length,
    };
  } catch (error) {
    console.error("Error fetching KYC stats:", error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
  }
};

export const getUserKYCStatus = async (
  userAddress: string,
): Promise<{ status: KYCStatus; request?: KYCRequest } | null> => {
  try {
    // Validate user address format first
    if (!userAddress || !ethers.utils.isAddress(userAddress)) {
      console.error("Invalid user address format:", userAddress);
      return { status: KYCStatus.NOT_SUBMITTED };
    }

    console.log("Checking KYC status for address:", userAddress);

    // First check database for existing KYC request
    try {
      const { data: existingRequest, error: dbError } = await supabase
        .from('kyc_requests')
        .select('*')
        .eq('user_address', userAddress)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!dbError && existingRequest) {
        console.log("Found existing KYC request in database:", existingRequest.status);
        return {
          status: existingRequest.status as KYCStatus,
          request: existingRequest as KYCRequest
        };
      }
    } catch (dbError) {
      console.warn("Database check failed, falling back to NFT contract:", dbError);
    }

    // Check NFT contract for KYC approval
    const contract_NFT = getReadOnlyNFTContract();
    console.log("NFT Contract instance:", {
      contractExists: !!contract_NFT,
      contractAddress: contract_NFT?.address,
      hasBalanceOf: contract_NFT ? typeof contract_NFT.balanceOf === 'function' : false,
      provider: contract_NFT?.provider?.constructor?.name
    });
    
    if (contract_NFT) {
      try {
        // Verify contract has the balanceOf function
        if (typeof contract_NFT.balanceOf !== 'function') {
          console.error("NFT contract does not have balanceOf function");
          return { status: KYCStatus.NOT_SUBMITTED };
        }

        console.log("Attempting to call balanceOf for address:", userAddress);

        // First check if the contract exists by getting its code
        try {
          const provider = contract_NFT.provider;
          const contractCode = await provider.getCode(contract_NFT.address);
          
          if (contractCode === '0x') {
            console.error("No contract deployed at address:", contract_NFT.address);
            return { status: KYCStatus.NOT_SUBMITTED };
          }
          
          console.log("Contract verified - code length:", contractCode.length);
        } catch (codeError) {
          console.error("Error checking contract code:", codeError);
          return { status: KYCStatus.NOT_SUBMITTED };
        }

        // Add timeout to prevent hanging calls
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Contract call timeout after 10 seconds')), 10000);
        });

        // Try the balanceOf call with timeout protection
        console.log("Making balanceOf call with parameters:", {
          contractAddress: contract_NFT.address,
          userAddress: userAddress,
          isValidAddress: ethers.utils.isAddress(userAddress)
        });

        const balancePromise = contract_NFT.balanceOf(userAddress);
        
        const userBalance = await Promise.race([balancePromise, timeoutPromise]);
        const readableBalance = ethers.utils.formatUnits(userBalance, 0); // NFTs are usually whole numbers
        
        console.log("NFT Balance check successful:", {
          userAddress,
          rawBalance: userBalance.toString(),
          readableBalance,
          hasTokens: parseInt(readableBalance) > 0
        });
        
        if (parseInt(readableBalance) > 0) {
          return { status: KYCStatus.APPROVED };
        } else {
          return { status: KYCStatus.NOT_SUBMITTED };
        }
      } catch (nftError: any) {
        console.error("Error checking NFT balance:", nftError);
        
        // Detailed error logging
        console.error("NFT Error details:", {
          message: nftError.message,
          code: nftError.code,
          reason: nftError.reason,
          data: nftError.data,
          stack: nftError.stack?.split('\n')[0] // First line of stack trace
        });
        
        // Handle specific error cases
        if (nftError.message?.includes('missing revert data') || 
            nftError.message?.includes('call exception') ||
            nftError.message?.includes('missing trie node')) {
          console.warn("Blockchain connectivity issue detected:");
          console.warn("1. RPC node may be experiencing issues");
          console.warn("2. Network connectivity problems");
          console.warn("3. Contract state synchronization issues");
          console.warn("Falling back to database-only KYC status");
          
          // Return NOT_SUBMITTED since we couldn't verify on-chain
          return { status: KYCStatus.NOT_SUBMITTED };
          
        } else if (nftError.message?.includes('timeout')) {
          console.warn("Contract call timed out - network or RPC issues");
          return { status: KYCStatus.NOT_SUBMITTED };
        } else if (nftError.code === 'NETWORK_ERROR' || nftError.code === -32603) {
          console.warn("Network error when calling NFT contract");
          return { status: KYCStatus.NOT_SUBMITTED };
        } else if (nftError.code === 'CALL_EXCEPTION') {
          console.warn("Call exception - contract function call failed");
          return { status: KYCStatus.NOT_SUBMITTED };
        }
        
        // Return default status for any other errors
        return { status: KYCStatus.NOT_SUBMITTED };
      }
    } else {
      console.warn("NFT contract not available - contract initialization failed");
      return { status: KYCStatus.NOT_SUBMITTED };
    }
  } catch (error) {
    console.error("Error fetching user KYC status:", error);
    return { status: KYCStatus.NOT_SUBMITTED };
  }
};

export const submitKYCRequest = async (
  data: KYCSubmissionData,
): Promise<void> => {
  try {
    let query = supabase
      .from("kyc_requests")
      .select("*")
      .eq("user_address", data.user_address)
      .order("submitted_at", { ascending: false });

    const { data: dataRes, error: error1 } = await query;

    if (dataRes.length > 0) {
      var requestId = dataRes[0].id;

      const { error } = await supabase
        .from("kyc_requests")
        .update({
          status: KYCStatus.APPROVED,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);
    } else {
      const appIdStatus = await getSumsubApplicantStatus(
        data.user_address,
        data.sumsub_applicant_id,
      );

      var kycStatusSMSB = KYCStatus.PENDING;
      if (appIdStatus?.reviewStatus === "completed") {
        kycStatusSMSB = KYCStatus.APPROVED;
      }
      const { error } = await supabase.from("kyc_requests").insert([
        {
          ...data,
          status: kycStatusSMSB,
          submitted_at: new Date().toISOString(),
          verification_method: data.verification_method || "manual",
        },
      ]);
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error submitting KYC request:", error);
    throw error;
  }
};

export const fetchKYCRequests = async (
  status?: KYCStatus,
): Promise<KYCRequest[]> => {
  try {
    let query = supabase
      .from("kyc_requests")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching KYC requests:", error);
      return [];
    }

    return data as KYCRequest[];
  } catch (error) {
    console.error("Error fetching KYC requests:", error);
    return [];
  }
};

export const approveKYCRequest = async (requestId: string): Promise<void> => {
  try {
    // Check wallet connection first
    if (!window.ethereum) {
      throw new Error("Please install MetaMask to use this feature.");
    }

    // If not connected, try to connect automatically
    if (!window.ethereum.selectedAddress) {
      try {
        console.log("Wallet not connected. Attempting to connect...");
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Recheck connection after request
        if (!window.ethereum.selectedAddress) {
          throw new Error(
            "Please connect your wallet first. Click on MetaMask extension and connect your account.",
          );
        }
      } catch (connectionError: any) {
        if (connectionError.code === 4001) {
          throw new Error(
            "Wallet connection was rejected. Please connect your wallet and try again.",
          );
        } else if (connectionError.code === -32002) {
          throw new Error(
            "MetaMask is already processing a connection request. Please check MetaMask and complete the connection.",
          );
        } else {
          throw new Error(
            "Failed to connect wallet. Please open MetaMask and connect manually, then try again.",
          );
        }
      }
    }

    // First get the KYC request details
    const { data: request, error: fetchError } = await supabase
      .from("kyc_requests")
      .select("user_address, verification_method")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      throw new Error("KYC request not found");
    }

    const userAddress = request.user_address;
    const verificationMethod = request.verification_method;

    // Get contract with signer
    const contract = getContract();
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet 123.");
    }

    // Verify this is a contract with signer, not read-only
    if (!contract.signer) {
      throw new Error(
        "Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.",
      );
    }

    // Check if the contract has the required functions
    if (!contract.updateKYCStatus) {
      throw new Error("Contract does not have updateKYCStatus function");
    }

    // Try to estimate gas first to catch permission errors early
    console.log("Approving KYC for user:", userAddress);
    try {
      // Check if the contract has the signer properly
      const signerAddress = await contract.signer.getAddress();
      console.log("Signer address:", signerAddress);

      // Check if contract has the updateKYCStatus function
      if (!contract.updateKYCStatus) {
        throw new Error("Contract does not have updateKYCStatus function. Please check the contract ABI.");
      }

      // Verify the user's address is valid
      if (!ethers.utils.isAddress(userAddress)) {
        throw new Error("Invalid user address format.");
      }
      
      await contract.estimateGas.updateKYCStatus(userAddress, true);
    } catch (gasError: any) {
      console.error("Gas estimation failed:", gasError);

      // Handle specific error cases
      if (
        gasError.message?.includes("sending a transaction requires a signer") ||
        gasError.code === "UNSUPPORTED_OPERATION"
      ) {
        throw new Error(
          "Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.",
        );
      } else if (
        gasError.message?.includes("AccessControl") ||
        gasError.message?.includes("missing role") ||
        gasError.reason?.includes("AccessControl") ||
        gasError.message?.includes("Ownable: caller is not the owner") ||
        gasError.reason?.includes("caller is not the owner")
      ) {
        throw new Error(
          "You do not have permission to approve KYC requests. Only users with ADMIN role can approve KYC. Please ensure your wallet address has the required permissions on the smart contract.",
        );
      } else if (
        gasError.message?.includes("user rejected") ||
        gasError.code === 4001 ||
        gasError.code === "ACTION_REJECTED"
      ) {
        throw new Error("Transaction was rejected by user.");
      } else if (
        gasError.code === "UNPREDICTABLE_GAS_LIMIT" ||
        gasError.code === "CALL_EXCEPTION"
      ) {
        throw new Error(
          "Smart contract call failed. This might be due to insufficient permissions or contract state issues. Please check your admin role permissions.",
        );
      } else if (gasError.code === "NETWORK_ERROR") {
        throw new Error(
          "Blockchain network error occurred. Please ensure the RPC node or blockchain network is reachable and try again.",
        );
      } else if (gasError.code === "INSUFFICIENT_FUNDS") {
        throw new Error(
          "Insufficient funds for gas fees. Please add more ETH to your wallet.",
        );
      } else if (gasError.message?.includes("Contract does not have updateKYCStatus function")) {
        throw new Error("Contract configuration error. The smart contract does not have the required updateKYCStatus function.");
      } else {
        // Extract meaningful error message from the error object
        const errorMessage =
          gasError.reason ||
          gasError.message ||
          gasError.data?.message ||
          "Unknown error occurred";
        throw new Error(`Transaction would fail: ${errorMessage}`);
      }
    }

    // Execute the KYC status update
    try {
      // Get current gas price from network
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const gasPrice = await provider.getGasPrice();
      
      // Estimate gas limit for the transaction
      let gasLimit = 100000; // Default fallback
      try {
        const estimatedGas = await contract.estimateGas.updateKYCStatus(userAddress, true);
        gasLimit = Math.ceil(estimatedGas.toNumber() * 1.2); // Add 20% buffer
        console.log("Estimated gas limit:", gasLimit);
      } catch (gasEstError) {
        console.warn("Gas estimation failed, using default:", gasLimit);
      }

      const kycTx = await contract.updateKYCStatus(userAddress, true, {
        gasLimit: gasLimit,
        gasPrice: gasPrice.mul(110).div(100), // Use network gas price + 10%
      });
      console.log("KYC transaction submitted:", kycTx.hash);
      const receipt = await kycTx.wait();
      console.log("KYC transaction confirmed:", receipt.transactionHash);
    } catch (txError: any) {
      console.error("Transaction execution failed:", txError);
      
      if (txError.code === "CALL_EXCEPTION") {
        throw new Error(
          "Smart contract call failed. This might be due to insufficient permissions or contract state issues. Please check your admin role permissions."
        );
      } else if (txError.code === 4001 || txError.code === "ACTION_REJECTED") {
        throw new Error("Transaction was rejected by user.");
      } else if (txError.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient funds for gas fees. Please add more ETH to your wallet.");
      } else {
        const errorMessage = txError.reason || txError.message || "Transaction failed";
        throw new Error(`Transaction execution failed: ${errorMessage}`);
      }
    }

    // For manual KYC requests, mint GSDC_NFT to the user's wallet via API
    if (verificationMethod === "manual") {
      console.log("Minting GSDC_NFT for manual KYC approval:", userAddress);
      try {
        const MINT_TOKEN_API_URL = import.meta.env.VITE_MINT_TOKEN_API_URL;
        const MINT_TOKEN_API_SECRET_CODE = import.meta.env.VITE_MINT_TOKEN_API_SECRET_CODE;

        if (!MINT_TOKEN_API_URL || !MINT_TOKEN_API_SECRET_CODE) {
          console.warn("Mint API configuration missing - skipping NFT minting");
        } else {
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          try {
            const response = await fetch(`${MINT_TOKEN_API_URL}/validatewallet`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userwallet: userAddress,
                secretcode: MINT_TOKEN_API_SECRET_CODE
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(`API call failed with status: ${response.status}`);
            }

            const responseData = await response.text();
            console.log("Successfully called mint API for GSDC_NFT:", userAddress, responseData);
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
              console.warn("Mint API call timed out after 10 seconds - continuing with KYC approval");
            } else {
              throw fetchError;
            }
          }
        }
      } catch (mintError) {
        console.error(
          "Error calling mint API for manual KYC approval:",
          mintError,
        );
        // Don't throw here - KYC approval succeeded, minting failed
        // The admin can manually mint NFT if needed
      }
    }

    // For manual KYC approvals, call our webhook API to sync with external systems
    if (verificationMethod === "manual") {
      try {
        const SUMSUB_NODE_API_URL = import.meta.env.VITE_SUMSUB_NODE_API_URL;
        const apiUrl = SUMSUB_NODE_API_URL + "/webhooks/sumsub";

        const webhookPayload = {
          applicantId: `manual-${userAddress}-${Date.now()}`,
          inspectionId: `manual-${userAddress}-${Date.now()}`,
          correlationId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          externalUserId: userAddress,
          levelName: "manual-verification",
          type: "applicantReviewed",
          reviewResult: {
            reviewAnswer: "GREEN",
          },
          reviewStatus: "completed",
          createdAtMs: new Date().toISOString(),
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-payload-digest": import.meta.env.VITE_SUMSUB_WEBHOOK_KEYPAIR,
            "x-payload-sign": import.meta.env.VITE_SUMSUB_WEBHOOK_KEYPAIR,
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!response.ok) {
          throw new Error(
            `Manual KYC webhook API failed with status: ${response.status}`,
          );
        }

        console.log("Manual KYC webhook API called successfully");
      } catch (webhookError) {
        console.error("Error calling manual KYC webhook API:", webhookError);
        // Don't throw here - the KYC approval should still proceed even if webhook fails
      }
    }

    // Get user email for notification
    const { data: authUser } = await supabase.auth.getUser();
    const userEmail = authUser?.user?.email;

    // Update the database
    const { error } = await supabase
      .from("kyc_requests")
      .update({
        status: KYCStatus.APPROVED,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) throw error;

    // Send approval email notification
    if (userEmail) {
      try {
        const emailResponse = await fetch('/api/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: userEmail,
            type: 'kyc_approved',
            data: {
              firstName: request.first_name || 'User',
              mintingUrl: `${window.location.origin}/token-minting`
            }
          })
        });
        
        if (!emailResponse.ok) {
          console.warn('Failed to send KYC approval email');
        }
      } catch (emailError) {
        console.error('Error sending KYC approval email:', emailError);
      }
    }
  } catch (error: any) {
    console.error("Error approving KYC request:", error);

    // Handle different types of errors with specific messages
    if (error.message?.includes("sending a transaction requires a signer")) {
      throw new Error(
        "Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.",
      );
    } else if (error.code === "ACTION_REJECTED" || error.code === 4001) {
      throw new Error("Transaction was rejected by user.");
    } else if (error.code === "INSUFFICIENT_FUNDS" || error.code === -32000) {
      throw new Error(
        "Insufficient funds for gas fees. Please add more ETH to your wallet.",
      );
    } else if (error.code === "NETWORK_ERROR" || error.code === "TIMEOUT") {
      throw new Error(
        "Blockchain network error occurred. Please ensure the RPC node or blockchain network is reachable and try again.",
      );
    } else if (
      error.message?.includes("AccessControl") ||
      error.message?.includes("missing role")
    ) {
      throw new Error(
        "You do not have permission to approve KYC requests. Only users with ADMIN role can approve KYC.",
      );
    } else if (error.message?.includes("execution reverted")) {
      const revertReason = error.data?.message || error.reason || error.message;
      throw new Error(`Smart contract error: ${revertReason}`);
    } else if (error.message?.includes("Contract not initialized")) {
      throw new Error(
        "Contract not initialized. Please connect your wallet and try again 234.",
      );
    } else if (error.message?.includes("KYC request not found")) {
      throw new Error(
        "KYC request not found. Please refresh the page and try again.",
      );
    } else {
      // If it's already a formatted error message, use it directly
      throw new Error(
        error.message ||
          "An unexpected error occurred while approving KYC request. Please try again.",
      );
    }
  }
};

export const rejectKYCRequest = async (
  requestId: string,
  reason: string,
): Promise<void> => {
  try {
    // Check wallet connection first
    if (!window.ethereum) {
      throw new Error("Please install MetaMask to use this feature.");
    }

    // If not connected, try to connect automatically
    if (!window.ethereum.selectedAddress) {
      try {
        console.log("Wallet not connected. Attempting to connect...");
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Recheck connection after request
        if (!window.ethereum.selectedAddress) {
          throw new Error(
            "Please connect your wallet first. Click on MetaMask extension and connect your account.",
          );
        }
      } catch (connectionError: any) {
        if (connectionError.code === 4001) {
          throw new Error(
            "Wallet connection was rejected. Please connect your wallet and try again.",
          );
        } else if (connectionError.code === -32002) {
          throw new Error(
            "MetaMask is already processing a connection request. Please check MetaMask and complete the connection.",
          );
        } else {
          throw new Error(
            "Failed to connect wallet. Please open MetaMask and connect manually, then try again.",
          );
        }
      }
    }

    // First get the KYC request details
    const { data: request, error: fetchError } = await supabase
      .from("kyc_requests")
      .select("user_address")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      throw new Error("KYC request not found");
    }

    const userAddress = request.user_address;

    // Get contract with signer
    const contract = getContract();
    if (!contract) {
      throw new Error("Contract not initialized. Please connect your wallet 345.");
    }

    // Verify this is a contract with signer, not read-only
    if (!contract.signer) {
      throw new Error(
        "Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.",
      );
    }

    // Try to estimate gas first
    try {
      await contract.estimateGas.updateKYCStatus(userAddress, false);
    } catch (gasError: any) {
      console.error("Gas estimation failed for rejection:", gasError);

      if (
        gasError.message?.includes("sending a transaction requires a signer")
      ) {
        throw new Error(
          "Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.",
        );
      } else if (
        gasError.message?.includes("AccessControl") ||
        gasError.message?.includes("missing role")
      ) {
        throw new Error(
          "You do not have permission to reject KYC requests. Only users with ADMIN role can reject KYC.",
        );
      } else {
        const errorMessage =
          gasError.reason ||
          gasError.message ||
          gasError.data?.message ||
          "Unknown error occurred";
        throw new Error(`Transaction would fail: ${errorMessage}`);
      }
    }

    try {
      // Get current gas price from network
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const gasPrice = await provider.getGasPrice();
      
      // Estimate gas limit for the transaction
      let gasLimit = 100000; // Default fallback
      try {
        const estimatedGas = await contract.estimateGas.updateKYCStatus(userAddress, false);
        gasLimit = Math.ceil(estimatedGas.toNumber() * 1.2); // Add 20% buffer
        console.log("Estimated gas limit for rejection:", gasLimit);
      } catch (gasEstError) {
        console.warn("Gas estimation failed for rejection, using default:", gasLimit);
      }

      const tx = await contract.updateKYCStatus(userAddress, false, {
        gasLimit: gasLimit,
        gasPrice: gasPrice.mul(110).div(100), // Use network gas price + 10%
      });
      console.log("KYC rejection transaction submitted:", tx.hash);
      const receipt = await tx.wait();
      console.log("KYC rejection transaction confirmed:", receipt.transactionHash);
    } catch (txError: any) {
      console.error("KYC rejection transaction execution failed:", txError);
      
      if (txError.code === "CALL_EXCEPTION") {
        throw new Error(
          "Smart contract call failed. This might be due to insufficient permissions or contract state issues. Please check your admin role permissions."
        );
      } else if (txError.code === 4001 || txError.code === "ACTION_REJECTED") {
        throw new Error("Transaction was rejected by user.");
      } else if (txError.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient funds for gas fees. Please add more ETH to your wallet.");
      } else {
        const errorMessage = txError.reason || txError.message || "Transaction failed";
        throw new Error(`KYC rejection transaction failed: ${errorMessage}`);
      }
    }

    // For manual KYC rejections, call our webhook API to sync with external systems
    try {
      // Get the KYC request details to check verification method
      const { data: kycRequest, error: fetchKycError } = await supabase
        .from("kyc_requests")
        .select("verification_method")
        .eq("id", requestId)
        .single();

      if (!fetchKycError && kycRequest?.verification_method === "manual") {
        const SUMSUB_NODE_API_URL = import.meta.env.VITE_SUMSUB_NODE_API_URL;
        const apiUrl = SUMSUB_NODE_API_URL + "/webhooks/sumsub";

        const webhookPayload = {
          applicantId: `manual-${userAddress}-${Date.now()}`,
          inspectionId: `manual-${userAddress}-${Date.now()}`,
          correlationId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          externalUserId: userAddress,
          levelName: "manual-verification",
          type: "applicantReviewed",
          reviewResult: {
            reviewAnswer: "RED",
          },
          reviewStatus: "completed",
          moderationComment: reason,
          createdAtMs: new Date().toISOString(),
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!response.ok) {
          console.error(
            `Manual KYC webhook API failed with status: ${response.status}`,
          );
        } else {
          console.log(
            "Manual KYC webhook API called successfully for rejection",
          );
        }
      }
    } catch (webhookError) {
      console.error(
        "Error calling manual KYC webhook API for rejection:",
        webhookError,
      );
      // Don't throw here - the KYC rejection should still proceed even if webhook fails
    }

    // Then update the database
    const { error } = await supabase
      .from("kyc_requests")
      .update({
        status: KYCStatus.REJECTED,
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error rejecting KYC request:", error);

    // Handle different types of errors with specific messages
    if (error.message?.includes("sending a transaction requires a signer")) {
      throw new Error(
        "Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.",
      );
    } else if (error.code === "ACTION_REJECTED" || error.code === 4001) {
      throw new Error("Transaction was rejected by user.");
    } else if (error.code === "INSUFFICIENT_FUNDS" || error.code === -32000) {
      throw new Error(
        "Insufficient funds for gas fees. Please add more ETH to your wallet.",
      );
    } else if (
      error.message?.includes("AccessControl") ||
      error.message?.includes("missing role")
    ) {
      throw new Error(
        "You do not have permission to reject KYC requests. Only users with ADMIN role can reject KYC.",
      );
    } else if (error.message?.includes("execution reverted")) {
      const revertReason = error.data?.message || error.reason || error.message;
      throw new Error(`Smart contract error: ${revertReason}`);
    } else {
      // If it's already a formatted error message, use it directly
      throw new Error(
        error.message ||
          "An unexpected error occurred while rejecting KYC request. Please try again.",
      );
    }
  }
};

export const submitSumsubKYCRequest = async (
  userAddress: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  nationality: string,
  sumsubApplicantId: string,
): Promise<void> => {
  try {
    // Check if a KYC request already exists for this user with Sumsub verification
    const { data: existingRequest, error: checkError } = await supabase
      .from("kyc_requests")
      .select("id")
      .eq("user_address", userAddress)
      .eq("verification_method", "sumsub")
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingRequest) {
      // Update existing request
      const { error: updateError } = await supabase
        .from("kyc_requests")
        .update({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          nationality: nationality,
          sumsub_applicant_id: sumsubApplicantId,
          status: KYCStatus.PENDING,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existingRequest.id);

      if (updateError) throw updateError;
    } else {
      // Create new request
      const { error: insertError } = await supabase
        .from("kyc_requests")
        .insert([
          {
            user_address: userAddress,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            nationality: nationality,
            document_type: "sumsub_verification",
            document_url: "",
            status: KYCStatus.PENDING,
            submitted_at: new Date().toISOString(),
            verification_method: "sumsub",
            sumsub_applicant_id: sumsubApplicantId,
          },
        ]);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error("Error submitting Sumsub KYC request:", error);
    throw error;
  }
};

export const updateKYCWithSumsubData = async (
  userAddress: string,
  sumsubApplicantId: string,
  sumsubData: any,
  status: KYCStatus,
  rejectionReason?: string,
): Promise<void> => {
  try {
    // Get the KYC request
    const { data, error: fetchError } = await supabase
      .from("kyc_requests")
      .select("id")
      .eq("user_address", userAddress)
      .eq("sumsub_applicant_id", sumsubApplicantId)
      .single();

    if (fetchError) {
      // If no request exists with this applicant ID, try to find by user address
      const { data: userData, error: userError } = await supabase
        .from("kyc_requests")
        .select("id")
        .eq("user_address", userAddress)
        .eq("verification_method", "sumsub")
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (userError) {
        throw new Error("No KYC request found for this user and applicant ID");
      }

      // Update the existing request
      const { error: updateError } = await supabase
        .from("kyc_requests")
        .update({
          status,
          sumsub_data: sumsubData,
          sumsub_applicant_id: sumsubApplicantId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", userData.id);

      if (updateError) throw updateError;
    } else {
      // Update the existing request
      const { error: updateError } = await supabase
        .from("kyc_requests")
        .update({
          status,
          sumsub_data: sumsubData,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", data.id);

      if (updateError) throw updateError;
    }

    // If approved, update the blockchain
    if (status === KYCStatus.APPROVED) {
      try {
        const contract = getContract();
        if (!contract) {
          throw new Error("Contract not initialized");
        }
        const tx = await contract.updateKYCStatus(userAddress, true);
        await tx.wait();
      } catch (error) {
        console.error("Error updating blockchain KYC status:", error);
        throw error;
      }
    } else if (status === KYCStatus.REJECTED) {
      try {
        const contract = getContract();
        if (!contract) {
          throw new Error("Contract not initialized");
        }
        const tx = await contract.updateKYCStatus(userAddress, false);
        await tx.wait();
      } catch (error) {
        console.error("Error updating blockchain KYC status:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error updating KYC with Sumsub data:", error);
    throw error;
  }
};
