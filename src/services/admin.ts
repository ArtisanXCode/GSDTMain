import { ethers } from 'ethers';
import { supabase } from '../lib/supabase';
import { SMART_CONTRACT_ROLES, SmartContractRole } from '../constants/roles';

// Re-export everything from the modular admin services
export * from './admin/types';
export * from './admin/roles';
export * from './admin/transactions';

// Transaction types for monitoring
export enum TransactionType {
  MINT = 'MINT',
  REDEEM = 'REDEEM',
  TRANSFER = 'TRANSFER',
  FIAT_DEPOSIT = 'FIAT_DEPOSIT'
}

// Transaction status
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FLAGGED = 'FLAGGED'
}

// Interface definitions
export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  fromAddress: string;
  toAddress: string;
  timestamp: Date;
  blockNumber: number;
  txHash: string;
  riskScore?: number;
  flags?: string[];
}

export interface FiatDeposit {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: string;
  timestamp: Date;
  verificationDocument?: string;
}

// Generate mock transactions
const generateMockTransactions = (count: number): Transaction[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    type: Object.values(TransactionType)[Math.floor(Math.random() * 4)],
    status: Object.values(TransactionStatus)[Math.floor(Math.random() * 4)],
    amount: ethers.utils.parseEther((Math.random() * 1000).toFixed(2)).toString(),
    fromAddress: `0x${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
    toAddress: `0x${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    blockNumber: 12345678 + i,
    txHash: `0x${Math.random().toString(36).substring(2, 10)}`,
    riskScore: Math.floor(Math.random() * 100)
  }));
};

// Generate mock deposits
const generateMockDeposits = (count: number): FiatDeposit[] => {
  const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
  const paymentMethods = ['Bank Transfer', 'Credit Card', 'Wire Transfer', 'SEPA'];

  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    userId: `0x${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
    amount: Math.floor(Math.random() * 10000),
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    status: TransactionStatus.PENDING,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
  }));
};

// Mock data
const mockTransactions = generateMockTransactions(50); // Generate 50 mock transactions
const mockDeposits = generateMockDeposits(20); // Generate 20 mock deposits

// Admin API functions
export const useTransactions = (
  status?: TransactionStatus,
  type?: TransactionType,
  currentPage = 1,
  pageSize = 10
) => {
  // Filter transactions based on status and type
  const filteredTransactions = mockTransactions
    .filter(tx => !status || tx.status === status)
    .filter(tx => !type || tx.type === type);

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const pagination = {
    currentPage,
    totalPages: Math.ceil(filteredTransactions.length / pageSize),
    totalItems: filteredTransactions.length,
    pageSize
  };

  return {
    transactions: paginatedTransactions,
    pagination,
    isLoading: false,
    refresh: () => {} // Mock refresh function
  };
};

export const useFiatDeposits = (status?: TransactionStatus) => {
  // Filter deposits based on status
  const filteredDeposits = mockDeposits
    .filter(deposit => !status || deposit.status === status);

  return {
    deposits: filteredDeposits,
    isLoading: false,
    refresh: () => {} // Mock refresh function
  };
};

export const approveFiatDeposit = async (depositId: string) => {
  console.log('Approving deposit:', depositId);
  return true;
};

export const rejectFiatDeposit = async (depositId: string, reason: string) => {
  console.log('Rejecting deposit:', depositId, 'Reason:', reason);
  return true;
};

export const flagTransaction = async (txId: string, reason: string) => {
  console.log('Flagging transaction:', txId, 'Reason:', reason);
  return true;
};

// Fraud detection helpers
export const calculateRiskScore = (tx: Transaction): number => {
  let score = 0;

  // Amount-based risk
  const amount = parseFloat(ethers.utils.formatEther(tx.amount));
  if (amount > 100000) score += 30;
  else if (amount > 10000) score += 20;
  else if (amount > 1000) score += 10;

  // Time-based risk (unusual hours)
  const hour = new Date(tx.timestamp).getHours();
  if (hour < 6 || hour > 22) score += 10;

  return Math.min(score, 100);
};

export const getFraudDetectionFlags = (tx: Transaction): string[] => {
  const flags: string[] = [];
  const amount = parseFloat(ethers.utils.formatEther(tx.amount));

  // Large transaction amount
  if (amount > 100000) flags.push('LARGE_AMOUNT');

  // Unusual hours
  const hour = new Date(tx.timestamp).getHours();
  if (hour < 6 || hour > 22) flags.push('UNUSUAL_HOURS');

  return flags;
};

// Use smart contract roles - export both for compatibility
export const AdminRole = SMART_CONTRACT_ROLES;
export type AdminRole = SmartContractRole;

// For backward compatibility, also export individual role values
export const SUPER_ADMIN = SMART_CONTRACT_ROLES.SUPER_ADMIN_ROLE;
export const MINTER = SMART_CONTRACT_ROLES.MINTER_ROLE;
export const BURNER = SMART_CONTRACT_ROLES.BURNER_ROLE;
export const PAUSER = SMART_CONTRACT_ROLES.PAUSER_ROLE;
export const PRICE_UPDATER = SMART_CONTRACT_ROLES.PRICE_UPDATER_ROLE;
export const BLACKLIST_MANAGER = SMART_CONTRACT_ROLES.BLACKLIST_MANAGER_ROLE;
export const APPROVER = SMART_CONTRACT_ROLES.APPROVER_ROLE;