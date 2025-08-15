
import { motion } from 'framer-motion';
import { CheckIcon, ChartBarIcon, ShieldCheckIcon, GlobeAltIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative py-24 sm:py-32 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)",
        }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Phoenix Icon overlapping sections */}
        <div className="absolute top-16 right-8 z-20">
          <div className="phoenix-icon-parent">
            <img
              src="/logo_gsdc_icon.png"
              alt="Phoenix Icon"
              className="phoenix-icon-large opacity-20"
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                GSDC
              </h1>
              <p className="text-xl text-orange-300 font-semibold mb-4">
                Beyond the Dollar
              </p>
              <p className="text-lg leading-8 text-white/90 max-w-2xl mx-auto">
                Revolutionizing global finance with a currency designed for the Global South. 
                Transparent, stable, and backed by real assets.
              </p>
            </motion.div>
          </div>
        </div>
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
