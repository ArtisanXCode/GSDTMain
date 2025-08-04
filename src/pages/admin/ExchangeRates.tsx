import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import AdminNavigation from "../../components/admin/AdminNavigation";
import AdminHeroSection from "../../components/admin/AdminHeroSection";
import AccessDenied from "../../components/admin/AccessDenied";
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
      <AccessDenied 
        message="Access Denied"
        description="Only Super Admins and Price Updaters can manage exchange rates."
      />
    );
  }

  return (
    <div className="bg-white">
      <AdminHeroSection />

      {/* Main Content */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Navigation Menu */}
          <AdminNavigation className="mb-8" />

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

                <div>
                  <h3 className="text-3xl font-semibold text-white">
                    Exchange Rates
                  </h3>
                  <p className="text-white text-sm pt-3">
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
              <div className="mb-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mt-2">
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