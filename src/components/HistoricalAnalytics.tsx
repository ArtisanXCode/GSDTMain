
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ShieldCheckIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import HistoricalChart from './HistoricalChart';
import { useLiveExchangeRates } from '../services/liveExchangeRates';

const HistoricalAnalytics: React.FC = () => {
  const { data: liveRates, loading: ratesLoading } = useLiveExchangeRates();
  const [selectedCurrency, setSelectedCurrency] = useState('CNY');
  const [selectedTimeframe, setSelectedTimeframe] = useState('3 months');

  const currencies = ['CNY', 'THB', 'INR', 'BRL', 'ZAR'];
  const timeframes = ['3 months', '6 months', '1 year', '2 year'];

  const currentRate = liveRates.find(rate => rate.currency === selectedCurrency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center items-center mb-4">
            <ChartBarIcon className="h-10 w-10 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              GSDC Historical Analytics
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive analysis of GSDC stability and performance across different time horizons
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Select Benchmark Currency</label>
              <div className="grid grid-cols-3 gap-2">
                {currencies.map((currency) => (
                  <button
                    key={currency}
                    onClick={() => setSelectedCurrency(currency)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedCurrency === currency
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Time Period</label>
              <div className="grid grid-cols-2 gap-2">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedTimeframe === timeframe
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart Section */}
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">GSDC/{selectedCurrency} Performance</h2>
            <p className="text-gray-300">Historical price movements and stability analysis</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 h-96 mb-6">
            {ratesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="ml-4 text-white/70">Loading chart data...</span>
              </div>
            ) : (
              <HistoricalChart
                currency={selectedCurrency}
                period={selectedTimeframe}
                color="#3B82F6"
              />
            )}
          </div>

          {/* Current Stats */}
          {currentRate && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {currentRate.gsdcRate.toFixed(6)}
                </div>
                <div className="text-sm text-gray-300">Current Rate</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {((currentRate.gsdcRate * 0.995)).toFixed(6)}
                </div>
                <div className="text-sm text-gray-300">Support Level</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {((currentRate.gsdcRate * 1.005)).toFixed(6)}
                </div>
                <div className="text-sm text-gray-300">Resistance Level</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Info Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-green-400 mr-3" />
              <h3 className="text-xl font-bold">Stability Score</h3>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">95.8%</div>
            <p className="text-gray-300 text-sm">
              GSDC maintains excellent stability against basket currencies
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-400 mr-3" />
              <h3 className="text-xl font-bold">Performance</h3>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">+2.1%</div>
            <p className="text-gray-300 text-sm">
              Positive performance over selected timeframe
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex items-center mb-4">
              <InformationCircleIcon className="h-8 w-8 text-purple-400 mr-3" />
              <h3 className="text-xl font-bold">Volatility</h3>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">0.8%</div>
            <p className="text-gray-300 text-sm">
              Low volatility demonstrates GSDC's stable nature
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HistoricalAnalytics;
