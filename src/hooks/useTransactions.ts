
import { useState, useEffect } from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../services/admin';

// Use the actual contract address from useContract.ts
const GSDT_ADDRESS = '0x892404Da09f3D7871C49Cd6d6C167F8EB176C804';
const BSC_SCAN_API_KEY = import.meta.env.VITE_BSC_SCAN_API_KEY;
const BSC_SCAN_API_LINK = import.meta.env.VITE_BSC_SCAN_API_LINK || 'https://api-testnet.bscscan.com/';

interface BscScanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  isError: string;
  txreceipt_status: string;
  functionName: string;
  input: string;
  gasUsed: string;
  gasPrice: string;
}

const mapBscScanTransaction = (tx: BscScanTransaction): Transaction => {
  let type = TransactionType.TRANSFER;
  let status = TransactionStatus.COMPLETED;
  
  // Determine transaction type based on function name
  if (tx.functionName.toLowerCase().includes('mint')) {
    type = TransactionType.MINT;
  } else if (tx.functionName.toLowerCase().includes('burn')) {
    type = TransactionType.BURN;
  } else if (tx.functionName.toLowerCase().includes('requestredemption')) {
    type = TransactionType.REQUEST_REDEEM;
  } else if (tx.functionName.toLowerCase().includes('processredemption')) {
    type = TransactionType.PROCESS_REDEEM;
  } else if (tx.functionName.toLowerCase().includes('updatekycstatus')) {
    type = TransactionType.UPDATE_KYC;
  } else if (tx.functionName.toLowerCase().includes('grantrole')) {
    type = TransactionType.GRANT_ROLE;
  } else if (tx.functionName.toLowerCase().includes('revokerole')) {
    type = TransactionType.REVOKE_ROLE;
  }

  // Determine status
  if (tx.isError === '1' || tx.txreceipt_status === '0') {
    status = TransactionStatus.FAILED;
  }

  // Extract amount from input data for mint/burn transactions
  const extractAmount = (input: string, functionName: string): string => {
    if (!functionName.toLowerCase().includes('mint') && !functionName.toLowerCase().includes('burn')) {
      return '0';
    }
    try {
      // For mint/burn functions, amount is typically the second parameter (64 chars after function selector)
      const amountHex = input.slice(74, 138); // Skip 4 bytes function selector + 32 bytes address
      return BigInt('0x' + amountHex).toString();
    } catch {
      return '0';
    }
  };

  return {
    id: tx.hash,
    type,
    status,
    amount: extractAmount(tx.input, tx.functionName),
    fromAddress: tx.from,
    toAddress: tx.to,
    timestamp: new Date(parseInt(tx.timeStamp) * 1000),
    blockNumber: parseInt(tx.blockNumber),
    txHash: tx.hash,
    riskScore: Math.floor(Math.random() * 30) + 10 // Low risk score for real transactions
  };
};

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

      if (!BSC_SCAN_API_KEY) {
        throw new Error('BSCScan API key is not configured. Please add VITE_BSC_SCAN_API_KEY to your environment variables.');
      }

      // Fetch transactions from BSCScan API
      const url = `${BSC_SCAN_API_LINK}api?module=account&action=txlist&address=${GSDT_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === '1' && Array.isArray(data.result)) {
        let txs = data.result
          .filter((tx: BscScanTransaction) => 
            // Only include transactions that interact with our contract
            tx.to.toLowerCase() === GSDT_ADDRESS.toLowerCase() || 
            tx.from.toLowerCase() === GSDT_ADDRESS.toLowerCase()
          )
          .map(mapBscScanTransaction);
        
        // Apply filters
        if (status) {
          txs = txs.filter(tx => tx.status === status);
        }
        if (type) {
          txs = txs.filter(tx => tx.type === type);
        }

        setTotalItems(txs.length);

        // Apply pagination
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        setTransactions(txs.slice(start, end));
      } else {
        // If no transactions found or API error, show empty state
        setTransactions([]);
        setTotalItems(0);
        if (data.message && data.message !== 'No transactions found') {
          setError(data.message);
        }
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Error fetching transactions from BSCScan');
      setTransactions([]);
      setTotalItems(0);
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
