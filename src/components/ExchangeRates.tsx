import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getExchangeRates, ExchangeRate } from '../services/exchangeRates';
import { format } from 'date-fns';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ExchangeRates() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const data = await getExchangeRates();
      setRates(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching rates:', err);
      setError(err.message || 'Error fetching exchange rates');
      // Show mock data for demonstration
      setRates([
        { id: '1', currency_from: 'GSDC', currency_to: 'USD', rate: 1.00, last_updated: new Date().toISOString() },
        { id: '2', currency_from: 'GSDC', currency_to: 'EUR', rate: 0.92, last_updated: new Date().toISOString() },
        { id: '3', currency_from: 'GSDC', currency_to: 'GBP', rate: 0.79, last_updated: new Date().toISOString() },
        { id: '4', currency_from: 'GSDC', currency_to: 'JPY', rate: 149.50, last_updated: new Date().toISOString() },
        { id: '5', currency_from: 'GSDC', currency_to: 'CAD', rate: 1.36, last_updated: new Date().toISOString() },
        { id: '6', currency_from: 'GSDC', currency_to: 'AUD', rate: 1.52, last_updated: new Date().toISOString() },
        { id: '7', currency_from: 'GSDC', currency_to: 'CHF', rate: 0.88, last_updated: new Date().toISOString() },
        { id: '8', currency_from: 'GSDC', currency_to: 'CNY', rate: 7.24, last_updated: new Date().toISOString() }
      ]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchRates();
  };

  if (loading && rates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white/70">Loading exchange rates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-white/70">
            Status: <span className="text-green-400">Live</span>
          </div>
          <div className="text-sm text-white/70">
            Last Updated: {lastUpdated ? format(lastUpdated, 'HH:mm:ss') : 'Never'}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Exchange Rates Table */}
      <div className="overflow-x-auto" style={{ backgroundColor: "#2a4661" }}>
        <table className="w-full">
          <thead style={{ backgroundColor: "#5a7a96" }}>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-4 text-white/70 font-medium uppercase text-xs">
                FROM CURRENCY
              </th>
              <th className="text-left py-3 px-4 text-white/70 font-medium uppercase text-xs">
                TO CURRENCY
              </th>
              <th className="text-left py-3 px-4 text-white/70 font-medium uppercase text-xs">
                EXCHANGE RATE
              </th>
              <th className="text-left py-3 px-4 text-white/70 font-medium uppercase text-xs">
                LAST UPDATED
              </th>
              <th className="text-left py-3 px-4 text-white/70 font-medium uppercase text-xs">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  <p className="mt-4 text-white/70">
                    Loading exchange rates...
                  </p>
                </td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <p className="text-white/70">No exchange rates available</p>
                </td>
              </tr>
            ) : (
              rates.map((rate, index) => (
                <motion.tr
                  key={rate.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/10 hover:bg-white/5"
                >
                  <td className="py-4 px-4 text-white text-sm font-medium">
                    {rate.currency_from}
                  </td>
                  <td className="py-4 px-4 text-white text-sm font-medium">
                    {rate.currency_to}
                  </td>
                  <td className="py-4 px-4 text-white text-sm">
                    {rate.rate.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6
                    })}
                  </td>
                  <td className="py-4 px-4 text-white/70 text-sm">
                    {format(new Date(rate.last_updated), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      LIVE
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}