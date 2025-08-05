import { motion } from "framer-motion";
import {
  GlobeAltIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useState } from "react";
import ExchangeRatesList from "../components/ExchangeRatesList";

const features = [
  {
    name: "Global Accessibility",
    description:
      "Access GSDC markets from anywhere in the world with minimal barriers to entry.",
    icon: GlobeAltIcon,
  },
  {
    name: "Cost-Effective",
    description:
      "Reduce transaction costs and eliminate traditional banking fees.",
    icon: BanknotesIcon,
  },
  {
    name: "Instant Settlement",
    description: "Experience near-instantaneous cross-border settlements.",
    icon: ChartBarIcon,
  },
  {
    name: "Regulatory Compliance",
    description:
      "Built with compliance at its core, following all relevant regulations.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Advanced Technology",
    description:
      "Powered by cutting-edge blockchain technology for maximum security and efficiency.",
    icon: CogIcon,
  },
];

const currencies = [
  { code: "CNH", name: "Chinese Yuan", symbol: "¥" },
  { code: "THB", name: "Thailand Baht", symbol: "฿" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
];

const metrics = [
  { id: 1, stat: "10M+", emphasis: "GSDC", rest: "in circulation" },
  { id: 2, stat: "50+", emphasis: "Countries", rest: "supported" },
  { id: 3, stat: "99.9%", emphasis: "Uptime", rest: "guaranteed" },
  { id: 4, stat: "24/7", emphasis: "Support", rest: "available" },
];

export default function Home() {
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

  return (
    <div className="bg-white">
      {/* Hero section with background image and color combination */}
      <div
        className="relative isolate text-white min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/home_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Orange globe/sphere pattern overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "600px 600px",
          }}
        />

        {/* Orange and yellow floating dots */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-24 lg:py-32 z-10"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
                Global South
                <br />
                <span className="text-white-900">Digital Currency</span>
              </h1>
              <p className="text-lg leading-8 text-white/90 mb-10 font-bold">
                GSDC is a revolutionary stablecoin offering enhanced financial
                accessibility with innovative blockchain technology and
                real-world asset backing.
              </p>
              <div className="flex items-center gap-x-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-lg hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
                >
                  <Link to="/dashboard">Get started</Link>
                </motion.button>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="text-base font-semibold leading-6 text-white"
                >
                  <Link to="/about">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </motion.button>
              </div>
            </div>

            {/* Exchange Rates Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-sm"
            >
              <ExchangeRatesList refreshInterval={30000} variant="compact" />
            </motion.div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {currencies.map((currency, index) => (
              <motion.div
                key={currency.code}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl p-8 min-h-[140px] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center"
                style={{
                  background: "linear-gradient(to bottom, #6d97bf, #446c93)",
                }}
              >
                <div className="flex items-center space-x-4 w-full">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background:
                        "linear-gradient(to bottom, #f6b62e, #d46c00)",
                    }}
                  >
                    <span className="text-white font-bold text-lg">
                      {currency.code.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3
                      className="text-xl font-extrabold mb-1"
                      style={{ color: "#ed9030" }}
                    >
                      {currency.code}
                    </h3>
                    <p className="text-white text-sm font-medium opacity-90">
                      {currency.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
            <motion.button
              className="rounded-full bg-white px-8 py-4 text-base font-semibold text-brand-orange shadow-lg hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/dashboard">Get started</Link>
            </motion.button>
            <motion.button
              className="text-base font-semibold leading-6 text-white"
              whileHover={{ x: 5 }}
            >
              <Link to="/about">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
