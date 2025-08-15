
import { motion } from 'framer-motion';
import { CheckIcon, ChartBarIcon, ShieldCheckIcon, GlobeAltIcon, CurrencyDollarIcon, UserGroupIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function About() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    console.log('Playing video...');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Exact Design Match */}
      <div className="relative overflow-hidden min-h-screen bg-black">
        {/* Top-left logo */}
        <div className="absolute top-8 left-8 z-20">
          <img
            src="/logo_gsdc_white.png"
            alt="GSDC Logo"
            className="h-12 opacity-90"
          />
        </div>

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Flowing wave lines background */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 800" className="w-full h-full">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {[...Array(20)].map((_, i) => (
              <motion.path
                key={i}
                d={`M0,${400 + i * 10} Q300,${350 + i * 5} 600,${400 + i * 10} T1200,${400 + i * 10}`}
                stroke="url(#waveGradient)"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: i * 0.1 }}
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white space-y-8"
            >
              <div>
                <h1 className="text-6xl font-bold tracking-tight leading-tight mb-6">
                  <span 
                    className="font-bold"
                    style={{
                      background: "linear-gradient(135deg, #f6b62e 0%, #fbbf24 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    GSDC
                  </span>
                  <br />
                  <span className="text-white">Beyond the </span>
                  <span 
                    className="font-bold"
                    style={{
                      background: "linear-gradient(135deg, #e74134 0%, #dc2626 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    Dollar
                  </span>
                </h1>
              </div>
              
              <div className="space-y-4 text-lg leading-relaxed max-w-lg">
                <p className="text-white/90">
                  A multi-currency stablecoin beyond the US Dollar, collateralized by a basket of BRICS+ Real-World Assets held in reserve.
                </p>
                <p className="text-white/90">
                  GSDC is created for financial sovereignty, stability and inclusion.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                }}
              >
                WATCH VIDEO
              </motion.button>

              <p className="text-xs text-white/50">
                Our early access and opinions are not financial advice.
              </p>
            </motion.div>

            {/* Right Content - 3D Sphere and Phone Layout */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              {/* 3D Sphere with wire frame effect */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotateY: 360,
                    rotateX: [0, 10, 0, -10, 0]
                  }}
                  transition={{ 
                    rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                    rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-80 h-80 relative"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%),
                      radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      conic-gradient(from 0deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05))
                    `,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    filter: 'blur(0.5px)'
                  }}
                >
                  {/* Wire frame lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
                    {[...Array(12)].map((_, i) => (
                      <g key={i}>
                        <motion.circle
                          cx="160"
                          cy="160"
                          r={40 + i * 15}
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="0.5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, delay: i * 0.1 }}
                        />
                        <motion.line
                          x1="160"
                          y1="0"
                          x2="160"
                          y2="320"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="0.5"
                          transform={`rotate(${i * 15} 160 160)`}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, delay: i * 0.05 }}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Floating particles inside sphere */}
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-40"
                      style={{
                        left: `${30 + Math.random() * 40}%`,
                        top: `${30 + Math.random() * 40}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                    />
                  ))}
                </motion.div>

                {/* Floating Phone with Fire Effect */}
                <motion.div
                  initial={{ opacity: 0, y: 20, rotateZ: -15 }}
                  animate={{ 
                    opacity: 1, 
                    y: [0, -10, 0], 
                    rotateZ: [-15, -10, -15],
                    rotateY: [0, 5, 0]
                  }}
                  transition={{ 
                    opacity: { duration: 0.8, delay: 0.5 },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute -right-20 top-10 z-10"
                >
                  {/* Phone Container */}
                  <div className="relative w-32 h-56 bg-gradient-to-br from-gray-800 to-black rounded-2xl p-1 shadow-2xl">
                    {/* Phone Screen with Fire Effect */}
                    <div 
                      className="w-full h-full rounded-xl overflow-hidden relative"
                      style={{
                        background: `
                          radial-gradient(circle at center, #ff4500 0%, #ff6b00 20%, #ff8c00 40%, #000 70%),
                          linear-gradient(45deg, #ff0000, #ff4500, #ffa500)
                        `
                      }}
                    >
                      {/* Fire animation overlay */}
                      <div className="absolute inset-0">
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                              background: `radial-gradient(circle, #ff${Math.random() > 0.5 ? '45' : 'ff'}00, transparent)`,
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                              y: [0, -30]
                            }}
                            transition={{
                              duration: Math.random() * 2 + 1,
                              repeat: Infinity,
                              delay: Math.random() * 2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Phone reflection */}
                    <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  </div>
                </motion.div>

                {/* Phoenix Icon with Fire Trail */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: [1, 1.1, 1],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    opacity: { duration: 0.8, delay: 0.8 },
                    scale: { duration: 2, repeat: Infinity },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute -bottom-16 -right-16 z-20"
                >
                  <div className="relative">
                    {/* Fire trail effect */}
                    <div className="absolute inset-0 -z-10">
                      {[...Array(15)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-4 h-4 rounded-full"
                          style={{
                            background: `radial-gradient(circle, rgba(255,${100 + i * 10},0,0.8), transparent)`,
                            left: `${i * 3}px`,
                            top: `${i * 2}px`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 0.8, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Phoenix icon with gradient */}
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                      style={{
                        background: "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                      }}
                    >
                      <img
                        src="/logo_gsdc_icon.png"
                        alt="Phoenix Icon"
                        className="w-12 h-12 drop-shadow-lg"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* The Alternative Section */}
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                The Alternative
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                GSDC represents a paradigm shift in digital currency design. Unlike traditional 
                stablecoins pegged to a single currency, GSDC is backed by a carefully curated 
                basket of Global South currencies, providing unprecedented stability and 
                diversification for emerging markets.
              </p>
              
              <div className="space-y-4">
                {[
                  "Multi-currency backing reduces volatility",
                  "Transparent reserve management",
                  "Built for Global South economies",
                  "Regulatory compliant framework"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
                <img
                  src="/headers/about_us_header.png"
                  alt="Global South representation"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <h3 className="text-xl font-semibold text-white mb-4">
                  Empowering Global South
                </h3>
                <p className="text-gray-300">
                  Our mission is to create financial infrastructure that serves the unique 
                  needs of emerging economies worldwide.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Design
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built on cutting-edge technology with transparency and security at its core
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ChartBarIcon,
                title: "Stability Through Diversity",
                description: "Multi-currency basket reduces single-point-of-failure risks and provides superior stability compared to single-currency pegs."
              },
              {
                icon: ShieldCheckIcon,
                title: "Transparent Operations",
                description: "Real-time proof of reserves and open-source smart contracts ensure complete transparency in all operations."
              },
              {
                icon: GlobeAltIcon,
                title: "Global Accessibility",
                description: "Designed specifically for Global South markets with localized support and regulatory compliance."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900 rounded-xl p-8 hover:shadow-lg transition-shadow border border-gray-800"
              >
                <feature.icon className="h-12 w-12 text-orange-500 mb-6" />
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div 
        className="py-16 relative"
        style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              CONTACT GSDC
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Ready to be part of the financial revolution? Get in touch with our team 
              to learn more about GSDC and how you can participate in the future of Global South finance.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Get in Touch
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
