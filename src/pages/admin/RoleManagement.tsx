import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import {
  AdminRole,
  AdminUser,
  getAdminUsers,
  assignUserRole,
  removeUserRole,
} from "../../services/admin";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import RoleCard from "../../components/admin/role-management/RoleCard";
import RoleTable from "../../components/admin/role-management/RoleTable";
import RoleModals from "../../components/admin/role-management/RoleModals";

export default function RoleManagement() {
  const { address } = useWallet();
  const { isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    userAddress: "",
    role: "",
  });
  const [formErrors, setFormErrors] = useState({
    userAddress: "",
    role: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getAdminUsers();
      setAdminUsers(users);
    } catch (err: any) {
      console.error("Error loading admin users:", err);
      setError(err.message || "Error loading admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const validateForm = () => {
    const errors = {
      userAddress: "",
      role: "",
    };
    let isValid = true;

    if (!formData.userAddress) {
      errors.userAddress = "Ethereum address is required";
      isValid = false;
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.userAddress)) {
      errors.userAddress = "Invalid Ethereum address format";
      isValid = false;
    }

    if (!formData.role) {
      errors.role = "Role selection is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
  };

  const handleCloseModal = (modal: "add" | "edit" | "remove") => {
    switch (modal) {
      case "add":
        setShowAddModal(false);
        break;
      case "edit":
        setShowEditModal(false);
        setSelectedUser(null);
        break;
      case "remove":
        setShowRemoveModal(false);
        setSelectedUser(null);
        break;
    }
    setFormData({ userAddress: "", role: "" });
    setFormErrors({ userAddress: "", role: "" });
  };

  const handleAddUser = async () => {
    if (!address || !isSuperAdmin || !validateForm()) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      await assignUserRole(
        formData.userAddress,
        formData.role as AdminRole,
        address,
      );

      setSuccess(
        `Successfully assigned ${formData.role} role to ${formData.userAddress}`,
      );
      await loadAdminUsers();
      handleCloseModal("add");
    } catch (error: any) {
      console.error("Error adding user:", error);

      if (error.code === "ACTION_REJECTED") {
        setError("Transaction was rejected by user.");
      } else {
        setError("Error adding user. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!address || !selectedUser || !isSuperAdmin || !validateForm()) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      await assignUserRole(
        selectedUser.user_address,
        formData.role as AdminRole,
        address,
      );

      setSuccess(`Successfully updated role for ${selectedUser.user_address}`);
      await loadAdminUsers();
      handleCloseModal("edit");
    } catch (error: any) {
      console.error("Error editing user:", error);
      if (error.code === "ACTION_REJECTED") {
        setError("Transaction was rejected by user.");
      } else {
        setError("Error editing user. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!address || !selectedUser || !isSuperAdmin) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      await removeUserRole(selectedUser.user_address, address);

      setSuccess(`Successfully removed role from ${selectedUser.user_address}`);
      await loadAdminUsers();
      handleCloseModal("remove");
    } catch (error: any) {
      console.error("Error removing user:", error);

      if (error.code === "ACTION_REJECTED") {
        setError("Transaction was rejected by user.");
      } else {
        setError("Error removing user. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white min-h-screen">
        {/* Hero section with same style as other pages */}
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
              <p className="text-lg leading-8 text-white/90 font-regular">
                Super Admin Dashboard – Full Access
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

        {/* Main content section */}
        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Navigation Tabs */}
            <div className="mb-8">
              <div
                className="flex flex-wrap gap-1 p-2 rounded-lg"
                style={{ backgroundColor: "#5a7a96" }}
              >
                <button
                  onClick={() => navigate("/admin/kyc-requests")}
                  className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  KYC Requests
                </button>
                <button
                  onClick={() => navigate("/admin/contact-messages")}
                  className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  Contact Messages
                </button>
                <button className="px-6 py-3 rounded-lg text-white font-medium bg-orange-500">
                  Role Management
                </button>
                <button
                  onClick={() => navigate("/admin/fiat-requests")}
                  className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  Fiat Mint Requests
                </button>
                <button
                  onClick={() => navigate("/admin/reserves")}
                  className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  Proof of Reserves
                </button>
                <button
                  onClick={() => navigate("/admin/exchange-rates")}
                  className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
                >
                  Exchange Rates
                </button>
              </div>
            </div>

            {/* Access Denied Section */}
            <div
              className="rounded-lg p-6"
              style={{ backgroundColor: "#5a7a96" }}
            >
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
                    Only Super Admins can manage user roles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero section with same style as other pages */}
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
            <p className="text-lg leading-8 text-white/90 font-regular">
              Super Admin Dashboard – Full Access
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
                style={{ backgroundColor: "#ed9030" }}
                className="px-6 py-2 rounded-lg font-medium text-white"
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
                onClick={() => navigate("/admin/exchange-rates")}
                className="px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors text-white"
              >
                Exchange Rates
              </button>
            </div>
          </div>

          {/* Role Management Section */}
          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: "#2a4661" }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Smart Contract Role Management
                </h3>
                <p className="text-sm text-white/70">
                  Assign and manage smart contract roles for users
                </p>
              </div>
              <button
                onClick={() => {
                  setFormData({ userAddress: "", role: "" });
                  setFormErrors({ userAddress: "", role: "" });
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-lg text-white font-medium inline-flex items-center"
                style={{ backgroundColor: "#ed9030" }}
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Role
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg word-break">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Role descriptions */}
            <div className="mb-6 bg-gray-700 border border-gray-600 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white/70 mb-2">
                Available Smart Contract Roles:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(AdminRole).map((role) => (
                  <RoleCard key={role} role={role} />
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-white/70">Loading admin users...</p>
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/70">No admin users found</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <RoleTable
                  adminUsers={adminUsers}
                  currentUserAddress={address}
                  onEdit={(user) => {
                    setSelectedUser(user);
                    setFormData({
                      userAddress: user.user_address,
                      role: user.role,
                    });
                    setFormErrors({
                      userAddress: "",
                      role: "",
                    });
                    setShowEditModal(true);
                  }}
                  onRemove={(user) => {
                    setSelectedUser(user);
                    setShowRemoveModal(true);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <RoleModals
        showAddModal={showAddModal}
        showEditModal={showEditModal}
        showRemoveModal={showRemoveModal}
        selectedUser={selectedUser}
        formData={formData}
        formErrors={formErrors}
        actionLoading={actionLoading}
        onFormChange={handleFormChange}
        onAdd={handleAddUser}
        onEdit={handleEditUser}
        onRemove={handleRemoveUser}
        onClose={handleCloseModal}
      />
    </div>
  );
}
