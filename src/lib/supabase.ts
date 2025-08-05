import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback values for development if environment variables are not available
const fallbackUrl = '';
const fallbackKey = '';

// Use environment variables or fallback to hardcoded values
const url = supabaseUrl || fallbackUrl;
const key = supabaseAnonKey || fallbackKey;

// Create and export the Supabase client with retries
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js/2.39.3'
    }
  },
  db: {
    schema: 'public'
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST116') {
    return 'No data found';
  }
  
  if (error.code === '23505') {
    return 'This record already exists';
  }
  
  if (error.code === '42703') {
    return 'Database schema error: Column does not exist';
  }
  
  if (error.message?.includes('Failed to fetch')) {
    return 'Connection error: Unable to reach database';
  }
  
  return error.message || 'An unexpected error occurred';
};

// Connection caching to prevent constant API calls
let connectionCache: {
  isConnected: boolean;
  lastChecked: number;
  cacheTimeout: number;
} = {
  isConnected: false,
  lastChecked: 0,
  cacheTimeout: 30000, // 30 seconds cache
};

// Helper function to check if Supabase is available with caching
export const checkSupabaseConnection = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Return cached result if within timeout period
  if (now - connectionCache.lastChecked < connectionCache.cacheTimeout) {
    return connectionCache.isConnected;
  }

  try {
    const { data, error } = await supabase.from('admin_roles').select('count').limit(1);
    const isConnected = !error;
    // Update cache
    connectionCache = {
      isConnected,
      lastChecked: now,
      cacheTimeout: isConnected ? 30000 : 10000, // 30s if connected, 10s if failed
    };
    
    return isConnected;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    
    // Update cache with failure
    connectionCache = {
      isConnected: false,
      lastChecked: now,
      cacheTimeout: 10000, // 10 seconds on failure
    };
    
    return false;
  }
};

// Helper function to reset connection cache (useful for testing)
export const resetConnectionCache = (): void => {
  connectionCache = {
    isConnected: false,
    lastChecked: 0,
    cacheTimeout: 30000,
  };
};