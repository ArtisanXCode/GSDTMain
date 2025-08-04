
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import { CheckIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import { getContract } from "../../lib/web3";

interface PendingTransaction {
  id: number;
  txType: string;
  status: string;
  initiator: string;
  target: string;
  amount: string;
  timestamp: number;
  executeAfter: number;
  data: string;
}

export default function PendingRoles() {
  const { address } = useWallet();
  const { isSuperAdmin, isApprover } = useAdmin();
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPendingTransactions();
  }, []);

  const loadPendingTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contract = getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const pendingIds = await contract.getPendingTransactionIds();
      const transactions = [];

      for (const id of pendingIds) {
        const tx = await contract.getPendingTransaction(id);
        if (tx.txType === 6 || tx.txType === 7) { // ROLE_GRANT or ROLE_REVOKE
          transactions.push({
            id: id.toNumber(),
            txType: tx.txType === 6 ? 'ROLE_GRANT' : 'ROLE_REVOKE',
            status: tx.status,
            initiator: tx.initiator,
            target: tx.target,
            amount: tx.amount.toString(),
            timestamp: tx.timestamp.toNumber(),
            executeAfter: tx.executeAfter.toNumber(),
            data: tx.data
          });
        }
      }

      setPendingTransactions(transactions);
    } catch (err: any) {
      console.error('Error loading pending transactions:', err);
      setError(err.message || 'Error loading pending transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (txId: number) => {
    if (!address || (!isSuperAdmin && !isApprover)) return;
    
    try {
      setActionLoading(`approve-${txId}`);
      setError(null);
      setSuccess(null);
      
      const contract = getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await contract.approveTransaction(txId);
      await tx.wait();
      
      setSuccess('Transaction approved successfully');
      await loadPendingTransactions();
    } catch (err: any) {
      console.error('Error approving transaction:', err);
      setError(err.message || 'Error approving transaction');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (txId: number, reason: string) => {
    if (!address || (!isSuperAdmin && !isApprover)) return;
    
    try {
      setActionLoading(`reject-${txId}`);
      setError(null);
      setSuccess(null);
      
      const contract = getContract();
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await contract.rejectTransaction(txId, reason);
      await tx.wait();
      
      setSuccess('Transaction rejected successfully');
      await loadPendingTransactions();
    } catch (err: any) {
      console.error('Error rejecting transaction:', err);
      setError(err.message || 'Error rejecting transaction');
    } finally {
      setActionLoading(null);
    }
  };

  const decodeRoleData = (data: string) => {
    try {
      // This is a simplified decoder - you might need to adjust based on your contract's encoding
      return "Role assignment data";
    } catch {
      return "Unknown role data";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isSuperAdmin && !isApprover) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <XMarkIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            Only Super Admins and Approvers can view pending role approvals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero section with same style as RoleManagement */}
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
              Pending Role Approvals
            </h1>
            <p className="text-lg leading-8 text-white/90 font-regular">
              Review and approve pending role assignments
            </p>
          </div>
        </motion.div>
      </div>

      {/* Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
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
          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: "#2a4661" }}
          >

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Pending Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading pending role approvals...</p>
          </div>
        ) : pendingTransactions.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">All role assignments have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Initiator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto Execute
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingTransactions.map((tx) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{tx.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.txType === 'ROLE_GRANT'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tx.txType === 'ROLE_GRANT' ? 'Grant Role' : 'Revoke Role'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.target.slice(0, 6)}...{tx.target.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.initiator.slice(0, 6)}...{tx.initiator.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(tx.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(tx.executeAfter)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleApprove(tx.id)}
                        disabled={actionLoading === `approve-${tx.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {actionLoading === `approve-${tx.id}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(tx.id, 'Rejected by admin')}
                        disabled={actionLoading === `reject-${tx.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {actionLoading === `reject-${tx.id}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Reject
                          </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}
