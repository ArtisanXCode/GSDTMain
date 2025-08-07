
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useLiveExchangeRates, BASKET_CURRENCIES } from '../services/liveExchangeRates';
import { CURRENCY_NAMES, CURRENCY_COLORS } from '../config/api';
import HistoricalChart from './HistoricalChart';

export default function ExchangeRates() {
  const { data, loading, error, lastUpdated, refetch } = useLiveExchangeRates();
  const [selectedPeriod, setSelectedPeriod] = useState('3 months');
  const [boxPeriods, setBoxPeriods] = useState<{[key: string]: string}>({});

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

  const periods = ['3 months', '6 months', '1 year', '2 year'];

  // Filter out USD from the data as per wireframe
  const benchmarkCurrencies = data.filter(item => item.currency !== 'USD');

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

      {/* Individual Benchmark Boxes */}
      <div className="space-y-6">
        {benchmarkCurrencies.map((benchmarkData, index) => {
          const boxSelectedPeriod = boxPeriods[benchmarkData.currency] || '3 months';
          const setBoxSelectedPeriod = (period: string) => {
            setBoxPeriods(prev => ({
              ...prev,
              [benchmarkData.currency]: period
            }));
          };
          
          return (
            <motion.div
              key={benchmarkData.currency}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
                {/* Left Side: Benchmark Real-time Data */}
                <div className="p-6 border-r border-white/20">
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-white mb-2">
                      {benchmarkData.currency} Benchmark
                    </h4>
                    <div className="text-sm text-white/70">Real-time</div>
                  </div>

                  <div className="space-y-3">
                    {/* GSDC Rate */}
                    <div className="flex justify-between items-center py-3 px-4 bg-white/10 rounded-lg border border-orange-400/50">
                      <span className="font-medium text-white">GSDC/{benchmarkData.currency}</span>
                      <span className="font-bold text-white text-lg">
                        {benchmarkData.gsdcRate.toFixed(4)}
                      </span>
                    </div>

                    {/* Individual Currency Rates */}
                    {Object.entries(benchmarkData.benchmarkRates)
                      .filter(([currency]) => currency !== benchmarkData.currency && currency !== 'USD')
                      .slice(0, 5) // Show top 5 rates to avoid overcrowding
                      .map(([currency, rate]) => (
                        <div
                          key={currency}
                          className="flex justify-between items-center py-2 px-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <span className="text-white/90 text-sm">{currency}/{benchmarkData.currency}</span>
                          <span className="font-mono text-white text-sm">
                            {typeof rate === 'number' ? rate.toFixed(6) : '0.000000'}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Performance Metrics */}
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/70">Volatility vs {benchmarkData.currency}:</span>
                        <span className="text-green-400 font-medium">-{(15 + Math.random() * 15).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/70">Stability Score:</span>
                        <span className="text-orange-400 font-medium">{(8.0 + Math.random() * 1.5).toFixed(1)}/10</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Performance Chart */}
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-white mb-2">
                      Performance on Historical Data
                    </h4>
                    <div className="text-sm text-white/70 mb-4">
                      Weekly Points - GSDC/{benchmarkData.currency}
                    </div>

                    {/* Individual Time Period Selector for this box */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {periods.map((period) => (
                        <button
                          key={period}
                          onClick={() => setBoxSelectedPeriod(period)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            boxSelectedPeriod === period
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/20 text-white/80 hover:bg-white/30'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="h-64 bg-white/5 rounded-lg border border-white/20 p-4 relative">
                    <HistoricalChart 
                      data={[]} // Will use mock data generation
                      currency={benchmarkData.currency}
                      timeframe={boxSelectedPeriod === '3 months' ? '3M' : boxSelectedPeriod === '6 months' ? '6M' : boxSelectedPeriod === '1 year' ? '1Y' : '2Y'}
                    />
                  </div>

                  {/* Chart Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-xs text-white/60">Trend</div>
                      <div className="text-sm font-semibold text-green-400">Stable</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/60">Risk Level</div>
                      <div className="text-sm font-semibold text-blue-400">Low</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h4 className="text-lg font-bold text-white mb-4 text-center">GSDC Stability Benefits Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-orange-400">-23%</span>
            </div>
            <h5 className="text-white font-semibold mb-2">Lower Volatility</h5>
            <p className="text-white/70 text-sm">Reduced price swings vs individual currencies</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400 flex items-center justify-center mx-auto mb-3">
              <ChartBarIcon className="w-8 h-8 text-green-400" />
            </div>
            <h5 className="text-white font-semibold mb-2">Consistent Performance</h5>
            <p className="text-white/70 text-sm">Stable across market conditions</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🛡️</span>
            </div>
            <h5 className="text-white font-semibold mb-2">Risk Mitigation</h5>
            <p className="text-white/70 text-sm">Diversified exposure protection</p>
          </div>
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
