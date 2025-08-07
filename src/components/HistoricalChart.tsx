
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useHistoricalRates, TimeFrame } from '../services/historicalRates';
import { CURRENCY_NAMES, CURRENCY_COLORS } from '../config/api';
import { ArrowUpIcon, ArrowDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  currency: string;
  defaultTimeframe?: TimeFrame;
  className?: string;
}

const timeframeLabels: Record<TimeFrame, string> = {
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '3 Months',
  '180d': '6 Months',
  '1y': '1 Year',
  'all': 'All Time'
};

export default function HistoricalChart({ currency, defaultTimeframe = '30d', className = '' }: Props) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>(defaultTimeframe);
  const { data, loading, error } = useHistoricalRates(currency, selectedTimeframe);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(42, 70, 97, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: CURRENCY_COLORS[currency] || '#ed9030',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const change = data?.data[context.dataIndex]?.change || 0;
            const changePercent = data?.data[context.dataIndex]?.changePercent || 0;
            
            return [
              `GSDC/${currency}: ${value.toFixed(6)}`,
              `Change: ${change >= 0 ? '+' : ''}${change.toFixed(6)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ffffff',
          callback: (value: any) => value.toFixed(4)
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const chartData = {
    labels: data?.data.map(point => {
      const date = new Date(point.date);
      if (selectedTimeframe === '7d') {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }
      if (selectedTimeframe === '30d' || selectedTimeframe === '90d') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }) || [],
    datasets: [
      {
        label: `GSDC/${currency}`,
        data: data?.data.map(point => point.value) || [],
        borderColor: CURRENCY_COLORS[currency] || '#ed9030',
        backgroundColor: `${CURRENCY_COLORS[currency] || '#ed9030'}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CURRENCY_COLORS[currency] || '#ed9030',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ]
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-4"></div>
          <div className="h-64 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} text-center py-8`}>
        <InformationCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">Failed to load historical data</p>
        <p className="text-white/70 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className={`${className} text-center py-8`}>
        <InformationCircleIcon className="h-12 w-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/70">No historical data available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h3 className="text-2xl font-bold text-white mb-2">
            GSDC/{currency} Historical Performance
          </h3>
          <div className="flex items-center space-x-6 text-sm">
            <div>
              <span className="text-white/70">Current: </span>
              <span className="font-semibold text-white">
                {data.data[data.data.length - 1]?.value.toFixed(6)}
              </span>
            </div>
            <div>
              <span className="text-white/70">Change: </span>
              <span className={`font-semibold flex items-center ${
                data.totalChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {data.totalChange >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {data.totalChange >= 0 ? '+' : ''}{data.totalChangePercent.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-white/70">Volatility: </span>
              <span className="font-semibold text-white">
                {data.volatility.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex space-x-2">
          {Object.entries(timeframeLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSelectedTimeframe(value as TimeFrame)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedTimeframe === value
                  ? 'bg-white text-gray-900 font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Statistics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/70 text-sm">Min Value</p>
          <p className="text-white font-semibold text-lg">{data.minValue.toFixed(6)}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/70 text-sm">Max Value</p>
          <p className="text-white font-semibold text-lg">{data.maxValue.toFixed(6)}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/70 text-sm">Average</p>
          <p className="text-white font-semibold text-lg">{data.avgValue.toFixed(6)}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white/70 text-sm">Data Points</p>
          <p className="text-white font-semibold text-lg">{data.data.length}</p>
        </div>
      </div>
    </div>
  );
}
