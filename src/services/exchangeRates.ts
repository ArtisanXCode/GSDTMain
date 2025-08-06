import { supabase } from "../lib/supabase";
import useSWR from "swr";

export interface ExchangeRate {
  id: string;
  currency_from: string;
  currency_to: string;
  rate: number;
  last_updated: string;
}

// BRICS currencies included in the GSDC basket
export const GSDC_BASKET_CURRENCIES = ["CNH", "BRL", "INR", "ZAR", "IDR", "THB"];

// Major currencies for phase 2
export const MAJOR_CURRENCIES = ["USD", "JPY", "EUR", "CAD"];

// All supported currencies
export const ALL_CURRENCIES = [...GSDC_BASKET_CURRENCIES, ...MAJOR_CURRENCIES];

// Fetch exchange rates from the database
const fetchExchangeRates = async (): Promise<ExchangeRate[]> => {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("*")
    .order("last_updated", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get exchange rate between two currencies
export const getExchangeRate = async (from: string, to: string): Promise<number> => {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("rate")
    .eq("currency_from", from)
    .eq("currency_to", to)
    .single();

  if (error) throw error;
  return data.rate;
};

// Get exchange rate between two currencies (using the fetched rates array)
// This is a helper function that might be used internally by GSDC calculations
const getExchangeRateFromArray = (rates: ExchangeRate[], from: string, to: string): number => {
  // Direct rate
  const directRate = rates.find(r => r.currency_from === from && r.currency_to === to);
  if (directRate) return directRate.rate;

  // Inverse rate
  const inverseRate = rates.find(r => r.currency_from === to && r.currency_to === from);
  if (inverseRate && inverseRate.rate !== 0) return 1 / inverseRate.rate;

  return 0;
};


// Create a new exchange rate
export const createExchangeRate = async (
  exchangeRate: Omit<ExchangeRate, "id" | "last_updated">,
): Promise<ExchangeRate> => {
  const { data, error } = await supabase
    .from("exchange_rates")
    .insert([exchangeRate])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update an exchange rate
export const updateExchangeRate = async (
  id: string,
  updates: Partial<Omit<ExchangeRate, "id">>,
): Promise<ExchangeRate> => {
  const { data, error } = await supabase
    .from("exchange_rates")
    .update({
      ...updates,
      last_updated: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete an exchange rate
export const deleteExchangeRate = async (id: string): Promise<void> => {
  const { error } = await supabase.from("exchange_rates").delete().eq("id", id);

  if (error) throw error;
};

// Get all exchange rates
export const getExchangeRates = async (): Promise<ExchangeRate[]> => {
  return fetchExchangeRates();
};

// Hook to fetch exchange rates with SWR
export const useExchangeRates = () => {
  return useSWR<ExchangeRate[]>("exchange-rates", fetchExchangeRates, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
  });
};

// Calculate GSDC value against USD
// GSDC/USD = CNH/USD + BRL/USD + INR/USD + ZAR/USD + IDR/USD + THB/USD
export const calculateGSDCToUSD = (rates: ExchangeRate[]): number => {
  let gsdcValue = 0;

  GSDC_BASKET_CURRENCIES.forEach(currency => {
    const rate = getExchangeRateFromArray(rates, currency, "USD");
    gsdcValue += rate;
  });

  return Number(gsdcValue.toFixed(6));
};

// Calculate GSDC value against any currency in the basket
// GSDC/[Currency] = 1 + sum of (other_currencies/[Currency])
export const calculateGSDCToCurrency = (rates: ExchangeRate[], targetCurrency: string): number => {
  if (!GSDC_BASKET_CURRENCIES.includes(targetCurrency)) {
    return 0;
  }

  let gsdcValue = 1; // Start with 1 unit of the target currency

  // Add rates of all other basket currencies converted to target currency
  GSDC_BASKET_CURRENCIES.forEach(currency => {
    if (currency !== targetCurrency) {
      const rate = getExchangeRateFromArray(rates, currency, targetCurrency);
      gsdcValue += rate;
    }
  });

  return Number(gsdcValue.toFixed(6));
};

// Calculate all GSDC rates
export const calculateAllGSDCRates = (rates: ExchangeRate[]) => {
  const gsdcRates: Record<string, number> = {};

  // GSDC/USD
  gsdcRates["USD"] = calculateGSDCToUSD(rates);

  // GSDC against each basket currency
  GSDC_BASKET_CURRENCIES.forEach(currency => {
    gsdcRates[currency] = calculateGSDCToCurrency(rates, currency);
  });

  // Phase 2: GSDC against major currencies (via USD conversion)
  MAJOR_CURRENCIES.slice(1).forEach(currency => {
    const usdToCurrency = getExchangeRateFromArray(rates, "USD", currency);
    if (usdToCurrency > 0) {
      gsdcRates[currency] = Number((gsdcRates["USD"] * usdToCurrency).toFixed(6));
    }
  });

  return gsdcRates;
};

// Legacy function for backward compatibility
export const calculateGSDCPrice = (rates: ExchangeRate[]): number => {
  return calculateGSDCToUSD(rates);
};

// Custom hook to fetch and calculate GSDC prices
export const useGSDCPrice = () => {
  const { data, error, isLoading } = useSWR<ExchangeRate[]>(
    "exchange-rates",
    fetchExchangeRates,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    },
  );

  const gsdcRates = data ? calculateAllGSDCRates(data) : null;

  return {
    price: gsdcRates?.USD || null, // Legacy USD price
    gsdcRates, // All GSDC rates against different currencies
    rates: data,
    isLoading,
    isError: error,
    timestamp: data?.[0]?.last_updated,
  };
};

// Re-export everything from the unified service for backward compatibility
// This is placed at the end to ensure all definitions are available before re-exporting.
export * from './liveExchangeRates'; // Assuming liveExchangeRates.ts contains the re-export logic for GSDC price