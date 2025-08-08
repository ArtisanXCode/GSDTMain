
// This file is deprecated - historical data is now generated based on live rates
// All historical functionality has been moved to use live GSDC rates as the base

export type TimeFrame = '3M' | '6M' | '1Y' | '2Y';

export interface HistoricalRate {
  date: string;
  value: number;
  currency: string;
}

// This service is no longer used - kept for backward compatibility
export const getHistoricalRates = async (
  pair: string, 
  timeframe: TimeFrame
): Promise<HistoricalRate[]> => {
  console.warn('getHistoricalRates is deprecated. Use HistoricalChart component with live rates instead.');
  return [];
};

export const getAvailablePairs = (): string[] => {
  return [
    'GSDC/CNY',
    'GSDC/USD', 
    'GSDC/EUR',
    'GSDC/GBP',
    'GSDC/JPY',
  ];
};
