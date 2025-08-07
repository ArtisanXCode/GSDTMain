
import { supabase } from '../lib/supabase';
import { API_CONFIG, EXCHANGE_RATE_CONFIG } from '../config/api';

export interface HistoricalRate {
  id: string;
  date: string;
  currency: string;
  gsdc_rate: number;
  benchmark_rates: Record<string, number>;
  created_at: string;
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
  change?: number;
  changePercent?: number;
}

export interface HistoricalAnalytics {
  currency: string;
  timeframe: string;
  data: HistoricalDataPoint[];
  minValue: number;
  maxValue: number;
  avgValue: number;
  volatility: number;
  totalChange: number;
  totalChangePercent: number;
}

export type TimeFrame = '7d' | '30d' | '90d' | '180d' | '1y' | 'all';

class HistoricalRatesService {
  private cache: Map<string, { data: HistoricalRate[]; timestamp: number }> = new Map();

  // Fetch historical data from third-party API (example with exchangerate-api.com)
  async fetchHistoricalFromAPI(date: string): Promise<Record<string, number> | null> {
    try {
      const response = await fetch(`${API_CONFIG.EXCHANGE_RATE_API_URL}/${date}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.rates || null;
    } catch (error) {
      console.error('Error fetching historical data from API:', error);
      return null;
    }
  }

  // Store daily snapshot in database
  async storeDailySnapshot(): Promise<void> {
    try {
      // Get current rates from our live service
      const response = await fetch(`${API_CONFIG.EXCHANGE_RATE_API_URL}/USD`);
      const data = await response.json();
      
      if (!data.rates) return;

      // Calculate GSDC rates and cross rates
      const crossRates = this.calculateCrossRates(data.rates);
      const gsdcRates = this.calculateGSDCRates(crossRates);

      // Store for each currency
      const today = new Date().toISOString().split('T')[0];
      
      for (const currency of EXCHANGE_RATE_CONFIG.BASKET_CURRENCIES) {
        const existingRecord = await supabase
          .from('historical_rates')
          .select('id')
          .eq('date', today)
          .eq('currency', currency)
          .single();

        const recordData = {
          date: today,
          currency,
          gsdc_rate: gsdcRates[currency] || 0,
          benchmark_rates: crossRates[currency] || {}
        };

        if (existingRecord.error) {
          // Create new record
          await supabase
            .from('historical_rates')
            .insert([recordData]);
        } else {
          // Update existing record
          await supabase
            .from('historical_rates')
            .update(recordData)
            .eq('id', existingRecord.data.id);
        }
      }
    } catch (error) {
      console.error('Error storing daily snapshot:', error);
    }
  }

  // Get historical data from database
  async getHistoricalData(currency: string, timeframe: TimeFrame): Promise<HistoricalRate[]> {
    const cacheKey = `${currency}-${timeframe}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 min cache
      return cached.data;
    }

    try {
      let days = 365;
      switch (timeframe) {
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 90; break;
        case '180d': days = 180; break;
        case '1y': days = 365; break;
        case 'all': days = 3650; break; // 10 years max
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('historical_rates')
        .select('*')
        .eq('currency', currency)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const result = data || [];
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  // Calculate analytics for historical data
  calculateAnalytics(currency: string, timeframe: TimeFrame, data: HistoricalRate[]): HistoricalAnalytics {
    if (data.length === 0) {
      return {
        currency,
        timeframe,
        data: [],
        minValue: 0,
        maxValue: 0,
        avgValue: 0,
        volatility: 0,
        totalChange: 0,
        totalChangePercent: 0
      };
    }

    const dataPoints: HistoricalDataPoint[] = data.map((rate, index) => {
      const value = rate.gsdc_rate;
      let change = 0;
      let changePercent = 0;

      if (index > 0) {
        const prevValue = data[index - 1].gsdc_rate;
        change = value - prevValue;
        changePercent = prevValue !== 0 ? (change / prevValue) * 100 : 0;
      }

      return {
        date: rate.date,
        value,
        change,
        changePercent
      };
    });

    const values = dataPoints.map(dp => dp.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Calculate volatility (standard deviation)
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);

    // Total change
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const totalChange = lastValue - firstValue;
    const totalChangePercent = firstValue !== 0 ? (totalChange / firstValue) * 100 : 0;

    return {
      currency,
      timeframe,
      data: dataPoints,
      minValue,
      maxValue,
      avgValue,
      volatility,
      totalChange,
      totalChangePercent
    };
  }

  // Backfill historical data (for initial setup)
  async backfillHistoricalData(days: number = 365): Promise<void> {
    console.log(`Starting backfill for ${days} days...`);
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      try {
        // Check if data already exists
        const { data: existing } = await supabase
          .from('historical_rates')
          .select('id')
          .eq('date', dateString)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`Skipping ${dateString} - already exists`);
          continue;
        }

        // Fetch historical data from API
        const rates = await this.fetchHistoricalFromAPI(dateString);
        if (!rates) {
          console.log(`No data available for ${dateString}`);
          continue;
        }

        // Calculate cross rates and GSDC rates
        const crossRates = this.calculateCrossRates(rates);
        const gsdcRates = this.calculateGSDCRates(crossRates);

        // Store for each currency
        const records = EXCHANGE_RATE_CONFIG.BASKET_CURRENCIES.map(currency => ({
          date: dateString,
          currency,
          gsdc_rate: gsdcRates[currency] || 0,
          benchmark_rates: crossRates[currency] || {}
        }));

        const { error } = await supabase
          .from('historical_rates')
          .insert(records);

        if (error) {
          console.error(`Error storing data for ${dateString}:`, error);
        } else {
          console.log(`Stored data for ${dateString}`);
        }

        // Rate limit to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing ${dateString}:`, error);
      }
    }

    console.log('Backfill completed');
  }

  private calculateCrossRates(baseRates: Record<string, number>): Record<string, Record<string, number>> {
    const crossRates: Record<string, Record<string, number>> = {};

    EXCHANGE_RATE_CONFIG.BASKET_CURRENCIES.forEach(benchmark => {
      crossRates[benchmark] = {};
      EXCHANGE_RATE_CONFIG.BASKET_CURRENCIES.forEach(currency => {
        if (benchmark === currency) {
          crossRates[benchmark][currency] = 1.0000;
        } else {
          const benchmarkRate = baseRates[benchmark];
          const currencyRate = baseRates[currency];

          if (benchmarkRate && currencyRate && benchmarkRate > 0 && currencyRate > 0) {
            const crossRate = benchmarkRate / currencyRate;
            crossRates[benchmark][currency] = Math.round(crossRate * 1000000) / 1000000;
          } else {
            crossRates[benchmark][currency] = 0;
          }
        }
      });
    });

    return crossRates;
  }

  private calculateGSDCRates(crossRates: Record<string, Record<string, number>>): Record<string, number> {
    const gsdcRates: Record<string, number> = {};
    const basketCurrenciesExcludingUSD = EXCHANGE_RATE_CONFIG.BASKET_CURRENCIES.filter(cur => cur !== 'USD');

    basketCurrenciesExcludingUSD.forEach(benchmark => {
      let gsdcValue = 0;

      basketCurrenciesExcludingUSD.forEach(currency => {
        const rate = crossRates[benchmark]?.[currency];
        if (rate !== undefined && !isNaN(rate) && rate > 0) {
          gsdcValue += rate;
        }
      });

      gsdcRates[benchmark] = parseFloat(gsdcValue.toFixed(6));
    });

    return gsdcRates;
  }
}

export const historicalRatesService = new HistoricalRatesService();

// React hook for historical data
import { useState, useEffect } from 'react';

export const useHistoricalRates = (currency: string, timeframe: TimeFrame) => {
  const [data, setData] = useState<HistoricalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const historicalData = await historicalRatesService.getHistoricalData(currency, timeframe);
        const analytics = historicalRatesService.calculateAnalytics(currency, timeframe, historicalData);
        
        setData(analytics);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch historical data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currency, timeframe]);

  return { data, loading, error, refetch: () => fetchData() };
};
