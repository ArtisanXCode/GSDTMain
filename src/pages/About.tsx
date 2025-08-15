
import { motion } from 'framer-motion';
import { CheckIcon, ChartBarIcon, ShieldCheckIcon, GlobeAltIcon, CurrencyDollarIcon, UserGroupIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function About() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    // Here you would implement actual video playback logic
    console.log('Playing video...');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Exact Design Match */}
      <div 
        className="relative overflow-hidden min-h-screen"
        style={{
          backgroundImage: "url('/hero-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Top-left logo */}
        <div className="absolute top-8 left-8 z-20">
          <img
            src="/logo_gsdc_white.png"
            alt="GSDC Logo"
            className="h-12 opacity-90"
          />
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
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl mb-4 leading-tight">
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
              
              <div className="space-y-4 text-lg leading-relaxed">
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
                className="px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                }}
              >
                WATCH VIDEO
              </motion.button>

              <p className="text-xs text-white/60">
                Our early access and opinions are not financial advice.
              </p>
            </motion.div>

            {/* Right Content - Phone and Phoenix Icon Layout */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              {/* Large circular background with dotted border */}
              <div className="relative">
                {/* Outer dotted circle */}
                <div className="w-96 h-96 rounded-full border-2 border-dotted border-white/30 flex items-center justify-center relative">
                  
                  {/* Phone mockup positioned in the center-right */}
                  <div className="absolute right-8 top-12">
                    <motion.img
                      src="/phone-mockup.png"
                      alt="GSDC Mobile App"
                      className="w-40 h-auto transform rotate-12 drop-shadow-2xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    />
                  </div>
                  
                  {/* Phoenix icon positioned at bottom right of circle */}
                  <div className="absolute bottom-8 right-8">
                    <motion.img
                      src="/phoenix-icon.png"
                      alt="Phoenix Icon"
                      className="w-16 h-16 drop-shadow-lg"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Video Thumbnail Section - Positioned at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="relative w-80 h-48 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
               onClick={handleVideoPlay}>
            {/* Video thumbnail background */}
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: "url('/headers/about_us_header.png')"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-xl group-hover:bg-white transition-all duration-300"
              >
                <PlayIcon className="w-8 h-8 text-gray-800 ml-1" />
              </motion.div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </motion.div>
      </div>

      {/* The Alternative Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Alternative
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
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
                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
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
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <img
                  src="/headers/about_us_header.png"
                  alt="Global South representation"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Empowering Global South
                </h3>
                <p className="text-gray-600">
                  Our mission is to create financial infrastructure that serves the unique 
                  needs of emerging economies worldwide.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Design
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Opportunities Section */}
      <div 
        className="py-24 sm:py-32 relative"
        style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Market Opportunities
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Addressing the $4 trillion Global South economy with innovative financial solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CurrencyDollarIcon,
                stat: "$4T+",
                label: "Global South GDP",
                description: "Representing over 40% of global economic output"
              },
              {
                icon: UserGroupIcon,
                stat: "5B+",
                label: "Population Served",
                description: "Billions of people seeking financial inclusion"
              },
              {
                icon: GlobeAltIcon,
                stat: "100+",
                label: "Countries",
                description: "Emerging markets ready for digital transformation"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
              >
                <item.icon className="h-12 w-12 text-white mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-2">{item.stat}</div>
                <div className="text-lg font-semibold text-white/90 mb-2">{item.label}</div>
                <p className="text-sm text-white/80">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Empowering the Global South Section */}
      <div 
        className="py-24 sm:py-32 relative"
        style={{
          background: "linear-gradient(to bottom, #1e40af, #1e3a8a)",
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Phoenix Icon */}
        <div className="absolute bottom-16 right-8 z-20">
          <div className="phoenix-icon-parent">
            <img
              src="/logo_gsdc_icon.png"
              alt="Phoenix Icon"
              className="phoenix-icon-large opacity-30"
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Empowering the Global South
              </h2>
              <p className="text-lg text-white/90 mb-8 leading-relaxed">
                GSDC is more than a digital currency—it's a movement towards financial 
                sovereignty for emerging economies. By leveraging blockchain technology 
                and innovative economic design, we're building the infrastructure for 
                the next generation of global finance.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    title: "Financial Inclusion",
                    description: "Bringing banking services to the unbanked populations across emerging markets"
                  },
                  {
                    title: "Economic Stability",
                    description: "Reducing dependency on volatile foreign currencies through diversified backing"
                  },
                  {
                    title: "Innovation Hub",
                    description: "Creating opportunities for fintech innovation in developing economies"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-white/80 text-sm">{item.description}</p>
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
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Built for Security and Compliance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <ShieldCheckIcon className="h-6 w-6 text-orange-300 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold">Smart Contract Audits</h4>
                      <p className="text-white/80 text-sm">Independently audited smart contracts ensure maximum security</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckIcon className="h-6 w-6 text-orange-300 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold">Regulatory Compliance</h4>
                      <p className="text-white/80 text-sm">Built to meet international compliance standards</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <GlobeAltIcon className="h-6 w-6 text-orange-300 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold">Global Standards</h4>
                      <p className="text-white/80 text-sm">Adhering to international financial regulations and best practices</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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

      {/* Bottom Logo Section */}
      <div 
        className="py-12"
        style={{
          background: "linear-gradient(to bottom, #1e3a8a, #1e40af)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <img
            src="/logo_gsdc_white.png"
            alt="GSDC Logo"
            className="h-16 mx-auto opacity-80"
          />
        </div>
      </div>
    </div>
  );
}
