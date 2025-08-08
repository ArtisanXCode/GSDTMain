import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { useContract } from "../../hooks/useContract";
import { useAdmin } from "../../hooks/useAdmin";
import PendingTransactions from "../../components/admin/PendingTransactions";
import AdminNavigation from "../../components/admin/AdminNavigation";
import { toast } from "react-hot-toast";

export default function PendingTransactionsPage() {
  const { account, isConnected } = useWallet();
  const { contract } = useContract();
  const { isAdmin, isSuperAdmin, loading: adminLoading } = useAdmin();
  const [hasApprovalPermissions, setHasApprovalPermissions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, [contract, account, isConnected, isAdmin, isSuperAdmin, adminLoading]);

  const checkPermissions = async () => {
    if (!isConnected || !account) {
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
            contract.hasRole(APPROVER_ROLE, account),
            contract.hasRole(SUPER_ADMIN_ROLE, account),
          ]);

          setHasApprovalPermissions(hasApproverRole || hasSuperAdminRole);
        } catch (contractError) {
          console.warn("Smart contract role check failed, using database roles only");
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
                    <div className="font-mono text-sm">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </div>
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

                <PendingTransactions onRefresh={handleRefresh} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
