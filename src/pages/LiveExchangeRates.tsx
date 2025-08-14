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
              GSDC Stability Analysis
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              Real-time benchmark analysis showing the stability of GSDC versus each 
              single currency in the basket composition.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Centered Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      {/* Main content section with updated design */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4"
              style={{ color: "#ed9030" }}
            >
              LIVE GSDC <br/> STABILITY DASHBOARD
            </p>
            <p className="text-lg leading-6 text-black max-w-4xl mx-auto font-regular">
              Interactive benchmark analysis comparing GSDC stability against individual basket currencies.
              <br />
              Monitor real-time performance and historical data to understand GSDC's 
              <br />
              diversification benefits and reduced volatility versus single currency exposure.
            </p>
          </div>

          {/* Exchange Rates Analysis with updated design */}
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

      {/* Methodology Section */}
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
              Stability Analysis Methodology
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our stability analysis provides comprehensive insights into GSDC's performance 
              relative to individual basket currencies, demonstrating the benefits of diversification.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Benchmark Analysis */}
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
                <h3 className="text-2xl font-semibold text-gray-900">Real-time Benchmarks</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Compare GSDC performance against each basket currency in real-time, 
                showing how diversification reduces single-currency risk.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• CNH (Chinese Yuan)</li>
                <li>• BRL (Brazilian Real)</li>
                <li>• INR (Indian Rupee)</li>
                <li>• ZAR (South African Rand)</li>
                <li>• IDR (Indonesian Rupiah)</li>
                <li>• THB (Thai Baht)</li>
              </ul>
            </motion.div>

            {/* Historical Performance */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                  style={{ backgroundColor: "#ed9030" }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Historical Analysis</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track GSDC stability over multiple time periods to demonstrate 
                consistent performance and reduced volatility.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• 3-month trending analysis</li>
                <li>• 6-month stability metrics</li>
                <li>• 1-year performance review</li>
                <li>• 2-year long-term stability</li>
              </ul>
            </motion.div>

            {/* Stability Metrics */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-8"
            >
              <div className="flex items-center mb-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                  style={{ backgroundColor: "#2a4661" }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Stability Metrics</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Quantitative measures of GSDC's stability compared to individual 
                currencies, proving the effectiveness of basket diversification.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Volatility reduction metrics</li>
                <li>• Price stability scoring</li>
                <li>• Diversification benefits</li>
                <li>• Risk-adjusted returns</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Benefits Summary */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">GSDC Stability Benefits</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover how GSDC's basket approach provides superior stability compared to single currency exposure
            </p>
          </div>

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
                <svg viewBox="0 0 64 64" className="w-8 h-8">
                  <defs>
                    <linearGradient id="volatilityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  {/* Minimal volatility line chart */}
                  <path
                    d="M8 32 L16 30 L24 31 L32 29 L40 30 L48 28 L56 29"
                    stroke="url(#volatilityGrad)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  <circle cx="16" cy="30" r="2" fill="white" fillOpacity="0.8" />
                  <circle cx="32" cy="29" r="2" fill="white" fillOpacity="0.8" />
                  <circle cx="48" cy="28" r="2" fill="white" fillOpacity="0.8" />
                  {/* -23% indicator */}
                  <text x="32" y="20" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">-23%</text>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lower Volatility</h3>
              <p className="text-gray-400">
                Reduced price volatility compared to individual basket currencies through diversification.
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
                style={{ backgroundColor: "#ed9030" }}
              >
                <svg viewBox="0 0 64 64" className="w-8 h-8">
                  <defs>
                    <linearGradient id="performanceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  {/* Steady upward trend line */}
                  <path
                    d="M8 48 L16 42 L24 36 L32 30 L40 24 L48 18 L56 12"
                    stroke="url(#performanceGrad)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Arrow indicator */}
                  <path
                    d="M50 18 L56 12 L50 6"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.9"
                  />
                  <path
                    d="M56 12 L46 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeOpacity="0.9"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Consistent Performance</h3>
              <p className="text-gray-400">
                Stable performance across different market conditions and economic cycles.
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
                <svg viewBox="0 0 64 64" className="w-8 h-8">
                  <defs>
                    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  {/* Modern shield shape */}
                  <path
                    d="M32 8 C38 8 44 10 44 10 C44 10 44 24 44 32 C44 44 32 56 32 56 C32 56 20 44 20 32 C20 24 20 10 20 10 C20 10 26 8 32 8 Z"
                    fill="url(#shieldGrad)"
                    stroke="none"
                  />
                  {/* Network nodes for diversification */}
                  <circle cx="32" cy="26" r="1.5" fill="white" fillOpacity="0.3" />
                  <circle cx="26" cy="32" r="1.2" fill="white" fillOpacity="0.3" />
                  <circle cx="38" cy="32" r="1.2" fill="white" fillOpacity="0.3" />
                  <circle cx="29" cy="38" r="1.2" fill="white" fillOpacity="0.3" />
                  <circle cx="35" cy="38" r="1.2" fill="white" fillOpacity="0.3" />
                  {/* Connecting lines */}
                  <line x1="32" y1="26" x2="26" y2="32" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
                  <line x1="32" y1="26" x2="38" y2="32" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
                  <line x1="26" y1="32" x2="29" y2="38" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
                  <line x1="38" y1="32" x2="35" y2="38" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
                  {/* Subtle checkmark */}
                  <path
                    d="M26 30 L30 34 L38 24"
                    stroke="white"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.9"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Risk Mitigation</h3>
              <p className="text-gray-400">
                Diversified exposure reduces single-currency risk and economic dependency.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}