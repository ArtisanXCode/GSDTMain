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
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('');

  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    // Set the first benchmark as the default selected one if data is available
    if (data && data.length > 0) {
      setSelectedBenchmark(data[0].currency);
    }
  }, [data]);

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

  const selectedBenchmarkData = data.find(item => item.currency === selectedBenchmark);

  return (
    <div className="min-h-screen bg-white/5 backdrop-blur-lg text-white p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">GSDC Stability Analysis</h1>
          <p className="text-gray-300 text-lg">
            Real-time benchmark analysis showing the stability of GSDC versus each 
            single currency in the basket composition.
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Benchmark Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2" />
                {selectedBenchmark} Benchmark
              </h2>
              <p className="text-gray-300 text-sm mb-6">Real-time</p>
            </div>

            {/* Benchmark Currency Selection */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {benchmarkCurrencies.map((benchmarkData) => (
                <button
                  key={benchmarkData.currency}
                  onClick={() => setSelectedBenchmark(benchmarkData.currency)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedBenchmark === benchmarkData.currency
                      ? 'bg-blue-500/30 border border-blue-400'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div className="text-sm font-medium">{benchmarkData.currency}</div>
                  <div className="text-xs text-gray-400">{CURRENCY_NAMES[benchmarkData.currency]}</div>
                </button>
              ))}
            </div>

            {/* Exchange Rates List for Selected Benchmark */}
            {selectedBenchmarkData && (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                  <span className="text-white font-medium">GSDC/{selectedBenchmark}</span>
                  <span className="text-white font-bold">
                    {selectedBenchmarkData.gsdcRate.toFixed(6)}
                  </span>
                </div>

                {Object.entries(selectedBenchmarkData.benchmarkRates)
                  .filter(([currency]) => currency !== selectedBenchmark && currency !== 'USD')
                  .map(([currency, rate]) => (
                  <div key={currency} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                    <span className="text-gray-300">{currency}/{selectedBenchmark}</span>
                    <span className="text-gray-200">
                      {typeof rate === 'number' ? rate.toFixed(6) : '0.000000'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chart for Selected Benchmark */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-2">Performance on Historical Data</h3>
              <p className="text-gray-300 text-sm mb-4">Weekly Points - GSDC/{selectedBenchmark}</p>

              {/* Period Selection */}
              <div className="flex space-x-2 mb-4">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setBoxPeriods(prev => ({
                      ...prev,
                      [selectedBenchmark]: period
                    }))}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      (boxPeriods[selectedBenchmark] || '3 months') === period
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
            <div className="bg-white/5 rounded-lg p-4 h-64">
              <HistoricalChart
                currency={selectedBenchmark}
                period={boxPeriods[selectedBenchmark] || '3 months'}
                color={CURRENCY_COLORS[selectedBenchmark] || '#3B82F6'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}