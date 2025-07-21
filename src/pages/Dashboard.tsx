import { motion } from "framer-motion";
import { useState } from "react";
import ExchangeRates from "../components/ExchangeRates";
import ProofOfReserves from "../components/ProofOfReserves";
import KYCVerification from "../components/KYCVerification";
import SumsubKYC from "../components/SumsubKYC";
import TokenInfo from "../components/TokenInfo";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [kycMethod, setKycMethod] = useState<"manual" | "sumsub">("sumsub");

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
              Dashboard
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              Manage your GSDC tokens and view market information
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
                backgroundColor: "#3f763a",
              }}
            >
              <h3 className="text-lg font-medium text-white/80 mb-5">
                KYC Status
              </h3>
              <div className="text-xl font-bold text-white">Approved</div>
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
            <div
              className="rounded-lg p-4 mb-4"
              style={{ background: "rgba(34, 197, 94, 0.2)" }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-white font-medium">KYC Verified</span>
              </div>
              <p className="text-white/80 text-sm mt-2">
                Your identity has been verified and you can now access all
                features.111
              </p>
            </div>

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
                Exchange Rates
              </h3>
            </div>

            {/* Body with solid background */}
            <div
              className="p-8"
              style={{
                backgroundColor: "#2a4661",
              }}
            >
              <div className="mb-6">
                <div className="text-sm text-white/80 mb-2">GSDC Price</div>
                <div className="text-3xl font-bold" style={{ color: "#ed9030" }}>
                  $0.000000 USDC
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { currency: "USD", label: "to EUR", rate: "1.500000" },
                  { currency: "BTC", label: "to USDT", rate: "10.000000" },
                  { currency: "CNH", rate: "1.000000" },
                ].map((item, index) => (
                  <div key={item.currency} className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm text-white/80">
                      {item.currency}
                      {item.label && (
                        <div className="text-xs text-white/60">{item.label}</div>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {item.rate}
                    </div>
                  </div>
                ))}
              </div>
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
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "#446c93" }}
                >
                  <div className="text-sm text-white/80 mb-2">Total GSDC Supply</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "#ed9030" }}
                  >
                    0 GSDC
                  </div>
                </div>
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "#446c93" }}
                >
                  <div className="text-sm text-white/80 mb-2">Total Reserves</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "#ed9030" }}
                  >
                    $96
                  </div>
                </div>
                <div
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "#446c93" }}
                >
                  <div className="text-sm text-white/80 mb-2">Backing Ratio</div>
                  <div className="text-2xl font-bold text-green-400">100.00%</div>
                </div>
              </div>

              {/* Reserve Assets Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-6">
                  Reserve Assets
                </h4>

                {/* Account One */}
                <div
                  className="rounded-lg p-6"
                  style={{ backgroundColor: "#446c93" }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-semibold text-lg">Account One</div>
                      <div className="text-white/70 text-sm">Last Updated: 2025-03-05</div>
                    </div>
                    <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                      View Audit Report →
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-white/70 text-sm">USDC</div>
                      <div className="text-white font-semibold text-lg">1,000,000</div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">USD Value</div>
                      <div className="text-white font-semibold text-lg">$1,000,000</div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">Custodian</div>
                      <div className="text-white font-semibold text-lg">Fireblocks</div>
                    </div>
                  </div>
                </div>

                {/* USD Coin */}
                <div
                  className="rounded-lg p-6"
                  style={{ backgroundColor: "#446c93" }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-semibold text-lg">USD Coin</div>
                      <div className="text-white/70 text-sm">Last Updated: 2025-03-05</div>
                    </div>
                    <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                      View Audit Report →
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-white/70 text-sm">USDT</div>
                      <div className="text-white font-semibold text-lg">10,000,000</div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">USD Value</div>
                      <div className="text-white font-semibold text-lg">$10,000,000</div>
                    </div>
                    <div>
                      <div className="text-white/70 text-sm">Custodian</div>
                      <div className="text-white font-semibold text-lg">Fireblocks</div>
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