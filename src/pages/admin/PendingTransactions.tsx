
import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useContract } from '../../hooks/useContract';
import AdminLayout from './layout/AdminLayout';
import PendingTransactions from '../../components/admin/PendingTransactions';
import { toast } from 'react-hot-toast';

export default function PendingTransactionsPage() {
  const { account, isConnected } = useWallet();
  const { contract } = useContract();
  const [hasApprovalPermissions, setHasApprovalPermissions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, [contract, account, isConnected]);

  const checkPermissions = async () => {
    if (!contract || !account || !isConnected) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check if user has APPROVER_ROLE or SUPER_ADMIN_ROLE
      const APPROVER_ROLE = await contract.APPROVER_ROLE();
      const SUPER_ADMIN_ROLE = await contract.SUPER_ADMIN_ROLE();
      
      const [hasApproverRole, hasSuperAdminRole] = await Promise.all([
        contract.hasRole(APPROVER_ROLE, account),
        contract.hasRole(SUPER_ADMIN_ROLE, account)
      ]);

      setHasApprovalPermissions(hasApproverRole || hasSuperAdminRole);
    } catch (error) {
      console.error('Error checking permissions:', error);
      toast.error('Failed to check permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // This will be called when transactions are updated
    checkPermissions();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!isConnected) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access this page.</p>
        </div>
      </AdminLayout>
    );
  }

  if (!hasApprovalPermissions) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need APPROVER_ROLE or SUPER_ADMIN_ROLE permissions to access this page.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>Required Roles:</strong>
              <br />
              • APPROVER_ROLE
              <br />
              • SUPER_ADMIN_ROLE
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction Approval</h1>
              <p className="text-gray-600 mt-2">
                Review and approve or reject pending transactions that are in cooldown period.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Connected as</div>
              <div className="font-mono text-sm">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All sensitive transactions have a 90-minute cooldown period</li>
              <li>• Transactions can be approved or rejected during this period</li>
              <li>• If no action is taken, transactions auto-execute after 90 minutes</li>
              <li>• Only APPROVER_ROLE and SUPER_ADMIN_ROLE can approve/reject</li>
            </ul>
          </div>

          <PendingTransactions onRefresh={handleRefresh} />
        </div>
      </div>
    </AdminLayout>
  );
}
