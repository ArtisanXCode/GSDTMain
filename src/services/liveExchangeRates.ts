import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, EXCHANGE_RATE_CONFIG } from '../config/api';

export interface LiveExchangeRate {
  currency: string;
  rate: number;
  lastUpdated: string;
}

export interface BasketCalculation {
  currency: string;
  benchmarkRates: Record<string, number>;
  gsdcRate: number;
}

export interface GSDCRatesData {
  gsdcRates: Record<string, number>;
  isLoading: boolean;
  isError: boolean;
  timestamp: string | null;
  refetch: () => Promise<void>;
}

// Re-export constants for backward compatibility
export const BASKET_CURRENCIES = ['USD', 'CNY', 'RUB', 'EUR', 'GBP', 'JPY', 'INR', 'BRL', 'ZAR', 'THB', 'IDR'];
export const REFERENCE_CURRENCIES = EXCHANGE_RATE_CONFIG.REFERENCE_CURRENCIES;

// Unified exchange rate API service
class UnifiedExchangeRateService {
  private cache: { data: Record<string, number>; timestamp: number } | null = null;

  async fetchLiveRates(): Promise<Record<string, number>> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.timestamp < EXCHANGE_RATE_CONFIG.CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      // Fetch USD as base currency to get all rates
      const response = await fetch(`${API_CONFIG.EXCHANGE_RATE_API_URL}/USD`);
      const data = await response.json();
      if (!data.rates) {
        throw new Error('Invalid API response');
      }

      // Cache the data
      this.cache = {
        data: data.rates,
        timestamp: Date.now()
      };

      return data.rates;
    } catch (error) {
      console.error('Error fetching live rates:', error);
      // Return cached data if available, otherwise throw
      if (this.cache) {
        return this.cache.data;
      }
      throw error;
    }
  }

  calculateCrossRates(baseRates: Record<string, number>): Record<string, Record<string, number>> {
    const crossRates: Record<string, Record<string, number>> = {};

    // Calculate all cross rates between basket currencies
    BASKET_CURRENCIES.forEach(benchmark => {
      crossRates[benchmark] = {};
      BASKET_CURRENCIES.forEach(currency => {
        if (benchmark === currency) {
          crossRates[benchmark][currency] = 1.0000;
        } else {
          const benchmarkRate = baseRates[benchmark];
          const currencyRate = baseRates[currency];

          if (benchmarkRate && currencyRate && benchmarkRate > 0 && currencyRate > 0) {
            // Cross rate calculation: how many benchmark currency units per 1 target currency unit
            const crossRate = benchmarkRate / currencyRate;
            crossRates[benchmark][currency] = Math.round(crossRate * 1000000) / 1000000; // Round to 6 decimal places for precision
          } else {
            crossRates[benchmark][currency] = 0;
          }
        }
      });

      // Add USD rates - how many benchmark currency units per 1 USD
      const benchmarkRate = baseRates[benchmark];
      if (benchmarkRate && benchmarkRate > 0) {
        // For USD, we want the reciprocal: how many USD per 1 benchmark currency
        crossRates[benchmark]['USD'] = Math.round((1 / benchmarkRate) * 1000000) / 1000000;
      } else {
        crossRates[benchmark]['USD'] = 0;
      }
    });

    return crossRates;
  }

  calculateGSDCRates(crossRates: Record<string, Record<string, number>>): Record<string, number> {
    const gsdcRates: Record<string, number> = {};

    // GSDC calculation: sum of all basket currency rates relative to each benchmark
    const basketCurrenciesExcludingUSD = BASKET_CURRENCIES.filter(cur => cur !== 'USD');

    basketCurrenciesExcludingUSD.forEach(benchmark => {
      let gsdcValue = 0;

      basketCurrenciesExcludingUSD.forEach(currency => {
        const rate = crossRates[benchmark]?.[currency];
        if (rate !== undefined && !isNaN(rate) && rate > 0) {
          // Since rates are now reciprocal, we add them directly
          gsdcValue += rate;
        }
      });

      gsdcRates[benchmark] = parseFloat(gsdcValue.toFixed(6));
    });

    // Calculate GSDC/USD: sum all basket currencies in USD terms
    let gsdcUsdValue = 0;
    basketCurrenciesExcludingUSD.forEach(currency => {
      const rate = crossRates['USD']?.[currency];
      if (rate && !isNaN(rate) && rate > 0) {
        // Since rates are now reciprocal (USD per 1 currency unit), we add them directly
        gsdcUsdValue += rate;
      }
    });
    gsdcRates['USD'] = parseFloat(gsdcUsdValue.toFixed(6));

    return gsdcRates;
  }

  async getTokenomicsData(): Promise<BasketCalculation[]> {
    const liveRates = await this.fetchLiveRates();
    const crossRates = this.calculateCrossRates(liveRates);
    const gsdcRates = this.calculateGSDCRates(crossRates);

    return BASKET_CURRENCIES.map(currency => ({
      currency,
      benchmarkRates: crossRates[currency],
      gsdcRate: gsdcRates[currency]
    }));
  }

  async getGSDCRates(): Promise<Record<string, number>> {
    const liveRates = await this.fetchLiveRates();
    const crossRates = this.calculateCrossRates(liveRates);
    return this.calculateGSDCRates(crossRates);
  }

  clearCache() {
    this.cache = null;
  }
}

export const unifiedExchangeRateService = new UnifiedExchangeRateService();

// Hook for live exchange rates (for detailed page)
export const useLiveExchangeRates = () => {
  const [data, setData] = useState<BasketCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      const tokenomicsData = await unifiedExchangeRateService.getTokenomicsData();
      setData(tokenomicsData);
      setLastUpdated(new Date());
      setError(null); // Clear error on successful fetch
    } catch (err: any) {
      console.error('Error fetching rates:', err);
      setError(err.message || 'Failed to fetch live rates');
      setData([]); // Clear data on error
      setLastUpdated(null); // Clear last updated on error
      throw err; // Re-throw to be caught by refetch
    }
  }, []); // No dependencies, fetchRates is stable

  useEffect(() => {
    fetchRates();

    // Update every 30 seconds
    const interval = setInterval(fetchRates, EXCHANGE_RATE_CONFIG.UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRates]); // fetchRates is stable due to useCallback

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear cache to ensure fresh data
      unifiedExchangeRateService.clearCache();
      await fetchRates();
    } catch (err) {
      console.error('Error during refetch:', err);
    } finally {
      setLoading(false); // Ensure loading is set to false after refetch attempt
    }
  }, [fetchRates]);

  return { data, loading, error, lastUpdated, refetch };
};

// Hook for GSDC rates (for home page compact view)
export const useGSDCPrice = (): GSDCRatesData => {
  const [gsdcRates, setGsdcRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const fetchGSDCRates = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const rates = await unifiedExchangeRateService.getGSDCRates();
      setGsdcRates(rates);
      setTimestamp(new Date().toISOString());
    } catch (error) {
      console.error('Error fetching GSDC rates:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGSDCRates();

    // Update every 30 seconds
    const interval = setInterval(fetchGSDCRates, EXCHANGE_RATE_CONFIG.UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return {
    gsdcRates,
    isLoading,
    isError,
    timestamp,
    refetch: fetchGSDCRates
  };
};