
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
              Complete Exchange Rates
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              Comprehensive view of GSDC rates against all supported currencies with detailed 
              calculation methodology.
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

      {/* Main content section with theme background */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4"
              style={{ color: "#ed9030" }}
            >
              REAL-TIME GSDC <br/> EXCHANGE RATES
            </p>
            <p className="text-lg leading-6 text-black max-w-2xl mx-auto font-regular">
              Stay updated with live exchange rates for GSDC against major global currencies.
              <br />
              Our transparent methodology ensures accurate and reliable pricing information
              <br />
              for all your trading and investment decisions.
            </p>
          </div>

          {/* Exchange Rates Component */}
          <ExchangeRates />
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
