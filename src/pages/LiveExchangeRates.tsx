
import React from 'react';
import { motion } from 'framer-motion';
import ExchangeRates from '../components/ExchangeRates';

export default function LiveExchangeRatesPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div
        className="relative isolate text-white min-h-[40vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-16 z-10"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
                <span className="text-sm font-medium text-white/90">Live Market Data</span>
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              GSDC Exchange Rates
            </h1>
            <p className="text-xl leading-8 text-white/90 mb-8 max-w-3xl mx-auto">
              Real-time exchange rates for GSDC against major global currencies with 
              comprehensive market analysis and calculation transparency.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 text-sm text-white/80"
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span>Live Updates</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>8 Currency Pairs</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span>Real-time Data</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Exchange Rates Component */}
      <ExchangeRates />
      
      {/* Additional Information Section */}
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
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">24/7</span>
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
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
