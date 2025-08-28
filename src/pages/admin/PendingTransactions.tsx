import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import { useMultiSigAdminContract } from "../../hooks/useContract";
import AdminNavigation from "../../components/admin/AdminNavigation";
import AdminHeroSection from "../../components/admin/AdminHeroSection";
import AccessDenied from "../../components/admin/AccessDenied";
import { 
  MultiSigAdminService, 
  PendingTransaction, 
  TransactionType, 
  TransactionStatus 
} from "../../services/multiSigAdmin";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function PendingTransactionsPage() {
  const { address, isConnected } = useWallet();
  const { isAdmin, isSuperAdmin, loading: adminLoading } = useAdmin();
  const [hasApprovalPermissions, setHasApprovalPermissions] = useState(false);
  const [loading, setLoading] = useState(true);
  const multiSigContract = useMultiSigAdminContract();
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [multiSigService, setMultiSigService] = useState<MultiSigAdminService | null>(null);

  useEffect(() => {
    if (multiSigContract) {
      setMultiSigService(new MultiSigAdminService(multiSigContract));
    }
  }, [multiSigContract]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!multiSigService) return;

      try {
        setLoading(true);
        setError(null);

        const txIds = await multiSigService.getPendingTransactionIds();
        const txPromises = txIds.map(id => multiSigService.getPendingTransaction(id));
        const txs = await Promise.all(txPromises);

        setTransactions(txs.filter(tx => tx.exists));
      } catch (err: any) {
        console.error("Error loading pending transactions:", err);
        setError(err.message || "Error loading transactions");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [multiSigService]);

  const checkPermissions = async () => {

    if (!isConnected || !address) {
      setLoading(false);
      return;
    }    

    try {
      setLoading(true);

      // First check database admin roles (faster and more reliable)
      if (isSuperAdmin || isAdmin) {
        setHasApprovalPermissions(true);
        setLoading(false);
        return;
      }

      // Fallback to smart contract role checking if available
      if (contract) {
        try {
          const APPROVER_ROLE = await contract.APPROVER_ROLE();
          const SUPER_ADMIN_ROLE = await contract.SUPER_ADMIN_ROLE();

          const [hasApproverRole, hasSuperAdminRole] = await Promise.all([
            contract.hasRole(APPROVER_ROLE, address),
            contract.hasRole(SUPER_ADMIN_ROLE, address),
          ]);

          setHasApprovalPermissions(hasApproverRole || hasSuperAdminRole);
        } catch (contractError) {
          console.warn(
            "Smart contract role check failed, using database roles only",
          );
          setHasApprovalPermissions(isSuperAdmin || isAdmin);
        }
      } else {
        // If no contract, rely on database roles
        setHasApprovalPermissions(isSuperAdmin || isAdmin);
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      // Fallback to database admin roles if contract check fails
      setHasApprovalPermissions(isSuperAdmin || isAdmin);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // This will be called when transactions are updated
    checkPermissions();
    const loadTransactions = async () => {
      if (!multiSigService) return;

      try {
        setLoading(true);
        setError(null);

        const txIds = await multiSigService.getPendingTransactionIds();
        const txPromises = txIds.map(id => multiSigService.getPendingTransaction(id));
        const txs = await Promise.all(txPromises);

        setTransactions(txs.filter(tx => tx.exists));
      } catch (err: any) {
        console.error("Error loading pending transactions:", err);
        setError(err.message || "Error loading transactions");
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  };

  const handleApprove = async () => {
    if (!selectedTransaction || !multiSigService) return;

    try {
      setActionLoading(true);
      await multiSigService.approveTransaction(selectedTransaction.id);

      // Refresh transactions
      const txIds = await multiSigService.getPendingTransactionIds();
      const txPromises = txIds.map(id => multiSigService.getPendingTransaction(id));
      const txs = await Promise.all(txPromises);
      setTransactions(txs.filter(tx => tx.exists));

      setShowApproveModal(false);
      setSelectedTransaction(null);
    } catch (err: any) {
      console.error("Error approving transaction:", err);
      setError(err.message || "Error approving transaction");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction || !multiSigService || !rejectionReason) return;

    try {
      setActionLoading(true);
      await multiSigService.rejectTransaction(selectedTransaction.id, rejectionReason);

      // Refresh transactions
      const txIds = await multiSigService.getPendingTransactionIds();
      const txPromises = txIds.map(id => multiSigService.getPendingTransaction(id));
      const txs = await Promise.all(txPromises);
      setTransactions(txs.filter(tx => tx.exists));

      setShowRejectModal(false);
      setSelectedTransaction(null);
      setRejectionReason("");
    } catch (err: any) {
      console.error("Error rejecting transaction:", err);
      setError(err.message || "Error rejecting transaction");
    } finally {
      setActionLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: number) => {
    switch (type) {
      case TransactionType.MINT: return "Mint Tokens";
      case TransactionType.BURN: return "Burn Tokens";
      case TransactionType.BURN_BLACKLISTED: return "Burn Blacklisted";
      case TransactionType.BLACKLIST: return "Blacklist Address";
      case TransactionType.FREEZE: return "Freeze Address";
      case TransactionType.UNFREEZE: return "Unfreeze Address";
      case TransactionType.ROLE_GRANT: return "Grant Role";
      case TransactionType.ROLE_REVOKE: return "Revoke Role";
      case TransactionType.PAUSE_TOKEN: return "Pause Token";
      case TransactionType.UNPAUSE_TOKEN: return "Unpause Token";
      case TransactionType.TRANSFER_OWNERSHIP: return "Transfer Ownership";
      case TransactionType.UPDATE_TOKEN_CONTRACT: return "Update Contract";
      default: return "Unknown";
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case TransactionStatus.REJECTED:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      case TransactionStatus.EXECUTED:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Executed</span>;
      case TransactionStatus.AUTO_EXECUTED:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Auto-Executed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
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

  if (!hasApprovalPermissions) {
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
                You need APPROVER_ROLE or SUPER_ADMIN_ROLE permissions to access
                this page.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  <strong>Required Roles:</strong>
                  <br />
                  • APPROVER_ROLE
                  <br />• SUPER_ADMIN_ROLE
                </p>
              </div>
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
                      Transaction Approval
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Review and approve or reject pending transactions that are
                      in cooldown period.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Connected as</div>
                    <div className="font-mono text-sm text-gray-900">
                      {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not connected'}
                    </div>
                    {isSuperAdmin && (
                      <div className="text-xs text-blue-600 font-medium">Super Admin</div>
                    )}
                    {isAdmin && !isSuperAdmin && (
                      <div className="text-xs text-green-600 font-medium">Admin</div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    How it works:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • All sensitive transactions have a 90-minute cooldown
                      period
                    </li>
                    <li>
                      • Transactions can be approved or rejected during this
                      period
                    </li>
                    <li>
                      • If no action is taken, transactions auto-execute after
                      90 minutes
                    </li>
                    <li>
                      • Only APPROVER_ROLE and SUPER_ADMIN_ROLE can
                      approve/reject
                    </li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600">Loading transactions...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">No Pending Transactions</h3>
                    <p className="text-gray-500 mt-2">There are no pending transactions to review at this time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposer</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((tx) => (
                          <tr key={tx.id.toString()}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.id.toString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTransactionTypeLabel(tx.transactionType)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.proposer.slice(0, 8)}...{tx.proposer.slice(-6)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(tx.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => { setSelectedTransaction(tx); setShowApproveModal(true); }}
                                className="text-green-600 hover:text-green-900 mr-4"
                                disabled={actionLoading}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => { setSelectedTransaction(tx); setShowRejectModal(true); }}
                                className="text-red-600 hover:text-red-900"
                                disabled={actionLoading}
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
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

      {/* Approve Modal */}
      {showApproveModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Approve Transaction</h2>
            <p>Are you sure you want to approve transaction ID: {selectedTransaction.id.toString()}?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => { setShowApproveModal(false); setSelectedTransaction(null); }} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={handleApprove} disabled={actionLoading} className="px-4 py-2 bg-green-500 text-white rounded-md disabled:opacity-50">
                {actionLoading ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Reject Transaction</h2>
            <p>Are you sure you want to reject transaction ID: {selectedTransaction.id.toString()}?</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (optional)"
              className="mt-4 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => { setShowRejectModal(false); setSelectedTransaction(null); setRejectionReason(""); }} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading} className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-50">
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}