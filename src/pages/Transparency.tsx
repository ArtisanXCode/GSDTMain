import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, LinkIcon } from '@heroicons/react/24/outline';
import { GSDC_ADDRESS, GSDC_ABI } from '../contracts/GSDC';

interface CirculationData {
  network: string;
  address: string;
  supply: string;
  holders: number;
  explorer: string;
}

interface ReserveAsset {
  id: string;
  asset_type: string;
  amount: string;
  value_usd: string;
  custodian: string;
  last_updated: string;
  audit_report_url?: string;
}

export default function Transparency() {
  const [circulationData, setCirculationData] = useState<CirculationData[]>([]);
  const [reserveAssets, setReserveAssets] = useState<ReserveAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransparencyData();
  }, []);

  const fetchTransparencyData = async () => {
    try {
      // Mock data for now - replace with actual API calls
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

      setReserveAssets([
        {
          id: '1',
          asset_type: 'USDC',
          amount: '10,000,000',
          value_usd: '10,000,000',
          custodian: 'Fireblocks',
          last_updated: '2025-01-15',
          audit_report_url: '/audits/fireblocks-usdc-2025-01.pdf'
        },
        {
          id: '2',
          asset_type: 'USDT',
          amount: '5,000,000',
          value_usd: '5,000,000',
          custodian: 'Coinbase Custody',
          last_updated: '2025-01-15',
          audit_report_url: '/audits/coinbase-usdt-2025-01.pdf'
        },
        {
          id: '3',
          asset_type: 'Cash Equivalents',
          amount: '2,000,000',
          value_usd: '2,000,000',
          custodian: 'Traditional Bank',
          last_updated: '2025-01-15',
          audit_report_url: '/audits/bank-cash-2025-01.pdf'
        }
      ]);
    } catch (error) {
      console.error('Error fetching transparency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalReserveValue = reserveAssets.reduce((sum, asset) => 
    sum + parseFloat(asset.value_usd.replace(/,/g, '')), 0
  );

  const totalCirculation = circulationData.reduce((sum, data) => 
    sum + parseFloat(data.supply.replace(/,/g, '')), 0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transparency data...</p>
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
                      ${totalReserveValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-sm text-white/80 mb-2">Backing Ratio</div>
                    <div className="text-3xl font-bold text-green-400">
                      {totalCirculation > 0 ? ((totalReserveValue / totalCirculation) * 100).toFixed(2) : '100.00'}%
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="text-sm text-white/80 mb-2">Last Updated</div>
                    <div className="text-3xl font-bold" style={{ color: "#ed9030" }}>
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Reserve Assets */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Reserve Composition</h3>
                  {reserveAssets.map((asset) => (
                    <div key={asset.id} className="bg-white/10 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{asset.asset_type}</h4>
                          <p className="text-white/70 text-sm">Custodian: {asset.custodian}</p>
                        </div>
                        {asset.audit_report_url && (
                          <a
                            href={asset.audit_report_url}
                            download
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
                          <div className="text-white font-semibold text-lg">{asset.amount}</div>
                        </div>
                        <div>
                          <div className="text-white/70 text-sm">USD Value</div>
                          <div className="text-white font-semibold text-lg">${asset.value_usd}</div>
                        </div>
                        <div>
                          <div className="text-white/70 text-sm">Last Updated</div>
                          <div className="text-white font-semibold text-lg">{asset.last_updated}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-6 bg-white/5 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">Transparency Commitment</h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    All reserve assets are held off-chain with regulated custodians and are subject to regular third-party audits. 
                    Audit reports are published monthly and made available for public download. Reserve composition is updated 
                    in real-time to ensure full transparency and maintain the highest standards of accountability.
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