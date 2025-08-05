import { motion } from "framer-motion";
import { useWallet } from "../hooks/useWallet";
import { useState, useEffect } from "react";
import {
  KYCStatus,
  getUserKYCStatus,
  getDatabaseUserKYCStatus,
} from "../services/kyc";
import { getSumsubApplicantStatus } from "../services/sumsub";
import KYCVerification from "../components/KYCVerification";
import SumsubKYC from "../components/SumsubKYC";
import TokenInfo from "../components/TokenInfo";
import ExchangeRatesList from "../components/ExchangeRatesList";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import KYCSuccessModal from "../components/modals/KYCSuccessModal";

export default function Dashboard() {
  const { address, isConnected, connect } = useWallet();
  const { user, isAuthenticated } = useAuth();
  const [kycStatus, setKycStatus] = useState<KYCStatus>(
    KYCStatus.NOT_SUBMITTED,
  );
  const [kycMethod, setKycMethod] = useState<"manual" | "sumsub">("sumsub");
  const [showWelcome, setShowWelcome] = useState(false);
  const [checkingKYC, setCheckingKYC] = useState(true);
  const [autoRedirectShown, setAutoRedirectShown] = useState(false);
  const [showKYCSuccessModal, setShowKYCSuccessModal] = useState(false);

  // Check if user just signed up or logged in
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromAuth = urlParams.get('from') === 'auth';
    const isNewUser = urlParams.get('new') === 'true';

    if (fromAuth || isNewUser) {
      setShowWelcome(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!address) {
        setCheckingKYC(false);
        return;
      }

      try {
        setCheckingKYC(true);
        const userKYCStatus = await getUserKYCStatus(address);

        if (userKYCStatus) {
          setKycStatus(userKYCStatus.status);

          // Check if KYC was just approved
          if (
            userKYCStatus.status === KYCStatus.APPROVED &&
            kycStatus !== KYCStatus.APPROVED
          ) {
            // Show success modal
            setShowKYCSuccessModal(true);
          }
        }
      } catch (error) {
        console.error("Error checking KYC status:", error);
      } finally {
        setCheckingKYC(false);
      }
    };

    if (isConnected && address) {
      checkKYCStatus();
    } else {
      setCheckingKYC(false);
    }
  }, [address, isConnected, kycStatus]); // Added kycStatus to dependency array

  const handleCloseKYCModal = () => {
    setShowKYCSuccessModal(false);
  };

  const handleGoToMinting = () => {
    setShowKYCSuccessModal(false);
    window.location.href = '/token-minting';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please log in to access your dashboard.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white">
      {/* Hero section */}
      <div
        className="relative isolate text-white min-h-[50vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/dashboard_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              Dashboard
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              {showWelcome ? (
                "Welcome! Let's get your account verified to unlock all features."
              ) : (
                "Manage your GSDC tokens and account settings"
              )}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Welcome message for new users */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">
                  Account created successfully! Complete your KYC verification below to start minting tokens.
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-white hover:text-gray-200"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phoenix Icon */}
      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to access your dashboard and manage your account
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connect}
                  className="rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                  }}
                >
                  Connect Wallet
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Token Info Section - Updated Design */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              >
                {/* Balance Card */}
                <div className="bg-slate-700 rounded-2xl p-6 text-white">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Balance</h3>
                  <p className="text-2xl font-bold text-orange-400">0 GSDC</p>
                </div>

                {/* Current Price Card */}
                <div className="bg-slate-700 rounded-2xl p-6 text-white">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Current Price</h3>
                  <p className="text-2xl font-bold text-orange-400">0 GSDC</p>
                </div>

                {/* KYC Status Card */}
                <div className={`rounded-2xl p-6 text-white ${
                  kycStatus === KYCStatus.APPROVED 
                    ? 'bg-green-600' 
                    : kycStatus === KYCStatus.PENDING 
                    ? 'bg-yellow-600' 
                    : 'bg-red-600'
                }`}>
                  <h3 className="text-sm font-medium text-gray-100 mb-2">KYC Status</h3>
                  <p className="text-2xl font-bold">
                    {kycStatus === KYCStatus.APPROVED && "Approved"}
                    {kycStatus === KYCStatus.PENDING && "Pending"}
                    {kycStatus === KYCStatus.NOT_SUBMITTED && "Not Submitted"}
                    {kycStatus === KYCStatus.REJECTED && "Rejected"}
                  </p>
                </div>
              </motion.div>

              {/* KYC Progress Indicator */}
              {checkingKYC ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl p-8 text-white shadow-lg"
                  style={{ backgroundColor: "#2a4661" }}
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-4"></div>
                    <p className="text-lg">Checking verification status...</p>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* KYC Progress Steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl p-6 text-white shadow-lg"
                    style={{ backgroundColor: "#2a4661" }}
                  >
                    <h3 className="text-lg font-semibold mb-4">Verification Progress</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="ml-2 text-sm">Account Created</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-gray-600">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-500"
                          style={{
                            width: kycStatus === KYCStatus.NOT_SUBMITTED ? '0%' :
                                   kycStatus === KYCStatus.PENDING ? '50%' : '100%'
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          kycStatus === KYCStatus.PENDING ? 'bg-yellow-500' :
                          kycStatus === KYCStatus.APPROVED ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                          {kycStatus === KYCStatus.APPROVED ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : kycStatus === KYCStatus.PENDING ? (
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                          ) : (
                            <span className="text-xs font-bold text-white">2</span>
                          )}
                        </div>
                        <span className="ml-2 text-sm">Identity Verification</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-gray-600">
                        <div
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: kycStatus === KYCStatus.APPROVED ? '100%' : '0%' }}
                        ></div>
                      </div>
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          kycStatus === KYCStatus.APPROVED ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                          {kycStatus === KYCStatus.APPROVED ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs font-bold text-white">3</span>
                          )}
                        </div>
                        <span className="ml-2 text-sm">Start Minting</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* KYC Verification Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl p-8 text-white shadow-lg mb-8"
                    style={{ backgroundColor: "#2a4661" }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">
                        Identity Verification
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setKycMethod("sumsub")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            kycMethod === "sumsub"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          Automated
                        </button>
                        <button
                          onClick={() => setKycMethod("manual")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            kycMethod === "manual"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>

                    {kycMethod === "sumsub" ? <SumsubKYC /> : <KYCVerification />}
                  </motion.div>
                </>
              )}

              {/* Exchange Rates Section */}
              {kycStatus === KYCStatus.APPROVED && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl shadow-lg mb-8 overflow-hidden"
                >
                  <div
                    className="p-6"
                    style={{
                      background: "linear-gradient(to bottom, #446c93, #6d97bf)",
                    }}
                  >
                    <h3 className="text-xl font-semibold text-white">
                      Live Exchange Rates
                    </h3>
                  </div>
                  <div
                    className="p-8"
                    style={{ backgroundColor: "#2a4661" }}
                  >
                    <ExchangeRatesList refreshInterval={30000} />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      <KYCSuccessModal
        isOpen={showKYCSuccessModal}
        onClose={handleCloseKYCModal}
        onGoToMinting={handleGoToMinting}
      />
    </div>
  );
}