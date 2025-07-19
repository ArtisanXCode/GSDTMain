import { motion } from "framer-motion";
import TokenActions from "../components/TokenActions";
import FiatMinting from "../components/FiatMinting";
import CryptoMinting from "../components/CryptoMinting";
import { useWallet } from "../hooks/useWallet";
import { useState, useEffect } from "react";
import {
  KYCStatus,
  getUserKYCStatus,
  submitKYCRequest,
  getDatabaseUserKYCStatus,
} from "../services/kyc";
import { getSumsubApplicantStatus } from "../services/sumsub";
import { Link } from "react-router-dom";

export default function TokenMinting() {
  const { isConnected, connect, address } = useWallet();
  const [activeTab, setActiveTab] = useState<"fiat" | "crypto">("fiat");
  const [kycStatus, setKycStatus] = useState<KYCStatus>(
    KYCStatus.NOT_SUBMITTED,
  );
  const [checkingKYC, setCheckingKYC] = useState(false);

  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!address) return;

      try {
        const userKYCStatus = await getUserKYCStatus(address);

        if (userKYCStatus.status == KYCStatus.APPROVED) {
          setCheckingKYC(true);
          setKycStatus(userKYCStatus.status);
        } else {
          setCheckingKYC(false);
        }
      } catch (error) {
        console.error("Error checking KYC status:", error);
      }

      console.log(kycStatus);
      console.log(checkingKYC);
    };

    if (isConnected && address) {
      checkKYCStatus();
    }
  }, [address, isConnected]);

  return (
    <div className="bg-white">
      {/* Hero section with tech background */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10, 20, 35, 0.95) 0%, rgba(20, 30, 48, 0.85) 30%, rgba(139, 69, 19, 0.7) 60%, rgba(255, 140, 0, 0.4) 85%, rgba(255, 165, 0, 0.3) 100%), url('/attached_assets/AdobeStock_1180220151_1752737711909.jpeg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/20 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-transparent to-gray-900/60"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              Token Minting
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              Mint GSDC tokens using fiat or cryptocurrency
            </p>
          </div>
        </motion.div>
      </div>

      {/* Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-center">
        <div className="absolute -top-16">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="w-24 h-24 sm:w-32 sm:h-32"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="min-h-screen py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                {!isConnected && (
                  <div className="flex justify-center mb-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={connect}
                      className="rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200"
                      style={{
                        background:
                          "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                      }}
                    >
                      Connect Wallet
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="mt-8 space-y-8">
              {/* Show KYC Required Message and Tabs if not connected or KYC not approved */}
              {(!isConnected || (isConnected && !checkingKYC)) && (
                <>
                  {/* KYC Required Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl shadow-lg overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #475569 0%, #64748b 100%)",
                    }}
                  >
                    <div className="p-8 text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
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
                      <h3 className="text-xl font-bold text-white mb-2">
                        KYC Required
                      </h3>
                      <p className="text-white/90 text-sm mb-6">
                        You need to complete KYC verification before you can
                        perform token actions.
                        <br />
                        Please complete your KYC verification first.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white shadow-lg transition-all duration-200"
                        style={{
                          background:
                            "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                        }}
                      >
                        <Link to="/dashboard">Complete KYC</Link>
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Tabs with KYC Required Messages */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="border-b border-gray-200">
                        <nav className="-mb-px flex" aria-label="Tabs">
                          <button
                            onClick={() => setActiveTab("fiat")}
                            className={`w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                              activeTab === "fiat"
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            Fiat Payment
                          </button>
                          <button
                            onClick={() => setActiveTab("crypto")}
                            className={`w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                              activeTab === "crypto"
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            Crypto Payment
                          </button>
                        </nav>
                      </div>

                      <div className="p-6">
                        <div
                          className="rounded-xl shadow-lg overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(135deg, #475569 0%, #64748b 100%)",
                          }}
                        >
                          <div className="p-8 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
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
                            <h3 className="text-xl font-bold text-white mb-2">
                              KYC Required
                            </h3>
                            <p className="text-white/90 text-sm mb-6">
                              You need to complete KYC verification before you
                              can mint tokens.
                              <br />
                              Please go to the dashboard to complete your KYC
                              verification.
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white shadow-lg transition-all duration-200"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                              }}
                            >
                              <Link to="/dashboard">Complete KYC</Link>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}

              {/* Show minting options only if KYC is approved */}
              {isConnected &&
                checkingKYC &&
                kycStatus === KYCStatus.APPROVED && (
                  <>
                    {/* Token Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <TokenActions />
                    </motion.div>

                    {/* Minting Options */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="border-b border-gray-200">
                          <nav className="-mb-px flex" aria-label="Tabs">
                            <button
                              onClick={() => setActiveTab("fiat")}
                              className={`w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                                activeTab === "fiat"
                                  ? "border-primary-500 text-primary-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              }`}
                            >
                              Fiat Payment
                            </button>
                            <button
                              onClick={() => setActiveTab("crypto")}
                              className={`w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium ${
                                activeTab === "crypto"
                                  ? "border-primary-500 text-primary-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              }`}
                            >
                              Crypto Payment
                            </button>
                          </nav>
                        </div>

                        <div className="p-6">
                          {activeTab === "fiat" ? (
                            <FiatMinting />
                          ) : (
                            <CryptoMinting />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
