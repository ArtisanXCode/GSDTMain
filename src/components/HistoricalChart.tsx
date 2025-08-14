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
import zoomPlugin from 'chartjs-plugin-zoom';
import { unifiedExchangeRateService } from '../services/liveExchangeRates';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

// Predefined Y-axis ranges for GSDC exchange rates
const GSDC_RATE_RANGES: Record<string, { min: number; max: number }> = {
  'USD': { min: 0.00, max: 1.00 },
  'CNY': { min: 1.00, max: 6.00 },
  'THB': { min: 10.00, max: 15.00 },
  'INR': { min: 33.00, max: 38.00 },
  'BRL': { min: 1.5, max: 3.00 },
  'ZAR': { min: 6.0, max: 9.0 },
  'IDR': { min: 6000, max: 8000 }
};

interface HistoricalChartProps {
  currency: string;
  period: string;
  color?: string;
}

export default function HistoricalChart({ currency, period, color = '#3B82F6' }: HistoricalChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentGSDCRate, setCurrentGSDCRate] = useState<number>(0);
  const chartRef = useRef<ChartJS<'line'>>(null);

  useEffect(() => {
    // Add event listeners for zoom controls
    const handleZoomEvent = (event: CustomEvent) => {
      if (event.detail.currency !== currency || !chartRef.current) return;

      const chart = chartRef.current;

      switch (event.detail.action) {
        case 'zoomIn':
          chart.zoom(1.1);
          break;
        case 'zoomOut':
          chart.zoom(0.9);
          break;
        case 'resetZoom':
          chart.resetZoom();
          break;
      }
    };

    window.addEventListener('chartZoom', handleZoomEvent as EventListener);

    return () => {
      window.removeEventListener('chartZoom', handleZoomEvent as EventListener);
    };
  }, [currency]);

  useEffect(() => {
    const generateHistoricalData = async () => {
      setLoading(true);

      try {
        // Get current live GSDC rate
        const gsdcRates = await unifiedExchangeRateService.getGSDCRates();
        const currentRate = gsdcRates[currency] || 0;
        setCurrentGSDCRate(currentRate);

        if (currentRate === 0) {
          setLoading(false);
          return;
        }

        // Generate dates based on period
        const days = period === '3 months' ? 90 :
                     period === '6 months' ? 180 :
                     period === '1 year' ? 365 : 730;

        const labels = [];
        const data = [];
        const now = new Date();

        // Generate weekly data points (approximately)
        const totalPoints = Math.min(Math.floor(days / 7), 52);

        for (let i = totalPoints - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

          // Generate historical values with small variations around current rate
          // The most recent point should be exactly the current rate
          if (i === 0) {
            data.push(Number(currentRate.toFixed(6)));
          } else {
            // Add small realistic variations (±0.5% max) for historical data
            const variation = (Math.random() - 0.5) * 0.01; // ±0.5%
            const historicalRate = currentRate * (1 + variation);
            data.push(Number(historicalRate.toFixed(6)));
          }
        }

        setChartData({
          labels,
          datasets: [
            {
              label: `GSDC/${currency}`,
              data,
              borderColor: color,
              backgroundColor: `${color}20`,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: color,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: color,
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 3,
              shadow: {
                blur: 10,
                color: color,
                offsetX: 0,
                offsetY: 2
              }
            },
          ],
        });
      } catch (error) {
        console.error('Error generating historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    generateHistoricalData();
  }, [currency, period, color]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 2,
        cornerRadius: 12,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: (context) => {
            return `Date: ${context[0].label}`;
          },
          label: (context) => {
            const value = context.parsed.y;
            const formattedValue = currency === 'IDR' ? 
              value.toFixed(0) : 
              value.toFixed(4);
            return `GSDC/${currency}: ${formattedValue}`;
          },
          afterLabel: (context) => {
            return `Stability Range: ${GSDC_RATE_RANGES[currency]?.min} - ${GSDC_RATE_RANGES[currency]?.max}`;
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          maxTicksLimit: 8,
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
      y: {
        min: GSDC_RATE_RANGES[currency]?.min,
        max: GSDC_RATE_RANGES[currency]?.max,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11,
            weight: '500',
          },
          callback: function(value) {
            if (currency === 'IDR') {
              return Number(value).toLocaleString();
            } else if (currency === 'USD' || currency === 'BRL') {
              return Number(value).toFixed(2);
            } else {
              return Number(value).toFixed(2);
            }
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
        hoverBorderWidth: 3,
      },
      line: {
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
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
        chartData && <Line ref={chartRef} data={chartData} options={options} />
      )}
    </div>
  );
}