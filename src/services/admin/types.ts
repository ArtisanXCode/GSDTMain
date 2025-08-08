
import { SMART_CONTRACT_ROLES } from '../../constants/roles';

export type AdminRole = typeof SMART_CONTRACT_ROLES[keyof typeof SMART_CONTRACT_ROLES];

export interface AdminUser {
  id: string;
  user_address: string;
  role: AdminRole;
  created_at: string;
  updated_at?: string;
}

export interface PendingTransaction {
  id: number;
  txType: string;
  status: number;
  initiator: string;
  target: string;
  amount: string;
  timestamp: number;
  executeAfter: number;
  data: string;
  rejectionReason?: string;
  approver?: string;
}

export interface TransactionDetails {
  id: number;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'AUTO_EXECUTED';
  initiator: string;
  target: string;
  amount?: string;
  timestamp: Date;
  executeAfter: Date;
  approver?: string;
  rejectionReason?: string;
}

export const TRANSACTION_TYPES = {
  MINT: 'MINT',
  BURN: 'BURN',
  TRANSFER: 'TRANSFER',
  BLACKLIST: 'BLACKLIST',
  KYC_UPDATE: 'KYC_UPDATE',
  ROLE_GRANT: 'ROLE_GRANT',
  ROLE_REVOKE: 'ROLE_REVOKE',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  EXECUTED: 3,
  AUTO_EXECUTED: 4,
} as const;

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FLAGGED = 'FLAGGED'
}

export enum TransactionType {
  MINT = 'MINT',
  BURN = 'BURN',
  TRANSFER = 'TRANSFER',
  REQUEST_REDEEM = 'REQUEST_REDEEM',
  PROCESS_REDEEM = 'PROCESS_REDEEM',
  UPDATE_KYC = 'UPDATE_KYC',
  GRANT_ROLE = 'GRANT_ROLE',
  REVOKE_ROLE = 'REVOKE_ROLE',
  BLACKLIST = 'BLACKLIST',
  KYC_UPDATE = 'KYC_UPDATE',
  FIAT_DEPOSIT = 'FIAT_DEPOSIT',
  REDEEM = 'REDEEM'
}

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
}
