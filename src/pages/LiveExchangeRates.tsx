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
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Minimal volatility line chart - stable with low variance */}
                  <path
                    d="M4 16 L8 15.5 L12 16.25 L16 15.75 L20 16 L24 15.5 L28 16"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Stable data points showing minimal volatility */}
                  <circle cx="4" cy="16" r="1" fill="white" />
                  <circle cx="8" cy="15.5" r="1" fill="white" />
                  <circle cx="12" cy="16.25" r="1" fill="white" />
                  <circle cx="16" cy="15.75" r="1" fill="white" />
                  <circle cx="20" cy="16" r="1" fill="white" />
                  <circle cx="24" cy="15.5" r="1" fill="white" />
                  <circle cx="28" cy="16" r="1" fill="white" />
                  {/* Chart axes for context */}
                  <line x1="4" y1="22" x2="28" y2="22" stroke="white" strokeWidth="0.5" opacity="0.4" />
                  <line x1="4" y1="10" x2="4" y2="22" stroke="white" strokeWidth="0.5" opacity="0.4" />
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
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Steady upward trend line */}
                  <path
                    d="M4 24 L8 21 L12 18 L16 15 L20 12 L24 9 L28 6"
                    stroke="white"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Performance data points */}
                  <circle cx="4" cy="24" r="1.2" fill="white" />
                  <circle cx="12" cy="18" r="1.2" fill="white" />
                  <circle cx="20" cy="12" r="1.2" fill="white" />
                  <circle cx="28" cy="6" r="1.2" fill="white" />
                  {/* Upward arrow indicator */}
                  <path
                    d="M25 9 L28 6 L25 3"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M28 6 L23 6"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Chart grid for context */}
                  <line x1="4" y1="26" x2="28" y2="26" stroke="white" strokeWidth="0.5" opacity="0.3" />
                  <line x1="4" y1="4" x2="4" y2="26" stroke="white" strokeWidth="0.5" opacity="0.3" />
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
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Modern shield shape */}
                  <path
                    d="M16 3 C20 3 23 4 23 4 C23 4 23 11 23 16 C23 23 16 29 16 29 C16 29 9 23 9 16 C9 11 9 4 9 4 C9 4 12 3 16 3 Z"
                    fill="white"
                    stroke="none"
                  />
                  {/* Network nodes pattern for diversification */}
                  <circle cx="16" cy="11" r="1" fill="#ed9030" />
                  <circle cx="12" cy="15" r="0.8" fill="#ed9030" />
                  <circle cx="20" cy="15" r="0.8" fill="#ed9030" />
                  <circle cx="14" cy="19" r="0.8" fill="#ed9030" />
                  <circle cx="18" cy="19" r="0.8" fill="#ed9030" />
                  <circle cx="16" cy="22" r="0.7" fill="#ed9030" />
                  {/* Network connecting lines */}
                  <line x1="16" y1="11" x2="12" y2="15" stroke="#ed9030" strokeWidth="0.8" />
                  <line x1="16" y1="11" x2="20" y2="15" stroke="#ed9030" strokeWidth="0.8" />
                  <line x1="12" y1="15" x2="14" y2="19" stroke="#ed9030" strokeWidth="0.8" />
                  <line x1="20" y1="15" x2="18" y2="19" stroke="#ed9030" strokeWidth="0.8" />
                  <line x1="14" y1="19" x2="16" y2="22" stroke="#ed9030" strokeWidth="0.8" />
                  <line x1="18" y1="19" x2="16" y2="22" stroke="#ed9030" strokeWidth="0.8" />
                  {/* Checkmark for security validation */}
                  <path
                    d="M13 16 L15 18 L19 13"
                    stroke="#ed9030"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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