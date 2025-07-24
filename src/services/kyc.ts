import { supabase } from "../lib/supabase";
import { getContract, getNFTContract } from "../lib/web3";
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
    // Check NFT contract for KYC approval
    const contract_NFT = getNFTContract();
    if (contract_NFT) {
      try {
        const userBalance = await contract_NFT.balanceOf(userAddress);
        const readableBalance = ethers.utils.formatUnits(userBalance, 0); // NFTs are usually whole numbers
        console.log('NFT:', readableBalance);
        if (parseInt(readableBalance) > 0) {
          return { status: KYCStatus.APPROVED };
        } else {
          return { status: KYCStatus.NOT_SUBMITTED };          
        }
      } catch (nftError) {
        console.error('Error checking NFT balance:', nftError);
        return { status: KYCStatus.NOT_SUBMITTED };        
      }
    } else {      
      return { status: KYCStatus.NOT_SUBMITTED };      
    }
  } catch (error) {
    console.error('Error fetching user KYC status:', error);
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

export const approveKYCRequest = async (
  requestId: string,
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
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Recheck connection after request
        if (!window.ethereum.selectedAddress) {
          throw new Error("Please connect your wallet first. Click on MetaMask extension and connect your account.");
        }
      } catch (connectionError: any) {
        if (connectionError.code === 4001) {
          throw new Error("Wallet connection was rejected. Please connect your wallet and try again.");
        } else if (connectionError.code === -32002) {
          throw new Error("MetaMask is already processing a connection request. Please check MetaMask and complete the connection.");
        } else {
          throw new Error("Failed to connect wallet. Please open MetaMask and connect manually, then try again.");
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
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    // Verify this is a contract with signer, not read-only
    if (!contract.signer) {
      throw new Error("Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.");
    }

    // Check if the contract has the required functions
    if (!contract.updateKYCStatus) {
      throw new Error("Contract does not have updateKYCStatus function");
    }

    // Try to estimate gas first to catch permission errors early
    try {
      await contract.estimateGas.updateKYCStatus(userAddress, true);
    } catch (gasError: any) {
      console.error("Gas estimation failed:", gasError);

      // Handle specific error cases
      if (gasError.message?.includes('sending a transaction requires a signer')) {
        throw new Error("Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.");
      } else if (gasError.message?.includes('AccessControl') || gasError.message?.includes('missing role')) {
        throw new Error("You do not have permission to approve KYC requests. Only users with ADMIN role can approve KYC.");
      } else if (gasError.message?.includes('user rejected')) {
        throw new Error("Transaction was rejected by user.");
      } else if (gasError.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error("Cannot estimate gas for this transaction. Please check your permissions and wallet connection.");
      } else if (gasError.code === 'NETWORK_ERROR') {
        throw new Error("Network error occurred. Please check your internet connection and try again.");
      } else if (gasError.code === 'INSUFFICIENT_FUNDS') {
        throw new Error("Insufficient funds for gas fees. Please add more ETH to your wallet.");
      } else {
        // Extract meaningful error message from the error object
        const errorMessage = gasError.reason || gasError.message || gasError.data?.message || "Unknown error occurred";
        throw new Error(`Transaction would fail: ${errorMessage}`);
      }
    }

    // Execute the KYC status update
    const kycTx = await contract.updateKYCStatus(userAddress, true, {
      gasLimit: 150000 // Set manual gas limit
    });
    await kycTx.wait();

    // For manual KYC requests, mint 1 token to the user's wallet
    if (verificationMethod === "manual") {
      console.log("Minting 1 token for manual KYC approval:", userAddress);
      try {
        // Check minting permissions first
        if (contract.mint) {
          try {
            const mintAmount = ethers.utils.parseEther("1");
            await contract.estimateGas.mint(userAddress, mintAmount);

            // Mint 1 token (1 * 10^18 wei)
            const mintTx = await contract.mint(userAddress, mintAmount, {
              gasLimit: 200000 // Set manual gas limit for minting
            });
            await mintTx.wait();
            console.log("Successfully minted 1 token to user:", userAddress);
          } catch (mintGasError: any) {
            console.error("Mint gas estimation failed:", mintGasError);
            if (mintGasError.message?.includes('AccessControl') || mintGasError.message?.includes('missing role')) {
              console.warn("No MINTER_ROLE permission - skipping token minting");
            } else {
              throw mintGasError;
            }
          }
        }
      } catch (mintError) {
        console.error("Error minting tokens for manual KYC approval:", mintError);
        // Don't throw here - KYC approval succeeded, minting failed
        // The admin can manually mint tokens if needed
      }
    }

    // Call SumSub webhook API if this is a SumSub verification
    if (verificationMethod === "sumsub") {
      try {
        // Get SumSub applicant ID from the request
        const { data: kycRequest, error: kycError } = await supabase
          .from("kyc_requests")
          .select("sumsub_applicant_id")
          .eq("id", requestId)
          .single();

        if (kycError || !kycRequest?.sumsub_applicant_id) {
          console.warn("No SumSub applicant ID found for KYC request");
        } else {
          const SUMSUB_NODE_API_URL = import.meta.env.VITE_SUMSUB_NODE_API_URL;
          const apiUrl = SUMSUB_NODE_API_URL + '/webhooks/sumsub';
          
          const webhookPayload = {
            applicantId: kycRequest.sumsub_applicant_id,
            inspectionId: kycRequest.sumsub_applicant_id,
            correlationId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            externalUserId: userAddress,
            levelName: "id-and-liveness",
            type: "applicantReviewed",
            reviewResult: {
              reviewAnswer: "GREEN"
            },
            reviewStatus: "completed",
            createdAtMs: new Date().toISOString()
          };

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
          });

          if (!response.ok) {
            throw new Error(`SumSub webhook API failed with status: ${response.status}`);
          }

          console.log("SumSub webhook API called successfully");
        }
      } catch (webhookError) {
        console.error("Error calling SumSub webhook API:", webhookError);
        // Don't throw here - the KYC approval should still proceed even if webhook fails
        // You can choose to throw if you want the approval to fail when webhook fails
        // throw new Error(`KYC approved but SumSub webhook failed: ${webhookError.message}`);
      }
    }

    // Update the database
    const { error } = await supabase
      .from("kyc_requests")
      .update({
        status: KYCStatus.APPROVED,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error approving KYC request:", error);

    // Handle different types of errors with specific messages
    if (error.message?.includes('sending a transaction requires a signer')) {
      throw new Error("Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.");
    } else if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      throw new Error("Transaction was rejected by user.");
    } else if (error.code === 'INSUFFICIENT_FUNDS' || error.code === -32000) {
      throw new Error("Insufficient funds for gas fees. Please add more ETH to your wallet.");
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      throw new Error("Network error occurred. Please check your internet connection and try again.");
    } else if (error.message?.includes('AccessControl') || error.message?.includes('missing role')) {
      throw new Error("You do not have permission to approve KYC requests. Only users with ADMIN role can approve KYC.");
    } else if (error.message?.includes('execution reverted')) {
      const revertReason = error.data?.message || error.reason || error.message;
      throw new Error(`Smart contract error: ${revertReason}`);
    } else if (error.message?.includes('Contract not initialized')) {
      throw new Error("Contract not initialized. Please connect your wallet and try again.");
    } else if (error.message?.includes('KYC request not found')) {
      throw new Error("KYC request not found. Please refresh the page and try again.");
    } else {
      // If it's already a formatted error message, use it directly
      throw new Error(error.message || "An unexpected error occurred while approving KYC request. Please try again.");
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
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Recheck connection after request
        if (!window.ethereum.selectedAddress) {
          throw new Error("Please connect your wallet first. Click on MetaMask extension and connect your account.");
        }
      } catch (connectionError: any) {
        if (connectionError.code === 4001) {
          throw new Error("Wallet connection was rejected. Please connect your wallet and try again.");
        } else if (connectionError.code === -32002) {
          throw new Error("MetaMask is already processing a connection request. Please check MetaMask and complete the connection.");
        } else {
          throw new Error("Failed to connect wallet. Please open MetaMask and connect manually, then try again.");
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
      throw new Error("Contract not initialized. Please connect your wallet.");
    }

    // Verify this is a contract with signer, not read-only
    if (!contract.signer) {
      throw new Error("Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.");
    }

    // Try to estimate gas first
    try {
      await contract.estimateGas.updateKYCStatus(userAddress, false);
    } catch (gasError: any) {
      console.error("Gas estimation failed for rejection:", gasError);

      if (gasError.message?.includes('sending a transaction requires a signer')) {
        throw new Error("Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.");
      } else if (gasError.message?.includes('AccessControl') || gasError.message?.includes('missing role')) {
        throw new Error("You do not have permission to reject KYC requests. Only users with ADMIN role can reject KYC.");
      } else {
        const errorMessage = gasError.reason || gasError.message || gasError.data?.message || "Unknown error occurred";
        throw new Error(`Transaction would fail: ${errorMessage}`);
      }
    }

    const tx = await contract.updateKYCStatus(userAddress, false, {
      gasLimit: 150000
    });
    await tx.wait();

    // Call SumSub webhook API if this is a SumSub verification
    try {
      // Get the KYC request details to check verification method
      const { data: kycRequest, error: fetchKycError } = await supabase
        .from("kyc_requests")
        .select("verification_method, sumsub_applicant_id")
        .eq("id", requestId)
        .single();

      if (!fetchKycError && kycRequest?.verification_method === "sumsub" && kycRequest?.sumsub_applicant_id) {
        const SUMSUB_NODE_API_URL = import.meta.env.VITE_SUMSUB_NODE_API_URL;
        const apiUrl = SUMSUB_NODE_API_URL + '/webhooks/sumsub';
        
        const webhookPayload = {
          applicantId: kycRequest.sumsub_applicant_id,
          inspectionId: kycRequest.sumsub_applicant_id,
          correlationId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          externalUserId: userAddress,
          levelName: "id-and-liveness",
          type: "applicantReviewed",
          reviewResult: {
            reviewAnswer: "RED"
          },
          reviewStatus: "completed",
          moderationComment: reason,
          createdAtMs: new Date().toISOString()
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!response.ok) {
          console.error(`SumSub webhook API failed with status: ${response.status}`);
        } else {
          console.log("SumSub webhook API called successfully for rejection");
        }
      }
    } catch (webhookError) {
      console.error("Error calling SumSub webhook API for rejection:", webhookError);
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
    if (error.message?.includes('sending a transaction requires a signer')) {
      throw new Error("Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.");
    } else if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      throw new Error("Transaction was rejected by user.");
    } else if (error.code === 'INSUFFICIENT_FUNDS' || error.code === -32000) {
      throw new Error("Insufficient funds for gas fees. Please add more ETH to your wallet.");
    } else if (error.message?.includes('AccessControl') || error.message?.includes('missing role')) {
      throw new Error("You do not have permission to reject KYC requests. Only users with ADMIN role can reject KYC.");
    } else if (error.message?.includes('execution reverted')) {
      const revertReason = error.data?.message || error.reason || error.message;
      throw new Error(`Smart contract error: ${revertReason}`);
    } else {
      // If it's already a formatted error message, use it directly
      throw new Error(error.message || "An unexpected error occurred while rejecting KYC request. Please try again.");
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