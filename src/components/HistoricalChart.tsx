import { useEffect, useState, useRef } from 'react';
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
  ChartOptions,
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

interface HistoricalChartProps {
  currency: string;
  period: string;
  color?: string;
}

export default function HistoricalChart({ currency, period, color = '#3B82F6' }: HistoricalChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const seedRef = useRef<string>('');

  useEffect(() => {
    // Create a stable seed based on currency and period
    const seed = `${currency}-${period}`;

    // Only regenerate data if the seed changes (currency or period changes)
    if (seedRef.current === seed && chartData) {
      return;
    }

    seedRef.current = seed;

    // Simulate loading historical data with stable generation
    const generateStableData = () => {
      const days = period === '3 months' ? 90 : 
                   period === '6 months' ? 180 : 
                   period === '1 year' ? 365 : 730;

      const labels = [];
      const data = [];

      // Create a stable random seed based on currency and period
      let seedValue = 0;
      for (let i = 0; i < seed.length; i++) {
        seedValue += seed.charCodeAt(i);
      }

      // Use a simple PRNG with the seed for consistent results
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };

      // Set Y-axis range from 0 to 10 for all currencies
      const minValue = 0;
      const maxValue = 10;
      const range = maxValue - minValue;

      for (let i = 0; i < Math.min(days / 7, 52); i++) { // Weekly data points
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        labels.unshift(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Generate stable values using seeded random
        const randomValue = seededRandom(seedValue + i);
        const basePercentage = 0.3 + (randomValue * 0.4); // Between 30% and 70% of range
        const value = minValue + (range * basePercentage);
        data.unshift(Number(value.toFixed(2)));
      }

      return { labels, data };
    };

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const stableData = generateStableData();
      setChartData({
        labels: stableData.labels,
        datasets: [
          {
            label: `GSDC/${currency}`,
            data: stableData.data,
            borderColor: color,
            backgroundColor: `${color}20`,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: color,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      });
      setLoading(false);
    }, 300);
  }, [currency, period, color, chartData]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        callbacks: {
          title: (context) => {
            return `${context[0].label}`;
          },
          label: (context) => {
            return `GSDC/${currency}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxTicksLimit: 8,
          font: {
            size: 10,
          },
        },
      },
      y: {
        min: 0,
        max: 10,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 10,
          },
          stepSize: 1,
          callback: function(value) {
            return Number(value).toFixed(0);
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="w-full h-full">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/70">Loading chart...</p>
        </div>
      ) : (
        chartData && <Line data={chartData} options={options} />
      )}
    </div>
  );
}