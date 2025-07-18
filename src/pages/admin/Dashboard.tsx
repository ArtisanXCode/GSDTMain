
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import AdminStats from '../../components/admin/AdminStats';
import { 
  UserGroupIcon, 
  ChatBubbleLeftIcon, 
  ShieldCheckIcon, 
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { isConnected } = useWallet();
  const { isAdmin, isSuperAdmin, adminRole } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin auth is in localStorage
    const isAdminAuth = localStorage.getItem('adminAuth') === 'true';
    
    // If we're not admin and not in localStorage, redirect to login
    if (!isAdminAuth && !isAdmin) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAdmin, isConnected, navigate]);

  // Check if we're admin from localStorage as a fallback
  const isAdminAuth = localStorage.getItem('adminAuth') === 'true';
  const storedRole = localStorage.getItem('adminRole');
  
  // If we're not admin and not in localStorage, show loading until redirect happens
  if (!isAdmin && !isAdminAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Use stored role if adminRole is not available yet
  const displayRole = adminRole || storedRole;
  const isSuperAdminUser = isSuperAdmin || displayRole === 'SUPER_ADMIN';

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
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              {displayRole === 'SUPER_ADMIN' && "Super Admin Dashboard - Full Access"}
              {displayRole === 'ADMIN' && "Admin Dashboard - Manage Content and Users"}
              {displayRole === 'MODERATOR' && "Moderator Dashboard - Content Management"}
              {displayRole === 'MINTER' && "Minter Dashboard - Token Minting Access"}
              {displayRole === 'BURNER' && "Burner Dashboard - Token Burning Access"}
              {displayRole === 'PAUSER' && "Pauser Dashboard - Contract Pause Access"}
              {displayRole === 'PRICE_UPDATER' && "Price Updater Dashboard - Token Price Management"}
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
          {/* Admin Navigation */}
          <div className="mb-8 bg-gray-600 shadow rounded-lg p-4">
            <nav className="flex flex-wrap gap-4">
              <Link 
                to="/admin/kyc-requests"
                className="px-4 py-2 rounded-md text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                KYC Requests
              </Link>
              <Link 
                to="/admin/contact-messages"
                className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-700 transition-colors"
              >
                Contact Messages
              </Link>
              {isSuperAdminUser && (
                <>
                  <Link 
                    to="/admin/role-management"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                  >
                    Role Management
                  </Link>
                  <Link 
                    to="/admin/fiat-requests"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                  >
                    Fiat Mint Requests
                  </Link>
                  <Link 
                    to="/admin/reserves"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                  >
                    Proof of Reserves
                  </Link>
                  <Link
                    to="/admin/exchange-rates"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                  >
                    Exchange Rates
                  </Link>
                  <Link
                    to="/transactions"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                  >
                    Transaction History
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Admin Dashboard Overview */}
          <div style={{ backgroundColor: '#2a4661' }} className="rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Admin Dashboard Overview</h2>
            <p className="text-gray-300">
              Welcome to the GSDC Admin Dashboard. Here you can manage KYC requests, contact messages, and admin roles.
            </p>
          </div>
          
          {/* Stats Section */}
          <div className="mb-8">
            <AdminStats />
          </div>
          
          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link to="/admin/kyc-requests" className="block p-6 rounded-lg shadow hover:shadow-md transition-shadow" style={{ backgroundColor: '#446c93' }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">KYC Requests</h3>
                    <p className="text-sm text-gray-300">Manage user verification requests</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/admin/contact-messages" className="block p-6 rounded-lg shadow hover:shadow-md transition-shadow" style={{ backgroundColor: '#446c93' }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftIcon className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">Contact Messages</h3>
                    <p className="text-sm text-gray-300">View and respond to user inquiries</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {isSuperAdminUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link to="/admin/role-management" className="block p-6 rounded-lg shadow hover:shadow-md transition-shadow" style={{ backgroundColor: '#446c93' }}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-8 w-8 text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Role Management</h3>
                      <p className="text-sm text-gray-300">Manage admin roles and permissions</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Additional Cards Row */}
          {isSuperAdminUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link to="/admin/fiat-requests" className="block p-6 rounded-lg shadow hover:shadow-md transition-shadow" style={{ backgroundColor: '#446c93' }}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BanknotesIcon className="h-8 w-8 text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Fiat Mint Requests</h3>
                      <p className="text-sm text-gray-300">Process fiat payment requests</p>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link to="/admin/reserves" className="block p-6 rounded-lg shadow hover:shadow-md transition-shadow" style={{ backgroundColor: '#446c93' }}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-white">Proof of Reserves</h3>
                      <p className="text-sm text-gray-300">Manage and update reserve assets</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
