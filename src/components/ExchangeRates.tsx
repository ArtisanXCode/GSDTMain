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
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('CNY');

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
    <div className="min-h-screen bg-white/5 backdrop-blur-lg text-white p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">GSDC Stability Analysis</h1>
          <p className="text-gray-300 text-lg">
            Purpose: Show the stability of GSDC versus each single currency in the basket
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Content - All Benchmark Boxes with Individual Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {benchmarkCurrencies.map((benchmarkData) => (
          <div 
            key={benchmarkData.currency}
            className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20"
          >
            {/* Left side - Benchmark Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              <div className="p-6 border-r border-white/20">
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <ChartBarIcon className="h-6 w-6 mr-2" />
                    {benchmarkData.currency} Benchmark
                  </h2>
                  <p className="text-gray-300 text-sm mb-6">Real-time</p>
                </div>

                {/* Exchange Rates List for this Benchmark */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <span className="text-white font-medium">GSDC/{benchmarkData.currency}</span>
                    <span className="text-white font-bold">
                      {benchmarkData.gsdcRate.toFixed(4)}
                    </span>
                  </div>

                  {Object.entries(benchmarkData.benchmarkRates)
                    .filter(([currency]) => currency !== benchmarkData.currency && currency !== 'USD')
                    .slice(0, 4) // Show only first 4 pairs
                    .map(([currency, rate]) => (
                    <div key={currency} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                      <span className="text-gray-300">{currency}/{benchmarkData.currency}</span>
                      <span className="text-gray-200">
                        {typeof rate === 'number' ? rate.toFixed(6) : '0.000000'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Chart for this Benchmark */}
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Performance on Historical Data</h3>
                    <p className="text-gray-300 text-sm mb-4">Weekly Points - GSDC/{benchmarkData.currency}</p>

                    {/* Period Selection */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {periods.map((period) => (
                        <button
                          key={period}
                          onClick={() => setBoxPeriods(prev => ({
                            ...prev,
                            [benchmarkData.currency]: period
                          }))}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            (boxPeriods[benchmarkData.currency] || '3 months') === period
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart Container */}
                  <div className="bg-white/5 rounded-lg p-4 h-48">
                    <HistoricalChart
                      currency={benchmarkData.currency}
                      period={boxPeriods[benchmarkData.currency] || '3 months'}
                      color={CURRENCY_COLORS[benchmarkData.currency] || '#3B82F6'}
                    />
                  </div>

                  {/* Current Stats Display */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Current:</span>
                      <span className="text-white font-medium">
                        {benchmarkData.gsdcRate.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-300">Range:</span>
                      <span className="text-white font-medium">
                        {(benchmarkData.gsdcRate * 0.99).toFixed(4)} - {(benchmarkData.gsdcRate * 1.01).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}