
export const API_CONFIG = {
  EXCHANGE_RATE_API_URL: import.meta.env.VITE_EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Exchange rate related constants
export const EXCHANGE_RATE_CONFIG = {
  // GSDC basket currencies - using CNY instead of CNH to match API
  BASKET_CURRENCIES: ['CNY', 'THB', 'INR', 'BRL', 'ZAR', 'IDR', 'USD'],
  REFERENCE_CURRENCIES: ['USD'],
  UPDATE_INTERVAL: 30000, // 30 seconds
  CACHE_DURATION: 60000, // 1 minute
} as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  CNY: "¥",
  CNH: "¥",
  BRL: "R$",
  INR: "₹",
  ZAR: "R",
  IDR: "Rp",
  THB: "฿",
  JPY: "¥",
  EUR: "€",
  CAD: "C$"
};

export const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  CNY: "Chinese Yuan",
  CNH: "Chinese Yuan",
  BRL: "Brazilian Real", 
  INR: "Indian Rupee",
  ZAR: "South African Rand",
  IDR: "Indonesian Rupiah",
  THB: "Thai Baht",
  JPY: "Japanese Yen",
  EUR: "Euro",
  CAD: "Canadian Dollar"
};
