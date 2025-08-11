
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { useRoleManagement } from '../../hooks/useRoleManagement';
import { assignUserRole, removeUserRole, getAdminUsers } from '../../services/admin/roles';
import { SMART_CONTRACT_ROLES, ROLE_DESCRIPTIONS } from '../../constants/roles';
import AdminNavigation from '../../components/admin/AdminNavigation';
import { toast } from 'react-hot-toast';
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function RoleManagementPage() {
  const { address, isConnected } = useWallet();
  const { isSuperAdmin, loading: adminLoading } = useAdmin();
  const {
    adminUsers,
    loading,
    error,
    success,
    showAddModal,
    showEditModal,
    showRemoveModal,
    selectedUser,
    formData,
    formErrors,
    actionLoading,
    setShowAddModal,
    setShowEditModal,
    setShowRemoveModal,
    setSelectedUser,
    setFormData,
    setFormErrors,
    setActionLoading,
    setError,
    setSuccess,
    validateForm,
    handleFormChange,
    handleCloseModal
  } = useRoleManagement();

  // Refresh users function
  const refreshUsers = async () => {
    try {
      const users = await getAdminUsers();
      // Update the users in the hook if needed
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  // Handle Add User with Smart Contract Integration
  const handleAddUser = async () => {
    if (!address || !isSuperAdmin || !validateForm()) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      // Show loading toast
      const loadingToast = toast.loading('Processing role assignment...');
      
      // Call the assignUserRole function which handles both contract and database
      const success = await assignUserRole(
        formData.userAddress,
        formData.role as any,
        address
      );
      
      if (success) {
        toast.dismiss(loadingToast);
        toast.success(`Role ${formData.role} successfully assigned!`);
        setSuccess(`Role ${formData.role} successfully assigned to ${formData.userAddress}`);
        
        // Refresh the users list
        await refreshUsers();
        handleCloseModal('add');
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to assign role');
        setError('Failed to assign role');
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Error adding user');
      setError(error.message || 'Error adding user');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit User
  const handleEditUser = async () => {
    if (!address || !selectedUser || !isSuperAdmin || !validateForm()) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const loadingToast = toast.loading('Updating user role...');
      
      // First remove the old role, then assign the new one
      const removeSuccess = await removeUserRole(selectedUser.user_address, address);
      if (removeSuccess) {
        const assignSuccess = await assignUserRole(
          formData.userAddress,
          formData.role as any,
          address
        );
        
        if (assignSuccess) {
          toast.dismiss(loadingToast);
          toast.success(`Role updated to ${formData.role}!`);
          setSuccess(`User role successfully updated to ${formData.role}`);
          await refreshUsers();
          handleCloseModal('edit');
        } else {
          toast.dismiss(loadingToast);
          toast.error('Failed to update role');
          setError('Failed to update role');
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to remove old role');
        setError('Failed to remove old role');
      }
    } catch (error: any) {
      console.error('Error editing user:', error);
      toast.error(error.message || 'Error editing user');
      setError(error.message || 'Error editing user');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Remove User
  const handleRemoveUser = async () => {
    if (!address || !selectedUser || !isSuperAdmin) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const loadingToast = toast.loading('Removing user role...');
      
      const success = await removeUserRole(selectedUser.user_address, address);
      
      if (success) {
        toast.dismiss(loadingToast);
        toast.success('User role successfully removed!');
        setSuccess('User role successfully removed');
        await refreshUsers();
        handleCloseModal('remove');
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to remove user role');
        setError('Failed to remove user role');
      }
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast.error(error.message || 'Error removing user');
      setError(error.message || 'Error removing user');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle opening edit modal
  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setFormData({
      userAddress: user.user_address,
      role: user.role
    });
    setShowEditModal(true);
  };

  // Handle opening remove modal
  const handleRemoveClick = (user: any) => {
    setSelectedUser(user);
    setShowRemoveModal(true);
  };

  if (loading || adminLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div
          className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: `url('/headers/admin_dashboard_header.png')`,
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

        <div className="relative z-20 flex justify-end">
          <div className="phoenix-icon-parent">
            <img
              src="/logo_gsdc_icon.png"
              alt="Phoenix Icon"
              className="phoenix-icon-large"
            />
          </div>
        </div>

        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <AdminNavigation className="mb-8" />
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white min-h-screen">
        <div
          className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: `url('/headers/admin_dashboard_header.png')`,
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

        <div className="relative z-20 flex justify-end">
          <div className="phoenix-icon-parent">
            <img
              src="/logo_gsdc_icon.png"
              alt="Phoenix Icon"
              className="phoenix-icon-large"
            />
          </div>
        </div>

        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <AdminNavigation className="mb-8" />
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Wallet Not Connected
              </h2>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to access this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="bg-white min-h-screen">
        <div
          className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: `url('/headers/admin_dashboard_header.png')`,
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

        <div className="relative z-20 flex justify-end">
          <div className="phoenix-icon-parent">
            <img
              src="/logo_gsdc_icon.png"
              alt="Phoenix Icon"
              className="phoenix-icon-large"
            />
          </div>
        </div>

        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <AdminNavigation className="mb-8" />
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-6">
                You need SUPER_ADMIN permissions to access this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/admin_dashboard_header.png')`,
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

      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <AdminNavigation className="mb-8" />

          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: "#2a4661" }}
          >
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Role Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Manage admin roles and permissions for the GSDC platform.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add User
                  </button>
                </div>

                {/* Success/Error Messages */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-sm text-green-800">{success}</div>
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-sm text-red-800">{error}</div>
                  </div>
                )}

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {adminUsers.map((user) => (
                        <tr key={user.user_address}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {user.user_address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              ROLE_DESCRIPTIONS[user.role]?.color || 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {ROLE_DESCRIPTIONS[user.role]?.name || user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveClick(user)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add User Role</h3>
              <button
                onClick={() => handleCloseModal('add')}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Address
                </label>
                <input
                  type="text"
                  value={formData.userAddress}
                  onChange={(e) => handleFormChange('userAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0x..."
                />
                {formErrors.userAddress && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.userAddress}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  {Object.entries(SMART_CONTRACT_ROLES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {ROLE_DESCRIPTIONS[value]?.name || value}
                    </option>
                  ))}
                </select>
                {formErrors.role && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.role}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => handleCloseModal('add')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Assign Role'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit User Role</h3>
              <button
                onClick={() => handleCloseModal('edit')}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Address
                </label>
                <input
                  type="text"
                  value={formData.userAddress}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(SMART_CONTRACT_ROLES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {ROLE_DESCRIPTIONS[value]?.name || value}
                    </option>
                  ))}
                </select>
                {formErrors.role && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.role}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => handleCloseModal('edit')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Role'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove User Modal */}
      {showRemoveModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Remove User Role</h3>
              <button
                onClick={() => handleCloseModal('remove')}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to remove the role for:
              </p>
              <p className="font-mono text-sm text-gray-900 mt-2">
                {selectedUser.user_address}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Current role: <span className="font-semibold">{selectedUser.role}</span>
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => handleCloseModal('remove')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUser}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removing...
                  </>
                ) : (
                  'Remove Role'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
