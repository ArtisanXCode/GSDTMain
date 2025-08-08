import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, LinkIcon } from '@heroicons/react/24/outline';
import { GSDC_ADDRESS, GSDC_ABI } from '../contracts/GSDC';
import { useReserves } from '../hooks/useReserves';
import { formatCurrency } from '../services/reserves';

interface CirculationData {
  network: string;
  address: string;
  supply: string;
  holders: number;
  explorer: string;
}

export default function Transparency() {
  const [circulationData, setCirculationData] = useState<CirculationData[]>([]);
  const { data: reservesData, loading: reservesLoading, error: reservesError } = useReserves();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCirculationData();
  }, []);

  const fetchCirculationData = async () => {
    try {
      // Mock circulation data - replace with actual blockchain API calls when available
      setCirculationData([
        {
          network: 'Ethereum',
          address: GSDC_ADDRESS,
          supply: '1,000,000',
          holders: 1,
          explorer: 'https://etherscan.io/token/'+GSDC_ADDRESS
        },
        {
          network: 'BSC Testnet',
          address: GSDC_ADDRESS,
          supply: '500,000',
          holders: 25,
          explorer: 'https://testnet.bscscan.com/token/'+GSDC_ADDRESS
        }
      ]);
    } catch (error) {
      console.error('Error fetching circulation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reserveAssets = reservesData?.reserves || [];
  const reserveSummary = reservesData?.summary;

  const totalReserveValue = reserveAssets.reduce((sum, asset) => 
    sum + parseFloat(asset.value_usd.replace(/,/g, '')), 0
  );

  const totalCirculation = circulationData.reduce((sum, data) => 
    sum + parseFloat(data.supply.replace(/,/g, '')), 0
  );

  // Calculate backing ratio from summary or fallback calculation
  const backingRatio = reserveSummary?.backing_ratio 
    ? parseFloat(reserveSummary.backing_ratio) * 100
    : totalCirculation > 0 ? (totalReserveValue / totalCirculation) * 100 : 100;

  if (loading || reservesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transparency data...</p>
        </div>
      </div>
    );
  }

  if (reservesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading reserve data: {reservesError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/about_us_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              Transparency
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              Real-time visibility into GSDC circulation and reserve composition
            </p>
          </div>
        </motion.div>
      </div>

      {/* Phoenix Icon */}
      <div className="relative z-20 flex justify-end">
        <div className="phoenix-icon-parent">
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* GSDC Circulation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="rounded-2xl shadow-lg overflow-hidden">
              <div
                className="p-8"
                style={{ background: "linear-gradient(to bottom, #446c93, #6d97bf)" }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">GSDC in Circulation</h2>
                <p className="text-white/80">
                  Total supply across all supported networks
                </p>
              </div>

              <div
                className="p-8"
                style={{ backgroundColor: "#2a4661" }}
              >
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-sm text-white/80 mb-2">Total Circulation</div>
                    <div className="text-3xl font-bold" style={{ color: "#ed9030" }}>
                      {totalCirculation.toLocaleString()} GSDC
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-sm text-white/80 mb-2">Networks</div>
                    <div className="text-3xl font-bold" style={{ color: "#ed9030" }}>
                      {circulationData.length}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-sm text-white/80 mb-2">Total Holders</div>
                    <div className="text-3xl font-bold" style={{ color: "#ed9030" }}>
                      {circulationData.reduce((sum, data) => sum + data.holders, 0)}
                    </div>
                  </div>
                </div>

                {/* Network Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Network Distribution</h3>
                  {circulationData.map((data, index) => (
                    <div key={index} className="bg-white/10 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{data.network}</h4>
                          <p className="text-white/70 text-sm font-mono">{data.address}</p>
                        </div>
                        <a
                          href={data.explorer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 hover:text-orange-300 flex items-center space-x-1"
                        >
                          <LinkIcon className="h-4 w-4" />
                          <span className="text-sm">Explorer</span>
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="text-white/70 text-sm">Supply</div>
                          <div className="text-white font-semibold text-lg">{data.supply} GSDC</div>
                        </div>
                        <div>
                          <div className="text-white/70 text-sm">Holders</div>
                          <div className="text-white font-semibold text-lg">{data.holders}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reserves and Audit Reports Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl shadow-lg overflow-hidden">
              <div
                className="p-8"
                style={{ background: "linear-gradient(to bottom, #446c93, #6d97bf)" }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">Reserves & Audit Reports</h2>
                <p className="text-white/80">
                  Detailed breakdown of reserve assets backing GSDC tokens
                </p>
              </div>

              <div
                className="p-8"
                style={{ backgroundColor: "#2a4661" }}
              >
                {/* Reserve Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-sm text-white/80 mb-2">Total Reserves</div>
                    <div className="text-3xl font-bold" style={{ color: "#ed9030" }}>
                      ${reserveSummary?.total_value_usd ? formatCurrency(reserveSummary.total_value_usd) : totalReserveValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-sm text-white/80 mb-2">Backing Ratio</div>
                    <div className="text-3xl font-bold text-green-400">
                      {backingRatio.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-sm text-white/80 mb-2">Last Updated</div>
                    <div className="text-3xl font-bold" style={{ color: "#ed9030" }}>
                      {reserveSummary?.last_updated 
                        ? new Date(reserveSummary.last_updated).toLocaleDateString()
                        : new Date().toLocaleDateString()
                      }
                    </div>
                  </div>
                </div>

                {/* Reserve Assets */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Reserve Composition</h3>
                  {reserveAssets.length === 0 ? (
                    <div className="bg-white/10 rounded-lg p-8 text-center">
                      <p className="text-white/70">No reserve assets available at this time.</p>
                      <p className="text-white/50 text-sm mt-2">Reserve data will be updated as assets are added by administrators.</p>
                    </div>
                  ) : (
                    reserveAssets.map((asset) => (
                      <div key={asset.id} className="bg-white/10 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{asset.symbol} - {asset.name}</h4>
                            <p className="text-white/70 text-sm">Custodian: {asset.custodian}</p>
                          </div>
                          {asset.audit_url && (
                            <a
                              href={asset.audit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-400 hover:text-orange-300 flex items-center space-x-1"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              <span className="text-sm">Audit Report</span>
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <div className="text-white/70 text-sm">Amount</div>
                            <div className="text-white font-semibold text-lg">
                              {formatCurrency(asset.amount)} {asset.symbol}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/70 text-sm">USD Value</div>
                            <div className="text-white font-semibold text-lg">
                              ${formatCurrency(asset.value_usd)}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/70 text-sm">Last Updated</div>
                            <div className="text-white font-semibold text-lg">
                              {new Date(asset.last_updated).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-6 bg-white/5 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">Transparency Commitment</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    All reserve assets are held off-chain with regulated custodians and are subject to regular third-party audits. 
                    Audit reports are published monthly and made available for public download. Reserve composition is updated 
                    regularly by our administrators to ensure full transparency and maintain the highest standards of accountability.
                    {reserveAssets.length > 0 && (
                      <span className="block mt-2">
                        Current reserves are backed at {backingRatio.toFixed(2)}% with total reserves of ${formatCurrency(totalReserveValue.toString())}.
                      </span>
                    )}
                  </p>
                </div>
              </div>

                {/* Reserve Assets */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Reserve Composition</h3>
                  {reserveAssets.length === 0 ? (
                    <div className="bg-white/10 rounded-lg p-8 text-center">
                      <p className="text-white/70">No reserve assets available at this time.</p>
                      <p className="text-white/50 text-sm mt-2">Reserve data will be updated as assets are added by administrators.</p>
                    </div>
                  ) : (
                    reserveAssets.map((asset) => (
                      <div key={asset.id} className="bg-white/10 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{asset.symbol} - {asset.name}</h4>
                            <p className="text-white/70 text-sm">Custodian: {asset.custodian}</p>
                          </div>
                          {asset.audit_url && (
                            <a
                              href={asset.audit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-400 hover:text-orange-300 flex items-center space-x-1"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              <span className="text-sm">Audit Report</span>
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <div className="text-white/70 text-sm">Amount</div>
                            <div className="text-white font-semibold text-lg">
                              {formatCurrency(asset.amount)} {asset.symbol}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/70 text-sm">USD Value</div>
                            <div className="text-white font-semibold text-lg">
                              ${formatCurrency(asset.value_usd)}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/70 text-sm">Last Updated</div>
                            <div className="text-white font-semibold text-lg">
                              {new Date(asset.last_updated).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-6 bg-white/5 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">Transparency Commitment</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    All reserve assets are held off-chain with regulated custodians and are subject to regular third-party audits. 
                    Audit reports are published monthly and made available for public download. Reserve composition is updated 
                    regularly by our administrators to ensure full transparency and maintain the highest standards of accountability.
                    {reserveAssets.length > 0 && (
                      <span className="block mt-2">
                        Current reserves are backed at {backingRatio.toFixed(2)}% with total reserves of ${formatCurrency(totalReserveValue.toString())}.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}