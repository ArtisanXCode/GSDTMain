
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useLiveExchangeRates, BASKET_CURRENCIES } from '../services/liveExchangeRates';
import { CURRENCY_NAMES, CURRENCY_COLORS } from '../config/api';

export default function ExchangeRates() {
  const { data, loading, error, lastUpdated, refetch } = useLiveExchangeRates();
  const [selectedBenchmark, setSelectedBenchmark] = useState('CNH'); // Default to CNH as shown in wireframe
  const [selectedPeriod, setSelectedPeriod] = useState('3 months');

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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-300 mb-4">Error loading exchange rates: {error}</p>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  const benchmarkData = data.find(item => item.currency === selectedBenchmark);
  const periods = ['3 months', '6 months', '1 year', '2 year'];

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">GSDC Stability Analysis</h3>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Purpose Statement */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <p className="text-white/90 text-center text-lg font-medium">
          <strong>Purpose:</strong> Show the stability of GSDC versus each single currency in the basket
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Benchmark Real-time */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-white mb-4">
              {selectedBenchmark} Benchmark Real-time
            </h4>
            
            {/* Benchmark Currency Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {BASKET_CURRENCIES.filter(currency => currency !== 'USD').map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedBenchmark(currency)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedBenchmark === currency
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>

          {benchmarkData && (
            <div className="space-y-3">
              {/* GSDC Rate */}
              <div className="flex justify-between items-center py-3 px-4 bg-white/10 rounded-lg border border-orange-400/50">
                <span className="font-medium text-white">GSDC/{selectedBenchmark}</span>
                <span className="font-bold text-white text-lg">
                  {benchmarkData.gsdcRate.toFixed(4)}
                </span>
              </div>

              {/* Individual Currency Rates */}
              {Object.entries(benchmarkData.benchmarkRates)
                .filter(([currency]) => currency !== selectedBenchmark && currency !== 'USD')
                .map(([currency, rate]) => (
                  <motion.div
                    key={currency}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center py-3 px-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white/90">{currency}/{selectedBenchmark}</span>
                    <span className="font-mono text-white">
                      {typeof rate === 'number' ? rate.toFixed(6) : '0.000000'}
                    </span>
                  </motion.div>
                ))}
            </div>
          )}
        </div>

        {/* Right Side: Performance on Historical Data */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-white mb-4">
              Performance on Historical Data
            </h4>
            
            {/* Time Period Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/20 text-white/80 hover:bg-white/30'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Mock Chart Area - Simulating the wireframe chart */}
          <div className="h-64 bg-white/5 rounded-lg border border-white/20 p-4 relative">
            <div className="absolute top-4 right-4 text-orange-400 font-bold text-lg">
              3.018%
            </div>
            
            {/* Mock chart lines */}
            <div className="h-full flex items-end justify-between px-4 pb-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t opacity-70"
                  style={{ 
                    height: `${Math.random() * 60 + 20}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            
            {/* Mock trend line */}
            <div className="absolute bottom-8 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 opacity-60" />
            
            <div className="absolute bottom-2 left-4 text-white/60 text-xs">
              Weekly Points - GSDC/{selectedBenchmark}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Volatility vs {selectedBenchmark}:</span>
              <span className="text-green-400 font-medium">-23% lower</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Price Stability Score:</span>
              <span className="text-orange-400 font-medium">8.7/10</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Basket Diversification:</span>
              <span className="text-blue-400 font-medium">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Benchmark Analysis */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h4 className="text-lg font-bold text-white mb-4">Same for the Others Benchmark</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.filter(item => item.currency !== 'USD').map((item) => (
            <motion.div
              key={item.currency}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedBenchmark === item.currency
                  ? 'bg-orange-500/20 border-orange-400'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
              onClick={() => setSelectedBenchmark(item.currency)}
            >
              <div className="text-center">
                <div className="text-sm text-white/70 mb-1">{item.currency}</div>
                <div className="text-lg font-bold text-white">
                  {item.gsdcRate.toFixed(4)}
                </div>
                <div className="text-xs text-white/60">
                  {CURRENCY_NAMES[item.currency]}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
