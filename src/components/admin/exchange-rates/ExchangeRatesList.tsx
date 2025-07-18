import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ExchangeRate, getExchangeRates } from '../../../services/exchangeRates';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ExchangeRatesListProps {
  refreshInterval?: number;
  onEdit?: (rate: ExchangeRate) => void;
  onDelete?: (rate: ExchangeRate) => void;
}

const ExchangeRatesList = ({ 
  refreshInterval = 60000,
  onEdit,
  onDelete 
}: ExchangeRatesListProps) => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = async () => {
    try {
      const data = await getExchangeRates();
      setRates(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching rates:', err);
      setError(err.message || 'Error fetching exchange rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchRates, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading exchange rates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">{error}</div>
        <button
          onClick={fetchRates}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!rates || rates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No exchange rates available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/20">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
              FROM
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
              TO
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
              RATE
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
              LAST UPDATED
            </th>
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                ACTIONS
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rates.map((rate) => (
            <motion.tr
              key={rate.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="hover:bg-white/5"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                {rate.currency_from}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                {rate.currency_to}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {rate.rate.toFixed(6)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                {format(new Date(rate.last_updated), 'MMM d, yyyy HH:mm:ss')}
              </td>
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(rate)}
                        className="text-orange-400 hover:text-orange-300"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(rate)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
      {lastUpdated && (
        <div className="mt-4 text-right text-sm text-white/50">
          Last updated: {format(lastUpdated, 'HH:mm:ss')}
        </div>
      )}
    </div>
  );
};

export default ExchangeRatesList;