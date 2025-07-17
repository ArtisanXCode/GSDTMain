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
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
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
                <span className="text-sm text-white/70">
                  Last updated: Just now
                </span>
              </div>
              <ExchangeRatesList refreshInterval={30000} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Centered Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-end">
        <div
          className=""
          style={{ position: "absolute", right: "10%", top: "-60px" }}
        >
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="w-32 h-32 sm:w-50 sm:h-50"
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
          background: "linear-gradient(to bottom, #446c93, #2a4661)",
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

          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl p-6 text-white h-full hover:scale-105 transition-transform duration-300 text-center"
                style={{
                  background: "linear-gradient(to bottom, #f6b62e, #e74134)",
                }}
              >
                <div className="mb-4 flex justify-center">
                  <feature.icon
                    className="h-12 w-12 text-white"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.name}</h3>
                <p className="text-white text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Mobile/Tablet Slider */}
          <div className="lg:hidden">
            <div className="overflow-x-auto">
              <div
                className="flex space-x-4 pb-4"
                style={{ width: "max-content" }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="rounded-2xl p-6 text-white hover:scale-105 transition-transform duration-300 text-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, #f6b62e, #e74134)",
                      width: "280px",
                      minHeight: "200px",
                    }}
                  >
                    <div className="mb-4 flex justify-center">
                      <feature.icon
                        className="h-12 w-12 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">
                      {feature.name}
                    </h3>
                    <p className="text-white text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
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