import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useLiveExchangeRates, BASKET_CURRENCIES } from '../services/liveExchangeRates';
import { CURRENCY_NAMES, CURRENCY_COLORS } from '../config/api';

export default function ExchangeRates() {
  const { data, loading, error, lastUpdated, refetch } = useLiveExchangeRates();

  const handleRefresh = () => {
    refetch();
  };

  if (loading && data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-white/70">Loading tokenomics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">GSDC Tokenomics</h2>
        <p className="text-white/80 text-lg mb-4">
          Each unit of GSDC consists of 1 unit of each of the 6 currencies in the basket.
        </p>
        <div className="flex justify-center items-center space-x-6 text-sm text-white/70">
          <div>
            Status: <span className="text-green-400">Live</span>
          </div>
          <div>
            Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-1 hover:text-white transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tokenomics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((basket) => (
          <motion.div
            key={basket.currency}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div
              className="text-center py-3"
              style={{ backgroundColor: "#6d97bf" }}
            >
              <h3 className="text-lg font-semibold text-white">
                {basket.currency} as Benchmark Reference
              </h3>
            </div>

            {/* Content */}
            <div
              className="p-6"
              style={{ backgroundColor: "#2a4661" }}
            >

            {/* Cross Rates */}
              <div className="space-y-2 mb-4">
                {BASKET_CURRENCIES.map((currency) => {
                  // Filter out USD cross-rate pairs (USD/CNY, USD/THB, etc.)
                  if (basket.currency === 'USD' && currency !== 'USD') {
                    return null;
                  }
                  // Remove USD/USD from USD benchmark
                  if (basket.currency === 'USD' && currency === 'USD') {
                    return null;
                  }

                  return (
                    <div key={currency} className="flex justify-between text-sm">
                      <span className="text-white">
                        {currency}/{basket.currency}
                      </span>
                      <span className="text-white font-mono font-semibold">
                        {(() => {
                          const rate = basket.benchmarkRates[currency];
                          //console.log(`Display rate for ${currency}/${basket.currency}:`, rate);
                          if (!rate || isNaN(rate)) return '0.0000';
                          if (rate === 1) return '1.0000';
                          if (rate < 0.0001) return rate.toFixed(6);
                          if (rate < 0.01) return rate.toFixed(6);
                          if (rate < 1) return rate.toFixed(4);
                          return rate.toFixed(4);
                        })()}
                      </span>
                    </div>
                  );
                })}
              </div>

            {/* GSDC Rate */}
              <div
                className="border-t-2 pt-3"
                style={{ borderColor: CURRENCY_COLORS[basket.currency] || '#ed9030' }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold" style={{ color: CURRENCY_COLORS[basket.currency] || '#ed9030' }}>
                    GSDC/{basket.currency}
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: CURRENCY_COLORS[basket.currency] || '#ed9030' }}
                  >
                    {(() => {
                      const rate = basket.gsdcRate;
                      if (!rate || isNaN(rate) || rate <= 0) return '0.0000';
                      if (rate < 0.0001) return rate.toFixed(6);
                      if (rate < 0.01) return rate.toFixed(6);
                      return rate.toFixed(4);
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-red-300 text-xs mt-1">
            Showing cached data. Live rates will resume automatically.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 text-xs text-white/50 text-center">
        <p>
          Regrettably due to both primary and secondary sanctions served by the
          U.S. Office of Foreign Assets Control (OFAC) and the European External
          Action Service (EEAS), we were unable to include the Russian Ruble (RUB)
          and Russian Federation securities (Government Bonds) in the currency basket and reserves.
        </p>
      </div>
    </div>
  );
}