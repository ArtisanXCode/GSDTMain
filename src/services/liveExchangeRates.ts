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

// GSDC basket currencies - using CNY instead of CNH to match API
export const BASKET_CURRENCIES = ['CNY', 'THB', 'INR', 'BRL', 'ZAR', 'IDR', 'USD'];
export const REFERENCE_CURRENCIES = ['USD'];

// Live exchange rate API service
class LiveExchangeRateService {
  //private apiKey = 'demo'; // Replace with actual API key
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
    BASKET_CURRENCIES.forEach(benchmark => {
      crossRates[benchmark] = {};
      BASKET_CURRENCIES.forEach(currency => {
        if (benchmark === currency) {
          crossRates[benchmark][currency] = 1.0000;
        } else {
          const benchmarkRate = baseRates[benchmark];
          const currencyRate = baseRates[currency];

          //console.log(`Calculating ${currency}/${benchmark}: benchmarkRate=${benchmarkRate}, currencyRate=${currencyRate}`);

          if (benchmarkRate && currencyRate && benchmarkRate > 0 && currencyRate > 0) {
            // Cross rate calculation: how many benchmark currency units per 1 target currency unit
            // This gives us the reciprocal rate (e.g., USD per 1 INR instead of INR per 1 USD)
            const crossRate = benchmarkRate / currencyRate;
            //console.log(`Cross rate calculation: ${benchmarkRate} / ${currencyRate} = ${crossRate}`);
            crossRates[benchmark][currency] = Math.round(crossRate * 1000000) / 1000000; // Round to 6 decimal places for precision
          } else {
            //console.log(`Invalid rates for ${currency}/${benchmark}`);
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