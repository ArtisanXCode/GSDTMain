import { Fragment, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon, WalletIcon, ArrowRightOnRectangleIcon, DocumentTextIcon, PlusCircleIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from "../../hooks/useWallet";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../auth/LoginModal';

const Header = () => {
  const { address, isConnected, connect, disconnect, loading, connectionAttemptInProgress } = useWallet();
  const { isAdmin } = useAdmin();
  const { user, signIn, signOut, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminAddress");
      await disconnect();
      await signOut(); // Sign out from auth context as well
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
    { name: "ABOUT", href: "/about" },
    { name: "TRANSPARENCY", href: "/transparency" },
    { name: "EXCHANGE RATES", href: "/live-exchange-rates", requireAuth: false },
    { name: "DASHBOARD", href: "/dashboard", requireAuth: true },
    { name: "CONTACT", href: "/contact" },
  ];

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-gray-800 to-blue-300 text-white relative">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex flex-shrink-0 items-center">
                  <img
                    src="/logo_gsdc_white.png"
                    alt="The Global South"
                    className="h-10 w-auto"
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Login / Sign Up
                  </button>
                ) : !isConnected ? (
                  /* Show User Menu with Wallet Connect after authentication */
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors">
                      <UserIcon className="h-5 w-5" />
                      <span>{user?.email?.split('@')[0]}</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={connect}
                              disabled={loading || connectionAttemptInProgress}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } flex w-full px-4 py-2 text-sm text-gray-700 items-center disabled:opacity-50`}
                            >
                              <WalletIcon className="h-5 w-5 mr-2" />
                              {loading || connectionAttemptInProgress ? 'Connecting...' : 'Connect Wallet'}
                            </button>
                          )}
                        </Menu.Item>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } flex w-full px-4 py-2 text-sm text-gray-700 items-center`}
                            >
                              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  /* Show Full Menu after wallet connection */
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200">
                      <WalletIcon className="h-4 w-4 mr-2" />
                      <div className="flex flex-col items-start">
                        <span className="text-xs leading-tight">
                          {user?.email?.split('@')[0]}
                        </span>
                        <span className="text-xs leading-tight opacity-75">
                          {`${address.slice(0, 6)}...${address.slice(-4)}`}
                        </span>
                      </div>
                      <ChevronDownIcon className="ml-2 -mr-1 h-4 w-4" />
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm text-gray-500">Connected as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                          <p className="text-xs text-gray-500 truncate">{address}</p>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/transactions"
                              className={`${
                                active ? "bg-gray-100" : ""
                              } flex px-4 py-2 text-sm text-gray-700 items-center`}
                            >
                              <DocumentTextIcon className="h-5 w-5 mr-2" />
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
                              } flex px-4 py-2 text-sm text-gray-700 items-center`}
                              onClick={(e) => {
                                if (location.pathname === "/token-minting") {
                                  e.preventDefault();
                                  window.location.reload();
                                }
                              }}
                            >
                              <PlusCircleIcon className="h-5 w-5 mr-2" />
                              Mint Token
                            </Link>
                          )}
                        </Menu.Item>
                        {isAdmin && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin/dashboard"
                                className={`${
                                  active ? "bg-gray-100" : ""
                                } flex px-4 py-2 text-sm text-gray-700 items-center`}
                              >
                                <ShieldCheckIcon className="h-5 w-5 mr-2" />
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
                              } flex w-full px-4 py-2 text-sm text-gray-700 items-center`}
                            >
                              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                              Disconnect & Sign Out
                            </button>
                          )}
                        </Menu.Item>
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
            </div>
            <div className="border-t border-gray-200 px-4 py-6 space-y-4">
              {/* Auth and Wallet Flow */}
              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    setLoginModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center px-4 py-2 rounded-full text-base font-semibold text-white transition-all duration-200 hover:opacity-90 shadow-lg mx-3"
                  style={{
                    background: "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                  }}
                >
                  Login / Sign Up
                </button>
              ) : !isConnected ? (
                <div className="space-y-2">
                  <div className="text-sm text-white-600">
                    Signed in as: {user?.email}
                  </div>
                  <button
                    onClick={() => {
                      connect();
                      setMobileMenuOpen(false);
                    }}
                    disabled={loading || connectionAttemptInProgress}
                    className="w-full bg-gradient-to-r from-yellow-400 to-red-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {loading || connectionAttemptInProgress ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-white-600">
                    Signed in as: {user?.email}
                  </div>
                  <div className="text-sm text-white-600">
                    Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Disconnect & Sign Out
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
        </>
      )}
    </Disclosure>
  );
}

export default Header;