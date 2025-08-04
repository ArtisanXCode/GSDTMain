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
import AdminHeroSection from "../../components/admin/AdminHeroSection";
import AdminNavigation from "../../components/admin/AdminNavigation";
import AccessDenied from "../../components/admin/AccessDenied";

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
      <AccessDenied 
        message="Access Denied"
        description="Only Super Admins can manage proof of reserves."
      />
    );
  }

  return (
    <div className="bg-white">
      <AdminHeroSection />

      {/* Main content section */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Navigation Menu */}
          <AdminNavigation className="mb-8" />

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
                    <h3 className="text-3xl font-semibold text-white mb-1">
                      Proof of Reserves
                    </h3>
                    <p className="text-sm text-white">
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