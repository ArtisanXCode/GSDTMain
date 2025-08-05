
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useGSDCPrice } from "../services/exchangeRates";
import { format } from "date-fns";
import { ArrowPathIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  variant?: 'default' | 'compact' | 'hero';
  showTitle?: boolean;
  className?: string;
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  CNH: "¥",
  BRL: "R$",
  INR: "₹",
  ZAR: "R",
  IDR: "Rp",
  THB: "฿",
  JPY: "¥",
  EUR: "€",
  CAD: "C$"
};

const currencyNames: Record<string, string> = {
  USD: "US Dollar",
  CNH: "Chinese Yuan",
  BRL: "Brazilian Real", 
  INR: "Indian Rupee",
  ZAR: "South African Rand",
  IDR: "Indonesian Rupiah",
  THB: "Thai Baht",
  JPY: "Japanese Yen",
  EUR: "Euro",
  CAD: "Canadian Dollar"
};

export default function LiveExchangeRates({ 
  variant = 'default', 
  showTitle = true,
  className = ""
}: Props) {
  const { gsdcRates, isLoading, isError, timestamp } = useGSDCPrice();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (timestamp) {
      setLastUpdated(new Date(timestamp));
    }
  }, [timestamp]);

  const containerClasses = {
    default: "bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl",
    compact: "bg-white/15 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20",
    hero: "bg-white/15 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20"
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

  // Filter currencies based on variant
  const displayCurrencies = variant === 'compact' 
    ? ["USD", "CNH", "BRL", "INR"] // Top 4 for compact view
    : Object.keys(gsdcRates).filter(currency => gsdcRates[currency] > 0);

  if (variant === 'compact') {
    return (
      <div className={`${containerClasses[variant]} ${className}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-semibold text-white">GSDC Live Rates</h4>
          {lastUpdated && (
            <div className="flex items-center space-x-1">
              <ArrowPathIcon className="h-3 w-3 text-gray-300" />
              <p className="text-xs text-gray-300">
                {format(lastUpdated, "HH:mm")}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {displayCurrencies.map((currency) => (
            <motion.div
              key={currency}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-center py-2 px-3 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">
                  GSDC/{currency}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-white">
                  {currencySymbols[currency]}{gsdcRates[currency]?.toFixed(4)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`${containerClasses[variant]} ${className}`}>
        {showTitle && (
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Live Exchange Rates</h3>
            <p className="text-white/80 text-sm">Real-time GSDC values across global currencies</p>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayCurrencies.slice(0, 6).map((currency) => (
            <motion.div
              key={currency}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 rounded-xl p-4 text-center hover:bg-white/15 transition-colors"
            >
              <div className="text-lg font-bold text-white mb-1">
                GSDC/{currency}
              </div>
              <div className="text-2xl font-extrabold text-white mb-1">
                {currencySymbols[currency]}{gsdcRates[currency]?.toFixed(4)}
              </div>
              <div className="text-xs text-white/70">
                {currencyNames[currency]}
              </div>
            </motion.div>
          ))}
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
            {displayCurrencies.map((currency) => (
              <motion.tr
                key={currency}
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
                  {currencySymbols[currency]}{gsdcRates[currency]?.toFixed(6)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {currencyNames[currency]}
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
