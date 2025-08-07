
import React from 'react';
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
  Filler,
} from 'chart.js';

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

interface HistoricalData {
  date: string;
  value: number;
  currency: string;
}

interface HistoricalChartProps {
  data: HistoricalData[];
  currency: string;
  timeframe: string;
}

export default function HistoricalChart({ data, currency, timeframe }: HistoricalChartProps) {
  // Generate mock data if no real data is provided
  const generateMockData = () => {
    const mockData: HistoricalData[] = [];
    const now = new Date();
    const dataPoints = timeframe === '3M' ? 12 : timeframe === '6M' ? 24 : timeframe === '1Y' ? 52 : 104;
    
    // Base rate for different currencies
    const baseRates: { [key: string]: number } = {
      CNY: 7.2,
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.75,
      JPY: 110,
      BRL: 5.2,
      INR: 82,
      ZAR: 18,
      IDR: 15000,
      THB: 33
    };
    
    const baseRate = baseRates[currency] || 3.018;
    
    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7)); // Weekly points
      
      // Generate stable values with small fluctuations (showing GSDC stability)
      const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
      const value = baseRate * (1 + fluctuation);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        value: parseFloat(value.toFixed(6)),
        currency
      });
    }
    
    return mockData;
  };

  const chartData = data.length > 0 ? data : generateMockData();
  
  const config = {
    labels: chartData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: `GSDC/${currency}`,
        data: chartData.map(d => d.value),
        borderColor: '#f97316', // Orange color to match theme
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#ea580c',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#f97316',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        callbacks: {
          title: function(context: any) {
            const dataIndex = context[0].dataIndex;
            const date = new Date(chartData[dataIndex].date);
            return date.toLocaleDateString('en-US', { 
              weekday: 'short',
              year: 'numeric',
              month: 'short', 
              day: 'numeric' 
            });
          },
          label: function(context: any) {
            const value = context.parsed.y;
            return `GSDC/${currency}: ${value.toFixed(6)}`;
          },
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            if (dataIndex > 0) {
              const currentValue = chartData[dataIndex].value;
              const previousValue = chartData[dataIndex - 1].value;
              const change = ((currentValue - previousValue) / previousValue) * 100;
              const changeText = change >= 0 ? `+${change.toFixed(3)}%` : `${change.toFixed(3)}%`;
              const changeColor = change >= 0 ? '↗️' : '↘️';
              return `${changeColor} ${changeText} from previous week`;
            }
            return null;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#ffffff80',
          font: {
            size: 11,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#ffffff80',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return parseFloat(value).toFixed(4);
          },
        },
        beginAtZero: false,
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: '#f97316',
        hoverBorderColor: '#ffffff',
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutCubic' as const,
    },
  };

  return (
    <div className="w-full h-full relative">
      <Line data={config} options={options} />
      
      {/* Additional stats overlay */}
      <div className="absolute top-2 right-2 bg-black/50 rounded-lg p-2 text-xs text-white">
        <div className="flex flex-col space-y-1">
          <div>
            <span className="text-white/70">Current: </span>
            <span className="font-mono text-orange-400">
              {chartData[chartData.length - 1]?.value.toFixed(6) || '0.000000'}
            </span>
          </div>
          <div>
            <span className="text-white/70">Range: </span>
            <span className="font-mono text-green-400">
              {Math.min(...chartData.map(d => d.value)).toFixed(4)} - {Math.max(...chartData.map(d => d.value)).toFixed(4)}
            </span>
          </div>
          <div>
            <span className="text-white/70">Volatility: </span>
            <span className="font-mono text-blue-400">
              {(((Math.max(...chartData.map(d => d.value)) - Math.min(...chartData.map(d => d.value))) / Math.min(...chartData.map(d => d.value))) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
