import { motion } from "framer-motion";
import {
  GlobeAltIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LiveExchangeRates from "../components/LiveExchangeRates";
import { useWallet } from '../hooks/useWallet';
import { useAuth } from '../contexts/AuthContext';


// Import currency configuration from environment
import { EXCHANGE_RATE_CONFIG, CURRENCY_NAMES, CURRENCY_SYMBOLS } from "../config/api";

// Generate currencies array from environment configuration
const currencies = EXCHANGE_RATE_CONFIG.BASKET_CURRENCIES
  .filter(code => code !== 'USD') // Exclude USD from basket display
  .map(code => ({
    code,
    name: CURRENCY_NAMES[code] || code,
    symbol: CURRENCY_SYMBOLS[code] || code
  }));

const features = [
  {
    name: "Global Accessibility",
    description: "Access GSDC from anywhere in the world with seamless cross-border transactions and universal compatibility.",
    icon: GlobeAltIcon,
  },
  {
    name: "Stable Value",
    description: "Backed by a diversified basket of Global South currencies, providing stability and reducing volatility.",
    icon: BanknotesIcon,
  },
  {
    name: "Real-time Analytics",
    description: "Monitor exchange rates, transaction history, and market data with comprehensive analytics tools.",
    icon: ChartBarIcon,
  },
  {
    name: "Secure Platform",
    description: "Advanced security protocols and smart contract audits ensure your assets are protected at all times.",
    icon: ShieldCheckIcon,
  },
];

const metrics = [
  { id: 1, stat: "10M+", emphasis: "GSDC", rest: "in circulation" },
  { id: 2, stat: "50+", emphasis: "Countries", rest: "supported" },
  { id: 3, stat: "99.9%", emphasis: "Uptime", rest: "guaranteed" },
  { id: 4, stat: "24/7", emphasis: "Support", rest: "available" },
];

export default function Home() {
  const { isConnected } = useWallet();
  const { isAuthenticated } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string;
    totalSupply: string;
  } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  // Check for redirect message from protected routes
  useEffect(() => {
    if (location.state?.message) {
      setShowRedirectMessage(true);
      const timer = setTimeout(() => setShowRedirectMessage(false), 5000);
      return () => clearTimeout(timer);
    }

    // Auto-show login modal if redirected from protected route
    if (location.state?.showLogin && !isAuthenticated) {
      const timer = setTimeout(() => {
        const loginTrigger = document.querySelector('[data-login-trigger]') as HTMLButtonElement;
        if (loginTrigger) {
          loginTrigger.click();
        }
      }, 1000); // Small delay to ensure page is loaded
      return () => clearTimeout(timer);
    }
  }, [location.state, isAuthenticated]);

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath && isAuthenticated) {
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate]);


  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide(
      (prev) => (prev + 1) % Math.ceil(features.length / getItemsPerSlide()),
    );
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.ceil(features.length / getItemsPerSlide())) %
        Math.ceil(features.length / getItemsPerSlide()),
    );
  };

  const getItemsPerSlide = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024 ? 4 : 1;
    }
    return 4;
  };

  // Dynamically create displayCurrencies including USD and the rest
  const displayCurrencies = [
    { code: 'USD', name: CURRENCY_NAMES['USD'] || 'USD', symbol: CURRENCY_SYMBOLS['USD'] || '$' },
    ...currencies,
  ];


  return (
    <div className="bg-white">
      {/* Hero section with background image and color combination */}
      <div className="relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div
          className="min-h-screen bg-cover bg-center bg-no-repeat relative"
          style={{
            backgroundImage: "url('/headers/home_header.png')"
          }}
        >
          <div className="flex items-center justify-between h-screen px-4 lg:px-8 max-w-7xl mx-auto">
            {/* Left side content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white flex-1 max-w-2xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Global South Digital Coin
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              A stable, transparent, and accessible digital currency for the Global South
            </p>

              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-400 rounded-lg">
                  <p className="text-lg font-semibold mb-2">
                    {showRedirectMessage ? '🚫 Authentication Required' : '🔒 Full Platform Access Requires Login'}
                  </p>
                  <p className="text-sm opacity-90">
                    {showRedirectMessage
                      ? location.state?.message || 'Please log in to access this page'
                      : 'Login to access live exchange rates, token minting, transaction history, and all platform features'
                    }
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={isAuthenticated ? "/dashboard" : "/"}
                    onClick={!isAuthenticated ? (e) => {
                      e.preventDefault();
                      // This will trigger the login modal via the header component
                      document.querySelector('[data-login-trigger]')?.click();
                    } : undefined}
                    className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:shadow-2xl transition-all duration-300"
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Login to Get Started'}
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/about"
                    className="inline-block px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right side Live Exchange Rates */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block flex-1 max-w-lg ml-8"
            >
              {/* Dynamically pass the first 8 currencies to LiveExchangeRates */}
              <LiveExchangeRates variant="hero" showTitle={true} currencies={displayCurrencies.slice(0, 8)} />
            </motion.div>
          </div>
        </div>
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

      {/* Currency Basket section */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold leading-7 text-gray-600 uppercase tracking-wide mb-2">
              CURRENCIES BASKET
            </h2>
            <p
              className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4"
              style={{ color: "#ed9030" }}
            >
              BACKED BY GSDC CURRENCIES
            </p>
            <p className="text-lg leading-6 text-gray-600 max-w-2xl mx-auto font-regular">
              GSDC is pegged to a basket of global south currencies,
              <br />
              providing stability and diversification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {currencies.map((currency, index) => {
              // Currency information for detailed view
              const currencyInfo = {
                CNY: {
                  fact: "Managed by PBOC, the yuan has shown notable stability amid global volatility, backed by robust FX reserves and disciplined policy.",
                  inclusion: "China's economy is the world's second largest, making CNY essential for Global South trade stability and BRICS cooperation.",
                  stability: "High",
                  volatility: "1.2%",
                  region: "East Asia"
                },
                RUB: {
                  fact: "The Russian ruble has historically been volatile but remains a key BRICS currency with significant energy sector backing.",
                  inclusion: "Russia's vast natural resources and BRICS leadership make RUB important for Global South economic independence, though currently excluded due to sanctions.",
                  stability: "Medium",
                  volatility: "3.8%",
                  region: "Eastern Europe"
                },
                THB: {
                  fact: "Seen as one of Southeast Asia's most stable currencies, the baht benefits from strong fundamentals and low volatility.",
                  inclusion: "Thailand's strategic position in ASEAN and stable monetary policy make THB a reliable anchor for regional stability.",
                  stability: "High",
                  volatility: "1.4%",
                  region: "Southeast Asia"
                },
                INR: {
                  fact: "Historically low volatility (~1.8% annually), with RBI interventions smoothing movement—even amid recent tariff-driven pressure.",
                  inclusion: "India's massive population and growing economy make INR crucial for representing Global South demographic and economic weight.",
                  stability: "High",
                  volatility: "1.8%",
                  region: "South Asia"
                },
                BRL: {
                  fact: "Despite 2024-25 volatility driven by fiscal stress, the Brazilian real offers strong yield carry (Selic ~15%). Its rebound and liquidity make it a high-return, emerging-market anchor for GSDC.",
                  inclusion: "Brazil's leadership in Latin America and strong agricultural exports provide diversification and commodity exposure to the basket.",
                  stability: "Medium",
                  volatility: "2.8%",
                  region: "South America"
                },
                ZAR: {
                  fact: "The South African rand is typically volatile—sensitive to oil prices and external shocks—but remains highly liquid in BRICS markets, offering diversification and upside during carry-trade flows.",
                  inclusion: "South Africa's role as Africa's most developed economy and BRICS founding member makes ZAR essential for continental representation.",
                  stability: "Medium",
                  volatility: "3.2%",
                  region: "Southern Africa"
                },
                IDR: {
                  fact: "The Indonesian rupiah has seen cycles of depreciation—like in 2024 reaching ~17K per USD—but interventions and stable policy have supported long-term stability in Southeast Asia.",
                  inclusion: "Indonesia's position as the world's fourth most populous country and largest Southeast Asian economy provides crucial demographic diversity.",
                  stability: "Medium",
                  volatility: "2.5%",
                  region: "Southeast Asia"
                }
              };

              const info = currencyInfo[currency.code];

              return (
                <motion.div
                  key={currency.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative min-h-[280px] perspective-1000 group"
                >
                  {/* Card Container with flip animation */}
                  <div className="relative w-full h-full transform-style-preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
                    
                    {/* Front Side */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#f6b62e] to-[#e74134]"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
                      
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-12 -translate-x-12"></div>
                      </div>
                      
                      <div className="relative p-6 h-full min-h-[280px] flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 border border-white/30">
                              <span className="text-white font-bold text-xl">
                                {currency.code.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-1">
                                {currency.code}
                              </h3>
                              <p className="text-white/90 text-sm font-medium">
                                {currency.name}
                              </p>
                            </div>
                          </div>
                          
                          {/* Flip indicator */}
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-white/80 text-xs uppercase tracking-wider font-semibold">
                            {info?.region}
                          </div>
                          <div className="text-white/80 text-xs">
                            Hover for details →
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div className="absolute inset-0 w-full backface-hidden rounded-3xl shadow-xl rotate-y-180 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-gray-900 to-slate-900"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
                      
                      <div className="relative p-6 h-full min-h-[280px] flex flex-col">
                        <div className="flex items-center space-x-3 mb-4 flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {currency.code.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {currency.code}
                            </h4>
                            <p className="text-white/60 text-xs">
                              {currency.name}
                            </p>
                          </div>
                        </div>

                        {/* Scrollable content area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                            <div className="bg-white/10 rounded-lg p-2">
                              <p className="text-white/60 text-xs font-medium">Stability</p>
                              <p className={`text-sm font-bold ${
                                info?.stability === 'High' ? 'text-green-400' : 
                                info?.stability === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {info?.stability}
                              </p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-2">
                              <p className="text-white/60 text-xs font-medium">Volatility</p>
                              <p className="text-white text-sm font-bold">
                                {info?.volatility}
                              </p>
                            </div>
                          </div>

                          {/* Key fact */}
                          <div className="bg-white/5 rounded-lg p-3 flex-shrink-0">
                            <h5 className="text-white/80 text-xs font-semibold mb-2 uppercase tracking-wide">
                              📊 Key Insight
                            </h5>
                            <p className="text-white/70 text-xs leading-relaxed">
                              {info?.fact}
                            </p>
                          </div>

                          {/* Why included */}
                          <div className="bg-white/5 rounded-lg p-3 flex-shrink-0">
                            <h5 className="text-white/80 text-xs font-semibold mb-2 uppercase tracking-wide">
                              🎯 GSDC Role
                            </h5>
                            <p className="text-white/70 text-xs leading-relaxed">
                              {info?.inclusion}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sanctions Disclaimer */}
        <div className="mt-12 max-w-5xl mx-auto bg-white rounded-lg p-6 border border-gray-300 shadow-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-gray-900">Important Notice:</strong> Regrettably due to both primary and secondary sanctions imposed by the U.S. Office of Foreign Assets Control (OFAC) and the European External Action Service (EEAS), we were unable to include the Russian Ruble (RUB) and Russian Federation securities (Government Bonds) in the currency basket and reserves. We look forward to a resolution of this situation in the future. In the interim, for anyone wishing to access a Russian stablecoin we suggest A5A7, a Russian ruble pegged stablecoin, accessible at the following link:{" "}
            <a 
              href="https://www.a7a5.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 underline font-medium"
            >
              https://www.a7a5.io/
            </a>
          </p>
        </div>
      </div>

      {/* Benefits section */}
      <div
        className="py-24 sm:py-32"
        style={{
          background: "linear-gradient(to bottom, #2a4661 65%, #ffffff 50%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold leading-7 text-white uppercase tracking-wide mb-2">
              BENEFITS
            </h2>
            <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
              Why Choose GSDC?
            </p>
            <p className="text-lg leading-8 text-white max-w-2xl mx-auto">
              GSDC is backed by a basket of real-world assets (RWAs)
              <br />
              providing stability and diversification
            </p>
          </div>

          {/* Responsive Slider */}
          <div className="relative">
            {/* Slider Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {Array.from({
                  length: Math.ceil(features.length / getItemsPerSlide()),
                }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {features
                        .slice(
                          slideIndex * getItemsPerSlide(),
                          (slideIndex + 1) * getItemsPerSlide(),
                        )
                        .map((feature, index) => (
                          <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="rounded-3xl p-8 lg:p-6 text-white h-full hover:scale-105 transition-transform duration-300 text-center mx-4 lg:mx-0"
                            style={{
                              background:
                                "linear-gradient(to bottom, #f6b62e, #e74134)",
                              minHeight: "280px",
                            }}
                          >
                            <div className="mb-6 flex justify-center">
                              <feature.icon
                                className="h-32 w-32 lg:h-24 lg:w-24 text-white"
                                aria-hidden="true"
                              />
                            </div>
                            <h3 className="text-xl lg:text-lg font-semibold mb-4 lg:mb-3">
                              {feature.name}
                            </h3>
                            <p className="text-white text-base lg:text-sm leading-relaxed">
                              {feature.description}
                            </p>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows - Desktop */}
            <div className="hidden lg:block">
              {Math.ceil(features.length / 4) > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors duration-200"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors duration-200"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Navigation Dots - Mobile */}
            <div className="lg:hidden flex justify-center mt-6 space-x-2">
              {Array.from({ length: features.length }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 aspect-square rounded-full transition-colors duration-200 ${
                    currentSlide === index ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl font-bold leading-7 uppercase tracking-wider mb-4"
              style={{ color: "#ed9030" }}
            >
              TRUSTED BY USERS WORLDWIDE
            </h2>
            <p className="text-lg leading-6 text-gray-600 max-w-lg mx-auto">
              Join the growing community of GSDC
              <br />
              users and experience the future of digital currency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className="text-5xl font-extrabold mb-3"
                  style={{
                    background: "linear-gradient(to bottom, #f6b62e, #e95533)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {metric.stat}
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {metric.emphasis}
                </div>
                <div className="text-base text-gray-600 font-regular">
                  {metric.rest}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="relative isolate text-white min-h-[60vh] flex items-center"
        style={{
          background: "radial-gradient(circle, #e74134 0%, #f6b62e 100%)",
        }}
      >
        {/* The Global South Logo/Icon Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo_gsdc_icon.png"
            alt="The Global South"
            className="h-[30rem] w-auto"
          />
        </div>

        <motion.div className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 text-center z-10">
          <motion.h1
            className="text-4xl font-extrabold tracking-tight mb-6 sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Ready to get started?
          </motion.h1>
          <motion.p
            className="text-lg leading-8 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Join the GSDC ecosystem today and experience the future of digital
            currency.
          </motion.p>
          <div className="flex items-center justify-center gap-x-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={isAuthenticated ? "/dashboard" : "/"}
                onClick={!isAuthenticated ? (e) => {
                  e.preventDefault();
                  // This will trigger the login modal via the header component
                  document.querySelector('[data-login-trigger]')?.click();
                } : undefined}
                className="rounded-full bg-white px-8 py-4 text-base font-semibold text-brand-orange shadow-lg hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Login to Get Started'}
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ x: 5 }}
            >
              <Link
                to="/about"
                className="text-base font-semibold leading-6 text-white"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}