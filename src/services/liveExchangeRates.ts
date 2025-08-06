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
export const BASKET_CURRENCIES = ['CNH', 'BRL', 'ZAR', 'THB', 'INR', 'IDR'];
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
      // Return mock data for development
      return this.getMockRates();
    }
  }

  private getMockRates(): Record<string, number> {
    return {
      CNH: 7.2405,
      THB: 33.95,
      INR: 83.12,
      BRL: 5.85,
      ZAR: 18.25,
      IDR: 15750.50,
      USD: 1.0000,
      EUR: 0.92,
      JPY: 149.50,
      GBP: 0.79,
      CAD: 1.36,
      AUD: 1.52
    };
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
          
          if (baseRate && targetRate && baseRate > 0 && targetRate > 0) {
            // Convert via USD: base/target = (base/USD) / (target/USD)
            // This gives us how many target units equal 1 base unit
            crossRates[base][target] = baseRate / targetRate;
          } else {
            crossRates[base][target] = 0;
          }
        }
      });

      // Add USD rates - direct rate from API (base currency per USD)
      const baseRate = baseRates[base];
      if (baseRate && baseRate > 0) {
        crossRates[base]['USD'] = baseRate;
      } else {
        crossRates[base]['USD'] = 0;
      }
    });

    return crossRates;
  }

  calculateGSDCRates(crossRates: Record<string, Record<string, number>>): Record<string, number> {
    const gsdcRates: Record<string, number> = {};

    // GSDC represents 1 unit of each basket currency
    // So GSDC/BRL = 1*CNH/BRL + 1*BRL/BRL + 1*ZAR/BRL + 1*THB/BRL + 1*INR/BRL + 1*IDR/BRL
    // Which simplifies to: CNH/BRL + 1 + ZAR/BRL + THB/BRL + INR/BRL + IDR/BRL

    BASKET_CURRENCIES.forEach(benchmark => {
      let gsdcValue = 0;
      let validCurrencies = 0;

      BASKET_CURRENCIES.forEach(currency => {
        const rate = crossRates[currency]?.[benchmark];
        if (rate && !isNaN(rate) && rate > 0) {
          gsdcValue += rate;
          validCurrencies++;
        }
      });

      // Only set rate if we have data for all basket currencies
      gsdcRates[benchmark] = validCurrencies === BASKET_CURRENCIES.length ? gsdcValue : 0;
    });

    // Calculate GSDC/USD
    let gsdcUsdValue = 0;
    let validUsdCurrencies = 0;

    BASKET_CURRENCIES.forEach(currency => {
      const rate = crossRates[currency]?.['USD'];
      if (rate && !isNaN(rate) && rate > 0) {
        // Each rate is currency/USD (e.g., CNH/USD = 7.24 CNH per USD)
        // To get USD value of 1 unit of currency: 1/rate
        // So for GSDC/USD, we sum: 1/CNH_rate + 1/BRL_rate + ... (USD value of each component)
        gsdcUsdValue += (1 / rate);
        validUsdCurrencies++;
      }
    });

    gsdcRates['USD'] = validUsdCurrencies === BASKET_CURRENCIES.length ? gsdcUsdValue : 0;

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