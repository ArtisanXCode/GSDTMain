import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ExchangeRatesList from "../components/ExchangeRatesList";
import KYCVerification from "../components/KYCVerification";
import SumsubKYC from "../components/SumsubKYC";
import { useWallet } from "../hooks/useWallet";
import { KYCStatus, getUserKYCStatus } from "../services/kyc";

export default function Dashboard() {
  const [kycMethod, setKycMethod] = useState<"manual" | "sumsub">("sumsub");
  const [kycStatus, setKycStatus] = useState<KYCStatus>(
    KYCStatus.NOT_SUBMITTED,
  );
  const [kycLoading, setKycLoading] = useState(true);
  const { address, isConnected } = useWallet();

  // Fetch KYC status when wallet connects
  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (isConnected && address) {
        setKycLoading(true);
        try {
          const result = await getUserKYCStatus(address);
          if (result) {
            setKycStatus(result.status);
          } else {
            setKycStatus(KYCStatus.NOT_SUBMITTED);
          }
        } catch (error) {
          console.error("Error fetching KYC status:", error);
          setKycStatus(KYCStatus.NOT_SUBMITTED);
        } finally {
          setKycLoading(false);
        }
      } else {
        setKycStatus(KYCStatus.NOT_SUBMITTED);
        setKycLoading(false);
      }
    };

    fetchKYCStatus();
  }, [isConnected, address]);

  return (
    <div className="bg-white">
      {/* Hero section with tech background */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/public/dashboard_header.png')`,
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
              Manage your GSDC tokens and view market information
            </p>
          </div>
        </motion.div>
      </div>

      {/* Centered Phoenix Icon overlapping sections */}
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
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-16 text-white shadow-lg"
              style={{
                backgroundColor: "#2a4661",
              }}
            >
              <h3 className="text-lg font-medium text-white/80 mb-5">
                Balance
              </h3>
              <div className="text-2xl font-bold" style={{ color: "#ed9030" }}>
                0 GSDC
              </div>
            </motion.div>

            {/* Current Price Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl p-16 text-white shadow-lg"
              style={{
                backgroundColor: "#2a4661",
              }}
            >
              <h3 className="text-lg font-medium text-white/80 mb-5">
                Current Price
              </h3>
              <div className="text-2xl font-bold" style={{ color: "#ed9030" }}>
                0 GSDC
              </div>
            </motion.div>

            {/* KYC Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-16 text-white shadow-lg"
              style={{
                backgroundColor:
                  kycStatus === KYCStatus.APPROVED
                    ? "#3f763a"
                    : kycStatus === KYCStatus.PENDING
                      ? "#d97706"
                      : kycStatus === KYCStatus.REJECTED
                        ? "#dc2626"
                        : "#E74134",
              }}
            >
              <h3 className="text-lg font-medium text-white/80 mb-5">
                KYC Status
              </h3>
              {kycLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <div className="text-xl font-bold text-white">Loading...</div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-white">
                  {kycStatus === KYCStatus.APPROVED && "Approved"}
                  {kycStatus === KYCStatus.PENDING && "Pending"}
                  {kycStatus === KYCStatus.REJECTED && "Rejected"}
                  {kycStatus === KYCStatus.NOT_SUBMITTED && "Not Submitted"}
                </div>
              )}
            </motion.div>
          </div>

          {/* KYC Verification Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-8 text-white shadow-lg mb-8"
            style={{
              backgroundColor: "#2a4661",
            }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">
              KYC Verification
            </h3>

            <div className="flex space-x-4 mb-6">
              <button
                data-kyc-method="sumsub"
                onClick={() => setKycMethod("sumsub")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  kycMethod === "sumsub"
                    ? "text-white shadow-lg"
                    : "bg-white/20 text-white/80 hover:bg-white/30"
                }`}
                style={{
                  background:
                    kycMethod === "sumsub"
                      ? "linear-gradient(to bottom, #f6b62e, #e74134)"
                      : undefined,
                }}
              >
                Automated Verification
              </button>
              <button
                data-kyc-method="manual"
                onClick={() => setKycMethod("manual")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  kycMethod === "manual"
                    ? "text-white shadow-lg"
                    : "bg-white/20 text-white/80 hover:bg-white/30"
                }`}
                style={{
                  background:
                    kycMethod === "manual"
                      ? "linear-gradient(to bottom, #f6b62e, #e74134)"
                      : undefined,
                }}
              >
                Manual Verification
              </button>
            </div>

            {/* KYC Status Display */}
            {/*
            <div
              className="rounded-lg p-4 mb-4"
              style={{ background: "rgba(34, 197, 94, 0.2)" }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-white font-medium">KYC Verified</span>
              </div>
              <p className="text-white/80 text-sm mt-2">
                Your identity has been verified and you can now access all features.
              </p>
            </div>*/}

            {kycMethod === "sumsub" ? <SumsubKYC /> : <KYCVerification />}
          </motion.div>

          {/* Exchange Rates Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl shadow-lg mb-8 overflow-hidden"
          >
            {/* Header with gradient */}
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

            {/* Body with solid background */}
            <div
              className="p-8"
              style={{
                backgroundColor: "#2a4661",
              }}
            >
              <ExchangeRatesList refreshInterval={30000} />
            </div>
          </motion.div>

          {/* Proof of Reserves Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl shadow-lg mb-8 overflow-hidden"
          >
            {/* Header with gradient */}
            <div
              className="p-6"
              style={{
                background: "linear-gradient(to bottom, #446c93, #6d97bf)",
              }}
            >
              <h3 className="text-xl font-semibold text-white">
                Proof of Reserves
              </h3>
            </div>

            {/* Body with solid background */}
            <div
              className="p-8"
              style={{
                backgroundColor: "#2a4661",
              }}
            >
              {/* Top stats in boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-white/80 mb-2">
                    Total GSDC Supply
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "#ed9030" }}
                  >
                    0 GSDC
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-white/80 mb-2">
                    Total Reserves
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "#ed9030" }}
                  >
                    $96
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-sm text-white/80 mb-2">
                    Backing Ratio
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    100.00%
                  </div>
                </div>
              </div>

              {/* Reserve Assets Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-6">
                  Reserve Assets
                </h4>

                {/* Account One */}
                <div className="bg-white/10 rounded-lg rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-semibold text-lg">
                        Account One
                      </div>
                      <div className="text-white/70 text-sm">
                        Last Updated: 2025-03-05
                      </div>
                    </div>
                    <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                      View Audit Report →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-white/70 text-sm">USDC</div>
                      <div className="text-white font-semibold text-lg">
                        1,000,000
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">USD Value</div>
                      <div className="text-white font-semibold text-lg">
                        $1,000,000
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">Custodian</div>
                      <div className="text-white font-semibold text-lg">
                        Fireblocks
                      </div>
                    </div>
                  </div>
                </div>

                {/* USD Coin */}
                <div
                  className="bg-white/10 rounded-lg p-6"
                  /*style={{ backgroundColor: "#446c93" }}*/
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-semibold text-lg">
                        USD Coin
                      </div>
                      <div className="text-white/70 text-sm">
                        Last Updated: 2025-03-05
                      </div>
                    </div>
                    <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                      View Audit Report →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-white/70 text-sm">USDT</div>
                      <div className="text-white font-semibold text-lg">
                        10,000,000
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">USD Value</div>
                      <div className="text-white font-semibold text-lg">
                        $10,000,000
                      </div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">Custodian</div>
                      <div className="text-white font-semibold text-lg">
                        Fireblocks
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
