import { motion } from "framer-motion";
import {
  CheckIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

// Usage Slider Component
function UsageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const usageItems = [
    {
      icon: "🌍",
      title: "Global Remittances",
      description:
        "GSDC may be preferred as foreign portfolio into any of the currency within The Global South's basket adjustment portfolio by The Global South's Saving Model Account.",
      details:
        "Once GSDC is adopted/tested, it can be used like any other cryptocurrency.",
    },
    {
      icon: "🔒",
      title: "Secure Storage",
      description:
        "GSDC can be used in a grap decentralised and secure environment.",
      details:
        "In portfolio integrate with individual, exchange and wallets as currency supermundial.",
    },
    {
      icon: "📊",
      title: "Financial Analytics",
      description:
        "The Global South of business liquidity business business Reserves, without business model financial wealth. This plugs market/listed by private group or public Financial International Trade.",
      details: "GSDC measures in any countries.",
    },
    {
      icon: "🔄",
      title: "Cross-Border Trade",
      description:
        "Facilitate international trade with reduced fees and faster settlement times.",
      details:
        "Enable seamless global commerce with GSDC as the settlement currency.",
    },
    {
      icon: "🏛️",
      title: "Institutional Banking",
      description:
        "Provide institutional-grade banking services with transparent reserves.",
      details: "Support large-scale financial operations with regulatory compliance.",
    },
    {
      icon: "💱",
      title: "Currency Exchange",
      description: "Offer stable currency exchange without volatility risks.",
      details: "Maintain purchasing power across Global South currencies.",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide(
      (prev) => (prev + 1) % Math.ceil(usageItems.length / getItemsPerSlide()),
    );
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.ceil(usageItems.length / getItemsPerSlide())) %
        Math.ceil(usageItems.length / getItemsPerSlide()),
    );
  };

  const getItemsPerSlide = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024 ? 3 : 1;
    }
    return 3;
  };

  return (
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
            length: Math.ceil(usageItems.length / getItemsPerSlide()),
          }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {usageItems
                  .slice(
                    slideIndex * getItemsPerSlide(),
                    (slideIndex + 1) * getItemsPerSlide(),
                  )
                  .map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative group cursor-pointer"
                    >
                      {/* Card with gradient background matching the design */}
                      <div
                        className="rounded-2xl p-8 text-white h-full hover:scale-105 transition-transform duration-300 shadow-xl"
                        style={{
                          background: "linear-gradient(to top, white 50%, #446c93 50%)",
                          minHeight: "320px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {/* Icon Circle */}
                        <div className="absolute top-0 left-0 -mt-4 ml-4">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg"
                            style={{
                              background:
                                "linear-gradient(to bottom, #f6b62e, #e74134)",
                              border: "2px solid rgba(255,255,255,0.2)",
                            }}
                          >
                            {item.icon}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold mb-4 text-center text-black pt-8">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-700 text-sm leading-relaxed text-center mb-4">
                          {item.description}
                        </p>

                        {/* Details */}
                        <p className="text-gray-500 text-xs leading-relaxed text-center italic">
                          {item.details}
                        </p>

                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Desktop */}
      <div className="hidden lg:block">
        {Math.ceil(usageItems.length / 3) > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors duration-200 shadow-lg backdrop-blur-sm"
            >
              <svg
                className="w-6 h-6 text-gray-700"
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
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors duration-200 shadow-lg backdrop-blur-sm"
            >
              <svg
                className="w-6 h-6 text-gray-700"
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
      <div className="lg:hidden flex justify-center mt-8 space-x-2">
        {Array.from({ length: Math.ceil(usageItems.length / getItemsPerSlide()) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              currentSlide === index ? "bg-gray-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Bottom Description */}
      <div className="mt-12 max-w-4xl mx-auto text-center space-y-4">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-700 text-lg leading-relaxed"
        >
          By leveraging this diversc mix, GSDC reduces its reliance on any
          single currency (eg USD), thereby distributing risk across diverse
          economic regions.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-gray-700 text-lg leading-relaxed"
        >
          GSDC enables an adaptable to US dollar pegged cryptocurrencies (USDT,
          USDC, DAI, etc.), representing a perpetual and economic shift from
          full dollar-backed crypto assets in a BUS dollar dominated financial
          system.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-gray-700 text-lg leading-relaxed"
        >
          GSDC is an alternative to US dollar pegged cryptocurrencies (USDT,
          USDC, DAI, etc.), representing a paradigmatic and economic shift from
          full dollar-backed crypto assets in a US dollar dominated financial
          system.
        </motion.p>
      </div>
    </div>
  );
}

export default function About() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    // Here you would implement actual video playback logic
    console.log("Playing video...");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Exact Design Match */}
      <div
        className="relative overflow-hidden"
        style={{
          height: "140vh",
          backgroundImage: "url('/hero_why_gsdc.png')",
          backgroundSize: "cover",
          backgroundPosition: "left",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Background overlay with specified color and opacity */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#446c93",
            opacity: 0.7,
          }}
        ></div>

        {/* Top-left logo */}
        <div className="absolute top-8 left-8 z-20">
          <img
            src="/logo_gsdc_white.png"
            alt="GSDC Logo"
            className="h-12 opacity-90"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full" style={{ position: 'relative', top: "-5rem" }}>
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white space-y-8"
            >
              <div >
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl mb-4 leading-tight">
                  <span
                    className="font-bold"
                    style={{
                      background:
                        "linear-gradient(to right, #f6b62e 0%, #e74134 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    GSDC
                  </span>
                  <br />
                  <span
                    className="font-bold"
                    style={{
                      background:
                        "linear-gradient(to right, #f6b62e 0%, #e74134 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Beyond the Dollar
                  </span>
                </h1>
              </div>

              <div className="space-y-4 text-lg leading-relaxed">
                <p className="text-white/90">
                  A multi-currency stablecoin beyond the US Dollar,
                  collateralized by a basket of BRICS+ Real-World Assets held in
                  reserve.
                </p>
                <p className="text-white/90">
                  GSDC is created for financial sovereignty, stability and
                  inclusion.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 shadow-lg"
                style={{
                  background:
                    "linear-gradient(to bottom, #f6b62e 0%, #e74134 100%)",
                }}
              >
                WATCH VIDEO
              </motion.button>

              <p className="text-xs text-white/80">
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
                <div
                  className="rounded-full flex items-center justify-center relative"
                  style={{
                    width: "30rem",
                    height: "35rem",
                    right: "6rem",
                    top: "-3rem",
                  }}
                >
                  {/* Phone mockup positioned in the center-right */}
                  <div className="absolute right-8 top-12">
                    <motion.img
                      src="/mobile_why_gsdc.png"
                      alt="GSDC Mobile App"
                      className="transform rotate-12 drop-shadow-2xl"
                      style={{ width: "35rem", height: "35rem" }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    />
                  </div>

                  {/* Phoenix icon positioned at bottom right of circle */}
                  <div className="absolute bottom-8 right-8">
                    <motion.img
                      src="/logo_gsdc_icon.png"
                      alt="Phoenix Icon"
                      className="drop-shadow-lg"
                      style={{
                        width: "15rem",
                        height: "15rem",
                        right: "0",
                        position: "relative",
                        top: "10rem",
                      }}
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
      </div>

      {/* Video Section - Overlapping between hero and alternative sections */}
      <div className="relative z-30 mb-24" style={{ marginTop: "-18rem" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center"
          >
            <div
              className="relative video-container cursor-pointer group"
              onClick={handleVideoPlay}
            >
              {/* Animated red border */}
              <div className="absolute inset-0 rounded-2xl animate-pulse-border"></div>

              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl m-1"
                style={{ width: "70rem", height: "35rem" }}
              >
                {/* Video thumbnail background */}
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: "url('/headers/about_us_header.png')",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center shadow-xl group-hover:bg-white transition-all duration-300"
                  >
                    <PlayIcon className="w-10 h-10 text-gray-800 ml-1" />
                  </motion.div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* GSDC The Alternative Section - Updated Layout */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: "150vh",
          background:
            "linear-gradient(to bottom, #f8f9fa 0%, #f8f9fa 50%, #f59e0b 50%, #dc2626 100%)",
        }}
      >
        {/* Phoenix Icon - Bottom Left with larger size */}
        <div className="absolute bottom-8 left-8 z-10">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="h-48 w-48 opacity-90"
            style={{
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
            }}
          />
        </div>

        <div
          className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 pt-24"
          style={{ minHeight: "150vh" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full">
            {/* Left Content - GSDC The Alternative */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-lg flex flex-col justify-start pt-16"
            >
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-blue-600 mb-2">GSDC</h2>
                <h3 className="text-3xl font-bold text-blue-500 mb-6">
                  The Alternative
                </h3>
              </div>

              <div className="text-gray-700 space-y-4 text-base leading-relaxed">
                <p>
                  In our vision, GSDC will be issued on blockchains serving as a
                  cryptocurrency token.
                </p>
                <p>
                  Each GSDC issued token position will be equal to the sum of
                  each selected Global South currencies (CNY, INR, BRL, ZAR,
                  THB, EGP), and backed by a basket of BRICS+ Government bonds,
                  liquid securities, etc.)
                </p>
                <p>
                  held as reserves by institutional custodians selected by The
                  Global South SMA.
                </p>
              </div>
            </motion.div>

            {/* Right Content - All Feature Points Centered Together */}
            <div className="flex flex-col justify-center items-center h-full">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {[
                  "Multi-currency stability serving as backbone architecture",
                  "Collateralized by a basket of BRICS+ RWAs advancing US Dollar hegemony",
                  "Proof of Reserves & institutional-grade custody",
                  "Multi-chain compatibility",
                  "Low-cost, scalable transaction fees",
                  "Designed for remittances, DeFi, and international trade",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative flex items-center"
                  >
                    {/* Separate Small Ball Checkmark */}
                    <div className="absolute -left-3 z-10 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-gray-300">
                      <svg
                        className="w-3 h-3 text-gray-800"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    <div
                      className="text-white px-6 py-4 rounded-full shadow-lg border border-white/20 flex items-center ml-3"
                      style={{
                        background:
                          "linear-gradient(to right, #446c93 0%, #2a4661 100%)",
                        width: "100%",
                        maxWidth: "450px",
                      }}
                    >
                      <span className="text-sm font-medium leading-relaxed flex-1">
                        {feature}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Section - Slider with Cards */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #f8f9fa 0%, #f8f9fa 50%, #446c93 50%, #446c93 100%)",
        }}
      >
        {/* Usage Title */}
        <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-600 mb-8 inline-block px-3 py-1 rounded-md"
              style={{ backgroundColor: "rgba(230, 230, 230, 0.7)" }}
            >
              Usage
            </motion.h2>
          </div>
        </div>

        {/* Usage Cards Slider */}
        <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 pb-16">
          <UsageSlider />
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
              Addressing the $4 trillion Global South economy with innovative
              financial solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CurrencyDollarIcon,
                stat: "$4T+",
                label: "Global South GDP",
                description: "Representing over 40% of global economic output",
              },
              {
                icon: UserGroupIcon,
                stat: "5B+",
                label: "Population Served",
                description: "Billions of people seeking financial inclusion",
              },
              {
                icon: GlobeAltIcon,
                stat: "100+",
                label: "Countries",
                description:
                  "Emerging markets ready for digital transformation",
              },
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
                <div className="text-3xl font-bold text-white mb-2">
                  {item.stat}
                </div>
                <div className="text-lg font-semibold text-white/90 mb-2">
                  {item.label}
                </div>
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
                GSDC is more than a digital currency—it's a movement towards
                financial sovereignty for emerging economies. By leveraging
                blockchain technology and innovative economic design, we're
                building the infrastructure for the next generation of global
                finance.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: "Financial Inclusion",
                    description:
                      "Bringing banking services to the unbanked populations across emerging markets",
                  },
                  {
                    title: "Economic Stability",
                    description:
                      "Reducing dependency on volatile foreign currencies through diversified backing",
                  },
                  {
                    title: "Innovation Hub",
                    description:
                      "Creating opportunities for fintech innovation in developing economies",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20"
                  >
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h4>
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
                      <h4 className="text-white font-semibold">
                        Smart Contract Audits
                      </h4>
                      <p className="text-white/80 text-sm">
                        Independently audited smart contracts ensure maximum
                        security
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckIcon className="h-6 w-6 text-orange-300 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold">
                        Regulatory Compliance
                      </h4>
                      <p className="text-white/80 text-sm">
                        Built to meet international compliance standards
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <GlobeAltIcon className="h-6 w-6 text-orange-300 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold">
                        Global Standards
                      </h4>
                      <p className="text-white/80 text-sm">
                        Adhering to international financial regulations and best
                        practices
                      </p>
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
            <h2 className="text-2xl font-bold text-white mb-4">CONTACT GSDC</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Ready to be part of the financial revolution? Get in touch with
              our team to learn more about GSDC and how you can participate in
              the future of Global South finance.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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