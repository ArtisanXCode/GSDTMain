
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useGSDCPrice } from '../services/liveExchangeRates';
import { CURRENCY_NAMES, CURRENCY_COLORS } from '../config/api';
import HistoricalChart from '../components/HistoricalChart';

export default function LiveExchangeRates() {
  const { gsdcRates, isLoading, isError, timestamp } = useGSDCPrice();
  const [selectedPeriod, setSelectedPeriod] = useState<{[key: string]: string}>({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (timestamp) {
      setLastUpdated(new Date(timestamp));
    }
  }, [timestamp]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear the cache to force fresh API call
      const { unifiedExchangeRateService } = await import('../services/liveExchangeRates');
      unifiedExchangeRateService.clearCache();
      
      // Force a small delay to show the refresh is working
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRefreshing(false);
    }
  };

  const periods = ['3 months', '6 months', '1 year', '2 year'];

  // Currency order with USD first, then the original 6
  const currencyOrder = ["USD", "CNY", "THB", "INR", "BRL", "ZAR", "IDR"];

  const formatGSDCRate = (rate: number, currency: string) => {
    if (!rate || rate === 0) return '0.0000';
    
    if (currency === 'USD') {
      return rate.toFixed(4);
    }
    
    if (rate < 0.0001) {
      return rate.toExponential(2);
    } else if (rate < 1) {
      return rate.toFixed(6);
    } else if (rate < 10) {
      return rate.toFixed(4);
    } else {
      return rate.toFixed(2);
    }
  };

  if (isLoading && !gsdcRates) {
    return (
      <div className="bg-white min-h-screen">
        {/* Header Section */}
        <div
          className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: `url('/headers/home_header.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
          >
            <div className="text-left">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
                Live Exchange Rates
              </h1>
              <p className="text-lg leading-8 text-white/90 font-regular">
                Real-time GSDC exchange rates across global currencies
              </p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-20 flex justify-end">
          <div className="phoenix-icon-parent">
            <img
              src="/logo_gsdc_icon.png"
              alt="Phoenix Icon"
              className="phoenix-icon-large"
            />
          </div>
        </div>

        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading exchange rates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white min-h-screen">
        {/* Header Section */}
        <div
          className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: `url('/headers/home_header.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
          >
            <div className="text-left">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
                Live Exchange Rates
              </h1>
              <p className="text-lg leading-8 text-white/90 font-regular">
                Real-time GSDC exchange rates across global currencies
              </p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-20 flex justify-end">
          <div className="phoenix-icon-parent">
            <img
              src="/logo_gsdc_icon.png"
              alt="Phoenix Icon"
              className="phoenix-icon-large"
            />
          </div>
        </div>

        <div className="bg-gray-200 py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error loading exchange rates</p>
              <button
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/home_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              Live Exchange Rates
            </h1>
            <p className="text-lg leading-8 text-white/90 font-regular">
              Real-time GSDC exchange rates across global currencies
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">GSDC Exchange Rates</h2>
              <p className="text-gray-600 text-lg">
                Live rates and historical charts for GSDC across major currencies
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          {lastUpdated && (
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            </div>
          )}

          {/* Individual Charts for Each Currency */}
          <div className="space-y-8">
            {currencyOrder.map((currency) => {
              const rate = gsdcRates?.[currency] || 0;
              const currentPeriod = selectedPeriod[currency] || '3 months';
              
              return (
                <motion.div
                  key={currency}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div className="flex h-full">
                    {/* Left sidebar - Currency info and current rate */}
                    <div className="w-80 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-r border-gray-200">
                      <div className="h-full flex flex-col">
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                            <ChartBarIcon className="h-7 w-7 mr-3 text-blue-600" />
                            GSDC/{currency}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4">{CURRENCY_NAMES[currency]}</p>
                          
                          {/* Current Rate Display */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="text-center">
                              <div className="text-sm text-gray-500 mb-1">Current Rate</div>
                              <div className="text-3xl font-bold text-gray-900 mb-1">
                                {formatGSDCRate(rate, currency)}
                              </div>
                              <div className="text-xs text-gray-500">Real-time</div>
                            </div>
                          </div>
                        </div>

                        {/* Currency Stats */}
                        <div className="space-y-3">
                          <div className="bg-white/70 rounded-lg p-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Currency Code:</span>
                              <span className="font-medium text-gray-900">{currency}</span>
                            </div>
                          </div>
                          
                          <div className="bg-white/70 rounded-lg p-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Chart Period:</span>
                              <span className="font-medium text-gray-900">{currentPeriod}</span>
                            </div>
                          </div>

                          {currency === 'USD' && (
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                              <div className="text-xs text-blue-800 font-medium">
                                Primary USD pair - Base currency
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Chart */}
                    <div className="flex-1 p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              Historical Performance
                            </h4>
                            <p className="text-gray-600 text-sm">
                              Weekly data points - GSDC/{currency} exchange rate
                            </p>
                          </div>

                          {/* Period Selection */}
                          <div className="flex gap-2">
                            {periods.map((period) => (
                              <button
                                key={period}
                                onClick={() => setSelectedPeriod(prev => ({
                                  ...prev,
                                  [currency]: period
                                }))}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                  currentPeriod === period
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {period}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Chart Container */}
                        <div className="bg-gray-50 rounded-lg p-4 h-80 border border-gray-200">
                          <HistoricalChart
                            currency={currency}
                            period={currentPeriod}
                            color={CURRENCY_COLORS[currency] || '#3B82F6'}
                          />
                        </div>

                        {/* Chart Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Current</div>
                            <div className="font-mono text-sm font-medium text-gray-900">
                              {formatGSDCRate(rate, currency)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Period</div>
                            <div className="text-sm font-medium text-gray-900">
                              {currentPeriod}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Status</div>
                            <div className="text-sm font-medium text-green-600">
                              Live
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Exchange Rate Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {currencyOrder.map((currency) => {
                const rate = gsdcRates?.[currency] || 0;
                return (
                  <div key={currency} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {currency}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {formatGSDCRate(rate, currency)}
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded">
                      <div 
                        className="h-1 bg-blue-500 rounded" 
                        style={{
                          width: `${Math.min((rate / Math.max(...currencyOrder.map(c => gsdcRates?.[c] || 0))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
