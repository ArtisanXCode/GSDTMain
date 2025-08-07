
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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
  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: `GSDC/${currency}`,
        data: data.map(d => d.value),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `GSDC Stability vs ${currency} (${timeframe})`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return value.toFixed(3);
          },
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: '#3B82F6',
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
