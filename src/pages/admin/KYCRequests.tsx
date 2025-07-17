
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { KYCStatus, fetchKYCRequests, KYCRequest, approveKYCRequest, rejectKYCRequest, getKYCStats } from '../../services/kyc';
import KYCDetailModal from '../../components/admin/kyc/KYCDetailModal';

export default function KYCRequests() {
  const { isConnected } = useWallet();
  const { isAdmin, isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [kycStats, setKycStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<KYCStatus | 'ALL'>('ALL');
  const [filterMethod, setFilterMethod] = useState<'manual' | 'sumsub' | 'ALL'>('ALL');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load KYC requests and stats
        const [allKycData, stats] = await Promise.all([
          fetchKYCRequests(),
          getKYCStats()
        ]);
        
        // Apply filters
        let filteredData = [...allKycData];
        if (filterStatus !== 'ALL') {
          filteredData = filteredData.filter(req => req.status === filterStatus);
        }
        if (filterMethod !== 'ALL') {
          filteredData = filteredData.filter(req => req.verification_method === filterMethod);
        }
        
        setKycRequests(filteredData);
        setKycStats(stats);
      } catch (error: any) {
        console.error('Error loading KYC data:', error);
        setError(error.message || 'Error loading KYC data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filterStatus, filterMethod]);

  const handleApprove = async (request: KYCRequest) => {
    if (!isSuperAdmin) {
      setError('Only Super Admins can approve KYC requests');
      return;
    }
    
    try {
      setActionLoading(true);
      await approveKYCRequest(request.id, request.user_address);
      
      // Update UI
      setKycRequests(prev => 
        prev.map(r => 
          r.id === request.id 
            ? {...r, status: KYCStatus.APPROVED} 
            : r
        )
      );
      
      setKycStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));
    } catch (error: any) {
      console.error('Error approving request:', error);
      if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Error approving kyc request. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (request: KYCRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(false);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest || !rejectReason) return;
    
    try {
      setActionLoading(true);
      await rejectKYCRequest(selectedRequest.id, selectedRequest.user_address, rejectReason);
      
      // Update UI
      setKycRequests(prev => 
        prev.map(r => 
          r.id === selectedRequest.id 
            ? {...r, status: KYCStatus.REJECTED} 
            : r
        )
      );
      
      setKycStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));
      
      setSelectedRequest(null);
      setRejectReason('');
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      if (error.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user.');
      } else {
        setError('Error rejecting kyc request. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case KYCStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case KYCStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case KYCStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero section with same style as other pages */}
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
            <p className="text-lg leading-8 text-white/90 font-regular">
              Super Admin Dashboard – Full Access
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
              className="flex flex-wrap gap-1 p-2 rounded-lg"
              style={{ backgroundColor: '#5a7a96' }}
            >
              <button className="px-6 py-3 rounded-lg text-white font-medium bg-orange-500">
                KYC Requests
              </button>
              <button 
                onClick={() => navigate('/admin/contact-messages')}
                className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
              >
                Contact Messages
              </button>
              <button 
                onClick={() => navigate('/admin/role-management')}
                className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
              >
                Role Management
              </button>
              <button 
                onClick={() => navigate('/admin/fiat-requests')}
                className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
              >
                Fiat Mint Requests
              </button>
              <button 
                onClick={() => navigate('/admin/reserves')}
                className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
              >
                Proof of Reserves
              </button>
              <button 
                onClick={() => navigate('/admin/exchange-rates')}
                className="px-6 py-3 rounded-lg text-white/70 font-medium hover:text-white hover:bg-white/10 transition-colors"
              >
                Exchange Rates
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              className="rounded-lg p-6 text-white"
              style={{ backgroundColor: '#5a7a96' }}
            >
              <div className="text-sm text-white/70 mb-2">Total KYC Requests</div>
              <div className="text-3xl font-bold">{kycStats.total}</div>
              <div className="text-xs text-green-400 mt-1">+100%</div>
            </div>
            
            <div 
              className="rounded-lg p-6 text-white"
              style={{ backgroundColor: '#5a7a96' }}
            >
              <div className="text-sm text-white/70 mb-2">Pending Requests</div>
              <div className="text-3xl font-bold">{kycStats.pending}</div>
              <div className="text-xs text-red-400 mt-1">-2%</div>
            </div>
            
            <div 
              className="rounded-lg p-6 text-white"
              style={{ backgroundColor: '#5a7a96' }}
            >
              <div className="text-sm text-white/70 mb-2">Approved Requests</div>
              <div className="text-3xl font-bold">{kycStats.approved}</div>
              <div className="text-xs text-green-400 mt-1">+100%</div>
            </div>
            
            <div 
              className="rounded-lg p-6 text-white"
              style={{ backgroundColor: '#5a7a96' }}
            >
              <div className="text-sm text-white/70 mb-2">Rejected Requests</div>
              <div className="text-3xl font-bold">{kycStats.rejected}</div>
              <div className="text-xs text-red-400 mt-1">+0.18%</div>
            </div>
          </div>

          {/* KYC Requests Section */}
          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: '#5a7a96' }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">KYC Requests</h3>
                <p className="text-sm text-white/70">Review and manage user KYC verification requests</p>
              </div>
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#ed9030' }}
              >
                Settings
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-white/70 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as KYCStatus | 'ALL')}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value={KYCStatus.PENDING}>Pending</option>
                  <option value={KYCStatus.APPROVED}>Approved</option>
                  <option value={KYCStatus.REJECTED}>Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-2">Verification Method</label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value as 'manual' | 'sumsub' | 'ALL')}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
                >
                  <option value="ALL">All Methods</option>
                  <option value="manual">Manual</option>
                  <option value="sumsub">Automated (SumSub)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* KYC Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white/70 font-medium">USER</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">NAME</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">DOCUMENT TYPE</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">STATUS</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">SUBMITTED</th>
                    <th className="text-left py-3 px-4 text-white/70 font-medium">VERIFICATION</th>
                    <th className="text-center py-3 px-4 text-white/70 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p className="mt-4 text-white/70">Loading KYC requests...</p>
                      </td>
                    </tr>
                  ) : kycRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <p className="text-white/70">No KYC requests found</p>
                      </td>
                    </tr>
                  ) : (
                    kycRequests.map((request) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-white/10 hover:bg-white/5"
                      >
                        <td className="py-4 px-4 text-white text-sm">
                          {request.user_address.slice(0, 6)}...{request.user_address.slice(-4)}
                        </td>
                        <td className="py-4 px-4 text-white text-sm">
                          {request.first_name} {request.last_name}
                        </td>
                        <td className="py-4 px-4 text-white text-sm">
                          {request.document_type}
                        </td>
                        <td className="py-4 px-4">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-white text-sm">
                          {new Date(request.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-white text-sm">
                          {request.verification_method === 'sumsub' ? (
                            <span className="text-blue-400">Automated (Sumsub)</span>
                          ) : (
                            <span>Manual</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {request.status === KYCStatus.PENDING && isSuperAdmin && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <KYCDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onApprove={() => {
            setShowDetailModal(false);
            handleApprove(selectedRequest);
          }}
          onReject={() => {
            setShowDetailModal(false);
            handleReject(selectedRequest);
          }}
          actionLoading={actionLoading}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* Reject Modal */}
      {selectedRequest && !showDetailModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject KYC Request</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                onClick={handleConfirmReject}
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
