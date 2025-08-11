import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KYCRequest, KYCStatus, fetchKYCRequests, approveKYCRequest, rejectKYCRequest } from '../../services/kyc';

export default function KYCApproval() {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchKYCRequests(KYCStatus.PENDING);
      setRequests(data || []);
    } catch (err: any) {
      console.error('Error loading KYC requests:', err);
      setError(err.message || 'Error loading KYC requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (request: KYCRequest) => {
    try {
      setActionLoading(true);
      setError(null);
      await approveKYCRequest(request.id);
      await loadRequests();
    } catch (error: any) {
      console.error('Error approving KYC request:', error);

      // Handle specific error messages
      if (error.message?.includes('missing role') || error.message?.includes('permission')) {
        setError('You do not have permission to approve KYC. Only users with ADMIN role can approve.');
      } else if (error.message?.includes('CALL_EXCEPTION')) {
        setError('Smart contract call failed. Please check your wallet connection and admin permissions, then try again.');
      } else if (error.message?.includes('cannot estimate gas') || error.message?.includes('Transaction would fail')) {
        setError('Transaction failed due to insufficient permissions or gas estimation error. Please check your role permissions and wallet connection.');
      } else if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC update failed. Please check user address and try again.');
        } else if (revertReason.includes('AccessControl')) {
          setError('Access denied. You do not have the required role to perform this action.');
        } else {
          setError(revertReason || 'Transaction failed. Please try again.');
        }
      } else if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        setError('Transaction was rejected by user.');
      } else if (error.message?.includes('Contract not initialized')) {
        setError('Please connect your wallet and try again.');
      } else if (error.message?.includes('Wallet not connected')) {
        setError('Wallet not connected properly. Please disconnect and reconnect your wallet, then try again.');
      } else {
        setError(error.message || 'Error approving KYC request. Please try again.');
      }

    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason) return;

    try {
      setActionLoading(true);
      setError(null);
      await rejectKYCRequest(selectedRequest.id, rejectReason);
      setSelectedRequest(null);
      setRejectReason('');
      await loadRequests();
    } catch (error: any) {
      console.error('Error rejecting KYC request:', error);

      // Handle specific error messages
      if (error.message?.includes('missing role')) {
        setError('You do not have permission to reject KYC. Only users with ADMIN role can reject.');
      } else if (error.message?.includes('execution reverted')) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes('KYC')) {
          setError('KYC verification required before KYC rejecting.');
        } else {
          setError(revertReason || 'Transaction failed. Please try again.');
        }
      } else if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Error rejecting KYC request.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading KYC requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadRequests}
          className="mt-2 text-sm text-red-600 hover:text-red-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Pending KYC Requests</h3>
        <button
          onClick={loadRequests}
          className="text-sm text-primary-600 hover:text-primary-500"
        >
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No pending KYC requests</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.first_name} {request.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.user_address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.document_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.submitted_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a
                      href={request.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      View Document
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => handleApprove(request)}
                        disabled={actionLoading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject KYC Request</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                rows={3}
                placeholder="Please provide a reason for rejection..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}