
import { motion } from "framer-motion";
import LiveExchangeRates from "../components/LiveExchangeRates";

export default function LiveExchangeRatesPage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div
        className="relative isolate text-white min-h-[60vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/dashboard_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-24 lg:py-32 z-10"
        >
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
              Live Exchange Rates
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-8 max-w-3xl mx-auto">
              Real-time GSDC exchange rates calculated from our basket of global south currencies. 
              Monitor live values across major international currencies.
            </p>
          </div>
          
          {/* Hero exchange rates display */}
          <div className="max-w-4xl mx-auto">
            <LiveExchangeRates variant="hero" showTitle={false} />
          </div>
        </motion.div>
      </div>

      {/* Detailed rates section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Complete Exchange Rates
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive view of GSDC rates against all supported currencies with detailed calculation methodology.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <LiveExchangeRates variant="default" showTitle={false} />
          </div>
        </div>
      </div>

      {/* Calculation methodology */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              How GSDC Rates Are Calculated
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                GSDC Basket Currencies
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-12 text-sm font-medium">CNH:</span>
                  <span>Chinese Yuan</span>
                </li>
                <li className="flex items-center">
                  <span className="w-12 text-sm font-medium">BRL:</span>
                  <span>Brazilian Real</span>
                </li>
                <li className="flex items-center">
                  <span className="w-12 text-sm font-medium">INR:</span>
                  <span>Indian Rupee</span>
                </li>
                <li className="flex items-center">
                  <span className="w-12 text-sm font-medium">ZAR:</span>
                  <span>South African Rand</span>
                </li>
                <li className="flex items-center">
                  <span className="w-12 text-sm font-medium">IDR:</span>
                  <span>Indonesian Rupiah</span>
                </li>
                <li className="flex items-center">
                  <span className="w-12 text-sm font-medium">THB:</span>
                  <span>Thai Baht</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Calculation Examples
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-900">GSDC/USD:</strong>
                  <p>CNH/USD + BRL/USD + INR/USD + ZAR/USD + IDR/USD + THB/USD</p>
                </div>
                <div>
                  <strong className="text-gray-900">GSDC/CNH:</strong>
                  <p>1 CNH + BRL/CNH + INR/CNH + ZAR/CNH + IDR/CNH + THB/CNH</p>
                </div>
                <div>
                  <strong className="text-gray-900">GSDC/BRL:</strong>
                  <p>1 BRL + CNH/BRL + INR/BRL + ZAR/BRL + IDR/BRL + THB/BRL</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
