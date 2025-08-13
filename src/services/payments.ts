import axios from 'axios';
import { supabase } from '../lib/supabase';
import { CURRENCY_NAMES } from '../config/api';

const NOWPAYMENTS_API_KEY = import.meta.env.VITE_NOWPAYMENTS_API_KEY || 'test_api_key';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

export interface PaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  success_url: string;
  cancel_url: string;
}

export interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  payin_extra_id: string;
  payment_url: string;
}

export interface PaymentStatus {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
}

// Map payment status to match database constraints
const mapPaymentStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'waiting': 'pending',
    'confirming': 'confirming',
    'confirmed': 'confirmed',
    'sending': 'sending',
    'partially_paid': 'partially_paid',
    'finished': 'finished',
    'failed': 'failed',
    'refunded': 'refunded',
    'expired': 'expired'
  };
  return statusMap[status] || 'pending';
};

// Available currencies with their display names
export interface CurrencyInfo {
  code: string;
  name: string;
  minAmount: number;
}

// Generate supported currencies from environment configuration plus crypto currencies
const CRYPTO_CURRENCIES: CurrencyInfo[] = [
  { code: 'USDT', name: 'Tether USD', minAmount: 10 },
  { code: 'USDC', name: 'USD Coin', minAmount: 10 },
  { code: 'BTC', name: 'Bitcoin', minAmount: 0.001 },
  { code: 'ETH', name: 'Ethereum', minAmount: 0.01 },
  { code: 'BNB', name: 'Binance Coin', minAmount: 0.1 },
  { code: 'ADA', name: 'Cardano', minAmount: 10 },
  { code: 'DOT', name: 'Polkadot', minAmount: 1 },
  { code: 'MATIC', name: 'Polygon', minAmount: 10 },
  { code: 'LTC', name: 'Litecoin', minAmount: 0.1 },
  { code: 'XRP', name: 'Ripple', minAmount: 10 },
];

const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  ...CRYPTO_CURRENCIES,
  // Add fiat currencies from environment configuration
  ...Object.keys(CURRENCY_NAMES).map(code => ({
    code,
    name: CURRENCY_NAMES[code],
    minAmount: 10
  }))
];

// Create a payment request
export const createPayment = async (
  amount: number,
  userAddress: string,
  currency = 'USDC'
): Promise<PaymentResponse> => {
  try {
    const paymentRequest: PaymentRequest = {
      price_amount: amount,
      price_currency: 'USD',
      pay_currency: currency,
      order_id: `GSDC-${Date.now()}-${userAddress}`,
      order_description: `GSDC Token Purchase - ${amount} GSDC`,
      ipn_callback_url: `${window.location.origin}/api/payment-callback`,
      success_url: `${window.location.origin}/dashboard?payment=success`,
      cancel_url: `${window.location.origin}/dashboard?payment=cancelled`
    };

    // For development, return mock response
    if (NOWPAYMENTS_API_KEY === 'test_api_key') {
      const mockResponse: PaymentResponse = {
        payment_id: `mock-${Date.now()}`,
        payment_status: 'waiting',
        pay_address: '0xMockAddress',
        price_amount: amount,
        price_currency: 'USD',
        pay_amount: amount,
        pay_currency: currency,
        order_id: paymentRequest.order_id,
        order_description: paymentRequest.order_description,
        payin_extra_id: '',
        payment_url: 'https://example.com/mock-payment'
      };

      try {
        // Store mock payment in Supabase
        await supabase.from('crypto_payments').insert([{
          payment_id: mockResponse.payment_id,
          user_address: userAddress.toLowerCase(),
          amount: amount,
          currency: currency,
          status: mapPaymentStatus(mockResponse.payment_status),
          order_id: mockResponse.order_id,
          created_at: new Date().toISOString()
        }]);
      } catch (dbError) {
        console.error('Error storing payment data:', dbError);
        // Continue even if storage fails
      }

      return mockResponse;
    }

    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      paymentRequest,
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    try {
      // Store payment request in Supabase
      await supabase.from('crypto_payments').insert([{
        payment_id: response.data.payment_id,
        user_address: userAddress.toLowerCase(),
        amount: amount,
        currency: currency,
        status: mapPaymentStatus(response.data.payment_status),
        order_id: paymentRequest.order_id,
        created_at: new Date().toISOString()
      }]);
    } catch (dbError) {
      console.error('Error storing payment data:', dbError);
      // Continue even if storage fails
    }

    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw new Error('Failed to create payment. Please try again.');
  }
};

// Get payment status
export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatus> => {
  try {
    if (NOWPAYMENTS_API_KEY === 'test_api_key') {
      // Simulate different payment statuses for testing
      const statuses = ['waiting', 'confirming', 'confirmed', 'sending', 'finished'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        payment_id: paymentId,
        payment_status: randomStatus,
        pay_address: '0xMockAddress',
        price_amount: 100,
        price_currency: 'USD',
        pay_amount: 100,
        actually_paid: randomStatus === 'finished' ? 100 : 0,
        pay_currency: 'USDC',
        order_id: 'mock-order',
        order_description: 'Mock Payment',
        purchase_id: 'mock-purchase',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const response = await axios.get(
      `${NOWPAYMENTS_API_URL}/payment/${paymentId}`,
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY
        }
      }
    );

    try {
      // Update payment status in Supabase
      await supabase.from('crypto_payments').update({
        status: mapPaymentStatus(response.data.payment_status),
        updated_at: new Date().toISOString()
      }).eq('payment_id', paymentId);
    } catch (dbError) {
      console.error('Error updating payment status:', dbError);
      // Continue even if update fails
    }

    return response.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw new Error('Failed to get payment status. Please try again.');
  }
};

// Get minimum payment amount
export const getMinPaymentAmount = async (currency: string): Promise<number> => {
  try {
    if (NOWPAYMENTS_API_KEY === 'test_api_key') {
      const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
      return currencyInfo?.minAmount || 10;
    }

    const response = await axios.get(
      `${NOWPAYMENTS_API_URL}/min-amount?currency_from=${currency}`,
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY
        }
      }
    );
    return response.data.min_amount;
  } catch (error) {
    console.error('Error getting minimum payment amount:', error);
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    return currencyInfo?.minAmount || 10;
  }
};

// Get available currencies
export const getAvailableCurrencies = async (): Promise<CurrencyInfo[]> => {
  try {
    if (NOWPAYMENTS_API_KEY === 'test_api_key') {
      return SUPPORTED_CURRENCIES;
    }

    const response = await axios.get(
      `${NOWPAYMENTS_API_URL}/currencies`,
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY
        }
      }
    );

    // Map API response to CurrencyInfo format
    return response.data.currencies.map((code: string) => {
      const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === code);
      return currencyInfo || {
        code,
        name: code,
        minAmount: 10
      };
    });
  } catch (error) {
    console.error('Error getting available currencies:', error);
    return SUPPORTED_CURRENCIES;
  }
};