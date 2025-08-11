import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useGSDCPrice } from '../services/liveExchangeRates';
import { CURRENCY_NAMES, CURRENCY_COLORS } from '../config/api';
import HistoricalChart from '../components/HistoricalChart';

export default function LiveExchangeRates() {
  const { gsdcRates, isLoading, isError, timestamp } = useGSDCPrice();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3 months');
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
            <div className="flex items-center space-x-4">
              {/* Period Selection */}
              <div className="flex gap-2">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {period}
                  </button>
                ))}
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
          </div>

          {lastUpdated && (
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            </div>
          )}

          {/* Individual Charts Grid */}
          <div className="space-y-8">
            {currencyOrder.map((currency, index) => {
              const rate = gsdcRates?.[currency] || 0;
              return (
                <motion.div
                  key={currency}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Chart Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-3">
                        <ChartBarIcon className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            GSDC/{currency}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {CURRENCY_NAMES[currency]} - Historical Performance
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Current Rate</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatGSDCRate(rate, currency)}
                        </div>
                        <div className="text-xs text-gray-500">Real-time</div>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="bg-gray-50 rounded-lg p-4 h-80 border border-gray-200">
                      <HistoricalChart
                        currency={currency}
                        period={selectedPeriod}
                        color={CURRENCY_COLORS[currency] || '#3B82F6'}
                      />
                    </div>

                    {/* Chart Stats */}
                    <div className="grid grid-cols-4 gap-4 pt-4 mt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Rate</div>
                        <div className="font-mono text-sm font-medium text-gray-900">
                          {formatGSDCRate(rate, currency)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Currency</div>
                        <div className="text-sm font-medium text-gray-900">
                          {currency}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Period</div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedPeriod}
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
                      GSDC/{currency}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {formatGSDCRate(rate, currency)}
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded">
                      <div
                        className="h-1 rounded transition-all duration-300"
                        style={{
                          width: `${Math.min((rate / Math.max(...currencyOrder.map(c => gsdcRates?.[c] || 0))) * 100, 100)}%`,
                          backgroundColor: CURRENCY_COLORS[currency] || '#3B82F6'
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