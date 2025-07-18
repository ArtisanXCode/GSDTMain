import { BigNumber } from "ethers";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import { useGSDTContract } from "../../hooks/useContract";

import {
  FiatMintRequest,
  FiatMintStatus,
  getFiatMintRequests,
  approveFiatMintRequest,
  rejectFiatMintRequest,
} from "../../services/fiatMinting";
import { format } from "date-fns";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function FiatMintRequests() {
  const { address, isConnected } = useWallet();
  const contract = useGSDTContract();
  const { isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FiatMintRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<FiatMintRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FiatMintStatus | "ALL">(
    "ALL",
  );
  const [minMintAmount, setMinMintAmount] = useState<string>("100"); // Default min amount

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFiatMintRequests(
          filterStatus === "ALL" ? undefined : filterStatus,
        );
        setRequests(data);
      } catch (err: any) {
        console.error("Error loading fiat mint requests:", err);
        setError(err.message || "Error loading requests");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!selectedRequest || !address) return;

    try {
      setActionLoading(true);

      const minMintAmt = await contract.MIN_MINT_AMOUNT();
      const decimals = await contract.decimals();
      const minMintAmnt = await minMintAmt.div(
        BigNumber.from(10).pow(decimals),
      ); // Dividing by 10^18 for ERC20 tokens
      await setMinMintAmount(minMintAmnt.toNumber());

      await approveFiatMintRequest(selectedRequest.id, address, adminNotes);

      // Update the local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: FiatMintStatus.APPROVED,
                admin_notes: adminNotes,
                processed_by: address,
              }
            : req,
        ),
      );

      setShowApproveModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error: any) {
      console.error("Error approving request:", error);
      //setError(err.message || 'Error approving request');

      if (error.message?.includes("missing role")) {
        setError(
          "You do not have permission to mint tokens. Only users with MINTER_ROLE can mint.",
        );
      } else if (error.message?.includes("execution reverted")) {
        const revertReason = error.data?.message || error.message;
        if (revertReason.includes("KYC")) {
          setError("KYC verification required before minting tokens.");
        } else if (revertReason.includes("amount below minimum")) {
          setError(`Amount must be at least ${minMintAmount} GSDT.`);
        } else if (revertReason.includes("amount above maximum")) {
          setError("Amount exceeds maximum minting limit.");
        } else if (revertReason.includes("daily mint limit")) {
          setError("Daily minting limit exceeded. Please try again tomorrow.");
        } else {
          setError(revertReason || "Transaction failed. Please try again.");
        }
      } else if (error.code === "ACTION_REJECTED") {
        setError("Transaction was rejected by user.");
      } else {
        setError("Error minting tokens. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !address || !adminNotes) return;

    try {
      setActionLoading(true);
      await rejectFiatMintRequest(selectedRequest.id, address, adminNotes);

      // Update the local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: FiatMintStatus.REJECTED,
                admin_notes: adminNotes,
                processed_by: address,
              }
            : req,
        ),
      );

      setShowRejectModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      setError(err.message || "Error rejecting request");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: FiatMintStatus) => {
    switch (status) {
      case FiatMintStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case FiatMintStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case FiatMintStatus.REJECTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              <p className="text-xl text-white/90 max-w-2xl leading-8">
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
                  style={{ backgroundColor: "#ed9030" }}
                  className="px-6 py-2 rounded-lg font-medium text-white"
                >
                  Fiat Mint Requests
                </button>
                <button
                  onClick={() => navigate("/admin/proof-of-reserves")}
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

            {/* Access Denied Content */}
            <div className="bg-slate-700 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-white mb-6">
                Access Denied
              </h3>
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-white">
                  Access Denied
                </h3>
                <p className="mt-1 text-sm text-gray-300">
                  Only Super Admins can manage fiat mint requests.
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
            <p className="text-xl text-white/90 max-w-2xl leading-8">
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
                style={{ backgroundColor: "#ed9030" }}
                className="px-6 py-2 rounded-lg font-medium text-white"
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

          {/* Fiat Mint Requests Content */}
          <div className="bg-slate-700 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Fiat Mint Requests
                </h3>
                <p className="text-gray-300">
                  Review and manage KYC verification requests
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-slate-600 p-4 rounded-lg">
              <div>
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Status
                </label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FiatMintStatus | "ALL")
                  }
                  className="block w-full md:w-48 rounded-md border-0 bg-slate-500 px-3 py-2 text-white shadow-sm ring-1 ring-inset ring-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value={FiatMintStatus.PENDING}>Pending</option>
                  <option value={FiatMintStatus.APPROVED}>Approved</option>
                  <option value={FiatMintStatus.REJECTED}>Rejected</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-300">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-300">No fiat mint requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-slate-600 rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        USER
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        AMOUNT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        CURRENCY
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        REFERENCE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        SUBMITTED
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500">
                    {requests.map((request) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-500"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {request.user_address.slice(0, 6)}...
                          {request.user_address.slice(-4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {request.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {request.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {request.payment_reference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {format(
                            new Date(request.created_at),
                            "MMM d, yyyy HH:mm",
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex justify-center space-x-3">
                            {request.payment_proof_url && (
                              <a
                                href={request.payment_proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                                title="View Payment Proof"
                              >
                                <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                              </a>
                            )}

                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApproveModal(true);
                              }}
                              disabled={
                                request.status !== FiatMintStatus.PENDING ||
                                actionLoading
                              }
                              className="text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Approve Request"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              disabled={
                                request.status !== FiatMintStatus.PENDING ||
                                actionLoading
                              }
                              className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reject Request"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </div>
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

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
              Approve Mint Request
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold leading-6 text-gray-900">
                Admin Notes (Optional)
              </label>
              <div className="mt-2.5">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                  rows={3}
                  placeholder="Add any notes about this approval..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                  setAdminNotes("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Approve & Mint
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <XCircleIcon className="h-6 w-6 text-red-600 mr-2" />
              Reject Mint Request
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold leading-6 text-gray-900">
                Reason for Rejection
              </label>
              <div className="mt-2.5">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="block w-full rounded-md border-0 bg-gray-50 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setAdminNotes("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !adminNotes}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
              >
                {actionLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
