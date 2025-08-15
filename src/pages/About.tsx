
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div
        className="relative isolate text-white min-h-[90vh] flex items-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #1a2332 0%, #2d4a6b 50%, #1a2332 100%)`,
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full border border-orange-300"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border border-orange-400"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-orange-200"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
                GSDC
                <br />
                <span className="text-orange-400">Beyond the Dollar</span>
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mb-8">
                Empowering Global South economies through innovative blockchain technology. 
                A revolutionary stablecoin backed by a diversified basket of BRICS currencies.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/token-minting"
                  className="px-8 py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Get Started
                </Link>
                <Link
                  to="/transparency"
                  className="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/logo_gsdc_icon.png"
                  alt="GSDC Icon"
                  className="w-96 h-96 mx-auto"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Key Principles Section */}
      <div className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Principles</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              GSDC is built on fundamental principles that ensure stability, transparency, and economic empowerment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-600 text-white p-8 rounded-lg"
            >
              <h3 className="text-xl font-bold mb-4">Stability Through Diversification</h3>
              <p className="text-blue-100">
                Backed by a balanced basket of BRICS currencies, reducing single-currency volatility
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-600 text-white p-8 rounded-lg"
            >
              <h3 className="text-xl font-bold mb-4">Transparency & Trust</h3>
              <p className="text-green-100">
                Real-time visibility into reserves, circulation, and smart contract operations
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-600 text-white p-8 rounded-lg"
            >
              <h3 className="text-xl font-bold mb-4">Financial Inclusion</h3>
              <p className="text-purple-100">
                Providing access to stable digital currency for underbanked populations
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-orange-600 text-white p-8 rounded-lg"
            >
              <h3 className="text-xl font-bold mb-4">Economic Sovereignty</h3>
              <p className="text-orange-100">
                Reducing dependence on traditional Western financial systems
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <div className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Usage</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              GSDC enables seamless financial operations across Global South economies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cross-Border Payments</h3>
              <p className="text-gray-600">
                Enable instant, low-cost international transfers between BRICS nations without traditional banking delays
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-green-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trade Settlement</h3>
              <p className="text-gray-600">
                Facilitate international trade settlements with reduced currency risk and faster processing times
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-purple-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Store of Value</h3>
              <p className="text-gray-600">
                Protect wealth against individual currency volatility through diversified basket backing
              </p>
            </motion.div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 max-w-4xl mx-auto">
              By leveraging blockchain technology and smart contracts, GSDC provides a transparent, 
              auditable, and efficient alternative to traditional cross-border payment systems. 
              Our platform ensures that all transactions are recorded immutably while maintaining 
              compliance with international financial regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Market Opportunities */}
      <div className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Market Opportunities</h2>
            <p className="text-lg text-gray-600">
              Tap into the growing Global South economy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">$50T+ Economy</h3>
              <p className="text-gray-600">
                Combined GDP of BRICS nations represents over 40% of global population and growing economic power
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rapid Growth</h3>
              <p className="text-gray-600">
                Emerging markets showing consistent GDP growth rates exceeding developed economies
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Trade Volume</h3>
              <p className="text-gray-600">
                Increasing intra-BRICS trade creating demand for efficient payment solutions
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Infrastructure</h3>
              <p className="text-gray-600">
                Growing digital payment adoption and blockchain infrastructure development
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Policy Support</h3>
              <p className="text-gray-600">
                Government initiatives promoting de-dollarization and alternative payment systems
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation Hub</h3>
              <p className="text-gray-600">
                Leading technological advancement in fintech and blockchain solutions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global South Empowerment */}
      <div
        className="py-24 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #1a2332 0%, #2d4a6b 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full border border-orange-300"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border border-orange-400"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Empowering the Global South</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Building financial infrastructure for sustainable economic growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">3.2B+</div>
              <div className="text-white/80">People Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">5</div>
              <div className="text-white/80">BRICS Nations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">24/7</div>
              <div className="text-white/80">Global Operations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">100%</div>
              <div className="text-white/80">Transparent</div>
            </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">Built for Security and Trust</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-3">•</span>
                    <span>Smart contract audited by leading security firms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-3">•</span>
                    <span>Multi-signature governance for critical operations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-3">•</span>
                    <span>Real-time proof of reserves and transparency reporting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-3">•</span>
                    <span>Regulatory compliance across multiple jurisdictions</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <img
                  src="/logo_gsdc_icon.png"
                  alt="GSDC Security"
                  className="w-64 h-64 mx-auto opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div
        className="py-24 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #f6b62e 0%, #e74134 100%)`,
        }}
      >
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join the Future?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Experience the power of GSDC and be part of the Global South's financial revolution. 
            Start your journey towards financial sovereignty today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/token-minting"
              className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              Start Minting GSDC
            </Link>
            <Link
              to="/live-exchange-rates"
              className="px-8 py-4 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              View Live Rates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
