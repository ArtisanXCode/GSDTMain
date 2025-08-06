

export const API_CONFIG = {
  EXCHANGE_RATE_API_URL: import.meta.env.VITE_EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Parse environment variables for currency configuration
const parseEnvArray = (envVar: string | undefined, fallback: string[]): string[] => {
  if (!envVar) return fallback;
  try {
    return envVar.split(',').map(item => item.trim()).filter(Boolean);
  } catch {
    return fallback;
  }
};

const parseEnvObject = (envVar: string | undefined, fallback: Record<string, string>): Record<string, string> => {
  if (!envVar) return fallback;
  try {
    return JSON.parse(envVar);
  } catch {
    return fallback;
  }
};

// Exchange rate related constants from environment variables
export const EXCHANGE_RATE_CONFIG = {
  // GSDC basket currencies from environment
  BASKET_CURRENCIES: parseEnvArray(import.meta.env.VITE_BASKET_CURRENCIES, ['CNY', 'THB', 'INR', 'BRL', 'ZAR', 'IDR', 'USD']),
  REFERENCE_CURRENCIES: parseEnvArray(import.meta.env.VITE_REFERENCE_CURRENCIES, ['USD']),
  UPDATE_INTERVAL: 30000, // 30 seconds
  CACHE_DURATION: 60000, // 1 minute
} as const;

// Currency symbols from environment variables
export const CURRENCY_SYMBOLS: Record<string, string> = parseEnvObject(
  import.meta.env.VITE_CURRENCY_SYMBOLS,
  {
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
  }
);

// Currency names from environment variables
export const CURRENCY_NAMES: Record<string, string> = parseEnvObject(
  import.meta.env.VITE_CURRENCY_NAMES,
  {
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
  }
);

