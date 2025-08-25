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

    // Check NFT contract for KYC approval
    const contract_NFT = getReadOnlyNFTContract();
    if (contract_NFT) {
      try {
        // Verify contract has the balanceOf function
        if (typeof contract_NFT.balanceOf !== 'function') {
          console.error("NFT contract does not have balanceOf function");
          return { status: KYCStatus.NOT_SUBMITTED };
        }

        // Retry logic for network issues
        const maxRetries = 3;
        let userBalance;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Making balanceOf call (attempt ${attempt}/${maxRetries}):`, {
              contractAddress: contract_NFT.address,
              userAddress: userAddress,
              isValidAddress: ethers.utils.isAddress(userAddress)
            });

            // Add timeout to prevent hanging calls
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Contract call timeout after 6 seconds')), 6000);
            });

            const balancePromise = contract_NFT.balanceOf(userAddress);
            userBalance = await Promise.race([balancePromise, timeoutPromise]);

            // If successful, break out of retry loop
            break;

          } catch (retryError: any) {
            console.group(`🔄 Retry Attempt ${attempt}/${maxRetries} Failed:`);
            console.error("Error message:", retryError.message);
            console.error("Error code:", retryError.code);
            console.error("Error type:", retryError.constructor.name);
            
            // Check for specific BSC RPC errors that indicate we should stop retrying
            const isFatalRpcError = retryError.message?.includes('missing trie node') ||
                                  retryError.message?.includes('missing revert data') ||
                                  retryError.message?.includes('call exception') ||
                                  retryError.code === -32603 ||
                                  retryError.code === -32000;

            if (isFatalRpcError) {
              console.warn("🚫 Fatal BSC RPC error detected - stopping retries");
              console.warn("Error classification: Known BSC testnet infrastructure issue");
              console.warn("Action: Skipping remaining retry attempts");
              console.groupEnd();
              throw retryError;
            }

            if (attempt === maxRetries) {
              console.error("❌ All retry attempts exhausted");
              console.error("Action: Propagating error to main handler");
              console.groupEnd();
              throw retryError;
            }

            // Wait before retrying (exponential backoff)
            const waitTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
            console.log(`⏳ Waiting ${waitTime}ms before next attempt...`);
            console.log(`📊 Retry strategy: Exponential backoff (${attempt + 1}/${maxRetries})`);
            console.groupEnd();
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
        const readableBalance = ethers.utils.formatUnits(userBalance, 0); // NFTs are usually whole numbers
        
        console.group("✅ NFT Balance Check Successful:");
        console.log("Raw balance:", userBalance.toString());
        console.log("Readable balance:", readableBalance);
        console.log("User address:", userAddress);
        console.log("Contract address:", contract_NFT.address);
        console.log("Has NFT (balance > 0):", parseInt(readableBalance) > 0);
        console.log("KYC Status:", parseInt(readableBalance) > 0 ? "APPROVED" : "NOT_SUBMITTED");
        console.groupEnd();

        if (parseInt(readableBalance) > 0) {
          return { status: KYCStatus.APPROVED };
        } else {
          return { status: KYCStatus.NOT_SUBMITTED };
        }
      } catch (nftError: any) {
        // Detailed error logging
        console.group("🔍 NFT Balance Check Error Details:");
        console.error("Full error object:", nftError);
        console.log("Error message:", nftError.message);
        console.log("Error code:", nftError.code);
        console.log("Error reason:", nftError.reason);
        console.log("Error data:", nftError.data);
        console.log("Transaction details:", nftError.transaction);
        console.log("User address:", userAddress);
        console.log("Contract address:", contract_NFT.address);
        console.groupEnd();

        // Handle specific error cases - BSC RPC node issues
        if (nftError.message?.includes('missing revert data') || 
            nftError.message?.includes('call exception') ||
            nftError.message?.includes('missing trie node') ||
            nftError.message?.includes('Internal JSON-RPC error') ||
            nftError.code === -32603 ||
            nftError.code === -32000) {
          
          console.group("⚠️ BSC Testnet RPC Issue Detected:");
          console.warn("Error classification: Known BSC testnet infrastructure issue");
          console.warn("Root cause: RPC node missing blockchain state data");
          console.warn("Impact: Cannot verify NFT balance on-chain");
          console.warn("Action: Falling back to database-only KYC status");
          
          // Extract more details if available
          if (nftError.transaction) {
            console.warn("Failed transaction details:");
            console.warn("- To address:", nftError.transaction.to);
            console.warn("- Data:", nftError.transaction.data);
          }
          
          if (nftError.error) {
            console.warn("Underlying RPC error:");
            console.warn("- Code:", nftError.error.code);
            console.warn("- Message:", nftError.error.message);
            if (nftError.error.data) {
              console.warn("- Data code:", nftError.error.data.code);
              console.warn("- Data message:", nftError.error.data.message);
            }
          }
          
          console.warn("This is a temporary BSC testnet issue and should resolve automatically");
          console.warn("User experience: KYC status will show as NOT_SUBMITTED until RPC recovers");
          console.groupEnd();

          // Return NOT_SUBMITTED since we couldn't verify on-chain due to RPC issues
          return { status: KYCStatus.NOT_SUBMITTED };
        } else if (nftError.message?.includes('timeout')) {
          console.group("⏱️ Contract Call Timeout:");
          console.warn("Type: Network timeout");
          console.warn("Cause: Slow RPC response or network connectivity issues");
          console.warn("Action: Returning NOT_SUBMITTED status");
          console.groupEnd();
        } else if (nftError.code === 'NETWORK_ERROR') {
          console.group("🌐 Network Error:");
          console.warn("Type: Network connectivity issue");
          console.warn("Cause: Cannot reach BSC testnet RPC endpoint");
          console.warn("Action: Returning NOT_SUBMITTED status");
          console.groupEnd();
        } else if (nftError.message?.includes('invalid address')) {
          console.group("📧 Invalid Address Error:");
          console.error("Type: Address validation failed");
          console.error("User address:", userAddress);
          console.error("Is valid address:", ethers.utils.isAddress(userAddress));
          console.error("Action: Returning NOT_SUBMITTED status");
          console.groupEnd();
        } else {
          console.group("❓ Unknown NFT Balance Error:");
          console.error("Type: Unhandled error case");
          console.error("This error type needs investigation");
          console.error("Please report this error for further analysis");
          console.groupEnd();
        }

        return { status: KYCStatus.NOT_SUBMITTED };
      }
    } else {
      console.warn("NFT contract not available");
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

    console.log("Approving KYC for user:", userAddress);

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
    if (error.message?.includes("KYC request not found")) {
      throw new Error(
        "KYC request not found. Please refresh the page and try again.",
      );
    } else if (error.message?.includes("Mint API configuration missing")) {
      throw new Error(
        "NFT minting configuration is missing. Please contact the administrator.",
      );
    } else if (error.message?.includes("API call failed")) {
      throw new Error(
        "Failed to mint NFT. The KYC was approved but NFT minting failed. Please contact support.",
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

    console.log("Rejecting KYC for user:", userAddress);

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
    if (error.message?.includes("KYC request not found")) {
      throw new Error(
        "KYC request not found. Please refresh the page and try again.",
      );
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

    // Note: Blockchain updates removed - KYC status managed through database only
    console.log(`KYC status updated to ${status} for user ${userAddress}`);
  } catch (error) {
    console.error("Error updating KYC with Sumsub data:", error);
    throw error;
  }
};