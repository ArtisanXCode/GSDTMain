
import { motion } from "framer-motion";
import {
  GlobeAltIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
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
  return (
    <div className="bg-white">
      {/* Hero section with background image and color combination */}
      <div
        className="relative isolate text-white min-h-screen flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10, 20, 35, 0.95) 0%, rgba(20, 30, 48, 0.85) 30%, rgba(139, 69, 19, 0.7) 60%, rgba(255, 140, 0, 0.4) 85%, rgba(255, 165, 0, 0.3) 100%), url('/attached_assets/AdobeStock_1180220151_1752737711909.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for left and right sides, lighter in center */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/20 to-gray-900/90"></div>
        
        {/* Additional dark overlay for sky area */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-transparent to-gray-900/60"></div>

        {/* Orange globe/sphere pattern overlay */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3CradialGradient id='globe-gradient' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23FF8C00;stop-opacity:0.9'/%3E%3Cstop offset='40%25' style='stop-color:%23FF6B00;stop-opacity:0.7'/%3E%3Cstop offset='70%25' style='stop-color:%23FF4500;stop-opacity:0.5'/%3E%3Cstop offset='100%25' style='stop-color:%23000000;stop-opacity:0.2'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='150' cy='150' r='120' fill='url(%23globe-gradient)' stroke='%23FF6B00' stroke-width='2'/%3E%3Cpath d='M30,150 Q150,30 270,150 Q150,270 30,150' fill='none' stroke='%23FF8C00' stroke-width='2'/%3E%3Cpath d='M150,30 Q270,150 150,270 Q30,150 150,30' fill='none' stroke='%23FF8C00' stroke-width='2'/%3E%3Cline x1='150' y1='30' x2='150' y2='270' stroke='%23FF6B00' stroke-width='1.5'/%3E%3Cline x1='30' y1='150' x2='270' y2='150' stroke='%23FF6B00' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '600px 600px',
          }}
        />

        {/* Orange and yellow floating dots */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-80 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-90 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-gradient-to-r from-orange-300 to-yellow-300 rounded-full opacity-70 animate-pulse delay-2000"></div>
          <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full opacity-85 animate-pulse delay-3000"></div>
          <div className="absolute top-1/2 left-1/5 w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full opacity-75 animate-pulse delay-1500"></div>
          <div className="absolute bottom-1/3 right-1/5 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full opacity-80 animate-pulse delay-2500"></div>
          <div className="absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full opacity-70 animate-pulse delay-500"></div>
          <div className="absolute top-1/6 right-2/3 w-2.5 h-2.5 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full opacity-85 animate-pulse delay-3500"></div>
        </div>

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
                <span className="text-brand-orange">Digital Currency</span>
              </h1>
              <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
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

            {/* Exchange Rates Table */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Live Exchange Rates
                </h3>
                <span className="text-sm text-white/70">Last updated: Just now</span>
              </div>
              <ExchangeRatesList refreshInterval={30000} />
            </motion.div>
          </div>
        </motion.div>

        {/* 3D Globe Icon - Right Center */}
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2 opacity-20">
          <div className="w-96 h-96 relative">
            <div className="absolute inset-0 rounded-full border-4 border-orange-400/30 animate-spin-slow"></div>
            <div className="absolute inset-4 rounded-full border-2 border-orange-500/40 animate-pulse"></div>
            <div className="absolute inset-8 rounded-full border border-red-400/50"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Basket section */}
      <div className="bg-gray-50 py-24 sm:py-32 relative">
        {/* The Global South Logo/Icon */}
        <div className="absolute top-12 right-12">
          <img 
            src="/logo_gsdc_icon.png" 
            alt="The Global South" 
            className="h-32 w-auto opacity-80"
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold leading-7 text-gray-500 uppercase tracking-wide mb-2">
              CURRENCIES BASKET
            </h2>
            <p className="text-4xl font-extrabold tracking-tight text-brand-orange sm:text-5xl mb-4">
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
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 min-h-[140px] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {currency.symbol}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold mb-1 text-brand-orange">
                      {currency.code}
                    </h3>
                    <p className="text-white text-sm font-medium">
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
      <div className="bg-gradient-to-br from-blue-700 to-blue-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold leading-7 text-orange-300 uppercase tracking-wide mb-2">
              BENEFITS
            </h2>
            <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
              Why Choose GSDC?
            </p>
            <p className="text-lg leading-8 text-blue-100 max-w-2xl mx-auto">
              GSDC combines innovation with security, providing unmatched
              advantages for global financial operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-brand-orange to-brand-red rounded-2xl p-6 text-white h-full hover:scale-105 transition-transform duration-300"
              >
                <div className="mb-4">
                  <feature.icon
                    className="h-8 w-8 text-white"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-3">
                  {feature.name}
                </h3>
                <p className="text-orange-100 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-lg font-bold leading-7 text-brand-orange uppercase tracking-wider mb-4">
              TRUSTED BY USERS WORLDWIDE
            </h2>
            <p className="text-base leading-6 text-gray-600 max-w-lg mx-auto">
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
                <div className="text-5xl font-extrabold text-brand-orange mb-3">
                  {metric.stat}
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {metric.emphasis}
                </div>
                <div className="text-sm text-gray-600 font-regular">
                  {metric.rest}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate text-white min-h-[60vh] flex items-center bg-gradient-to-r from-brand-orange to-yellow-500">
        {/* The Global South Logo/Icon Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <img 
            src="/logo_gsdc_icon.png" 
            alt="The Global South" 
            className="h-64 w-auto"
          />
        </div>

        <motion.div
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 text-center z-10"
        >
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
