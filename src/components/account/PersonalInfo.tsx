
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../hooks/useWallet';

export default function PersonalInfo() {
  const { user } = useAuth();
  const { address, isConnected, setManualAddress, disconnect, loading, error } = useWallet();
  const [walletAddress, setWalletAddress] = useState(address || '');
  const [isEditing, setIsEditing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSaveWalletAddress = async () => {
    setLocalError(null);
    
    if (!walletAddress.trim()) {
      setLocalError('Wallet address cannot be empty');
      return;
    }

    const result = await setManualAddress(walletAddress.trim());
    if (result) {
      setIsEditing(false);
      // Show success message with admin check notice      
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnect();
    setWalletAddress('');
    setIsEditing(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
      
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
              <p className="text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Address Management */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Address</h3>
          
          {!isConnected && !isEditing ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                No wallet address configured. Add your wallet address to enable blockchain transactions.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Wallet Address
              </button>
            </div>
          ) : isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a valid Ethereum wallet address (42 characters, starting with 0x)
                </p>
              </div>
              
              {(localError || error) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{localError || error}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveWalletAddress}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Address'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setWalletAddress(address || '');
                    setLocalError(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-green-800">Wallet Address Configured</p>
                    <p className="text-sm text-green-700 font-mono break-all">{address}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setWalletAddress(address || '');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit Address
                </button>
                <button
                  onClick={handleDisconnectWallet}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Remove Address
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your wallet address is used for blockchain transactions and admin role verification. 
            Make sure to enter the correct address that you control.
          </p>
        </div>
      </div>
    </div>
  );
}
