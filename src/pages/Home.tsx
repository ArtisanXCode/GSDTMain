import { motion } from 'framer-motion';
import { ArrowPathIcon, CloudArrowUpIcon, LockClosedIcon, ChartBarIcon, CurrencyDollarIcon, ShieldCheckIcon, GlobeAltIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import ExchangeRatesList from '../components/ExchangeRatesList';

const features = [
  {
    name: 'Global Accessibility',
    description: 'Access GSDC markets from anywhere in the world with minimal barriers to entry.',
    icon: GlobeAltIcon,
  },
  {
    name: 'Cost-Effective',
    description: 'Reduce transaction costs and eliminate traditional banking fees.',
    icon: BanknotesIcon,
  },
  {
    name: 'Instant Settlement',
    description: 'Experience near-instantaneous cross-border settlements.',
    icon: ChartBarIcon,
  },
  {
    name: 'Regulatory Compliance',
    description: 'Built with compliance at its core, following all relevant regulations.',
    icon: ShieldCheckIcon,
  },
];

const currencies = [
  { code: 'CNH', name: 'Chinese Yuan', weight: '30%', color: 'bg-orange-500' },
  { code: 'RUB', name: 'Russian Ruble', weight: '20%', color: 'bg-orange-500' },
  { code: 'INR', name: 'Indian Rupee', weight: '20%', color: 'bg-orange-500' },
  { code: 'BRL', name: 'Brazilian Real', weight: '15%', color: 'bg-orange-500' },
  { code: 'ZAR', name: 'South African Rand', weight: '10%', color: 'bg-orange-500' },
  { code: 'IDR', name: 'Indonesian Rupiah', weight: '5%', color: 'bg-orange-500' },
];

const metrics = [
  { id: 1, stat: '10M+', emphasis: 'GSDC', rest: 'in circulation' },
  { id: 2, stat: '50+', emphasis: 'Countries', rest: 'supported' },
  { id: 3, stat: '99.9%', emphasis: 'Uptime', rest: 'guaranteed' },
  { id: 4, stat: '24/7', emphasis: 'Support', rest: 'available' },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div 
        className="relative isolate text-white min-h-[80vh] flex items-center"
        style={{
          backgroundImage: `url('/AdobeStock_1180220151_1751887222070.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#1a0f0a',
        }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-orange-500/30 via-red-600/50 to-black/90"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-24 lg:py-32"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                Global South<br />
                Digital Currency
              </h1>
              <p className="text-lg leading-8 text-gray-200 mb-10">
                GSDC is a revolutionary stablecoin offering enhanced financial accessibility with innovative blockchain technology and real-world asset backing.
              </p>
              <div className="flex items-center gap-x-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  <Link to="/dashboard">Get Started</Link>
                </motion.button>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="text-sm font-semibold leading-6 text-white"
                >
                  <Link to="/about">Learn more <span aria-hidden="true">→</span></Link>
                </motion.button>
              </div>
            </div>

            {/* Exchange Rates Table */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Live Exchange Rates</h3>
              <ExchangeRatesList refreshInterval={30000} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Currency Basket section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold leading-7 text-orange-600 uppercase tracking-wide mb-2">CURRENCIES BASKET</h2>
            <p className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              BACKED BY GSDC CURRENCIES
            </p>
            <p className="text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              GSDC is backed by a basket of global south currencies, providing stability and diversification for enhanced financial security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {currencies.map((currency, index) => (
              <motion.div
                key={currency.code}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{currency.code.slice(0, 2)}</span>
                  </div>
                  <span className="text-2xl font-bold">{currency.weight}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{currency.code}</h3>
                <p className="text-blue-100 text-sm">{currency.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="bg-slate-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold leading-7 text-orange-400 uppercase tracking-wide mb-2">BENEFITS</h2>
            <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Why Choose GSDC?
            </p>
            <p className="text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
              GSDC combines innovation with security, providing unmatched advantages for global financial operations.
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
                className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white"
              >
                <div className="mb-4">
                  <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.name}</h3>
                <p className="text-orange-100 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold leading-7 text-orange-600 uppercase tracking-wide mb-2">TRUSTED BY USERS WORLDWIDE</h2>
            <p className="text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Join the growing community of GSDC users and experience the future of digital currency
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-orange-500 mb-2">{metric.stat}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{metric.emphasis}</div>
                <div className="text-gray-600">{metric.rest}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div 
        className="relative py-24 sm:py-32"
        style={{
          background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg leading-8 text-orange-100 max-w-2xl mx-auto mb-10">
              Join the GSDC ecosystem today and experience the future of digital currency.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Link to="/dashboard">Get Started</Link>
              </motion.button>
              <motion.button
                whileHover={{ x: 5 }}
                className="text-sm font-semibold leading-6 text-white"
              >
                <Link to="/contact">Contact us <span aria-hidden="true">→</span></Link>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Footer CTA */}
      <div 
        className="relative text-white py-16"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(234, 88, 12, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%), url('/AdobeStock_1318098135_1751881690402.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
      </div>
    </div>
  );
}