
import { motion } from 'framer-motion';
import { Transaction, TransactionStatus } from '../../services/admin';
import { format } from 'date-fns';
import { utils } from 'ethers';

const bscscan_explorer_link = import.meta.env.VITE_BSC_SCAN_EXPLORER_LINK;
const GSDC_DECIMALS = parseInt(import.meta.env.VITE_GSDC_DECIMALS || '18');

// Helper function to format token amount
const formatTokenAmount = (amount: string): string => {
  try {
    if (!amount || amount === '0') return '0.00';
    const divisor = Math.pow(10, GSDC_DECIMALS);
    const formattedAmount = (parseFloat(amount) / divisor).toFixed(2);
    return formattedAmount;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0.00';
  }
};

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const getStatusBadgeClass = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/80">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/20">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Transaction Hash</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {transactions.map((tx) => (
            <motion.tr
              key={tx.txHash}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-white/5"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {tx.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {formatTokenAmount(tx.amount)} GSDC
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                <a
                  href={`${bscscan_explorer_link}address/${tx.fromAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-300 hover:text-orange-100"
                >
                  {tx.fromAddress.slice(0, 6)}...{tx.fromAddress.slice(-4)}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                <a
                  href={`${bscscan_explorer_link}address/${tx.toAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-300 hover:text-orange-100"
                >
                  {tx.toAddress.slice(0, 6)}...{tx.toAddress.slice(-4)}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                {format(tx.timestamp, 'MMM d, yyyy HH:mm')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(tx.status)}`}>
                  {tx.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                <a
                  href={`${bscscan_explorer_link}tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-300 hover:text-orange-100"
                >
                  {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                </a>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
