
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import HistoricalChart from './HistoricalChart';
import { EXCHANGE_RATE_CONFIG, CURRENCY_NAMES } from '../config/api';
import { TimeFrame } from '../services/historicalRates';
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  ShieldCheckIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

export default function HistoricalAnalytics() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('CNY');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('30d');

  const currencyOptions = EXCHANGE_RATE_CONFIG.BASKET_CURRENCIES.filter(c => c !== 'USD');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            GSDC Historical Analytics
          </h2>
          <p className="text-white/80 text-lg max-w-3xl mx-auto">
            Analyze GSDC's historical performance and stability across different currencies and time periods.
            Our comprehensive analytics help you understand the token's behavior over time.
          </p>
        </motion.div>

        {/* Currency selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {currencyOptions.map((currency) => (
            <button
              key={currency}
              onClick={() => setSelectedCurrency(currency)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedCurrency === currency
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              GSDC/{currency}
            </button>
          ))}
        </div>
      </div>

      {/* Main chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
      >
        <HistoricalChart 
          currency={selectedCurrency}
          defaultTimeframe={selectedTimeframe}
        />
      </motion.div>

      {/* Information cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-8 w-8 text-blue-400 mr-3" />
            <h3 className="text-xl font-bold text-white">Data Sources</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Historical data is sourced from multiple tier-1 financial data providers and 
            stored daily to ensure accuracy and reliability. Our system maintains a complete 
            audit trail of all rate calculations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center mb-4">
            <TrendingUpIcon className="h-8 w-8 text-green-400 mr-3" />
            <h3 className="text-xl font-bold text-white">Stability Metrics</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Track volatility, price ranges, and stability coefficients across different 
            time periods. Our analytics help demonstrate GSDC's effectiveness as a 
            stable store of value.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-purple-400 mr-3" />
            <h3 className="text-xl font-bold text-white">Transparency</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Full transparency in our methodology and calculations. All historical data 
            is verifiable and our rate calculation algorithms are open for audit by 
            authorized parties.
          </p>
        </motion.div>
      </div>

      {/* Methodology section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <InformationCircleIcon className="h-8 w-8 mr-3" />
          Calculation Methodology
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-white/80">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Data Collection</h4>
            <ul className="space-y-2 text-sm">
              <li>• Daily snapshots taken at 00:00 UTC</li>
              <li>• Multiple data source validation</li>
              <li>• Automatic error detection and correction</li>
              <li>• Historical backfill for complete data sets</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Rate Calculation</h4>
            <ul className="space-y-2 text-sm">
              <li>• GSDC rate = sum of basket currency rates</li>
              <li>• Cross-rate calculations for each benchmark</li>
              <li>• 6-decimal precision for accuracy</li>
              <li>• Real-time validation against live rates</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
