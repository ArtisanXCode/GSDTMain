import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useLiveExchangeRates } from '../services/liveExchangeRates';
import { CURRENCY_NAMES, CURRENCY_COLORS, CURRENCY_SYMBOLS, EXCHANGE_RATE_CONFIG } from '../config/api';

// Get basket currencies from environment configuration
const BASKET_CURRENCIES = EXCHANGE_RATE_CONFIG.BASKET_CURRENCIES;
import HistoricalChart from './HistoricalChart';

export default function ExchangeRates() {
  const { data, loading, error, lastUpdated, refetch } = useLiveExchangeRates();
  const [selectedPeriod, setSelectedPeriod] = useState('3 months');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear the cache to force fresh API call
      const { unifiedExchangeRateService } = await import('../services/liveExchangeRates');
      unifiedExchangeRateService.clearCache();

      await refetch();
      // Force a small delay to show the refresh is working
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRefreshing(false);
    }
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

  const periods = ['3 months', '6 months', '1 year', '2 year'];
  // Get all currencies from environment configuration, ensuring no duplicates
  const availableCurrencies = ['USD', ...BASKET_CURRENCIES.filter(curr => curr !== 'USD')];

  // Get current benchmark data for selected currency
  const currentBenchmarkData = data.find(item => item.currency === selectedCurrency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg text-white">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">GSDC Stability Analysis</h1>
          <p className="text-gray-300 text-lg drop-shadow-md font-medium">
            Purpose: Show the stability of GSDC versus each single currency in the basket
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-all duration-300 shadow-lg"
        >
          <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Currency Navigation Tabs */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20 shadow-lg">
            <div className="flex space-x-1">
              {availableCurrencies.map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    selectedCurrency === currency
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{CURRENCY_SYMBOLS[currency] || ''}</span>
                    <span>-</span>
                    <span>{currency}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Single Dynamic Benchmark Display */}
      {currentBenchmarkData && (
        <motion.div
          key={selectedCurrency}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-xl border border-white/30 shadow-2xl"
        >
          <div className="flex h-full">
            {/* Left sidebar - Exchange rates info */}
            <div className="w-80 flex-shrink-0 p-6 border-r border-white/20 bg-gradient-to-b from-white/5 to-transparent">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white drop-shadow-lg">
                        {selectedCurrency} Benchmark
                      </h3>
                      <p className="text-sm text-gray-300 drop-shadow-md font-medium">
                        {CURRENCY_NAMES[selectedCurrency] || selectedCurrency}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">Real-time</span>
                </div>
              </div>

              {/* Exchange Rates List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-lg p-4 border border-orange-500/30">
                  <span className="text-white font-semibold text-sm">GSDC/{selectedCurrency}</span>
                  <span className="text-orange-300 font-bold text-lg">
                    {currentBenchmarkData.gsdcRate.toFixed(4)}
                  </span>
                </div>

                {Object.entries(currentBenchmarkData.benchmarkRates)
                  .filter(([currency]) => currency !== selectedCurrency)
                  .map(([currency, rate]) => (
                    <div key={currency} className="flex justify-between items-center bg-white/10 rounded-lg p-3 hover:bg-white/15 transition-colors duration-200">
                      <span className="text-gray-300 text-sm">{currency}/{selectedCurrency}</span>
                      <span className="text-gray-200 text-sm font-mono">
                        {typeof rate === 'number' ? rate.toFixed(6) : '0.000000'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right side - Chart area */}
            <div className="flex-1 p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-1 drop-shadow-lg">
                        Historical Performance
                      </h4>
                      <p className="text-sm text-gray-300 drop-shadow-md font-medium">
                        Weekly Data Points - GSDC/{selectedCurrency} ({CURRENCY_NAMES[selectedCurrency] || selectedCurrency})
                      </p>
                    </div>

                    {/* Period Selection */}
                    <div className="flex gap-2">
                      {periods.map((period) => (
                        <button
                          key={period}
                          onClick={() => setSelectedPeriod(period)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                            selectedPeriod === period
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart Container with enhanced styling */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 h-96 relative border border-white/20 shadow-inner">
                  {/* Zoom Controls */}
                  <div className="absolute top-4 right-4 z-10 flex space-x-2">
                    <button
                      onClick={() => {
                        const event = new CustomEvent('chartZoom', {
                          detail: { action: 'zoomIn', currency: selectedCurrency }
                        });
                        window.dispatchEvent(event);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg text-sm w-8 h-8 flex items-center justify-center transition-all duration-200 shadow-lg"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        const event = new CustomEvent('chartZoom', {
                          detail: { action: 'zoomOut', currency: selectedCurrency }
                        });
                        window.dispatchEvent(event);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg text-sm w-8 h-8 flex items-center justify-center transition-all duration-200 shadow-lg"
                      title="Zoom Out"
                    >
                      −
                    </button>
                    <button
                      onClick={() => {
                        const event = new CustomEvent('chartZoom', {
                          detail: { action: 'resetZoom', currency: selectedCurrency }
                        });
                        window.dispatchEvent(event);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg text-sm w-8 h-8 flex items-center justify-center transition-all duration-200 shadow-lg"
                      title="Reset Zoom"
                    >
                      ⌂
                    </button>
                  </div>

                  <div className="h-full">
                    <HistoricalChart
                      currency={selectedCurrency}
                      period={selectedPeriod}
                      color="#ed9030"
                    />
                  </div>
                </div>

                
              </div>
              
            </div>
            
          </div>

          
        </motion.div>
      )}

      {/* Sanctions Notice */}
      <div className="mt-6 m-3 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-md text-gray-300 leading-relaxed">
          <span className="font-semibold text-yellow-400">Important Notice:</span> Regrettably due to both primary and secondary sanctions imposed by the U.S. Office of Foreign Assets Control (OFAC) and the European External Action Service (EEAS), we were unable to include the Russian Ruble (RUB) and Russian Federation securities (Government Bonds) in the currency basket and reserves. We look forward to a resolution of this situation in the future. In the interim, for anyone wishing to access a Russian stablecoin we suggest A5A7, a Russian ruble pegged stablecoin, accessible at the following link: <a href="https://www.a7a5.io/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline transition-colors">https://www.a7a5.io/</a>
        </p>
      </div>
      
    </div>
  );
}