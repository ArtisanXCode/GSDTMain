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
  BASKET_CURRENCIES: parseEnvArray(import.meta.env.VITE_BASKET_CURRENCIES, ['USD', 'CNY', 'RUB', 'THB', 'INR', 'BRL', 'ZAR', 'IDR']),
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
    RUB: "₽",
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
    RUB: "Russian Ruble",
    JPY: "Japanese Yen",
    EUR: "Euro",
    CAD: "Canadian Dollar"
  }
);

// Currency colors from environment variables
export const CURRENCY_COLORS: Record<string, string> = parseEnvObject(
  import.meta.env.VITE_CURRENCY_COLORS,
  {
    CNY: '#ed9030',
    BRL: '#ed9030',
    ZAR: '#ed9030',
    THB: '#ed9030',
    RUB: '#ed9030',
    INR: '#ed9030',
    IDR: '#ed9030',
    USD: '#ed9030'
  }
);

// Currency precision configuration from environment variables
export const CURRENCY_PRECISION: Record<string, number> = parseEnvObject(
  import.meta.env.VITE_CURRENCY_PRECISION,
  {
    USD: 4,
    IDR: 4,
    INR: 4,
    THB: 4,
    RUB: 4,
    ZAR: 4,
    CNY: 4,
    BRL: 4
  }
);

// Compact currencies order from environment variables - USD first, then all 7 basket currencies
export const COMPACT_CURRENCIES = parseEnvArray(import.meta.env.VITE_COMPACT_CURRENCIES, ['USD', 'CNY', 'RUB', 'THB', 'INR', 'BRL', 'ZAR', 'IDR']);