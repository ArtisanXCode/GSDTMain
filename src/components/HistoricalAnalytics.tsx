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

  // Custom SVG Icon Components
  const LowerVolatilityIcon = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <defs>
        <linearGradient id="volatilityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6b62e" />
          <stop offset="100%" stopColor="#ed9030" />
        </linearGradient>
      </defs>
      {/* Stable line with minimal volatility */}
      <path
        d="M8 32 L16 30 L24 31 L32 29 L40 30 L48 28 L56 29"
        stroke="url(#volatilityGrad)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data points */}
      <circle cx="8" cy="32" r="2" fill="#f6b62e" />
      <circle cx="16" cy="30" r="2" fill="#f6b62e" />
      <circle cx="24" cy="31" r="2" fill="#f6b62e" />
      <circle cx="32" cy="29" r="2" fill="#f6b62e" />
      <circle cx="40" cy="30" r="2" fill="#f6b62e" />
      <circle cx="48" cy="28" r="2" fill="#f6b62e" />
      <circle cx="56" cy="29" r="2" fill="#f6b62e" />
      {/* Percentage indicator */}
      <rect x="48" y="12" width="12" height="8" rx="4" fill="url(#volatilityGrad)" />
      <text x="54" y="17.5" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">23%</text>
    </svg>
  );

  const ConsistentPerformanceIcon = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <defs>
        <linearGradient id="performanceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6b62e" />
          <stop offset="100%" stopColor="#ed9030" />
        </linearGradient>
      </defs>
      {/* Steady upward trend line */}
      <path
        d="M8 48 L16 42 L24 36 L32 30 L40 24 L48 18 L56 12"
        stroke="url(#performanceGrad)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Area under curve for stability */}
      <path
        d="M8 48 L16 42 L24 36 L32 30 L40 24 L48 18 L56 12 L56 52 L8 52 Z"
        fill="url(#performanceGrad)"
        fillOpacity="0.2"
      />
      {/* Arrow indicator */}
      <path
        d="M50 18 L56 12 L50 6"
        stroke="url(#performanceGrad)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M56 12 L46 12"
        stroke="url(#performanceGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  const RiskMitigationIcon = () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6b62e" />
          <stop offset="100%" stopColor="#ed9030" />
        </linearGradient>
      </defs>
      {/* Modern shield shape */}
      <path
        d="M32 8 C38 8 44 10 44 10 C44 10 44 24 44 32 C44 44 32 56 32 56 C32 56 20 44 20 32 C20 24 20 10 20 10 C20 10 26 8 32 8 Z"
        fill="url(#shieldGrad)"
        stroke="none"
      />
      {/* Network nodes pattern for diversification */}
      <circle cx="32" cy="26" r="2" fill="white" />
      <circle cx="26" cy="32" r="1.5" fill="white" fillOpacity="0.8" />
      <circle cx="38" cy="32" r="1.5" fill="white" fillOpacity="0.8" />
      <circle cx="29" cy="38" r="1.5" fill="white" fillOpacity="0.8" />
      <circle cx="35" cy="38" r="1.5" fill="white" fillOpacity="0.8" />
      {/* Connecting lines */}
      <line x1="32" y1="26" x2="26" y2="32" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="32" y1="26" x2="38" y2="32" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="26" y1="32" x2="29" y2="38" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="38" y1="32" x2="35" y2="38" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="29" y1="38" x2="35" y2="38" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
      {/* Subtle checkmark */}
      <path
        d="M28 26 L30 28 L36 22"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
    </svg>
  );

  const benefits = [
    {
      icon: LowerVolatilityIcon,
      title: 'Lower Volatility',
      description: 'Reduced price volatility compared to individual basket currencies through diversification.',
      percentage: '23%'
    },
    {
      icon: ConsistentPerformanceIcon,
      title: 'Consistent Performance',
      description: 'Stable performance across different market conditions and economic cycles.',
      percentage: null
    },
    {
      icon: RiskMitigationIcon,
      title: 'Risk Mitigation',
      description: 'Diversified exposure reduces single-currency risk and economic dependency.',
      percentage: null
    }
  ];

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
          {benefits.map((benefit) => (
            <div key={benefit.title} className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center mb-4">
                 <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400/10 to-red-500/10 flex items-center justify-center border border-orange-300/20">
                    <div className="w-10 h-10">
                      <benefit.icon />
                    </div>
                  </div>
                <h3 className="text-xl font-bold">{benefit.title}</h3>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-2">{benefit.percentage || ''}</div>
              <p className="text-gray-300 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HistoricalAnalytics;