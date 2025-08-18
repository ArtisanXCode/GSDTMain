import { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon, WalletIcon, ArrowRightOnRectangleIcon, DocumentTextIcon, PlusCircleIcon, ShieldCheckIcon, UserIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../auth/LoginModal';
import { pauseService } from '../../services/pauseManagement';
import { PauseIcon } from '@heroicons/react/24/solid';

const Header = () => {
  const { address, isConnected, connect, disconnect, loading, connectionAttemptInProgress } = useWallet();
  const { isAdmin } = useAdmin();
  const { user, signIn, signOut, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Check pause status on component mount
  useEffect(() => {
    const checkPauseStatus = async () => {
      try {
        const paused = await pauseService.isPaused();
        setIsPaused(paused);
      } catch (error) {
        console.error('Error checking pause status:', error);
      }
    };

    checkPauseStatus();

    // Check pause status every 30 seconds
    const interval = setInterval(checkPauseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminAddress");
      // Keep wallet connected, only sign out from auth
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      await signIn(credentials.email, credentials.password);
      setLoginModalOpen(false);
    } catch (error: any) {
      console.error('Login error in header:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const navigation = [
    { name: 'Home', href: '/', current: false, requireAuth: false },
    { name: 'Why GSDC', href: '/about', current: false, requireAuth: false },

    // Protected navigation items
    /*{ name: 'Dashboard', href: '/dashboard', current: false, requireAuth: true },*/
    { name: 'Live Exchange Rates', href: '/live-exchange-rates', current: false, requireAuth: true },
    /*{ name: 'Historical Analytics', href: '/historical-analytics', current: false, requireAuth: true },
    { name: 'Token Minting', href: '/token-minting', current: false, requireAuth: true },
    { name: 'Transactions', href: '/transactions', current: false, requireAuth: true },*/
    { name: 'Transparency', href: '/transparency', current: false, requireAuth: true },
    { name: 'Contact', href: '/contact', current: false, requireAuth: false },
  ];

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header>
      <Disclosure as="nav" className="bg-gradient-to-r from-gray-800 to-blue-300 text-white relative">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-20 justify-between items-center">
                {/* Logo */}
                <div className="flex items-center">
                  <Link to="/" className="flex flex-shrink-0 items-center">
                    <img
                      src="/logo_gsdc_white.png"
                      alt="The Global South"
                      className="h-16 w-auto"
                    />
                  </Link>
                </div>

                {/* Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                  {navigation
                    .filter(item => !item.requireAuth || isAuthenticated)
                    .map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-orange-300 ${
                        isActivePath(item.href) ? "text-orange-300" : "text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}                  
                </div>

                {/* Desktop Auth and Wallet Buttons */}
                <div className="hidden md:flex md:items-center md:space-x-4">
                  {/* Show Login Button if not authenticated */}
                  {!isAuthenticated ? (
                    <button
                      onClick={() => setLoginModalOpen(true)}
                      data-login-trigger
                      className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{
                        background: loading ? "#ed9030" : "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                        opacity: loading ? 0.7 : 1
                      }}
                    >
                      Login / Sign Up
                    </button>
                  ) : (
                    /* Show Full Menu after authentication */
                    <Menu as="div" className="relative">
                      <Menu.Button className="flex items-center rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <div className="flex flex-col items-start">
                          <span className="text-xs leading-tight">
                            {user?.email?.split('@')[0]}
                          </span>
                          {isConnected && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(address);
                                // You could add a toast notification here if desired
                              }}
                              className="text-xs leading-tight opacity-75 hover:opacity-100 transition-opacity"
                              title="Click to copy full address"
                            >
                              {`${address.slice(0, 6)}...${address.slice(-4)}`}
                            </button>
                          )}
                        </div>
                        <ChevronDownIcon className="ml-2 -mr-1 h-4 w-4" />
                      </Menu.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-10 focus:outline-none border border-gray-200">
                          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Logged in as</p>
                            <p className="text-sm font-medium text-gray-900 truncate mt-1">{user?.email}</p>
                            {isConnected && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(address);
                                  // You could add a toast notification here if desired
                                }}
                                className="text-xs text-gray-500 font-mono mt-1 hover:text-gray-700 transition-colors text-left"
                                title="Click to copy full address"
                              >
                                {`${address.slice(0, 6)}...${address.slice(-4)}`}
                              </button>
                            )}
                          </div>
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/dashboard"
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } flex w-full px-4 py-2 text-sm text-gray-700 items-center hover:bg-gray-50 transition-colors`}
                                >
                                  <HomeIcon className="h-5 w-5 mr-3" />
                                  Dashboard
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/my-account"
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } flex w-full px-4 py-2 text-sm text-gray-700 items-center hover:bg-gray-50 transition-colors`}
                                >
                                  <UserIcon className="h-5 w-5 mr-3" />
                                  My Account
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/transactions"
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } flex w-full px-4 py-2 text-sm text-gray-700 items-center hover:bg-gray-50 transition-colors`}
                                >
                                  <DocumentTextIcon className="h-5 w-5 mr-3" />
                                  Transactions
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/token-minting"
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } flex w-full px-4 py-2 text-sm text-gray-700 items-center hover:bg-gray-50 transition-colors`}
                                  onClick={(e) => {
                                    if (location.pathname === "/token-minting") {
                                      e.preventDefault();
                                      window.location.reload();
                                    }
                                  }}
                                >
                                  <PlusCircleIcon className="h-5 w-5 mr-3" />
                                  Mint Token
                                </Link>
                              )}
                            </Menu.Item>
                            {/* Only show Admin Dashboard if user is admin (requires both authentication and admin role) */}
                            {isAdmin && (
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/admin/dashboard"
                                    className={`${
                                      active ? "bg-gray-100" : ""
                                    } flex w-full px-4 py-2 text-sm text-gray-700 items-center hover:bg-gray-50 transition-colors`}
                                  >
                                    <ShieldCheckIcon className="h-5 w-5 mr-3" />
                                    Admin Dashboard
                                  </Link>
                                )}
                              </Menu.Item>
                            )}
                            <div className="border-t border-gray-100 my-1"></div>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    handleLogout();
                                  }}
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } flex w-full px-4 py-2 text-sm text-red-600 items-center hover:bg-red-50 transition-colors`}
                                >
                                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                                  Sign Out
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Panel */}
            <Disclosure.Panel className="md:hidden">
              <div className="space-y-2 px-4 pb-6">
                {navigation
                  .filter(item => !item.requireAuth || isAuthenticated)
                  .map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-white-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {isAuthenticated && isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`block px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-white-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
              <div className="border-t border-gray-200 px-4 py-6 space-y-4">
                {/* Auth Flow */}
                {!isAuthenticated ? (
                  <button
                    onClick={() => {
                      setLoginModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    data-login-trigger
                    className="block w-full text-center px-4 py-2 rounded-full text-base font-semibold text-white transition-all duration-200 hover:opacity-90 shadow-lg mx-3"
                    style={{
                      background: "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                    }}
                  >
                    Login / Sign Up
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-white-600">
                      Signed in as: {user?.email}
                    </div>
                    {isConnected && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(address);
                          // You could add a toast notification here if desired
                        }}
                        className="text-sm text-white-600 hover:text-white transition-colors text-left"
                        title="Click to copy full address"
                      >
                        Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                      </button>
                    )}
                    
                    {/* Mobile menu items */}
                    <div className="space-y-1 pt-2 border-t border-white/20">
                      <Link
                        to="/dashboard"
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/my-account"
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        to="/transactions"
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Transactions
                      </Link>
                      <Link
                        to="/token-minting"
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mint Token
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors mt-4"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </Disclosure.Panel>

            {/* Login Modal */}
            <LoginModal
              isOpen={loginModalOpen}
              onClose={() => setLoginModalOpen(false)}
              onLogin={handleLogin}
            />

            {/* Pause Status Banner */}
            {isPaused && (
              <div className="bg-red-600 text-white py-2 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-center">
                  <PauseIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    ⚠️ Contract is currently paused - All transactions are temporarily suspended
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </Disclosure>
    </header>
  );
}

export default Header;