
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ExchangeRate {
  pair: string;
  rate: number;
  currency: string;
  lastUpdated: string;
}

const ExchangeRates: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([
    { pair: 'GSDC/USD', rate: 1.00, currency: 'US Dollar', lastUpdated: new Date().toISOString() },
    { pair: 'GSDC/CNH', rate: 7.25, currency: 'Chinese Yuan', lastUpdated: new Date().toISOString() },
    { pair: 'GSDC/BRL', rate: 5.43, currency: 'Brazilian Real', lastUpdated: new Date().toISOString() },
    { pair: 'GSDC/INR', rate: 83.42, currency: 'Indian Rupee', lastUpdated: new Date().toISOString() },
    { pair: 'GSDC/ZAR', rate: 18.65, currency: 'South African Rand', lastUpdated: new Date().toISOString() },
    { pair: 'GSDC/IDR', rate: 15750.00, currency: 'Indonesian Rupiah', lastUpdated: new Date().toISOString() },
    { pair: 'GSDC/THB', rate: 34.25, currency: 'Thai Baht', lastUpdated: new Date().toISOString() },
    { pair: 'GSDC/EUR', rate: 0.92, currency: 'Euro', lastUpdated: new Date().toISOString() },
  ]);

  const [loading, setLoading] = useState(false);

  const formatRate = (rate: number, pair: string) => {
    if (pair.includes('IDR')) {
      return rate.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const getChangeDirection = () => {
    // Simulate rate changes for demo
    return Math.random() > 0.5 ? 'up' : 'down';
  };

  const getChangePercentage = () => {
    return (Math.random() * 2 - 1).toFixed(2); // Random change between -1% and 1%
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Complete Exchange Rates
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive view of GSDC rates against all supported currencies with detailed 
            calculation methodology.
          </p>
        </motion.div>

        {/* Exchange Rates Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Pair
                  </th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-white uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-white uppercase tracking-wider">
                    24h Change
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-white uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rates.map((rate, index) => {
                  const changeDirection = getChangeDirection();
                  const changePercentage = getChangePercentage();
                  
                  return (
                    <motion.tr
                      key={rate.pair}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-lg font-semibold text-blue-600">
                            {rate.pair}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-xl font-bold text-gray-900">
                          {formatRate(rate.rate, rate.pair)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          changeDirection === 'up' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {changeDirection === 'up' ? '↗' : '↘'} {Math.abs(parseFloat(changePercentage))}%
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-gray-700 font-medium">
                          {rate.currency}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-gray-500 text-sm">
                          {new Date(rate.lastUpdated).toLocaleString()}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Calculation Methodology */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Calculation Methodology</h3>
          <p className="text-gray-600 leading-relaxed">
            <strong>Calculation:</strong> GSDC rates are calculated based on the basket of currencies (CNH, BRL, INR, ZAR, IDR, THB). 
            GSDC/USD equals the sum of all basket currencies against USD. 
            Other rates use their respective currency pairings.
          </p>
        </motion.div>

        {/* Real-time Updates Notice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="ml-3">
              <p className="text-blue-800 font-medium">
                Real-time Updates: Rates are updated every 30 seconds during market hours
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Last system update: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExchangeRates;
