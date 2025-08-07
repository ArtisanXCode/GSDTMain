
import React from 'react';
import { motion } from 'framer-motion';
import HistoricalAnalytics from '../components/HistoricalAnalytics';

export default function HistoricalAnalyticsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/about_us_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              Historical Analytics
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular max-w-2xl">
              Deep dive into GSDC's historical performance with comprehensive analytics, 
              stability metrics, and interactive charts showing evolution across all basket currencies.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div
        className="relative isolate text-white py-24 sm:py-32"
        style={{ backgroundColor: "#2a4661" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <HistoricalAnalytics />
        </div>
      </div>

      {/* Additional info section */}
      <div className="bg-gray-100 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Professional-Grade Financial Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Data</h3>
                <p className="text-gray-600">
                  Historical data is continuously updated with real-time feeds from multiple 
                  tier-1 financial data providers.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Metrics</h3>
                <p className="text-gray-600">
                  Comprehensive volatility analysis, stability coefficients, and correlation 
                  studies across different time horizons.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Audit Trail</h3>
                <p className="text-gray-600">
                  Complete transparency with full audit trails and methodology disclosure 
                  for institutional and regulatory requirements.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
