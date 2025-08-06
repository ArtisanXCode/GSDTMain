
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useLiveExchangeRates, BASKET_CURRENCIES } from '../services/liveExchangeRates';

const currencyNames: Record<string, string> = {
  CNH: 'Chinese Yuan',
  THB: 'Thai Baht', 
  INR: 'Indian Rupee',
  BRL: 'Brazilian Real',
  ZAR: 'South African Rand',
  IDR: 'Indonesian Rupiah',
  USD: 'US Dollar'
};

const currencyColors: Record<string, string> = {
  CNH: '#ed9030',
  BRL: '#ed9030', 
  ZAR: '#ed9030',
  THB: '#ed9030',
  INR: '#ed9030',
  IDR: '#ed9030'
};

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((basket) => (
          <motion.div
            key={basket.currency}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {basket.currency} as Benchmark Reference
              </h3>
            </div>

            {/* Cross Rates */}
            <div className="space-y-2 mb-4">
              {BASKET_CURRENCIES.map((currency) => (
                <div key={currency} className="flex justify-between text-sm">
                  <span className="text-white/80">
                    {currency}/{basket.currency}
                  </span>
                  <span className="text-white font-mono">
                    {(() => {
                      const rate = basket.benchmarkRates[currency];
                      console.log(`Display rate for ${currency}/${basket.currency}:`, rate);
                      if (!rate || isNaN(rate) || rate <= 0) return '0.0000';
                      if (rate < 0.0001) return rate.toFixed(6);
                      if (rate < 1) return rate.toFixed(4);
                      return rate.toFixed(4);
                    })()}
                  </span>
                </div>
              ))}
              
              {/* USD Rate */}
              <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                <span className="text-white/80">
                  {basket.currency}/USD
                </span>
                <span className="text-white font-mono">
                  {(() => {
                    const rate = basket.benchmarkRates['USD'];
                    if (!rate || isNaN(rate) || rate <= 0) return '0.0000';
                    return rate.toFixed(4);
                  })()}
                </span>
              </div>
            </div>

            {/* GSDC Rate */}
            <div 
              className="border-t-2 pt-3"
              style={{ borderColor: currencyColors[basket.currency] }}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: currencyColors[basket.currency] }}>
                  GSDC/{basket.currency}
                </span>
                <span 
                  className="text-lg font-bold"
                  style={{ color: currencyColors[basket.currency] }}
                >
                  {(() => {
                    const rate = basket.gsdcRate;
                    if (!rate || isNaN(rate) || rate <= 0) return '0.0000';
                    return rate.toFixed(4);
                  })()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* USD Benchmark - Special Display */}
      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 backdrop-blur-sm rounded-lg p-6 border border-blue-400/30"
        >
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-white">
              USD as Benchmark Reference
            </h3>
            <p className="text-white/70 text-sm">Primary reference for international markets</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BASKET_CURRENCIES.map((currency) => {
              const usdRate = data.find(d => d.currency === currency)?.benchmarkRates['USD'] || 0;
              return (
                <div key={currency} className="text-center">
                  <div className="text-white/80 text-sm mb-1">{currency}/USD</div>
                  <div className="text-white font-mono text-lg">
                    {(() => {
                      if (!usdRate || isNaN(usdRate) || usdRate <= 0) return '0.0000';
                      return (1/usdRate).toFixed(4);
                    })()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-blue-400/30 mt-4 pt-4 text-center">
            <div className="flex justify-center items-center space-x-4">
              <span className="text-blue-300 font-semibold text-lg">GSDC/USD</span>
              <span className="text-blue-300 text-2xl font-bold">
                {(() => {
                  let sum = 0;
                  let validCount = 0;
                  
                  BASKET_CURRENCIES.forEach(currency => {
                    const basket = data.find(d => d.currency === currency);
                    const rate = basket?.benchmarkRates['USD'];
                    if (rate && !isNaN(rate) && rate > 0) {
                      sum += rate;
                      validCount++;
                    }
                  });
                  
                  return validCount > 0 ? sum.toFixed(4) : '0.0000';
                })()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

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
