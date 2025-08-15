import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGSDCPrice } from "../services/liveExchangeRates";
import { format } from "date-fns";
import { ArrowPathIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { CURRENCY_SYMBOLS, CURRENCY_NAMES, COMPACT_CURRENCIES, CURRENCY_PRECISION } from "../config/api";

interface Props {
  variant?: 'default' | 'compact' | 'hero' | 'mini';
  showTitle?: boolean;
  className?: string;
  currencies?: Array<{ code: string; name: string; symbol: string }>;
}

export default function LiveExchangeRates({ 
  variant = 'default', 
  showTitle = true,
  className = "",
  currencies
}: Props) {
  const { gsdcRates, isLoading, isError, timestamp } = useGSDCPrice();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Helper function to format rates, ensuring it's defined before use
  const formatRate = (rate: number, currency: string): string => {
    // Use precision from config or default to 2 decimal places
    const precision = CURRENCY_PRECISION[currency] || 2;
    return rate.toFixed(precision);
  };

  useEffect(() => {
    if (timestamp) {
      setLastUpdated(new Date(timestamp));
    }
  }, [timestamp]);

  const containerClasses = {
    default: "bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl",
    compact: "bg-white/20 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30",
    hero: "bg-white/15 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20",
    mini: "bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-lg"
  };

  if (isLoading) {
    return (
      <div className={`${containerClasses[variant]} ${className}`}>
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300 text-sm">Loading live rates...</p>
        </div>
      </div>
    );
  }

  if (isError || !gsdcRates) {
    return (
      <div className={`${containerClasses[variant]} ${className}`}>
        <div className="text-center py-6 text-red-300">
          <InformationCircleIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Unable to load rates</p>
          {variant !== 'compact' && (
            <button className="mt-2 text-white hover:text-gray-200 text-sm underline">
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filter currencies based on variant and props
  const displayCurrencies = currencies 
    ? currencies.map(c => c.code) // Use provided currencies
    : variant === 'compact' 
      ? COMPACT_CURRENCIES.slice(0, 4) // Top 4 for compact view
      : COMPACT_CURRENCIES.filter(currency => gsdcRates?.[currency] && gsdcRates[currency] > 0);

  if (variant === 'compact') {
    // Function to format GSDC rate with 2 decimal precision
    const formatGSDCRate = (rate: number, currency: string): string => {
      return rate.toFixed(2);
    };

    return (
      <div className={`bg-white/20 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 ${className}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-bold text-white">GSDC Live Rates</h4>
          {lastUpdated && (
            <div className="flex items-center space-x-1">
              <ArrowPathIcon className="h-3 w-3 text-white/80" />
              <p className="text-xs text-white/80">
                {format(lastUpdated, "HH:mm")}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {displayCurrencies.map((currency) => {
            const rate = gsdcRates?.[currency] || 0;
            return (
              <motion.div
                key={currency}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white/15 rounded-xl p-3 text-center hover:bg-white/20 transition-all duration-200 hover:scale-105 border border-white/30"
              >
                <div className="text-xs font-medium text-white/90 mb-1">
                  GSDC/{currency}
                </div>
                <div className="text-sm font-bold text-white">
                  {formatGSDCRate(rate, currency)}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 text-center">
          <Link 
            to="/live-exchange-rates" 
            className="text-xs text-white/80 hover:text-white transition-colors underline"
          >
            View detailed rates →
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs text-white/70 text-center leading-relaxed">
            Real-time GSDC rates calculated from basket composition
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    // Function to format GSDC rate with 2 decimal precision and styling for hero variant
    const formatHeroGSDCRate = (rate: number, currency: string): string => {
      // Format with 2 decimal places for consistency
      return `${CURRENCY_SYMBOLS[currency]}${rate.toFixed(2)}`;
    };

    // Helper to format currency name without wrapping
    const formatCurrencyName = (name: string): string => {
        // This function is a placeholder and might need to be adjusted based on actual implementation of currency names
        // For now, we assume direct usage or a simple trim, but the CSS class handles the wrapping
        return name;
    }


    return (
      <div className={`${containerClasses[variant]} ${className}`}>
        {showTitle && (
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Live Exchange Rates</h3>
            <p className="text-white/80 text-sm">Real-time GSDC values across global currencies</p>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(gsdcRates)
            .filter(([currency, rate], index, array) => {
              // Remove duplicates by checking if this is the first occurrence
              return array.findIndex(([c]) => c === currency) === index;
            })
            .slice(0, 8)
            .map(([currency, rate]) => {
            const currencyName = CURRENCY_NAMES[currency] || currency;

            return (
              <motion.div
                key={`hero-${currency}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 rounded-lg p-4 text-center border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="text-sm text-white/70 font-medium mb-2">
                  GSDC/{currency}
                </div>
                <div className="text-xl font-bold text-white mb-2">
                  {formatHeroGSDCRate(rate, currency)}
                </div>
                <div className="text-xs text-white/60 break-words">
                  {formatCurrencyName(currencyName)}
                </div>
              </motion.div>
            );
          })}
        </div>
        {lastUpdated && (
          <div className="flex justify-center items-center mt-4 space-x-2">
            <ArrowPathIcon className="h-4 w-4 text-white/60" />
            <p className="text-sm text-white/60">
              Last updated: {format(lastUpdated, "MMM dd, HH:mm:ss")}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Mini variant - specific currencies
  if (variant === 'mini') {
    const essentialCurrencies = ['USD', 'CNY', 'THB', 'INR', 'BRL', 'ZAR', 'IDR'];

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-3 text-center">
          Live GSDC Exchange Rates
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {essentialCurrencies.map((currency) => {
            const rate = gsdcRates[currency];
            if (!rate) return null;

            return (
              <div key={`gsdc-${currency}`} className="text-center py-1">
                <div className="text-white/80 font-medium">
                  GSDC/{currency}
                </div>
                <div className="text-white font-bold">
                  {formatRate(rate, currency)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant - full table view
  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {showTitle && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Live Exchange Rates</h3>
          {lastUpdated && (
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className="h-4 w-4 text-gray-300" />
              <p className="text-sm text-gray-300">
                Last updated: {format(lastUpdated, "HH:mm:ss")}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200/20">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                Pair
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                Rate
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                Currency
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/20">
            {Object.entries(gsdcRates)
              .filter(([currency, rate], index, array) => {
                // Remove duplicates by checking if this is the first occurrence
                return array.findIndex(([c]) => c === currency) === index;
              })
              .map(([currency, rate]) => (
                <motion.tr
                  key={`exchange-${currency}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100/20 text-blue-300">
                      GSDC/{currency}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-white">
                    {CURRENCY_SYMBOLS[currency]}{formatRate(rate, currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {CURRENCY_NAMES[currency]}
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <p className="text-xs text-gray-300 leading-relaxed">
          <strong>Calculation:</strong> GSDC rates are calculated based on the basket of currencies (CNH, BRL, INR, ZAR, IDR, THB). 
          GSDC/USD equals the sum of all basket currencies against USD. Other rates use 1 unit + cross-currency conversions.
        </p>
      </div>
    </div>
  );
}