import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import TransactionListComponent from "../components/TransactionList";

export default function TransactionListPage() {
  const { isConnected } = useWallet();
  const navigate = useNavigate();

  // Redirect to home if not connected
  if (!isConnected) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="bg-white">
      {/* Hero section with tech background */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/public/transaction_history_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-24 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              Transaction History
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              View and manage your GSDC token transactions
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

      {/* Main content section with blue gradient background */}
      <div
        className="py-24 sm:py-32 relative"
        style={{
          background: "linear-gradient(to bottom, #6d97bf, #446c93)",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Transaction List Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <TransactionListComponent />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
