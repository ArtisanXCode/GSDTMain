
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { createPayment, getPaymentStatus, getMinPaymentAmount, getAvailableCurrencies, CurrencyInfo } from '../services/payments';
import { getUserKYCStatus, KYCStatus } from '../services/kyc';

export default function CryptoMinting() {
  const { address, isConnected } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');
  const [availableCurrencies, setAvailableCurrencies] = useState<CurrencyInfo[]>([]);
  const [minAmount, setMinAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_SUBMITTED);
  const [checkingKYC, setCheckingKYC] = useState(true);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currencies = await getAvailableCurrencies();
        setAvailableCurrencies(currencies);
        
        if (currencies.length > 0) {
          const defaultCurrency = currencies.find(c => c.code === 'USDC') || currencies[0];
          setSelectedCurrency(defaultCurrency.code);
          setMinAmount(defaultCurrency.minAmount);
        }
      } catch (err) {
        console.error('Error loading currencies:', err);
      }
    };

    loadCurrencies();
  }, []);

  // Check KYC status
  useEffect(() => {
    const checkKYC = async () => {
      if (!address) return;
      
      try {
        setCheckingKYC(true);
        const response = await getUserKYCStatus(address);
        setKycStatus(response.status);
      } catch (err) {
        console.error('Error checking KYC status:', err);
        setKycStatus(KYCStatus.NOT_SUBMITTED);
      } finally {
        setCheckingKYC(false);
      }
    };

    checkKYC();
  }, [address]);

  const handleCurrencyChange = async (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    const currency = availableCurrencies.find(c => c.code === currencyCode);
    if (currency) {
      setMinAmount(currency.minAmount);
    }
  };

  const handleCreatePayment = async () => {
    if (!isConnected || !address || !amount) return;

    // Check KYC status first
    if (kycStatus !== KYCStatus.APPROVED) {
      setError('KYC verification is required before minting tokens. Please complete KYC verification first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setPaymentUrl('');
      setPaymentId('');

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < minAmount) {
        setError(`Minimum amount is ${minAmount} ${selectedCurrency}`);
        return;
      }

      const payment = await createPayment(amountNum, address, selectedCurrency);
      
      // Store payment URL and ID
      setPaymentUrl(payment.payment_url);
      setPaymentId(payment.payment_id);
      
      setSuccess(`Payment request created successfully! Please complete your payment of ${amountNum} ${selectedCurrency}.`);

      // Start polling for payment status
      const pollStatus = setInterval(async () => {
        try {
          const status = await getPaymentStatus(payment.payment_id);
          if (status.payment_status === 'finished' || status.payment_status === 'confirmed') {
            setSuccess('Payment confirmed! Your tokens will be minted shortly.');
            setPaymentUrl(''); // Hide payment link after confirmation
            clearInterval(pollStatus);
          } else if (status.payment_status === 'failed' || status.payment_status === 'expired') {
            setError('Payment failed or expired. Please try again.');
            setPaymentUrl(''); // Hide payment link on failure
            clearInterval(pollStatus);
          }
        } catch (err) {
          console.error('Error polling payment status:', err);
        }
      }, 30000); // Poll every 30 seconds

      // Clear polling after 30 minutes
      setTimeout(() => {
        clearInterval(pollStatus);
        if (paymentUrl) {
          setError('Payment session expired. Please create a new payment.');
          setPaymentUrl('');
        }
      }, 30 * 60 * 1000);

    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError(err.message || 'Error creating payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Connect your wallet to mint tokens with crypto</p>
      </div>
    );
  }

  if (checkingKYC) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking KYC status...</p>
      </div>
    );
  }

  if (kycStatus !== KYCStatus.APPROVED) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">KYC Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to complete KYC verification before you can mint tokens.
            Please go to the dashboard to complete your KYC verification.
          </p>
          <div className="mt-6">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Complete KYC
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Mint with Crypto</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Purchase GSDC tokens using cryptocurrency. Choose from a variety of supported digital currencies for instant token minting.
        </p>
      </div>

      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <h4 className="text-xl font-semibold text-white">Crypto Payment Details</h4>
          <p className="text-blue-100 text-sm mt-1">Complete your payment using cryptocurrency</p>
        </div>

        <div className="p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreatePayment();
            }}
            className="space-y-6"
          >
            {/* Amount and Currency Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="crypto-amount" className="block text-sm font-semibold text-gray-900 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="crypto-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Enter amount"
                    disabled={loading}
                    min={minAmount}
                    step="any"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-semibold text-gray-900 mb-2">
                  Currency *
                </label>
                <select
                  id="currency"
                  value={selectedCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  disabled={loading}
                  required
                >
                  {availableCurrencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.name} ({curr.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Payment Information</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>• Minimum amount: <span className="font-semibold">{minAmount} {selectedCurrency}</span></p>
                    <p>• Tokens will be minted automatically after payment confirmation</p>
                    <p>• Connected Wallet: <span className="font-mono text-xs">{address}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4"
              >
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-6"
              >
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-green-800 mb-3">{success}</p>
                    
                    {paymentUrl && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg border border-green-200 p-4">
                          <h5 className="font-semibold text-green-900 mb-2">Payment Details:</h5>
                          <div className="space-y-1 text-sm text-green-800">
                            <p>Amount: <span className="font-semibold">{amount} {selectedCurrency}</span></p>
                            <p>Payment ID: <span className="font-mono text-xs">{paymentId}</span></p>
                          </div>
                        </div>
                        
                        <motion.a
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-lg transition-all duration-200"
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Complete Payment
                        </motion.a>
                        
                        <p className="text-xs text-green-700">
                          Note: Payment link will expire in 30 minutes. Please complete your payment before then.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !amount || parseFloat(amount) < minAmount}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment Request...
                </span>
              ) : (
                'Create Payment Request'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">How Crypto Minting Works</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
            <p>Enter the amount and select your preferred cryptocurrency</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
            <p>Click "Create Payment Request" to generate your payment link</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
            <p>Complete the payment using the secure payment gateway</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
            <p>GSDC tokens will be automatically minted to your wallet upon confirmation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
