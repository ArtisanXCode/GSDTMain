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
    } catch (error) {
      throw error; // Let the modal handle the error display
    }
  };

  const navigation = [
    { name: "ABOUT", href: "/about" },
    { name: "TRANSPARENCY", href: "/transparency" },
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
    <nav className="bg-gradient-to-r from-gray-800 to-blue-300 text-white relative ">
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
            {/* Auth Buttons */}
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  <UserIcon className="h-5 w-5" />
                  <span>{user?.email}</span>
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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            active ? 'bg-gray-100' : ''
                          } text-gray-700`}
                        >
                          Sign Out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Login / Sign Up
              </button>
            )}

            {/* Wallet Connection */}
            {isConnected ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200">
                  <WalletIcon className="h-4 w-4 mr-2" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs leading-tight">
                      {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </span>
                    {/* Assuming adminRole is defined elsewhere or can be inferred */}
                    {/* {adminRole && (
                      <span className="text-xs leading-tight text-orange-300 font-medium">
                        {adminRole}
                      </span>
                    )} */}

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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                          Disconnect
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button
                onClick={connect}
                disabled={loading || connectionAttemptInProgress}
                className="flex items-center rounded-full bg-white/10 backdrop-blur-sm border border-white/30 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || connectionAttemptInProgress ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <WalletIcon className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Disclosure>
              {({ open }) => (
                <>
                  <Menu.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Menu.Button>
                  <Disclosure.Panel className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {navigation
                      .filter(item => !item.requireAuth || isAuthenticated)
                      .map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
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
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="border-t border-gray-200 px-4 py-6 space-y-4">
          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Signed in as: {user?.email}
              </div>
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
            <button
              onClick={() => {
                setLoginModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Login / Sign Up
            </button>
          )}

          {/* Wallet Section */}
          {isConnected ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button
                onClick={() => {
                  disconnect();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                connect();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-yellow-400 to-red-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </Disclosure.Panel>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </nav>
  );
}

export default Header;