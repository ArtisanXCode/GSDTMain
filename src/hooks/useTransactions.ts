import { useState, useEffect } from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../services/admin';

// Mock transaction data generator
const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const types = [TransactionType.MINT, TransactionType.BURN, TransactionType.TRANSFER, TransactionType.REDEEM];
  const statuses = [TransactionStatus.COMPLETED, TransactionStatus.PENDING, TransactionStatus.FAILED];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = (Math.random() * 10000).toFixed(0);
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    transactions.push({
      id: `tx_${i + 1}`,
      type,
      status,
      amount: amount,
      fromAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      toAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      timestamp,
      blockNumber: Math.floor(Math.random() * 1000000),
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      riskScore: Math.floor(Math.random() * 100)
    });
  }
  
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const mockTransactions = generateMockTransactions(50);

interface UseTransactionsProps {
  address?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  page?: number;
  pageSize?: number;
}

export const useTransactions = (props: UseTransactionsProps = {}) => {
  const {
    status,
    type,
    page = 1,
    pageSize = 10
  } = props;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredTransactions = [...mockTransactions];
      
      // Apply filters
      if (status) {
        filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
      }
      if (type) {
        filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
      }

      setTotalItems(filteredTransactions.length);

      // Apply pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setTransactions(filteredTransactions.slice(start, end));
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Error fetching transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [status, type, page, pageSize]);

  return {
    transactions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      pageSize
    },
    isLoading: loading,
    error,
    refresh: fetchTransactions
  };
};