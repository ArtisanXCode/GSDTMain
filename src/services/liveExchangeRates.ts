import { useState, useEffect } from 'react';

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

// GSDC basket currencies
export const BASKET_CURRENCIES = ['CNH', 'BRL', 'ZAR', 'THB', 'INR', 'IDR', 'USD'];
export const REFERENCE_CURRENCIES = ['USD'];

// Live exchange rate API service
class LiveExchangeRateService {
  private apiKey = 'demo'; // Replace with actual API key
  private baseUrl = 'https://api.exchangerate-api.com/v4/latest';

  async fetchLiveRates(): Promise<Record<string, number>> {
    try {
      // Fetch USD as base currency to get all rates
      const response = await fetch(`${this.baseUrl}/USD`);
      const data = await response.json();

      if (!data.rates) {
        throw new Error('Invalid API response');
      }

      return data.rates;
    } catch (error) {
      console.error('Error fetching live rates:', error);
    }
  }

  calculateCrossRates(baseRates: Record<string, number>): Record<string, Record<string, number>> {
    const crossRates: Record<string, Record<string, number>> = {};

    // Calculate all cross rates between basket currencies
    BASKET_CURRENCIES.forEach(base => {
      crossRates[base] = {};
      BASKET_CURRENCIES.forEach(target => {
        if (base === target) {
          crossRates[base][target] = 1.0000;
        } else {
          const baseRate = baseRates[base];
          const targetRate = baseRates[target];

          console.log(`Calculating ${target}/${base}: baseRate=${baseRate}, targetRate=${targetRate}`);

          if (baseRate && targetRate && baseRate > 0 && targetRate > 0) {
            // Cross rate calculation: how many target currency units per 1 base currency unit
            const crossRate = targetRate / baseRate;
            console.log(`Cross rate calculation: ${targetRate} / ${baseRate} = ${crossRate}`);
            crossRates[base][target] = Math.round(crossRate * 10000) / 10000; // Round to 4 decimal places
          } else {
            console.log(`Invalid rates for ${target}/${base}`);
            crossRates[base][target] = 0;
          }
        }
      });

      // Add USD rates - how many base currency units per 1 USD
      const baseRate = baseRates[base];
      if (baseRate && baseRate > 0) {
        crossRates[base]['USD'] = baseRate;
      } else {
        crossRates[base]['USD'] = 0;
      }
    });

    console.log('Final crossRates:', crossRates);
    return crossRates;
  }

  calculateGSDCRates(crossRates: Record<string, Record<string, number>>): Record<string, number> {
    const gsdcRates: Record<string, number> = {};

    // GSDC calculation: sum of all basket currency rates relative to each benchmark
    const basketCurrenciesExcludingUSD = BASKET_CURRENCIES.filter(cur => cur !== 'USD');

    basketCurrenciesExcludingUSD.forEach(benchmark => {
      let gsdcValue = 0;

      basketCurrenciesExcludingUSD.forEach(currency => {
        const rate = crossRates[currency]?.[benchmark];
        if (rate !== undefined && !isNaN(rate) && rate > 0) {
          gsdcValue += rate;
        }
      });

      gsdcRates[benchmark] = parseFloat(gsdcValue.toFixed(4));
    });

    // Calculate GSDC/USD: sum all basket currencies in USD terms
    let gsdcUsdValue = 0;
    BASKET_CURRENCIES.forEach(currency => {
      if (currency !== 'USD') {
        const rate = crossRates[currency]?.['USD'];
        if (rate && !isNaN(rate) && rate > 0) {
          // 1 unit of currency converted to USD
          gsdcUsdValue += (1 / rate);
        }
      }
    });
    gsdcRates['USD'] = parseFloat(gsdcUsdValue.toFixed(4));

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
}

export const liveExchangeRateService = new LiveExchangeRateService();

// Hook for live exchange rates
export const useLiveExchangeRates = () => {
  const [data, setData] = useState<BasketCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tokenomicsData = await liveExchangeRateService.getTokenomicsData();
      setData(tokenomicsData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Update every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, lastUpdated, refetch: fetchData };
};