
"use client";

import { BigNumber } from "ethers";
import { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { useGSDCContract } from "../hooks/useContract";
import { motion } from "framer-motion";
import { parseEther, formatEther } from "ethers/lib/utils";
import { useAdmin } from "../hooks/useAdmin";
import { getUserKYCStatus, KYCStatus } from "../services/kyc";
import { createTransaction, getUserTransactions, TransactionType, TransactionStatus } from "../services/admin/transactions";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  hash?: string;
  created_at: string;
  updated_at: string;
}

export default function TokenActions() {
  const { address, isConnected } = useWallet();
  const { isMinter, isAdmin } = useAdmin();
  const { contract } = useGSDCContract();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [balance, setBalance] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0");
  const [minMintAmount, setMinMintAmount] = useState<string>("100");
  const [maxMintAmount, setMaxMintAmount] = useState<string>("1000000");
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_SUBMITTED);
  const [checkingKYC, setCheckingKYC] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [activeTab, setActiveTab] = useState<'mint' | 'burn' | 'history'>('mint');

  // Check KYC status
  useEffect(() => {
    const checkKYC = async () => {
      if (!address) return;

      try {
        setCheckingKYC(true);
        const response = await getUserKYCStatus(address);
        setKycStatus(response.status);
      } catch (err) {
        console.error("Error checking KYC status:", err);
        setKycStatus(KYCStatus.NOT_SUBMITTED);
      } finally {
        setCheckingKYC(false);
      }
    };

    checkKYC();
  }, [address]);

  // Load contract data
  useEffect(() => {
    const loadContractData = async () => {
      if (!contract || !address) return;

      try {
        // Get user balance
        const userBalance = await contract.balanceOf(address);
        setBalance(formatEther(userBalance));

        // Get total supply
        const supply = await contract.totalSupply();
        setTotalSupply(formatEther(supply));

        // Get mint limits
        const minMint = await contract.MIN_MINT_AMOUNT();
        const maxMint = await contract.MAX_MINT_AMOUNT();
        setMinMintAmount(formatEther(minMint));
        setMaxMintAmount(formatEther(maxMint));
      } catch (err) {
        console.error("Error loading contract data:", err);
      }
    };

    loadContractData();
  }, [contract, address]);

  // Load transaction history
  useEffect(() => {
    const loadTransactions = async () => {
      if (!address) return;

      try {
        setLoadingTransactions(true);
        const userTxs = await getUserTransactions(address);
        setTransactions(userTxs);
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, [address]);

  const handleMint = async () => {
    if (!isConnected || !amount || !contract || !address) return;
    setError("");
    setSuccess("");

    // Check KYC status
    if (kycStatus !== KYCStatus.APPROVED) {
      setError("KYC verification is required before minting tokens. Please complete KYC verification first.");
      return;
    }

    // Check minter role
    if (!isMinter) {
      setError("You do not have permission to mint tokens. Only users with MINTER_ROLE can mint.");
      return;
    }

    // Validate amount
    const mintAmount = parseFloat(amount);
    if (mintAmount < parseFloat(minMintAmount) || mintAmount > parseFloat(maxMintAmount)) {
      setError(`Amount must be between ${minMintAmount} and ${maxMintAmount} GSDC`);
      return;
    }

    try {
      setLoading(true);

      // Convert amount to wei
      const amountWei = parseEther(amount);

      // Call contract mint function
      const tx = await contract.mint(address, amountWei);
      
      // Record transaction in database
      await createTransaction({
        user_address: address,
        type: TransactionType.MINT,
        amount: amount,
        status: TransactionStatus.PENDING,
        hash: tx.hash,
        contract_address: contract.address,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Update transaction status
      await createTransaction({
        user_address: address,
        type: TransactionType.MINT,
        amount: amount,
        status: receipt.status === 1 ? TransactionStatus.COMPLETED : TransactionStatus.FAILED,
        hash: tx.hash,
        contract_address: contract.address,
      });

      if (receipt.status === 1) {
        setSuccess(`Successfully minted ${amount} GSDC tokens!`);
        // Refresh balance and transactions
        const newBalance = await contract.balanceOf(address);
        setBalance(formatEther(newBalance));
        const newSupply = await contract.totalSupply();
        setTotalSupply(formatEther(newSupply));
        
        // Reload transactions
        const userTxs = await getUserTransactions(address);
        setTransactions(userTxs);
      } else {
        setError("Transaction failed. Please try again.");
      }

      setAmount("");
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      
      // Record failed transaction
      try {
        await createTransaction({
          user_address: address,
          type: TransactionType.MINT,
          amount: amount,
          status: TransactionStatus.FAILED,
          hash: error.transactionHash || null,
          contract_address: contract.address,
        });
      } catch (dbError) {
        console.error("Error recording failed transaction:", dbError);
      }

      if (error.message?.includes("missing role")) {
        setError("You do not have permission to mint tokens. Only users with MINTER_ROLE can mint.");
      } else if (error.message?.includes("execution reverted")) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes("KYC")) {
          setError("KYC verification required before minting tokens.");
        } else if (revertReason.includes("amount below minimum")) {
          setError(`Amount must be at least ${minMintAmount} GSDC.`);
        } else if (revertReason.includes("amount above maximum")) {
          setError("Amount exceeds maximum minting limit.");
        } else {
          setError(revertReason || "Transaction failed. Please try again.");
        }
      } else if (error.code === "ACTION_REJECTED") {
        setError("Transaction was rejected by user.");
      } else {
        setError("Error minting tokens. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    if (!isConnected || !amount || !contract || !address) return;
    setError("");
    setSuccess("");

    // Check KYC status
    if (kycStatus !== KYCStatus.APPROVED) {
      setError("KYC verification is required before burning tokens. Please complete KYC verification first.");
      return;
    }

    // Validate amount against balance
    const burnAmount = parseFloat(amount);
    const userBalance = parseFloat(balance);
    
    if (burnAmount > userBalance) {
      setError("Insufficient token balance for burning.");
      return;
    }

    if (burnAmount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    try {
      setLoading(true);

      // Convert amount to wei
      const amountWei = parseEther(amount);

      // Call contract requestRedemption function (which queues burn)
      const tx = await contract.requestRedemption(amountWei);
      
      // Record transaction in database
      await createTransaction({
        user_address: address,
        type: TransactionType.BURN,
        amount: amount,
        status: TransactionStatus.PENDING,
        hash: tx.hash,
        contract_address: contract.address,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Update transaction status
      await createTransaction({
        user_address: address,
        type: TransactionType.BURN,
        amount: amount,
        status: receipt.status === 1 ? TransactionStatus.PENDING : TransactionStatus.FAILED,
        hash: tx.hash,
        contract_address: contract.address,
      });

      if (receipt.status === 1) {
        setSuccess(`Successfully requested redemption of ${amount} GSDC tokens! Your request will be processed by administrators.`);
        
        // Reload transactions
        const userTxs = await getUserTransactions(address);
        setTransactions(userTxs);
      } else {
        setError("Transaction failed. Please try again.");
      }

      setAmount("");
    } catch (error: any) {
      console.error("Error requesting redemption:", error);
      
      // Record failed transaction
      try {
        await createTransaction({
          user_address: address,
          type: TransactionType.BURN,
          amount: amount,
          status: TransactionStatus.FAILED,
          hash: error.transactionHash || null,
          contract_address: contract.address,
        });
      } catch (dbError) {
        console.error("Error recording failed transaction:", dbError);
      }

      if (error.message?.includes("execution reverted")) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes("KYC")) {
          setError("KYC verification required before burning tokens.");
        } else if (revertReason.includes("insufficient balance")) {
          setError("Insufficient token balance for redemption.");
        } else {
          setError(revertReason || "Transaction failed. Please try again.");
        }
      } else if (error.code === "ACTION_REJECTED") {
        setError("Transaction was rejected by user.");
      } else {
        setError("Error requesting redemption. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case TransactionStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case TransactionStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Connect your wallet to access token actions</p>
      </div>
    );
  }

  if (checkingKYC) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking KYC status...</p>
      </div>
    );
  }

  if (kycStatus !== KYCStatus.APPROVED) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">KYC Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to complete KYC verification before you can perform token actions.
          </p>
          <div className="mt-6">
            <a href="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
              Complete KYC
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Your Balance</p>
            <p className="text-2xl font-bold text-primary-600">{parseFloat(balance).toLocaleString()} GSDC</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Supply</p>
            <p className="text-2xl font-bold text-secondary-600">{parseFloat(totalSupply).toLocaleString()} GSDC</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">KYC Status</p>
            <p className="text-lg font-semibold text-green-600">✓ Verified</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('mint')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mint'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mint Tokens
            </button>
            <button
              onClick={() => setActiveTab('burn')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'burn'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Burn/Redeem
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transaction History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Mint Tab */}
          {activeTab === 'mint' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mint GSDC Tokens</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Mint new GSDC tokens to your wallet. Amount must be between {minMintAmount} and {maxMintAmount} GSDC.
                </p>
                {!isMinter && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <p className="text-yellow-800 text-sm">⚠️ You need MINTER_ROLE to mint tokens</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="mint-amount" className="block text-sm font-medium text-gray-700">
                  Amount (GSDC)
                </label>
                <input
                  type="number"
                  id="mint-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="0.0"
                  min={minMintAmount}
                  max={maxMintAmount}
                  step="0.000001"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum: {minMintAmount} GSDC | Maximum: {maxMintAmount} GSDC
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMint}
                disabled={loading || !amount || !isMinter}
                className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Minting...
                  </span>
                ) : (
                  'Mint Tokens'
                )}
              </motion.button>
            </div>
          )}

          {/* Burn Tab */}
          {activeTab === 'burn' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Burn/Redeem GSDC Tokens</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Request redemption of your GSDC tokens. This will queue your tokens for burning after admin approval.
                </p>
                <p className="text-sm text-blue-600 mb-4">
                  Available Balance: {parseFloat(balance).toLocaleString()} GSDC
                </p>
              </div>

              <div>
                <label htmlFor="burn-amount" className="block text-sm font-medium text-gray-700">
                  Amount (GSDC)
                </label>
                <input
                  type="number"
                  id="burn-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="0.0"
                  min="0.000001"
                  max={balance}
                  step="0.000001"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum available: {balance} GSDC
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBurn}
                disabled={loading || !amount || parseFloat(amount) > parseFloat(balance)}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Request Redemption'
                )}
              </motion.button>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              
              {loadingTransactions ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tx.type === TransactionType.MINT 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {parseFloat(tx.amount).toLocaleString()} GSDC
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(tx.status)}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tx.hash ? (
                              <a 
                                href={`https://bscscan.com/tx/${tx.hash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-800"
                              >
                                {tx.hash.slice(0, 10)}...
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
