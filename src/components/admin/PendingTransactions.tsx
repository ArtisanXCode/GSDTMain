import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useContract } from '../../hooks/useContract';
import { toast } from 'react-hot-toast';
import { handleBlockchainError } from '../../lib/web3';
import { ethers } from 'ethers'; // Import ethers

interface PendingTransaction {
  id: string;
  txType: TransactionType;
  status: TransactionStatus;
  initiator: string;
  target: string;
  amount: string;
  timestamp: Date;
  executeAfter: Date;
  rejectionReason: string;
  approver: string;
  canAutoExecute: boolean;
}

enum TransactionType {
  MINT = 0,
  BURN = 1,
  TRANSFER = 2,
  BLACKLIST = 3,
  KYC_UPDATE = 4,
  ROLE_GRANT = 5,
  ROLE_REVOKE = 6
}

enum TransactionStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  EXECUTED = 3,
  AUTO_EXECUTED = 4
}

const transactionTypeNames = {
  [TransactionType.MINT]: 'Mint',
  [TransactionType.BURN]: 'Burn',
  [TransactionType.TRANSFER]: 'Transfer',
  [TransactionType.BLACKLIST]: 'Blacklist',
  [TransactionType.KYC_UPDATE]: 'KYC Update',
  [TransactionType.ROLE_GRANT]: 'Grant Role',
  [TransactionType.ROLE_REVOKE]: 'Revoke Role'
};

// Placeholder functions for type and status labels
const getTransactionTypeLabel = (type: TransactionType): string => transactionTypeNames[type] || 'Unknown';
const getTransactionStatusLabel = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.PENDING: return 'Pending';
    case TransactionStatus.APPROVED: return 'Approved';
    case TransactionStatus.REJECTED: return 'Rejected';
    case TransactionStatus.EXECUTED: return 'Executed';
    case TransactionStatus.AUTO_EXECUTED: return 'Auto Executed';
    default: return 'Unknown';
  }
};


interface Props {
  onRefresh?: () => void;
}

export default function PendingTransactions({ onRefresh }: Props) {
  const { contract, account, isConnected } = useContract();
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<PendingTransaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (contract && isConnected) {
      fetchPendingTransactions();
    } else {
      setTransactions([]); // Clear transactions if not connected
      setLoading(false);
    }
  }, [contract, isConnected]);

  const fetchPendingTransactions = async () => {
    if (!contract) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - please check your connection')), 15000);
      });

      // Check if contract has required methods
      if (!contract.getPendingTransactionIds || !contract.getPendingTransaction) {
        throw new Error('Contract does not support pending transactions feature');
      }

      // Get pending transaction IDs with timeout
      const pendingIds = await Promise.race([
        contract.getPendingTransactionIds(),
        timeoutPromise
      ]);

      if (!pendingIds || pendingIds.length === 0) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Fetch details for each pending transaction with individual error handling
      const transactionPromises = pendingIds.map(async (id: any) => {
        try {
          const tx = await contract.getPendingTransaction(id);
          return {
            id: id.toString(),
            txType: getTransactionTypeLabel(tx.txType),
            status: getTransactionStatusLabel(tx.status),
            initiator: tx.initiator,
            target: tx.target,
            amount: ethers.utils.formatEther(tx.amount || '0'),
            timestamp: new Date(tx.timestamp.toNumber() * 1000),
            executeAfter: new Date(tx.executeAfter.toNumber() * 1000),
            rejectionReason: tx.rejectionReason || '',
            approver: tx.approver || '',
            canAutoExecute: tx.canAutoExecute || false
          };
        } catch (txError) {
          console.warn(`Failed to fetch transaction ${id}:`, txError);
          return null;
        }
      });

      const fetchedTransactions = await Promise.all(transactionPromises);
      // Filter out failed transactions
      const validTransactions = fetchedTransactions.filter(tx => tx !== null);
      setTransactions(validTransactions);

      if (validTransactions.length === 0 && pendingIds.length > 0) {
        toast.error('No valid pending transactions could be loaded');
      }
    } catch (error: any) {
      console.error('Error fetching pending transactions:', error);
      let errorMessage = 'Failed to fetch pending transactions';

      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message.includes('support')) {
        errorMessage = 'This contract version does not support pending transactions.';
      } else {
        errorMessage = handleBlockchainError(error);
      }

      toast.error(errorMessage);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (txId: string) => {
    if (!contract) return;

    try {
      setProcessing(true);
      const tx = await contract.approveTransaction(txId);
      await tx.wait();

      toast.success('Transaction approved and executed');
      fetchPendingTransactions();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error approving transaction:', error);
      const errorMessage = handleBlockchainError(error);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!contract || !selectedTx || !rejectionReason) return;

    try {
      setProcessing(true);
      const tx = await contract.rejectTransaction(selectedTx.id, rejectionReason);
      await tx.wait();

      toast.success('Transaction rejected');
      setShowRejectModal(false);
      setSelectedTx(null);
      setRejectionReason('');
      fetchPendingTransactions();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error rejecting transaction:', error);
      const errorMessage = handleBlockchainError(error);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleExecute = async (txId: string) => {
    if (!contract) return;

    try {
      setProcessing(true);
      const tx = await contract.executeTransaction(txId);
      await tx.wait();

      toast.success('Transaction executed');
      fetchPendingTransactions();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error executing transaction:', error);
      const errorMessage = handleBlockchainError(error);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatAmount = (amount: string, txType: TransactionType): string => {
    if (txType === TransactionType.MINT || txType === TransactionType.BURN || txType === TransactionType.TRANSFER) {
      const divisor = Math.pow(10, 18);
      return (parseFloat(amount) / divisor).toFixed(2) + ' GSDC';
    }
    return 'N/A';
  };

  const getTimeRemaining = (executeAfter: Date): string => {
    const now = new Date();
    const remaining = executeAfter.getTime() - now.getTime();

    if (remaining <= 0) return 'Ready for auto-execution';

    const minutes = Math.floor(remaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m remaining`;
    }
    return `${remainingMinutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading pending transactions...</p>
        <p className="mt-2 text-sm text-gray-400">This may take a few moments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pending Transactions</h2>
        <button
          onClick={fetchPendingTransactions}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending transactions</h3>
          <p className="mt-1 text-sm text-gray-500">All transactions have been processed or there are no pending approvals.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Initiator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {transactions.map((tx) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{tx.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {tx.txType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatAmount(tx.amount, tx.txType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.target.slice(0, 6)}...{tx.target.slice(-4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.initiator.slice(0, 6)}...{tx.initiator.slice(-4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : tx.status === 'Approved' ? 'bg-green-100 text-green-800' : tx.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getTimeRemaining(tx.executeAfter)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleApprove(tx.id)}
                          disabled={processing}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTx(tx);
                            setShowRejectModal(true);
                          }}
                          disabled={processing}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        {tx.canAutoExecute && (
                          <button
                            onClick={() => handleExecute(tx.id)}
                            disabled={processing}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Execute
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Transaction Modal */}
      {showRejectModal && selectedTx && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Transaction #{selectedTx.id}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={3}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedTx(null);
                  setRejectionReason('');
                }}
                disabled={processing}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Reject Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}