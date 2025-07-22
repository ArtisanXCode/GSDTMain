import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import {
  ExchangeRate,
  createExchangeRate,
  updateExchangeRate,
  deleteExchangeRate,
} from "../../services/exchangeRates";
import ExchangeRatesList from "../../components/admin/exchange-rates/ExchangeRatesList";
import AddRateModal from "../../components/admin/exchange-rates/AddRateModal";
import EditRateModal from "../../components/admin/exchange-rates/EditRateModal";

export default function ExchangeRates() {
  const { isConnected } = useWallet();
  const { isSuperAdmin, isPriceUpdater } = useAdmin();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async (
    data: Omit<ExchangeRate, "id" | "last_updated">,
  ) => {
    try {
      setLoading(true);
      setError(null);

      await createExchangeRate(
        data.currency_from.toUpperCase(),
        data.currency_to.toUpperCase(),
        data.rate,
      );

      setSuccess("Exchange rate created successfully");
      setShowAddModal(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error creating rate:", err);
      setError(err.message || "Error creating exchange rate");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<ExchangeRate>) => {
    try {
      setLoading(true);
      setError(null);

      await updateExchangeRate(id, data.rate!);

      setSuccess("Exchange rate updated successfully");
      setShowEditModal(false);
      setSelectedRate(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error updating rate:", err);
      setError(err.message || "Error updating exchange rate");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rate: ExchangeRate) => {
    try {
      setLoading(true);
      setError(null);

      await deleteExchangeRate(rate.id);
      setSuccess("Exchange rate deleted successfully");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error deleting rate:", err);
      setError(err.message || "Error deleting exchange rate");
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin && !isPriceUpdater) {
    return (
      <div className="bg-white">
        {/* Hero section with tech background */}
        <div
          className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: `url('/public/admin_dashboard_header.png')`,
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
                Admin Dashboard
              </h1>
              <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
                Super Admin Dashboard - Full Access
              </p>
            </div>
          </motion.div>
        </div>

        {/* Phoenix Icon overlapping sections */}
        <div className="relative z-20 flex justify-end">
          <div
            className="phoenix-icon-parent"
          >
            <img
              src="/logo_gsdc_icon.png"
              alt="Phoenix Icon"
              className="phoenix-icon-large"
            />
          </div>
        </div>

        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center py-8">
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
                Access Denied
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Only Super Admins and Price Updaters can manage exchange rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero section with tech background */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/public/admin_dashboard_header.png')`,
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
              Admin Dashboard
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              Super Admin Dashboard - Full Access
            </p>
          </div>
        </motion.div>
      </div>

      {/* Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-end">
        <div
          className="phoenix-icon-parent"
        >
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
          {/* Navigation Menu */}
          <div className="mb-8">
            <div
              className="mb-8 shadow rounded-lg p-8"
              style={{ backgroundColor: "#2a4661" }}
            >
              <button
                onClick={() => navigate("/admin/kyc-requests")}
                className="px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors text-white"
              >
                KYC Requests
              </button>
              <button
                onClick={() => navigate("/admin/contact-messages")}
                className="px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors text-white"
              >
                Contact Messages
              </button>
              <button
                onClick={() => navigate("/admin/role-management")}
                className="px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors text-white"
              >
                Role Management
              </button>
              <button
                onClick={() => navigate("/admin/fiat-requests")}
                className="px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors text-white"
              >
                Fiat Mint Requests
              </button>
              <button
                onClick={() => navigate("/admin/reserves")}
                className="px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors text-white"
              >
                Proof of Reserves
              </button>
              <button
                style={{ backgroundColor: "#ed9030" }}
                className="px-6 py-2 rounded-lg font-medium text-white"
              >
                Exchange Rates
              </button>
            </div>
          </div>

          {/* Exchange Rates Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-8 text-white shadow-lg"
            style={{ backgroundColor: "#2a4661" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Exchange Rates
                  </h3>
                  <p className="text-white/70 text-sm">
                    Manage currency exchange rates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 rounded-lg text-white font-medium bg-orange-500 hover:bg-orange-600 transition-colors"
              >
                Add Rate
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="bg-white/5 rounded-lg p-6">
              <ExchangeRatesList
                refreshInterval={30000}
                onEdit={(rate) => {
                  setSelectedRate(rate);
                  setShowEditModal(true);
                }}
                onDelete={handleDelete}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {showAddModal && (
        <AddRateModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
          loading={loading}
        />
      )}

      {showEditModal && selectedRate && (
        <EditRateModal
          rate={selectedRate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRate(null);
          }}
          onSubmit={handleUpdate}
          loading={loading}
        />
      )}
    </div>
  );
}
