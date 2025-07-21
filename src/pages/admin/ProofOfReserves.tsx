import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import { ReserveAsset } from "../../services/reserves";
import ReserveSummary from "../../components/admin/reserves/ReserveSummary";
import ReserveList from "../../components/admin/reserves/ReserveList";
import ReserveForm from "../../components/admin/reserves/ReserveForm";
import DeleteConfirmModal from "../../components/admin/reserves/DeleteConfirmModal";
import { useReserves } from "../../hooks/useReserves";
import { motion } from "framer-motion";

export default function ProofOfReserves() {
  const { isConnected } = useWallet();
  const { isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReserve, setSelectedReserve] = useState<ReserveAsset | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    reserves,
    summary,
    loading,
    error,
    actionLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    refresh,
  } = useReserves();

  const handleCreateSubmit = async (data: Omit<ReserveAsset, "id">) => {
    try {
      await handleCreate(data);
      setSuccessMessage("Reserve asset created successfully");
      setShowAddModal(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error creating reserve asset:", err);
      throw err;
    }
  };

  const handleUpdateSubmit = async (
    id: string,
    data: Partial<ReserveAsset>,
  ) => {
    try {
      await handleUpdate(id, data);
      setSuccessMessage("Reserve asset updated successfully");
      setShowEditModal(false);
      setSelectedReserve(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error updating reserve asset:", err);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReserve) return;

    try {
      await handleDelete(selectedReserve);
      setSuccessMessage("Reserve asset deleted successfully");
      setShowDeleteModal(false);
      setSelectedReserve(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error deleting reserve asset:", err);
      throw err;
    }
  };

  if (!isSuperAdmin) {
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
                Admin Dashboard
              </h1>
              <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
                Super Admin Dashboard - Full Access
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

        {/* Main content section */}
        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Navigation Tabs */}
            <div className="mb-8">
              <div
                className="mb-8 shadow rounded-lg p-8"
                style={{ backgroundColor: "#2a4661" }}
              >
                <button
                  onClick={() => navigate("/admin/kyc-requests")}
                  className="px-6 py-2 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  KYC Requests
                </button>
                <button
                  onClick={() => navigate("/admin/contact-messages")}
                  className="px-6 py-2 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  Contact Messages
                </button>
                <button
                  onClick={() => navigate("/admin/role-management")}
                  className="px-6 py-2 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  Role Management
                </button>
                <button
                  onClick={() => navigate("/admin/fiat-requests")}
                  className="px-6 py-2 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  Fiat Mint Requests
                </button>
                <button className="px-6 py-2 rounded-lg text-white font-medium bg-orange-500">
                  Proof of Reserves
                </button>
                <button
                  onClick={() => navigate("/admin/exchange-rates")}
                  className="px-6 py-2 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  Exchange Rates
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
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
                  Only Super Admins can manage proof of reserves.
                </p>
              </div>
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
          className=""
          style={{ position: "absolute", right: "10%", top: "-60px" }}
        >
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="w-32 h-32 sm:w-50 sm:h-50"
          />
        </div>
      </div>

      {/* Main content section */}
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
                style={{ backgroundColor: "#ed9030" }}
                className="px-6 py-2 rounded-lg font-medium text-white"
              >
                Proof of Reserves
              </button>
              <button
                onClick={() => navigate("/admin/exchange-rates")}
                className="px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors text-white"
              >
                Exchange Rates
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Summary Section */}
            <ReserveSummary
              summary={summary}
              loading={loading}
              error={error}
              onRetry={refresh}
            />

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Reserves List */}
            <div
              className="shadow rounded-lg"
              style={{ backgroundColor: "#2a4661" }}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h3 className="text-lg font-medium leading-6 text-white">
                      Proof of Reserves
                    </h3>
                    <p className="mt-1 text-sm text-white/70">
                      Manage and update reserve assets and their allocations
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:w-auto"
                      style={{ backgroundColor: "#ed9030" }}
                    >
                      Add Reserve Asset
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-500/20 border border-red-400 text-red-300 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
                    <p className="mt-4 text-white/70">Loading reserves...</p>
                  </div>
                ) : (
                  <div className="mt-8">
                    <ReserveList
                      reserves={reserves}
                      loading={loading}
                      error={error}
                      onEdit={(reserve) => {
                        setSelectedReserve(reserve);
                        setShowEditModal(true);
                      }}
                      onDelete={(reserve) => {
                        setSelectedReserve(reserve);
                        setShowDeleteModal(true);
                      }}
                      onRetry={refresh}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Reserve Asset
            </h3>
            <ReserveForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setShowAddModal(false)}
              isLoading={actionLoading}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedReserve && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Reserve Asset
            </h3>
            <ReserveForm
              initialData={selectedReserve}
              onSubmit={(data) => handleUpdateSubmit(selectedReserve.id, data)}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedReserve(null);
              }}
              isLoading={actionLoading}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        asset={selectedReserve}
        loading={actionLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedReserve(null);
        }}
      />
    </div>
  );
}
