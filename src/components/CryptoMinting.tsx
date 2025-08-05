import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../hooks/useWallet";
import {
  createPayment,
  getPaymentStatus,
  getMinPaymentAmount,
  getAvailableCurrencies,
  CurrencyInfo,
} from "../services/payments";
import { getUserKYCStatus, KYCStatus } from "../services/kyc";
// Assume useGSDCContract is imported from a local hook or context
// import { useGSDCContract } from "../hooks/useGSDCContract";

export default function CryptoMinting() {
  const { address, isConnected } = useWallet();
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USDC");
  const [availableCurrencies, setAvailableCurrencies] = useState<
    CurrencyInfo[]
  >([]);
  const [minAmount, setMinAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [kycStatus, setKycStatus] = useState<KYCStatus>(
    KYCStatus.NOT_SUBMITTED,
  );
  const [checkingKYC, setCheckingKYC] = useState(true);

  // Fix: Destructure contract from useGSDCContract correctly
  // const { contract } = useGSDCContract(); // This line was added based on the thinking process

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await getAvailableCurrencies();
        setAvailableCurrencies(currencies);

        if (currencies.length > 0) {
          const defaultCurrency =
            currencies.find((c) => c.code === "USDC") || currencies[0];
          setSelectedCurrency(defaultCurrency.code);
          setMinAmount(defaultCurrency.minAmount);
        }
      } catch (err) {
        console.error("Error loading currencies:", err);
      }
    };

    loadCurrencies();
  }, []);

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

  const handleCurrencyChange = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    const currency = availableCurrencies.find((c) => c.code === currencyCode);
    if (currency) {
      setMinAmount(currency.minAmount);
    }
  };

  const handleCreatePayment = async () => {
    if (!isConnected || !address || !amount) return;

    // Check KYC status first
    if (kycStatus !== KYCStatus.APPROVED) {
      setError(
        "KYC verification is required before minting tokens. Please complete KYC verification first.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setPaymentUrl("");
      setPaymentId("");

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < minAmount) {
        setError(`Minimum amount is ${minAmount} ${selectedCurrency}`);
        return;
      }

      const payment = await createPayment(amountNum, address, selectedCurrency);

      // Store payment URL and ID
      setPaymentUrl(payment.payment_url);
      setPaymentId(payment.payment_id);

      setSuccess(
        `Payment request created successfully! Please complete your payment of ${amountNum} ${selectedCurrency}.`,
      );

      // Start polling for payment status
      const pollStatus = setInterval(async () => {
        try {
          const status = await getPaymentStatus(payment.payment_id);
          if (
            status.payment_status === "finished" ||
            status.payment_status === "confirmed"
          ) {
            setSuccess(
              "Payment confirmed! Your tokens will be minted shortly.",
            );
            setPaymentUrl(""); // Hide payment link after confirmation
            clearInterval(pollStatus);
          } else if (
            status.payment_status === "failed" ||
            status.payment_status === "expired"
          ) {
            setError("Payment failed or expired. Please try again.");
            setPaymentUrl(""); // Hide payment link on failure
            clearInterval(pollStatus);
          }
        } catch (err) {
          console.error("Error polling payment status:", err);
        }
      }, 30000); // Poll every 30 seconds

      // Clear polling after 30 minutes
      setTimeout(
        () => {
          clearInterval(pollStatus);
          if (paymentUrl) {
            setError("Payment session expired. Please create a new payment.");
            setPaymentUrl("");
          }
        },
        30 * 60 * 1000,
      );
    } catch (err: any) {
      console.error("Error creating payment:", err);
      setError(err.message || "Error creating payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="">Connect your wallet to mint tokens with crypto</p>
      </div>
    );
  }

  if (checkingKYC) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p
          className="mt-4
          "
        >
          Checking KYC status...
        </p>
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
          <h3 className="mt-2 text-lg font-medium">KYC Required</h3>
          <p className="mt-1 text-sm">
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
          <h3 className="text-xl font-semibold text-white mb-6">
            Mint with Crypto
          </h3>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              handleCreatePayment();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Amount Input */}
              <div>
                <label
                  htmlFor="crypto-amount"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="crypto-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full rounded-lg border-0 bg-slate-500/50 px-4 py-3 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-orange-500 focus:bg-slate-500/70 transition-all sm:text-sm backdrop-blur-sm"
                    style={{ backgroundColor: "#2a4661" }}
                    placeholder="Enter amount"
                    disabled={loading}
                    min={minAmount}
                    step="any"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5"
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
                    value={selectedCurrency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="block w-full rounded-lg border-0 bg-slate-500/50 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:bg-slate-500/70 transition-all sm:text-sm backdrop-blur-sm appearance-none"
                    style={{ backgroundColor: "#2a4661" }}
                    disabled={loading}
                    required
                  >
                    {availableCurrencies.map((curr) => (
                      <option
                        key={curr.code}
                        value={curr.code}
                        className="bg-slate-700"
                      >
                        {curr.name} ({curr.code})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5"
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
                  {amount || "0"} GSDC
                </span>
              </div>
              <div className="text-xs mt-1">
                Minimum amount: {minAmount} {selectedCurrency}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 text-green-200 rounded-lg text-sm">
                <div className="space-y-3">
                  <p>{success}</p>

                  {paymentUrl && (
                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-lg p-3">
                        <h5 className="font-semibold text-green-200 mb-1">
                          Payment Details:
                        </h5>
                        <div className="text-xs text-green-300">
                          <p>
                            Amount:{" "}
                            <span className="font-semibold">
                              {amount} {selectedCurrency}
                            </span>
                          </p>
                          <p>
                            Payment ID:{" "}
                            <span className="font-mono">{paymentId}</span>
                          </p>
                        </div>
                      </div>

                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-lg transition-all duration-200"
                      >
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Complete Payment
                      </motion.a>

                      <p className="text-xs text-green-300">
                        Note: Payment link will expire in 30 minutes.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Create Payment Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !amount || parseFloat(amount) < minAmount}
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
                "Create Payment Request"
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
                Tokens will be minted automatically after payment confirmation
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}