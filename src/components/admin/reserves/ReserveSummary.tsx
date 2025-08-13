import { motion } from 'framer-motion';
import { ReserveSummary as ReserveSummaryType } from '../../../services/reserves';
import { format } from 'date-fns';
import ErrorMessage from './ErrorMessage';
import LoadingState from './LoadingState';

interface ReserveSummaryProps {
  summary: ReserveSummaryType | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function ReserveSummary({ summary, loading, error, onRetry }: ReserveSummaryProps) {
  if (loading) {
    return <LoadingState message="Loading summary data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden shadow rounded-lg"
        style={{ backgroundColor: '#2a4661' }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-yellow-500 rounded-full p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-white/70 truncate">Total Value (USD)</dt>
                <dd className="text-lg font-medium text-white">${parseFloat(summary.total_value_usd).toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden shadow rounded-lg"
        style={{ backgroundColor: '#2a4661' }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-500 rounded-full p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-white/70 truncate">Total Supply (GSDC)</dt>
                <dd className="text-lg font-medium text-white">{parseFloat(summary.total_supply_gsdc).toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden shadow rounded-lg"
        style={{ backgroundColor: '#2a4661' }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-green-500 rounded-full p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-white/70 truncate">Backing Ratio</dt>
                <dd className="text-lg font-medium text-white">{(parseFloat(summary.backing_ratio) * 100).toFixed(2)}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-hidden shadow rounded-lg"
        style={{ backgroundColor: '#2a4661' }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-blue-500 rounded-full p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-white/70 truncate">Last Updated</dt>
                <dd className="text-lg font-medium text-white">{format(new Date(summary.last_updated), 'MMM d, HH:mm')}</dd>
              </dl>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}