import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pauseService, PauseAction } from '../../services/pauseManagement';
import { 
  PauseIcon, 
  PlayIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PauseManagementProps {
  onPauseStatusChange?: (isPaused: boolean) => void;
}

export default function PauseManagement({ onPauseStatusChange }: PauseManagementProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'PAUSE' | 'UNPAUSE'>('PAUSE');
  const [pauseHistory, setPauseHistory] = useState<PauseAction[]>([]);

  useEffect(() => {
    checkPauseStatus();
    fetchPauseHistory();
  }, []);

  const checkPauseStatus = async () => {
    try {
      const paused = await pauseService.isPaused();
      setIsPaused(paused);
      onPauseStatusChange?.(paused);
    } catch (error) {
      console.error('Error checking pause status:', error);
    }
  };

  const fetchPauseHistory = async () => {
    try {
      const history = await pauseService.getPauseHistory();
      setPauseHistory(history);
    } catch (error) {
      console.error('Error fetching pause history:', error);
    }
  };

  const handlePauseAction = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this action');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let txHash: string;
      if (actionType === 'PAUSE') {
        txHash = await pauseService.pauseContract(reason);
        setSuccess(`Contract paused successfully! Transaction: ${txHash}`);
        setIsPaused(true);
      } else {
        txHash = await pauseService.unpauseContract(reason);
        setSuccess(`Contract unpaused successfully! Transaction: ${txHash}`);
        setIsPaused(false);
      }

      onPauseStatusChange?.(actionType === 'PAUSE');
      setReason('');
      setShowModal(false);
      fetchPauseHistory();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'PAUSE' | 'UNPAUSE') => {
    setActionType(type);
    setReason('');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // Function to close the modal and reset state
  const closeModal = () => {
    setShowModal(false);
    setReason('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pause Management</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isPaused 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {isPaused ? (
            <span className="flex items-center">
              <PauseIcon className="h-4 w-4 mr-1" />
              Contract Paused
            </span>
          ) : (
            <span className="flex items-center">
              <PlayIcon className="h-4 w-4 mr-1" />
              Contract Active
            </span>
          )}
        </div>
      </div>

      {/* Current Status Card */}
      <div className={`border rounded-lg p-4 mb-6 ${
        isPaused ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 text-lg font-semibold mb-2">Current Status</h3>
            <p className={`text-sm ${isPaused ? 'text-red-700' : 'text-green-700'}`}>
              {isPaused 
                ? 'All token transfers and operations are currently paused' 
                : 'All systems are operational and transfers are allowed'
              }
            </p>
          </div>
          <div className="flex space-x-2">
            {isPaused ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('UNPAUSE')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Unpause Contract
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('PAUSE')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <PauseIcon className="h-4 w-4 mr-2" />
                Pause Contract
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        </div>
      )}

      {/* Pause History */}
      <div className="mt-8">
        <h3 className="text-gray-900 text-lg font-semibold mb-4">Pause History</h3>
        <div className="space-y-3">
          {pauseHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No pause actions recorded</p>
          ) : (
            pauseHistory.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {action.action_type === 'PAUSE' ? (
                    <PauseIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <PlayIcon className="h-5 w-5 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      Contract {action.action_type.toLowerCase()}d
                    </p>
                    <p className="text-xs text-gray-600">{action.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-xs text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {new Date(action.created_at).toLocaleString()}
                  </div>
                  {action.transaction_hash && (
                    <a
                      href={`https://testnet.bscscan.com/tx/${action.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View Tx
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pause/Unpause Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full m-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {actionType === 'PAUSE' ? 'Pause' : 'Unpause'} Contract
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className={`mb-4 p-3 rounded-lg ${
              actionType === 'PAUSE' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`text-sm ${actionType === 'PAUSE' ? 'text-red-700' : 'text-green-700'}`}>
                {actionType === 'PAUSE' 
                  ? 'This will pause all token transfers and operations on the smart contract.'
                  : 'This will resume all token transfers and normal operations on the smart contract.'
                }
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for {actionType === 'PAUSE' ? 'pausing' : 'unpausing'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Enter reason for ${actionType === 'PAUSE' ? 'pausing' : 'unpausing'} the contract...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                rows={3}
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading || !reason.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 text-white rounded-lg flex items-center disabled:opacity-50 ${
                  actionType === 'PAUSE' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                onClick={handlePauseAction}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {actionType === 'PAUSE' ? 'Pausing...' : 'Unpausing...'}
                  </span>
                ) : (
                  <>
                    {actionType === 'PAUSE' ? (
                      <PauseIcon className="h-4 w-4 mr-2" />
                    ) : (
                      <PlayIcon className="h-4 w-4 mr-2" />
                    )}
                    {actionType === 'PAUSE' ? 'Pause' : 'Unpause'} Contract
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}