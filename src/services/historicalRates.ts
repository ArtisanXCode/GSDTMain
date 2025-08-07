
// Mock historical rates service
export type TimeFrame = '3M' | '6M' | '1Y' | '2Y';

export interface HistoricalRate {
  date: string;
  value: number;
  currency: string;
}

// Generate mock historical data for demonstration
const generateMockData = (pair: string, timeframe: TimeFrame): HistoricalRate[] => {
  const [base, quote] = pair.split('/');
  const now = new Date();
  const data: HistoricalRate[] = [];
  
  const days = timeframe === '3M' ? 90 : 
               timeframe === '6M' ? 180 :
               timeframe === '1Y' ? 365 : 730;
               
  const baseValue = quote === 'CNY' ? 3.018 :
                   quote === 'USD' ? 1.000 :
                   quote === 'EUR' ? 0.850 :
                   quote === 'GBP' ? 0.750 :
                   quote === 'JPY' ? 110.5 : 1.000;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add small random variations to simulate real data
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const value = baseValue * (1 + variation);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(6)),
      currency: quote,
    });
  }
  
  return data;
};

export const getHistoricalRates = async (
  pair: string, 
  timeframe: TimeFrame
): Promise<HistoricalRate[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return generateMockData(pair, timeframe);
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
