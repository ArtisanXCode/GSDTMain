import { useState } from 'react';
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