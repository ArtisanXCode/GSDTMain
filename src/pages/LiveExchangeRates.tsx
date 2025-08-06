
import React from 'react';
import { motion } from 'framer-motion';
import ExchangeRates from '../components/ExchangeRates';

export default function LiveExchangeRatesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with theme colors */}
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
              GSDC Tokenomics
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              Live calculation of GSDC exchange rates using real-time market data from 
              the six-currency basket composition.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Centered Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-end">
        <div
          className="phoenix-icon-parent"
        >
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      {/* Main content section with KYC-style table */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4"
              style={{ color: "#ed9030" }}
            >
              LIVE GSDC <br/> TOKENOMICS CALCULATION
            </p>
            <p className="text-lg leading-6 text-black max-w-4xl mx-auto font-regular">
              Real-time calculation of GSDC rates based on live market data from our six-currency basket.
              <br />
              Each GSDC token represents 1 unit of each currency in the diversified basket,
              <br />
              providing transparent and dynamic valuation across global markets.
            </p>
          </div>

          {/* Exchange Rates Table with KYC Design */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: "#2a4661" }}
          >
            <div className="p-6">              
              {/* Exchange Rates Component */}
              <ExchangeRates />
            </div>
          </div>
        </div>
      </div>
      
      {/* Rate Calculation Methodology Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Rate Calculation Methodology
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our exchange rates are calculated using sophisticated algorithms that combine multiple data sources 
              to ensure accuracy, transparency, and fair pricing for all GSDC conversions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Primary Data Sources */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                  style={{ backgroundColor: "#2a4661" }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Primary Data Sources</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                    style={{ backgroundColor: "#ed9030" }}
                  ></div>
                  <div>
                    <span className="font-medium text-gray-900">Central Bank Rates:</span>
                    <p className="text-gray-600 mt-1">Official exchange rates from major central banks worldwide, updated in real-time.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                    style={{ backgroundColor: "#ed9030" }}
                  ></div>
                  <div>
                    <span className="font-medium text-gray-900">Major Financial Institutions:</span>
                    <p className="text-gray-600 mt-1">Aggregated data from top-tier banks and financial service providers.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                    style={{ backgroundColor: "#ed9030" }}
                  ></div>
                  <div>
                    <span className="font-medium text-gray-900">Market Data Providers:</span>
                    <p className="text-gray-600 mt-1">Professional-grade feeds from Bloomberg, Reuters, and other market data vendors.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Calculation Process */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                  style={{ backgroundColor: "#2a4661" }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Calculation Process</h3>
              </div>
              <div className="space-y-6">
                <div className="border-l-4 pl-4" style={{ borderColor: "#ed9030" }}>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Data Aggregation</h4>
                  <p className="text-gray-600">Multiple rate sources are collected and validated every 30 seconds for accuracy and consistency.</p>
                </div>
                <div className="border-l-4 pl-4" style={{ borderColor: "#ed9030" }}>
                  <h4 className="font-semibold text-gray-900 mb-2">2. Weighted Average</h4>
                  <p className="text-gray-600">Sources are weighted based on reliability, volume, and market significance to calculate the base rate.</p>
                </div>
                <div className="border-l-4 pl-4" style={{ borderColor: "#ed9030" }}>
                  <h4 className="font-semibold text-gray-900 mb-2">3. Spread Application</h4>
                  <p className="text-gray-600">Competitive spreads are applied to cover operational costs while maintaining market-leading rates.</p>
                </div>
                <div className="border-l-4 pl-4" style={{ borderColor: "#ed9030" }}>
                  <h4 className="font-semibold text-gray-900 mb-2">4. Final Validation</h4>
                  <p className="text-gray-600">Automated systems validate rates against market boundaries and publish updates instantly.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Rate Formula */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white"
          >
            <h3 className="text-2xl font-semibold mb-6 text-center">Rate Calculation Formula</h3>
            <div className="text-center">
              <div className="bg-black/30 rounded-lg p-6 font-mono text-lg mb-6">
                <div className="mb-4">
                  <span style={{ color: "#ed9030" }}>GSDC Exchange Rate</span> = 
                </div>
                <div className="text-sm text-gray-300 space-y-2">
                  <div>( Σ (Source Rate × Weight) ) × (1 + Operational Spread)</div>
                  <div className="text-xs">where Σ Weight = 1.0</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: "#ed9030" }}>Source Weights</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>Central Banks: 40%</li>
                    <li>Major Banks: 35%</li>
                    <li>Market Data: 25%</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: "#ed9030" }}>Update Frequency</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>Data Collection: 30s</li>
                    <li>Rate Calculation: 60s</li>
                    <li>Publishing: Real-time</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: "#ed9030" }}>Operational Spread</h4>
                  <ul className="space-y-1 text-gray-300">
                    <li>Major Currencies: 0.1-0.3%</li>
                    <li>Minor Currencies: 0.3-0.8%</li>
                    <li>Exotic Currencies: 0.8-1.5%</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Additional Information Section with theme colors */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#ed9030" }}
              >
                <span className="text-2xl font-bold text-white">24/7</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Continuous Updates</h3>
              <p className="text-gray-400">
                Our systems provide round-the-clock rate updates ensuring you always have the latest market data.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(100deg, #e74134 0%, #f6b62e 100%)" }}
              >
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent Methodology</h3>
              <p className="text-gray-400">
                All exchange rates are calculated using our transparent basket methodology with full visibility.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#ed9030" }}
              >
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-400">
                Enterprise-grade security and reliability ensure consistent access to accurate rate information.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
