import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ExchangeRate, getExchangeRates } from "../services/exchangeRates";
import { format } from "date-fns";

interface Props {
  refreshInterval?: number;
  variant?: 'default' | 'compact';
}

export default function ExchangeRatesList({ refreshInterval = 60000, variant = 'default' }: Props) {
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
      console.error("Error fetching rates:", err);
      setError(err.message || "Error fetching exchange rates");
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
    const containerClass = variant === 'compact' 
      ? "bg-white/15 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20"
      : "bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl";
    return (
      <div className={containerClass}>
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300 text-sm">Loading exchange rates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const containerClass = variant === 'compact' 
      ? "bg-white/15 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20"
      : "bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl";

    return (
      <div className={containerClass}>
        <div className="text-center py-6 text-red-300">
          <p className="text-sm">Error loading rates</p>
          {variant !== 'compact' && (
            <button
              onClick={fetchRates}
              className="block mx-auto mt-4 text-white hover:text-gray-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filter rates for compact variant - only show GSDC to other currencies or other currencies to GSDC
  const displayRates = variant === 'compact'
    ? rates.filter(rate => rate.currency_from === 'GSDC' || rate.currency_to === 'GSDC')
    : rates;

  if (variant === 'compact') {
    return (
      <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-semibold text-white">GSDC Rates</h4>
          {lastUpdated && (
            <p className="text-xs text-gray-300">
              {format(lastUpdated, "HH:mm")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          {displayRates.slice(0, 4).map((rate) => (
            <motion.div
              key={rate.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-center py-2 px-3 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">
                  {rate.currency_from === 'GSDC' ? rate.currency_to : rate.currency_from}
                </span>
              </div>
              <span className="text-sm font-semibold text-white">
                {rate.rate.toFixed(4)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        {lastUpdated && (
          <p className="text-sm text-gray-300">
            Last updated: {format(lastUpdated, "HH:mm:ss")}
          </p>
        )}
      </div>
      <div className="overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200/20">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                From
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                To
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                Rate
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/20">
            {rates.map((rate) => (
              <motion.tr
                key={rate.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-white/5"
              >
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/20 text-blue-300">
                    {rate.currency_from}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100/20 text-green-300">
                    {rate.currency_to}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-white">
                  {rate.rate.toFixed(6)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {format(new Date(rate.last_updated), "MMM dd, HH:mm")}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}