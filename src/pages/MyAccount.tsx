
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { 
  UserIcon, 
  IdentificationIcon, 
  BanknotesIcon, 
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import PersonalInfo from '../components/account/PersonalInfo';
import KYCStatus from '../components/account/KYCStatus';
import BankingInfo from '../components/account/BankingInfo';
import Messages from '../components/account/Messages';
import Security from '../components/account/Security';
import Settings from '../components/account/Settings';

type TabType = 'personal' | 'kyc' | 'banking' | 'messages' | 'security' | 'settings';

export default function MyAccount() {
  const { user, isAuthenticated } = useAuth();
  const { address, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const tabs = [
    {
      id: 'personal' as TabType,
      name: 'Personal Info',
      icon: UserIcon,
      description: 'Manage your profile information'
    },
    {
      id: 'kyc' as TabType,
      name: 'KYC Status',
      icon: IdentificationIcon,
      description: 'View verification status'
    },
    {
      id: 'banking' as TabType,
      name: 'Banking Info',
      icon: BanknotesIcon,
      description: 'Manage payment methods'
    },
    {
      id: 'messages' as TabType,
      name: 'Messages',
      icon: ChatBubbleLeftRightIcon,
      description: 'Communication history'
    },
    {
      id: 'security' as TabType,
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Account security settings'
    },
    {
      id: 'settings' as TabType,
      name: 'Settings',
      icon: Cog6ToothIcon,
      description: 'Preferences and notifications'
    }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfo />;
      case 'kyc':
        return <KYCStatus />;
      case 'banking':
        return <BankingInfo />;
      case 'messages':
        return <Messages />;
      case 'security':
        return <Security />;
      case 'settings':
        return <Settings />;
      default:
        return <PersonalInfo />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white min-h-screen">
        <div className="relative isolate text-white min-h-[50vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: `url('/headers/dashboard_header.png')`,
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
            <div className="text-center">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
                My Account
              </h1>
              <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
                Please log in to access your account
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero section */}
      <div className="relative isolate text-white min-h-[50vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/dashboard_header.png')`,
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
              My Account
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              Manage your profile, verification status, and account settings
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                {user?.email}
              </div>
              {isConnected && (
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Sidebar */}
              <div className="lg:w-1/4 bg-gray-50 border-r border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Menu</h2>
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === tab.id
                              ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">{tab.name}</div>
                            <div className="text-xs text-gray-500">{tab.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Main content area */}
              <div className="lg:w-3/4">
                <div className="p-6 lg:p-8">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderActiveTab()}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import PersonalInfo from '../components/account/PersonalInfo';
import BankingInfo from '../components/account/BankingInfo';
import KYCStatus from '../components/account/KYCStatus';
import Security from '../components/account/Security';
import Settings from '../components/account/Settings';
import { 
  UserIcon, 
  CreditCardIcon, 
  ShieldCheckIcon, 
  Cog6ToothIcon,
  DocumentCheckIcon 
} from '@heroicons/react/24/outline';

export default function MyAccount() {
  const { user } = useAuth();
  const { address, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: UserIcon, component: PersonalInfo },
    { id: 'banking', label: 'Banking', icon: CreditCardIcon, component: BankingInfo },
    { id: 'kyc', label: 'KYC Status', icon: DocumentCheckIcon, component: KYCStatus },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon, component: Security },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, component: Settings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || PersonalInfo;

  if (!user) {
    return (
      <div className="bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
            <p className="text-gray-600">You need to be logged in to access your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div
        className="relative isolate text-white min-h-[40vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/dashboard_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-20 z-10"
        >
          <div className="text-left">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 leading-tight">
              My Account
            </h1>
            <p className="text-lg leading-8 text-white/90 font-regular">
              Manage your profile, security settings, and preferences
            </p>
            {isConnected && (
              <div className="mt-4">
                <p className="text-sm text-white/80">Connected Wallet:</p>
                <p className="font-mono text-sm text-white">{address}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Phoenix Icon */}
      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 py-16 sm:py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveComponent />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
