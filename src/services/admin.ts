import { ethers } from 'ethers';
import { supabase } from '../lib/supabase';

// Re-export everything from the modular admin services
export * from './admin/types';
export * from './admin/roles';
export * from './admin/transactions';

// Import AdminRole directly for use in this file
import { AdminRole } from './admin/types';

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

// Import SMART_CONTRACT_ROLES for mock data
import { SMART_CONTRACT_ROLES } from '../constants/roles';

// Mock admin users for testing purposes (replace with actual data fetching if needed)
const mockAdminUsers = [
  { user_address: '0x1234567890abcdef1234567890abcdef12345678', role: SMART_CONTRACT_ROLES.SUPER_ADMIN },
  { user_address: '0xabcdef1234567890abcdef1234567890abcdef12', role: SMART_CONTRACT_ROLES.ADMIN },
];

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

// Admin role functions

export const getUserRole = async (address: string): Promise<AdminRole | null> => {
  try {
    // Validate address format
    if (!address || typeof address !== 'string') {
      return null;
    }

    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_address', address.toLowerCase())
      .maybeSingle(); // Use maybeSingle to handle no results gracefully

    if (error) {
      // Log error but don't treat "no rows found" as a critical error
      if (error.code !== 'PGRST116') {
        console.error('Database error in getUserRole:', error);
      }

      // Return mock role for testing
      const mockUser = mockAdminUsers.find(user => user.user_address.toLowerCase() === address.toLowerCase());
      return mockUser?.role || null;
    }

    // Return the role if found, null if not found
    return data?.role as AdminRole || null;
  } catch (error) {
    console.error('Error fetching user role:', error);

    // Return mock role for testing
    const mockUser = mockAdminUsers.find(user => user.user_address.toLowerCase() === address.toLowerCase());
    return mockUser?.role || null;
  }
};

export const assignUserRole = async (address: string, role: AdminRole): Promise<void> => {
  try {
    // Validate address and role
    if (!address || typeof address !== 'string' || !role) {
      console.error('Invalid input for assignUserRole');
      return;
    }

    // Check if user already has a role
    const { data: existingRole } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_address', address.toLowerCase())
      .maybeSingle();

    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from('admin_roles')
        .update({ role })
        .eq('id', existingRole.id);

      if (error) {
        console.error('Error updating user role:', error);
      }
    } else {
      // Insert new role
      const { error } = await supabase
        .from('admin_roles')
        .insert({ user_address: address.toLowerCase(), role });

      if (error) {
        console.error('Error assigning user role:', error);
      }
    }
  } catch (error) {
    console.error('Error assigning user role:', error);
  }
};

export const removeUserRole = async (address: string): Promise<void> => {
  try {
    // Validate address
    if (!address || typeof address !== 'string') {
      console.error('Invalid input for removeUserRole');
      return;
    }

    const { error } = await supabase
      .from('admin_roles')
      .delete()
      .eq('user_address', address.toLowerCase());

    if (error) {
      console.error('Error removing user role:', error);
    }
  } catch (error) {
    console.error('Error removing user role:', error);
  }
};