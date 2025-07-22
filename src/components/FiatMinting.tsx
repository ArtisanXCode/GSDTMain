"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { useGSDTPrice } from "../services/exchangeRates";
import { useGSDCContract } from "../hooks/useContract";
import {
  createFiatMintRequest,
  getUserFiatMintRequests,
  FiatMintRequest,
  FiatMintStatus,
} from "../services/fiatMinting";
import { format } from "date-fns";
import { getUserKYCStatus, KYCStatus } from "../services/kyc";

export default function FiatMinting() {
  const { address, isConnected } = useWallet();
  const { price: gsdtPrice, rates } = useGSDTPrice();
  const contract = useGSDCContract();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [success, setSuccess] = useState("");
  const [gsdtAmount, setGsdtAmount] = useState("0");
  const [minMintAmount, setMinMintAmount] = useState<string>("100"); // Default min amount
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [userRequests, setUserRequests] = useState<FiatMintRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus>(
    KYCStatus.NOT_SUBMITTED,
  );
  const [checkingKYC, setCheckingKYC] = useState(true);

  // Available currencies with their display names
  const currencies = [
    { code: "USD", name: "US Dollar (USD)" },
    { code: "CNH", name: "Chinese Yuan (CNH)" },
    { code: "RUB", name: "Russian Ruble (RUB)" },
    { code: "INR", name: "Indian Rupee (INR)" },
    { code: "BRL", name: "Brazilian Real (BRL)" },
    { code: "ZAR", name: "South African Rand (ZAR)" },
    { code: "IDR", name: "Indonesian Rupiah (IDR)" },
  ];

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

  // Load user's previous requests
  useEffect(() => {
    const loadUserRequests = async () => {
      if (!address) return;

      try {
        setLoadingRequests(true);
        const requests = await getUserFiatMintRequests(address);
        setUserRequests(requests);
      } catch (err) {
        console.error("Error loading user requests:", err);
      } finally {
        setLoadingRequests(false);
      }
    };

    loadUserRequests();
  }, [address]);

  // Calculate GSDC amount based on fiat amount and current rates
  useEffect(() => {
    if (!amount || !rates || !gsdtPrice) {
      setGsdtAmount("0");
      return;
    }

    try {
      const fiatAmount = parseFloat(amount);
      if (isNaN(fiatAmount)) {
        setGsdtAmount("0");
        return;
      }

      // Convert fiat amount to USDC equivalent
      let usdcAmount = fiatAmount;
      if (currency !== "USD") {
        usdcAmount = fiatAmount / rates[currency];
      }

      // Convert USDC to GSDT based on current price
      const gsdcAmount = usdcAmount / gsdtPrice;
      setGsdtAmount(gsdcAmount.toFixed(6));
    } catch (err) {
      console.error("Error calculating GSDT amount:", err);
      setGsdtAmount("0");
    }
  }, [amount, currency, rates, gsdtPrice]);

  const generatePaymentReference = () => {
    const ref = `GSDT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setPaymentReference(ref);
    return ref;
  };

  const handleFiatMint = async () => {
    if (!isConnected || !address || !amount || !gsdtAmount) return;

    // Check KYC status first
    if (kycStatus !== KYCStatus.APPROVED) {
      setError(
        "KYC verification is required before minting tokens. Please complete KYC verification first.",
      );
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Generate payment reference
      const ref = generatePaymentReference();

      // Create fiat mint request in Supabase
      const request = await createFiatMintRequest(
        address,
        parseFloat(amount),
        currency,
        ref,
      );

      // Show payment instructions
      setSuccess(`
        Please complete your payment using the following details:

        Bank: GSDT Global Bank
        Account Number: 1234567890
        Reference: ${ref}
        Amount: ${amount} ${currency}

        Your request has been submitted and tokens will be minted once the payment is verified.
      `);

      // Refresh user requests
      const updatedRequests = await getUserFiatMintRequests(address);
      setUserRequests(updatedRequests);

      // Reset form
      setAmount("");
      setGsdtAmount("0");
    } catch (err: any) {
      console.error("Error creating fiat mint request:", err);
      setError(err.message || "Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: FiatMintStatus) => {
    switch (status) {
      case FiatMintStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case FiatMintStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case FiatMintStatus.REJECTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          Connect your wallet to mint tokens with fiat
        </p>
      </div>
    );
  }

  if (checkingKYC) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4">Checking KYC status...</p>
      </div>
    );
  }

  if (kycStatus !== KYCStatus.APPROVED) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            KYC Required
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to complete KYC verification before you can mint tokens.
            Please go to the dashboard to complete your KYC verification.
          </p>
          <div className="mt-6">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Complete KYC
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Compact Card */}
      <div
        className="rounded-xl shadow-lg overflow-hidden"
        style={{
          backgroundColor: "#446c93",
        }}
      >
        <div className="p-8">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            Mint with Fiat
          </h3>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              handleFiatMint();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Amount Input */}
              <div>
                <label
                  htmlFor="fiat-amount"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="fiat-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full rounded-lg border-0 bg-slate-500/50 px-4 py-3 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500 focus:bg-slate-500/70 "
                    style={{ backgroundColor: "#2a4661" }}
                    placeholder="Enter amount"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Currency
                </label>
                <div className="relative">
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="block w-full rounded-lg border-0 bg-slate-500/50 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:bg-slate-500/70 transition-all sm:text-sm backdrop-blur-sm appearance-none"
                    style={{ backgroundColor: "#2a4661" }}
                    disabled={loading}
                  >
                    {currencies.map((curr) => (
                      <option
                        key={curr.code}
                        value={curr.code}
                        className="bg-slate-700"
                      >
                        {curr.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-300"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Amount - Compact */}
            <div
              className="bg-slate-500/30 rounded-lg p-4 border border-slate-400/20"
              style={{ backgroundColor: "#2a4661" }}
            >
              <div className="flex items-center">
                <span className="text-sm">You will receive:</span>
                <span className="text-lg font-semibold text-orange-400 p-1">
                  {gsdtAmount} GSDC
                </span>
              </div>
              <div className="text-xs mt-1">
                Minimum amount: {minMintAmount} GSDC
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 text-green-200 rounded-lg text-sm whitespace-pre-line">
                {success}
              </div>
            )}

            {/* Request Mint Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !amount || parseFloat(gsdtAmount) <= 0}
              className="w-full rounded-lg px-6 py-3 text-base font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform"
              style={{
                backgroundColor: "#ed9030",
                color: "#fff",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Request Mint"
              )}
            </motion.button>

            {/* Footer Info - Compact */}
            <div className="text-xs text-center">
              <p>
                Connected Wallet:{" "}
                <span className="font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </p>
              <p>
                Tokens will be minted to your wallet after payment verification
              </p>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Previous Requests */}
      {userRequests.length > 0 && (
        <div
          className="rounded-xl p-8 shadow-lg"
          style={{ backgroundColor: "#446c93" }}
        >
          <h3 className="text-xl font-semibold mb-6">Your Previous Requests</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-gray-200"
                style={{ backgroundColor: "#446c93" }}
              >
                {userRequests.map((request) => (
                  <tr key={request.id} className="">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(
                        new Date(request.created_at),
                        "MMM d, yyyy HH:mm",
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.payment_reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.admin_notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}