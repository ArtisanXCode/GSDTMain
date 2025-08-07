
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ShieldCheckIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import HistoricalChart from './HistoricalChart';
import { getHistoricalRates, TimeFrame } from '../services/historicalRates';

interface HistoricalData {
  date: string;
  value: number;
  currency: string;
}

const BENCHMARK_CURRENCIES = [
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
];

export default function HistoricalAnalytics() {
  const [selectedCurrency, setSelectedCurrency] = useState('CNY');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1Y');
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [currentRate, setCurrentRate] = useState<number>(3.018);
  const [loading, setLoading] = useState(false);
  const [volatility, setVolatility] = useState<number>(0.12);

  const timeframes: { label: string; value: TimeFrame }[] = [
    { label: '3 months', value: '3M' },
    { label: '6 months', value: '6M' },
    { label: '1 year', value: '1Y' },
    { label: '2 year', value: '2Y' },
  ];

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedCurrency, selectedTimeframe]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const data = await getHistoricalRates(`GSDC/${selectedCurrency}`, selectedTimeframe);
      setHistoricalData(data);
      if (data.length > 0) {
        setCurrentRate(data[data.length - 1].value);
        // Calculate volatility (simplified)
        const values = data.map(d => d.value);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
        setVolatility(Math.sqrt(variance) / avg * 100);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrencyInfo = BENCHMARK_CURRENCIES.find(c => c.code === selectedCurrency);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative py-24 sm:py-32"
        style={{
          backgroundImage: `linear-gradient(135deg, #0a1217c7 0%, #132536d4 100%), url(/headers/dashboard_header.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-blue-900/80"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
            >
              GSDC Stability Analysis
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg leading-8 text-gray-300"
            >
              Analyze GSDC's stability against major global currencies with comprehensive historical data
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Currency Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Benchmark Currency</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {BENCHMARK_CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => setSelectedCurrency(currency.code)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedCurrency === currency.code
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg font-bold">{currency.code}</div>
                  <div className="text-sm">{currency.name}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Side - Real-time Benchmark */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCurrency} Benchmark
                  </h3>
                </div>
                
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500 mb-2">Real-time</div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">GSDC/{selectedCurrency}</span>
                      <span className="font-mono text-lg">—</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Rate</span>
                      <span className="font-mono text-lg">—</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Change 24h</span>
                      <span className="font-mono text-lg">—</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Volatility</span>
                      <span className="font-mono text-lg">—</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                    <div className="text-2xl font-bold">
                      GSDC/{selectedCurrency}
                    </div>
                    <div className="text-4xl font-mono font-bold mt-2">
                      {currentRate.toFixed(3)}{selectedCurrencyInfo?.symbol}
                    </div>
                    <div className="text-sm mt-2 opacity-90">
                      Current Rate
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Performance Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Performance on Historical Data
                    </h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    Weekly Point
                  </div>
                </div>

                {/* Timeframe Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {timeframes.map((timeframe) => (
                    <button
                      key={timeframe.value}
                      onClick={() => setSelectedTimeframe(timeframe.value)}
                      className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                        selectedTimeframe === timeframe.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {timeframe.label}
                    </button>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="h-96 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                  {loading ? (
                    <div className="text-gray-500">Loading chart data...</div>
                  ) : historicalData.length > 0 ? (
                    <HistoricalChart 
                      data={historicalData}
                      currency={selectedCurrency}
                      timeframe={selectedTimeframe}
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <ChartBarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <div>Chart visualization would appear here</div>
                      <div className="text-sm mt-2">
                        Historical stability data for GSDC/{selectedCurrency}
                      </div>
                      {/* Placeholder trend line */}
                      <div className="mt-4 h-32 w-full relative">
                        <svg 
                          width="100%" 
                          height="100%" 
                          viewBox="0 0 400 120" 
                          className="text-blue-500"
                        >
                          <path
                            d="M 20 80 Q 100 70 150 75 T 280 78 T 380 82"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
                          <circle cx="380" cy="82" r="4" fill="currentColor" />
                        </svg>
                        <div className="absolute bottom-0 right-0 text-xs text-gray-400">
                          3.018¥
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Volatility</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {volatility.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Trend</div>
                    <div className="text-lg font-semibold text-green-600">
                      Stable
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Data Points</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {historicalData.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Purpose Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <InformationCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Purpose</h3>
            </div>
            <div className="prose prose-lg text-gray-600">
              <p className="text-xl leading-relaxed">
                <strong>Show the stability of GSDC versus each single currency in the basket.</strong>
              </p>
              <p className="mt-4">
                This analysis demonstrates GSDC's consistent performance across different benchmark currencies, 
                providing transparency into how our stablecoin maintains its value relative to major global currencies. 
                The same methodology applies to other benchmarks in our currency basket.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start">
                <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Stability Metrics</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Track volatility and deviation patterns to ensure GSDC maintains its stable value proposition.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Historical Analysis</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Comprehensive data spanning multiple timeframes provides insight into long-term stability trends.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
